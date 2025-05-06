import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
}
const JWT_SECRET = process.env.JWT_SECRET;

export interface DecodedToken {
    id: number;
    email: string;
}

declare global {
    namespace Express {
        interface Request {
            user?: DecodedToken;
        }
    }
}

export const authenticateUser = async (
    req: Request,
    res: Response, 
    next: NextFunction
) => {
    try {
        const authHeader = req.header("Authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized: No token provided or invalid format" });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;

        const user = await prisma.user.findUnique({ where: { email: decoded.email } });

        if (!user) {
            return res.status(401).json({ message: "Unauthorized: User does not exist" });
        }

        req.user = decoded;

        next();
    } catch (error) {
        console.error("Authentication error:", error);
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
};