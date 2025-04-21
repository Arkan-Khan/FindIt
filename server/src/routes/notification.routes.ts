import express from "express";
import { authenticateUser } from "../middlewares/auth.middleware";
import { saveFcmToken } from "../controllers/notification.controller";

const router = express.Router();

// @ts-ignore
router.post("/tokens", authenticateUser, saveFcmToken);

export default router;