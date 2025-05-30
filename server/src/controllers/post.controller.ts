import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { sendNotificationToGroup } from "../utils/notifications";

const prisma = new PrismaClient();

const createPostSchema = z.object({
    title: z.string().min(1, "Title is required"),
    details: z.string().min(1, "Details are required"),
    postType: z.enum(["LOST", "FOUND"]),
    imageUrl: z.string().url("Invalid URL format").optional(),
    groupId: z.string().uuid("Invalid group ID format"),
});

const updatePostStatusSchema = z.object({
    status: z.enum(["ACTIVE", "CLAIMED"]),
});

export const createPost = async (req: Request & { user?: { id: string } }, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const validatedData = createPostSchema.parse(req.body);

        const group = await prisma.group.findUnique({
            where: { id: validatedData.groupId },
        });

        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        const isMember = await prisma.groupMember.findFirst({
            where: {
                groupId: validatedData.groupId,
                userId: userId,
            },
        });

        if (!isMember) {
            return res.status(403).json({ message: "You are not a member of this group" });
        }

        const post = await prisma.post.create({
            data: {
                title: validatedData.title,
                details: validatedData.details,
                postType: validatedData.postType,
                imageUrl: validatedData.imageUrl,
                groupId: validatedData.groupId,
                authorId: userId,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        profileImageUrl: true
                    },
                },
                group: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        try {
            await sendNotificationToGroup(validatedData.groupId, {
                title: `New ${post.postType.toLowerCase()} item in ${post.group.name}`,
                body: `${post.author.name} posted: ${post.title}`,
                data: {
                    postId: post.id,
                    groupId: post.groupId,
                    type: 'NEW_POST'
                }
            }, userId);
        } catch (notifError) {
            console.error('Failed to send notifications:', notifError);
        }

        return res.status(201).json({ message: "Post created successfully!", post });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        console.error(error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

export const getPostsByGroupId = async (
    req: Request & { user?: { id: string; email: string } },
    res: Response
) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const groupId = req.params.groupId;

        if (!groupId || !z.string().uuid().safeParse(groupId).success) {
            return res.status(400).json({ message: "Invalid group ID format" });
        }

        const group = await prisma.group.findUnique({
            where: { id: groupId },
        });

        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        const isMember = await prisma.groupMember.findFirst({
            where: {
                groupId,
                userId,
            },
        });

        if (group.creatorId !== userId && !isMember) {
            return res.status(403).json({ message: "You are not a member of this group" });
        }

        const posts = await prisma.post.findMany({
            where: { groupId },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        profileImageUrl: true,
                        email: true,
                        phone: true,
                    },
                },
            },
        });

        return res.status(200).json({ groupId, posts });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

export const updatePostStatus = async (req: Request & { user?: { id: string } }, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const postId = req.params.postId;

        if (!postId || !z.string().uuid().safeParse(postId).success) {
            return res.status(400).json({ message: "Invalid post ID format" });
        }

        const validatedData = updatePostStatusSchema.parse(req.body);

        const post = await prisma.post.findUnique({
            where: { id: postId },
            include: {
                group: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                author: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        if (post.authorId !== userId) {
            return res.status(403).json({ message: "You are not authorized to update this post" });
        }

        const updatedPost = await prisma.post.update({
            where: { id: postId },
            data: { status: validatedData.status },
        });

        if (validatedData.status === 'CLAIMED') {
            try {
                await sendNotificationToGroup(post.groupId, {
                    title: `Item ${post.postType === 'LOST' ? 'found' : 'claimed'} in ${post.group.name}`,
                    body: `${post.author.name}'s item "${post.title}" has been ${post.postType === 'LOST' ? 'found' : 'claimed'}!`,
                    data: {
                        postId: post.id,
                        groupId: post.groupId,
                        type: 'POST_CLAIMED'
                    }
                }, userId);
            } catch (notifError) {
                console.error('Failed to send claim notifications:', notifError);
            }
        }

        return res.status(200).json({ message: "Post status updated successfully!", post: updatedPost });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        console.error(error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};