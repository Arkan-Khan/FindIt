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

const signupSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    phone: z.string()
        .regex(/^\d{10}$/, 'Phone number must be exactly 10 digits')
        .optional()
        .or(z.literal('')),
    profileImageUrl: z.string().url('Invalid URL format').optional(),
});

const loginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
});

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

        const token = jwt.sign(
            { id: user.id, email: user.email },
            JWT_SECRET, 
            { expiresIn: "7d" } 
        );

        res.status(201).json({ 
            message: "Signed up successfully!",
            token,
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

        const token = jwt.sign(
            { id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: "7d" }
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

import { deleteCloudinaryImage } from '../utils/cloudinary';
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const updateProfileSchema = z.object({
      phone: z.union([
        z.string().regex(/^\d{10}$/, { message: "Phone must be exactly 10 digits" }),
        z.string().length(0).transform(() => null),
        z.null()
      ]).optional(),
      profileImageUrl: z.string().url().optional(),
    });

    const validatedData = updateProfileSchema.safeParse(req.body);
    
    if (!validatedData.success) {
      return res.status(400).json({ 
        message: "Validation error",
        errors: validatedData.error.errors 
      });
    }
    
    const data = validatedData.data;

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const phoneChanged = data.phone !== undefined && 
                         ((data.phone === null && existingUser.phone !== null) || 
                          (data.phone !== null && existingUser.phone !== data.phone));
                         
    const profileImageChanged = data.profileImageUrl !== undefined && 
                               data.profileImageUrl !== existingUser.profileImageUrl;

    if (!phoneChanged && !profileImageChanged) {
      return res.status(200).json({ 
        message: "No changes detected. Profile remains the same.",
        user: {
          id: existingUser.id,
          name: existingUser.name,
          email: existingUser.email,
          phone: existingUser.phone,
          profileImageUrl: existingUser.profileImageUrl,
        }
      });
    }

    if (
      profileImageChanged &&
      existingUser.profileImageUrl &&
      data.profileImageUrl !== existingUser.profileImageUrl
    ) {
      try {
        await deleteCloudinaryImage(existingUser.profileImageUrl);
      } catch (cloudinaryError) {
        console.error("Error deleting previous image:", cloudinaryError);
      }
    }

    const updateData: any = {};
    if (phoneChanged) {
      updateData.phone = data.phone;
    }
    if (profileImageChanged) {
      updateData.profileImageUrl = data.profileImageUrl;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
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
    console.error("Profile update error:", error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};