import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getStats = async (req: Request, res: Response) => {
  try {
    // Get total users count
    const totalUsers = await prisma.user.count();
    
    // Get total groups count
    const totalGroups = await prisma.group.count();
    
    // Get total posts count
    const totalPosts = await prisma.post.count();
    
    // Get total claimed/returned items count
    const returnedItems = await prisma.post.count({
      where: {
        status: "CLAIMED"
      }
    });

    // Return all statistics
    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalGroups,
        totalPosts,
        returnedItems
      }
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch statistics"
    });
  }
};