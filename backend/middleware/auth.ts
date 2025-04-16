// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
    }
  }
}

export const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ message: 'Authentication token is required' });
    return;
  }

  const token = authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

  try {
    const decoded = jwt.verify(token,process.env.JWT_SECRET as string) as { userId: string }; 
    req.user = { id: decoded.userId };
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};