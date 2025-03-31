import express from "express";
import { authenticateUser } from "../middlewares/auth.middleware";
import { createGroup, joinGroup, getUserGroups, getGroupMembers, updateGroup } from "../controllers/group.controller";

const router = express.Router();

// Wrapper to handle async errors
const asyncHandler = (fn: Function) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Routes
// @ts-ignore
router.post("/create", authenticateUser, asyncHandler(createGroup)); // Create a new group
// @ts-ignore
router.post("/join", authenticateUser, asyncHandler(joinGroup)); // Join a group using code
// @ts-ignore
router.get("/my-groups", authenticateUser, asyncHandler(getUserGroups)); // Fetch created and joined groups
// @ts-ignore
router.get("/:groupId/members", authenticateUser, asyncHandler(getGroupMembers))
// @ts-ignore
router.put("/:groupId", authenticateUser, asyncHandler(updateGroup));

export default router;
