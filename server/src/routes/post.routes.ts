import express from "express";
import { authenticateUser } from "../middlewares/auth.middleware";
import { createPost, getPostsByGroupId, updatePostStatus } from "../controllers/post.controller";

const router = express.Router();

// @ts-ignore
router.post("/", authenticateUser, createPost); // Create a post
// @ts-ignore
router.get("/group/:groupId", authenticateUser, getPostsByGroupId); // Get posts by group ID
// @ts-ignore
router.put("/:postId/status", authenticateUser, updatePostStatus); // Update post status

export default router;