import { Request, Response } from "express";
 import { PrismaClient } from "@prisma/client";
 import { z } from "zod";
 
 const prisma = new PrismaClient();
 
 const tokenSchema = z.object({
   token: z.string().min(1, "Token is required"),
 });
 
 export const saveFcmToken = async (req: Request & { user?: { id: string } }, res: Response) => {
   try {
     const userId = req.user?.id;
 
     if (!userId) {
       return res.status(401).json({ message: "Unauthorized" });
     }
 
     const validatedData = tokenSchema.parse(req.body);
 
     const fcmToken = await prisma.fcmToken.upsert({
       where: {
         token: validatedData.token,
       },
       update: {
         userId: userId,
       },
       create: {
         token: validatedData.token,
         userId: userId,
       },
     });
 
     return res.status(200).json({ message: "FCM token saved successfully", fcmToken });
   } catch (error) {
     if (error instanceof z.ZodError) {
       return res.status(400).json({ errors: error.errors });
     }
     console.error(error);
     return res.status(500).json({ message: "Something went wrong" });
   }
 };

export const deleteFcmToken = async (req: Request & { user?: { id: string } }, res: Response) => {
  try {
    const userId = req.user?.id;
    const { token } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    await prisma.fcmToken.deleteMany({
      where: {
        token,
        userId,
      },
    });

    return res.status(200).json({ message: "FCM token deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
