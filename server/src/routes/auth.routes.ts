import express, { Request, Response, NextFunction } from 'express';
import { login, signup, updateProfile } from '../controllers/auth.controller';
import { authenticateUser } from '../middlewares/auth.middleware';

const router = express.Router();

// Simple async handler that automatically passes errors to next()
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
    (req: Request, res: Response, next: NextFunction): void => {
        fn(req, res, next).catch(next);
    };

// Routes
router.post('/login', asyncHandler(login));
router.post('/signup', asyncHandler(signup));
// @ts-ignore - Ignoring type error for middleware chaining
router.put('/updateProfile', authenticateUser, asyncHandler(updateProfile));


export default router;