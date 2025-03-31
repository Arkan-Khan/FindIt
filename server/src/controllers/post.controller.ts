import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Zod schemas for validation
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

// Create Post
export const createPost = async (req: Request & { user?: { id: string } }, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Validate request body
        const validatedData = createPostSchema.parse(req.body);

        // Check if the group exists
        const group = await prisma.group.findUnique({
            where: { id: validatedData.groupId },
        });

        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        // Create the post
        const post = await prisma.post.create({
            data: {
                title: validatedData.title,
                details: validatedData.details,
                postType: validatedData.postType,
                imageUrl: validatedData.imageUrl,
                groupId: validatedData.groupId,
                authorId: userId,
            },
        });

        return res.status(201).json({ message: "Post created successfully!", post });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        console.error(error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

// Get Posts by Group ID
export const getPostsByGroupId = async (req: Request, res: Response) => {
    try {
        const groupId = req.params.groupId;

        // Validate groupId
        if (!groupId || !z.string().uuid().safeParse(groupId).success) {
            return res.status(400).json({ message: "Invalid group ID format" });
        }

        // Check if the group exists
        const group = await prisma.group.findUnique({
            where: { id: groupId },
        });

        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        // Fetch posts for the group
        const posts = await prisma.post.findMany({
            where: { groupId },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        profileImageUrl: true,
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

// Update Post Status
export const updatePostStatus = async (req: Request & { user?: { id: string } }, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const postId = req.params.postId;

        // Validate postId
        if (!postId || !z.string().uuid().safeParse(postId).success) {
            return res.status(400).json({ message: "Invalid post ID format" });
        }

        // Validate request body
        const validatedData = updatePostStatusSchema.parse(req.body);

        // Check if the post exists and if the user is the author
        const post = await prisma.post.findUnique({
            where: { id: postId },
        });

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        if (post.authorId !== userId) {
            return res.status(403).json({ message: "You are not authorized to update this post" });
        }

        // Update the post status
        const updatedPost = await prisma.post.update({
            where: { id: postId },
            data: { status: validatedData.status },
        });

        return res.status(200).json({ message: "Post status updated successfully!", post: updatedPost });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        console.error(error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};