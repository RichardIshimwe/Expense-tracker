import { Router } from 'express';
import { storage } from '../storage';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@shared/schema';

const router = Router();

// Get all users
router.get('/', 
  authenticate, 
  authorize([UserRole.ADMIN, UserRole.MANAGER]),
  async (req, res, next) => {
    try {
      const users = await storage.getUsers();
      
      // Remove password from response
      const sanitizedUsers = users.map(({ password, ...user }) => user);
      
      res.json(sanitizedUsers);
    } catch (error) {
      next(error);
    }
  }
);

// Get users by role
router.get('/by-role/:role', 
  authenticate, 
  authorize([UserRole.ADMIN, UserRole.MANAGER]),
  async (req, res, next) => {
    try {
      const role = req.params.role;
      
      // Validate role
      if (!Object.values(UserRole).includes(role as UserRole)) {
        return res.status(400).json({ message: 'Invalid role' });
      }
      
      const users = await storage.getUsersByRole(role);
      
      // Remove password from response
      const sanitizedUsers = users.map(({ password, ...user }) => user);
      
      res.json(sanitizedUsers);
    } catch (error) {
      next(error);
    }
  }
);

// Get team members for a manager
router.get('/team', 
  authenticate, 
  authorize([UserRole.MANAGER, UserRole.ADMIN]),
  async (req, res, next) => {
    try {
      const users = await storage.getUsersByManagerId(req.user!.id);
      
      // Remove password from response
      const sanitizedUsers = users.map(({ password, ...user }) => user);
      
      res.json(sanitizedUsers);
    } catch (error) {
      next(error);
    }
  }
);

// Get user by ID
router.get('/:id', 
  authenticate, 
  async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      
      // Only allow admins, managers (for their team members), or the user themselves
      if (
        req.user!.role !== UserRole.ADMIN &&
        req.user!.id !== id &&
        !(req.user!.role === UserRole.MANAGER && await isTeamMember(req.user!.id, id))
      ) {
        return res.status(403).json({ message: 'Not authorized to access this user' });
      }
      
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Remove password from response
      const { password, ...sanitizedUser } = user;
      
      res.json(sanitizedUser);
    } catch (error) {
      next(error);
    }
  }
);

// Helper to check if a user is a team member of a manager
async function isTeamMember(managerId: number, userId: number): Promise<boolean> {
  const user = await storage.getUser(userId);
  return user?.managerId === managerId;
}

export default router;
