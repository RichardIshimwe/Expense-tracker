import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { storage } from '../storage';
import { UserRole } from '@shared/schema';

// JWT secret should be stored in environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Interface for decoded JWT
interface DecodedToken {
  userId: number;
  username: string;
  role: string;
}

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        role: string;
        email: string;
        firstName: string;
        lastName: string;
        managerId?: number | null;
      };
    }
  }
}

// Authenticate JWT token
export const authenticate = async (
  req: Request,
  res: Response, 
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
      
      // Get user from database
      const user = await storage.getUser(decoded.userId);
      
      if (!user) {
        return res.status(401).json({ message: 'Invalid user' });
      }
      
      // Attach user to request
      req.user = {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        managerId: user.managerId
      };
      
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    next(error);
  }
};

// Check if user has required role
export const authorize = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (!roles.includes(req.user.role as UserRole)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    next();
  };
};

// Generate JWT token
export const generateToken = (user: { id: number; username: string; role: string }) => {
  return jwt.sign(
    { userId: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};
