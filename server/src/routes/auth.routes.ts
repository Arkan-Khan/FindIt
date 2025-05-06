import express, { Request, Response, NextFunction } from 'express';
import { login, signup, updateProfile } from '../controllers/auth.controller';
import { authenticateUser } from '../middlewares/auth.middleware';

const router = express.Router();

const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
    (req: Request, res: Response, next: NextFunction): void => {
        fn(req, res, next).catch(next);
    };

router.post('/login', asyncHandler(login));
router.post('/signup', asyncHandler(signup));
// @ts-ignore
router.put('/updateProfile', authenticateUser, asyncHandler(updateProfile));


export default router;