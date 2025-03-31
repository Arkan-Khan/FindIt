import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
}
const JWT_SECRET = process.env.JWT_SECRET;

// Zod validation schemas
const signupSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    phone: z.string()
        .regex(/^\d{10}$/, 'Phone number must be exactly 10 digits')
        .optional()
        .or(z.literal('')), // Allows an empty string
    profileImageUrl: z.string().url('Invalid URL format').optional(),
});

const loginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
});

// Signup controller
export const signup = async (req: Request, res: Response) => {
    try {
        const validatedData = signupSchema.parse(req.body);
        const { name, email, password, phone, profileImageUrl } = validatedData;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                phone,
                profileImageUrl,
            },
        });

        // Generate JWT token upon signup
        const token = jwt.sign(
            { id: user.id, email: user.email }, // Payload
            JWT_SECRET, 
            { expiresIn: "7d" } 
        );

        res.status(201).json({ 
            message: "Signed up successfully!",
            token,  // Sending the token
            user: { id: user.id, name: user.name, email: user.email, phone, profileImageUrl }
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        console.error(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

// Login controller
export const login = async (req: Request, res: Response) => {
    try {
        const validatedData = loginSchema.parse(req.body);
        const { email, password } = validatedData;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: 'No User Exists!' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Wrong Password!' });
        }

        // Generate JWT token with expiry
        const token = jwt.sign(
            { id: user.id, email: user.email }, // Payload
            JWT_SECRET, // Secret key
            { expiresIn: "7d" } // Token expires in 7 days
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                profileImageUrl: user.profileImageUrl,
            }
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        console.error(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

export const updateProfile = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id; // Extract user ID from token

        // Validate request body
        const updateProfileSchema = z.object({
            phone: z.string()
                .regex(/^\d{10}$/, 'Phone number must be exactly 10 digits')
                .optional(),
            profileImageUrl: z.string().url('Invalid URL format').optional(),
        });

        const validatedData = updateProfileSchema.parse(req.body);

        // Fetch the current user data from the database
        const existingUser = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if the new data is different from existing data
        const isPhoneSame = validatedData.phone === undefined || validatedData.phone === existingUser.phone;
        const isProfileImageSame = validatedData.profileImageUrl === undefined || validatedData.profileImageUrl === existingUser.profileImageUrl;

        if (isPhoneSame && isProfileImageSame) {
            return res.status(400).json({ message: "No changes detected. Profile remains the same." });
        }

        // Update only if there are changes
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: validatedData,
        });

        res.status(200).json({
            message: 'Profile updated successfully!',
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                profileImageUrl: updatedUser.profileImageUrl,
            },
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        console.error(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};
