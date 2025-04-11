import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Zod schemas for validation
const addCommentSchema = z.object({
    postId: z.string().uuid("Invalid post ID format"),
    content: z.string().min(1, "Comment content is required"),
});

// Add Comment to a Post
export const addComment = async (req: Request & { user?: { id: string } }, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Validate request body
        const validatedData = addCommentSchema.parse(req.body);

        // Check if the post exists
        const post = await prisma.post.findUnique({
            where: { id: validatedData.postId },
            include: { group: true },
        });

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Check if the user is a member of the group
        const isMember = await prisma.groupMember.findFirst({
            where: {
                groupId: post.groupId,
                userId: userId,
            },
        });

        if (!isMember) {
            return res.status(403).json({ message: "You are not a member of this group" });
        }

        // Add the comment
        const comment = await prisma.comment.create({
            data: {
                content: validatedData.content,
                postId: validatedData.postId,
                authorId: userId,
            },
        });

        return res.status(201).json({ message: "Comment added successfully!", comment });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        console.error(error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

// Get Comments for a Post
export const getCommentsByPostId = async (req: Request & { user?: { id: string } }, res: Response) => {
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

        // Check if the post exists
        const post = await prisma.post.findUnique({
            where: { id: postId },
            include: { group: true },
        });

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Check if the user is a member of the group
        const isMember = await prisma.groupMember.findFirst({
            where: {
                groupId: post.groupId,
                userId: userId,
            },
        });

        if (!isMember) {
            return res.status(403).json({ message: "You are not a member of this group" });
        }

        // Fetch comments for the post
        const comments = await prisma.comment.findMany({
            where: { postId },
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

        return res.status(200).json({ postId, comments });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};