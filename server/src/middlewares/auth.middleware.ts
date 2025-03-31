import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
}
const JWT_SECRET = process.env.JWT_SECRET;

// Define the interface for decoded JWT payload
export interface DecodedToken {
    id: number;
    email: string;
}

// Extend Express Request interface
declare global {
    namespace Express {
        interface Request {
            user?: DecodedToken;
        }
    }
}

// Use the standard Express middleware signature
export const authenticateUser = async (
    req: Request,
    res: Response, 
    next: NextFunction
) => {
    try {
        // Get the token from Authorization header
        const authHeader = req.header("Authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized: No token provided or invalid format" });
        }

        // Extract the token (remove "Bearer ")
        const token = authHeader.split(" ")[1];

        // Verify the token
        const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;

        // Find the user in the database
        const user = await prisma.user.findUnique({ where: { email: decoded.email } });

        if (!user) {
            return res.status(401).json({ message: "Unauthorized: User does not exist" });
        }

        // Attach user info to request object
        req.user = decoded;

        // Proceed to the next middleware/route handler
        next();
    } catch (error) {
        console.error("Authentication error:", error);
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
};