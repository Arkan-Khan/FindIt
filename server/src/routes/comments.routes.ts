import express from "express";
import { authenticateUser } from "../middlewares/auth.middleware";
import { addComment, getCommentsByPostId } from "../controllers/comments.controller";

const router = express.Router();

// Routes
// @ts-ignore
router.post("/", authenticateUser, addComment); // Add a comment to a post
// @ts-ignore
router.get("/:postId", authenticateUser, getCommentsByPostId); // Get comments for a post

export default router;