import express from "express";
import { authenticateUser } from "../middlewares/auth.middleware";
import { saveFcmToken } from "../controllers/notification.controller";
import { deleteFcmToken } from "../controllers/notification.controller";
 
 const router = express.Router();
 
 // @ts-ignore
 router.post("/tokens", authenticateUser, saveFcmToken);
  // @ts-ignore
 router.delete("/tokens", authenticateUser, deleteFcmToken);

 export default router;