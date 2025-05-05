import express from "express";
import { getStats } from "../controllers/stats.controller";

const router = express.Router();

// @ts-ignore
router.get("/", getStats);

export default router;