import express from "express";
import { authenticateUser } from "../middlewares/auth.middleware";
import { 
    createGroup, 
    joinGroup, 
    getUserGroups, 
    getGroupMembers, 
    updateGroup,
    getGroupById 
} from "../controllers/group.controller";

const router = express.Router();

const asyncHandler = (fn: Function) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// @ts-ignore
router.post("/create", authenticateUser, asyncHandler(createGroup)); // Create a new group
// @ts-ignore
router.post("/join", authenticateUser, asyncHandler(joinGroup)); // Join a group using code
// @ts-ignore
router.get("/my-groups", authenticateUser, asyncHandler(getUserGroups)); // Fetch created and joined groups
// @ts-ignore
router.get("/:groupId/members", authenticateUser, asyncHandler(getGroupMembers)); // Get members of a group
// @ts-ignore
router.get("/:groupId", authenticateUser, asyncHandler(getGroupById)); // Get single group details
// @ts-ignore
router.put("/:groupId", authenticateUser, asyncHandler(updateGroup)); // Update group details

export default router;