import { Router } from 'express';
import { storage } from '../storage';
import bcrypt from 'bcryptjs';
import { generateToken, authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { z } from 'zod';

const router = Router();

// Login schema
const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

// Register schema
const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.enum(['employee', 'manager', 'admin']),
  managerId: z.number().optional().nullable(),
});

// Login endpoint
router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    // Get user from database
    const user = await storage.getUserByUsername(username);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    
    // Generate token
    const token = generateToken({
      id: user.id,
      username: user.username,
      role: user.role,
    });
    
    // Return user info and token
    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        managerId: user.managerId,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
});

// Register endpoint
router.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const { username, password, email, firstName, lastName, role, managerId } = req.body;
    
    // Check if username already exists
    const existingUsername = await storage.getUserByUsername(username);
    
    if (existingUsername) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    
    // Check if email already exists
    const existingEmail = await storage.getUserByEmail(email);
    
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = await storage.createUser({
      username,
      password: hashedPassword,
      email,
      firstName,
      lastName,
      role,
      managerId,
    });
    
    // Generate token
    const token = generateToken({
      id: user.id,
      username: user.username,
      role: user.role,
    });
    
    // Create audit log
    await storage.createAuditLog({
      userId: user.id,
      action: 'USER_CREATED',
      details: `User ${username} was created with role ${role}`,
    });
    
    // Return user info and token
    res.status(201).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        managerId: user.managerId,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  res.json({
    user: req.user,
  });
});

export default router;
