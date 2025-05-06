import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import crypto from "crypto";

const prisma = new PrismaClient();

const generateGroupCode = (): string => {
    return crypto.randomBytes(3).toString("hex").toUpperCase();
};

export const createGroup = async (
    req: Request & { user?: { id: string; email: string; name: string } }, 
    res: Response
) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const groupSchema = z.object({
            name: z.string().min(3, "Group name must be at least 3 characters"),
            groupImageUrl: z.string().url().optional(),
        });

        const validatedData = groupSchema.parse(req.body);

        let uniqueCode: string = "";
        let isUnique = false;
        while (!isUnique) {
            uniqueCode = generateGroupCode();
            const existingGroup = await prisma.group.findUnique({ where: { code: uniqueCode } });
            if (!existingGroup) isUnique = true;
        }

        const newGroup = await prisma.group.create({
            data: {
                name: validatedData.name,
                code: uniqueCode,
                groupImageUrl: validatedData.groupImageUrl,
                creatorId: userId,
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                },
                members: {
                    select: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                phone: true,
                            }
                        }
                    }
                }
            }
        });

        await prisma.groupMember.create({
            data: {
                userId,
                groupId: newGroup.id,
            },
        });

        const formattedGroup = {
            ...newGroup,
            members: newGroup.members.map(member => member.user)
        };

        return res.status(201).json({ message: "Group created successfully", group: formattedGroup });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        console.error(error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

export const joinGroup = async (
    req: Request & { user?: { id: string; email: string; name: string } }, 
    res: Response
) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const joinGroupSchema = z.object({
            code: z.string().length(6, "Group code must be exactly 6 characters"),
        });

        const { code } = joinGroupSchema.parse(req.body);

        const group = await prisma.group.findUnique({ 
            where: { code },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                }
            }
        });

        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        const existingMember = await prisma.groupMember.findUnique({
            where: { userId_groupId: { userId, groupId: group.id } },
        });

        if (existingMember) {
            return res.status(400).json({ message: "You are already a member of this group" });
        }

        await prisma.groupMember.create({
            data: {
                userId,
                groupId: group.id,
            },
        });

        const updatedGroup = await prisma.group.findUnique({
            where: { id: group.id },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                },
                members: {
                    select: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                phone: true,
                            }
                        }
                    }
                }
            }
        });

        const formattedGroup = {
            ...updatedGroup,
            members: updatedGroup?.members?.map(member => member.user) || []
        };

        return res.status(200).json({ message: "Successfully joined the group", group: formattedGroup });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        console.error(error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

export const getUserGroups = async (
    req: Request & { user?: { id: string; email: string } }, 
    res: Response
) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const createdGroups = await prisma.group.findMany({
            where: { creatorId: userId },
            select: {
                id: true,
                name: true,
                code: true,
                groupImageUrl: true,
                createdAt: true,
                creator: {
                    select: {
                        id: true,
                        name: true,
                        profileImageUrl: true, 
                    },
                },
            },
        });

        const joinedGroups = await prisma.groupMember.findMany({
            where: { userId },
            include: {
                group: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                        groupImageUrl: true,
                        createdAt: true,
                        creator: {
                            select: {
                                id: true,
                                name: true,
                                profileImageUrl: true,
                            },
                        },
                    },
                },
            },
        });

        const joinedGroupList = joinedGroups.map((gm) => gm.group);

        return res.status(200).json({ createdGroups, joinedGroups: joinedGroupList });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

export const getGroupMembers = async (
    req: Request & { user?: { id: string; email: string } },
    res: Response
) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const groupIdSchema = z.object({
            groupId: z.string().uuid("Invalid group ID format"),
        });

        const { groupId } = groupIdSchema.parse(req.params);

        const group = await prisma.group.findUnique({
            where: { id: groupId },
        });

        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        const groupMembers = await prisma.groupMember.findMany({
            where: { groupId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        profileImageUrl: true,
                    },
                },
            },
        });

        const members = groupMembers.map((gm) => gm.user);

        return res.status(200).json({ groupId, members });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        console.error(error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

export const updateGroup = async (
    req: Request & { user?: { id: string; email: string } },
    res: Response
) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const groupIdSchema = z.object({
            groupId: z.string().uuid("Invalid group ID format"),
        });

        const { groupId } = groupIdSchema.parse(req.params);

        const updateGroupSchema = z.object({
            name: z.string().min(3, "Group name must be at least 3 characters").optional(),
            groupImageUrl: z.string().url("Invalid URL format").optional(),
        });

        const validatedData = updateGroupSchema.parse(req.body);

        const group = await prisma.group.findUnique({
            where: { id: groupId },
        });

        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        if (group.creatorId !== userId) {
            return res.status(403).json({ message: "You are not authorized to update this group" });
        }

        const isSameData =
            (!validatedData.name || validatedData.name === group.name) &&
            (!validatedData.groupImageUrl || validatedData.groupImageUrl === group.groupImageUrl);

        if (isSameData) {
            return res.status(200).json({ message: "No changes detected, update skipped" });
        }

        const updatedGroup = await prisma.group.update({
            where: { id: groupId },
            data: validatedData,
        });

        return res.status(200).json({
            message: "Group updated successfully!",
            group: updatedGroup,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        console.error(error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

export const getGroupById = async (
    req: Request & { user?: { id: string; email: string } },
    res: Response
) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const groupIdSchema = z.object({
            groupId: z.string().uuid("Invalid group ID format"),
        });

        const { groupId } = groupIdSchema.parse(req.params);

        const group = await prisma.group.findUnique({
            where: { id: groupId },
            include: {
              creator: {
                select: {
                  id: true,
                },
              },
              members: {
                where: {
                  userId,
                },
                select: {
                  userId: true,
                },
              },
            },
        });          

        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        if (group.members.length === 0 && group.creator.id !== userId) {
            return res.status(403).json({ message: "You are not a member of this group" });
        }

        const groupDetails = {
            id: group.id,
            name: group.name,
            code: group.code,
            groupImageUrl: group.groupImageUrl
        };

        return res.status(200).json(groupDetails);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        console.error(error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};