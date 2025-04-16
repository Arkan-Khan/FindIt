import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import crypto from "crypto"; // For generating 6-digit alphanumeric group code

const prisma = new PrismaClient();

// Generate a random 6-character alphanumeric string
const generateGroupCode = (): string => {
    return crypto.randomBytes(3).toString("hex").toUpperCase();
};

// Create Group Controller
export const createGroup = async (
    req: Request & { user?: { id: string; email: string; name: string } }, 
    res: Response
) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Validate input using Zod
        const groupSchema = z.object({
            name: z.string().min(3, "Group name must be at least 3 characters"),
            groupImageUrl: z.string().url().optional(),
        });

        const validatedData = groupSchema.parse(req.body);

        // Generate unique 6-digit alphanumeric code
        let uniqueCode: string = "";
        let isUnique = false;
        while (!isUnique) {
            uniqueCode = generateGroupCode();
            const existingGroup = await prisma.group.findUnique({ where: { code: uniqueCode } });
            if (!existingGroup) isUnique = true;
        }

        // Create new group
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

        // Add creator as a member
        await prisma.groupMember.create({
            data: {
                userId,
                groupId: newGroup.id,
            },
        });

        // Format the response to match the expected structure
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

// Join Group Controller
export const joinGroup = async (
    req: Request & { user?: { id: string; email: string; name: string } }, 
    res: Response
) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Validate input using Zod
        const joinGroupSchema = z.object({
            code: z.string().length(6, "Group code must be exactly 6 characters"),
        });

        const { code } = joinGroupSchema.parse(req.body);

        // Check if group exists
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

        // Check if the user is already a member
        const existingMember = await prisma.groupMember.findUnique({
            where: { userId_groupId: { userId, groupId: group.id } },
        });

        if (existingMember) {
            return res.status(400).json({ message: "You are already a member of this group" });
        }

        // Add user to group
        await prisma.groupMember.create({
            data: {
                userId,
                groupId: group.id,
            },
        });

        // Get updated group with members
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

        // Format the response to match the expected structure
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

// Get User's Groups Controller
export const getUserGroups = async (
    req: Request & { user?: { id: string; email: string } }, 
    res: Response
) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Get groups created by user
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
                        profileImageUrl: true, // Include creator's profile image
                    },
                },
            },
        });

        // Get groups joined by user
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
                                profileImageUrl: true, // Include creator's profile image
                            },
                        },
                    },
                },
            },
        });

        // Extract group details from joinedGroups
        const joinedGroupList = joinedGroups.map((gm) => gm.group);

        return res.status(200).json({ createdGroups, joinedGroups: joinedGroupList });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

// Get All Group Members Controller
export const getGroupMembers = async (
    req: Request & { user?: { id: string; email: string } },
    res: Response
) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Validate groupId from request params
        const groupIdSchema = z.object({
            groupId: z.string().uuid("Invalid group ID format"),
        });

        const { groupId } = groupIdSchema.parse(req.params);

        // Check if the group exists
        const group = await prisma.group.findUnique({
            where: { id: groupId },
        });

        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        // Get all members of the group
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

        // Extract user details from group members
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

        // Validate groupId from request params
        const groupIdSchema = z.object({
            groupId: z.string().uuid("Invalid group ID format"),
        });

        const { groupId } = groupIdSchema.parse(req.params);

        // Validate input using Zod
        const updateGroupSchema = z.object({
            name: z.string().min(3, "Group name must be at least 3 characters").optional(),
            groupImageUrl: z.string().url("Invalid URL format").optional(),
        });

        const validatedData = updateGroupSchema.parse(req.body);

        // Fetch existing group data
        const group = await prisma.group.findUnique({
            where: { id: groupId },
        });

        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        if (group.creatorId !== userId) {
            return res.status(403).json({ message: "You are not authorized to update this group" });
        }

        // Check if any value has changed
        const isSameData =
            (!validatedData.name || validatedData.name === group.name) &&
            (!validatedData.groupImageUrl || validatedData.groupImageUrl === group.groupImageUrl);

        if (isSameData) {
            return res.status(200).json({ message: "No changes detected, update skipped" });
        }

        // Update the group only if at least one field is different
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
