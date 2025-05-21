import { Router } from 'express';
import { storage } from '../storage';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { ExpenseStatus, UserRole, insertExpenseSchema, updateExpenseStatusSchema } from '@shared/schema';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { sendExpenseStatusChangeEmail, sendNewExpenseNotificationEmail } from '../services/email';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Configure storage for receipts
const uploadsDir = path.join(process.cwd(), 'uploads');

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage_multer = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${uuidv4()}`;
    const ext = path.extname(file.originalname);
    cb(null, `receipt-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage: storage_multer,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  },
});

// Create new expense
router.post('/', 
  authenticate, 
  authorize([UserRole.EMPLOYEE, UserRole.MANAGER, UserRole.ADMIN]),
  upload.single('receipt'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Receipt is required' });
      }

      const { amount, category, description } = req.body;
      
      // Validate request body
      try {
        insertExpenseSchema.parse({
          userId: req.user!.id,
          amount: parseFloat(amount),
          category,
          description,
          receiptUrl: req.file.path
        });
      } catch (error) {
        // Delete uploaded file if validation fails
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({ message: 'Invalid expense data', error });
      }
      
      // Create expense
      const expense = await storage.createExpense({
        userId: req.user!.id,
        amount: parseFloat(amount),
        category,
        description,
        receiptUrl: req.file.path
      });
      
      // Create audit log
      await storage.createAuditLog({
        userId: req.user!.id,
        expenseId: expense.id,
        action: 'EXPENSE_CREATED',
        details: `Expense created for $${expense.amount} in category ${expense.category}`
      });
      
      // If user has a manager, notify them
      if (req.user!.managerId) {
        const manager = await storage.getUser(req.user!.managerId);
        if (manager) {
          await sendNewExpenseNotificationEmail(
            manager.email,
            `${manager.firstName} ${manager.lastName}`,
            `${req.user!.firstName} ${req.user!.lastName}`,
            expense.id,
            expense.amount,
            expense.category
          );
        }
      }
      
      res.status(201).json(expense);
    } catch (error) {
      // Delete uploaded file if error occurs
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      next(error);
    }
  }
);

// Get expenses for current user
router.get('/my-expenses', 
  authenticate, 
  async (req, res, next) => {
    try {
      const expenses = await storage.getExpensesByUserId(req.user!.id);
      res.json(expenses);
    } catch (error) {
      next(error);
    }
  }
);

// Get expenses for manager's team
router.get('/pending-approvals', 
  authenticate, 
  authorize([UserRole.MANAGER, UserRole.ADMIN]),
  async (req, res, next) => {
    try {
      const pendingExpenses = await storage.getPendingExpensesByManagerId(req.user!.id);
      res.json(pendingExpenses);
    } catch (error) {
      next(error);
    }
  }
);

// Get expense by id
router.get('/:id', 
  authenticate, 
  async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const expense = await storage.getExpense(id);
      
      if (!expense) {
        return res.status(404).json({ message: 'Expense not found' });
      }
      
      // Check if user is authorized to view this expense
      // Allow if:
      // 1. User is the expense owner
      // 2. User is the manager of the expense owner
      // 3. User is an admin
      if (
        expense.userId === req.user!.id || 
        req.user!.role === UserRole.ADMIN ||
        (req.user!.role === UserRole.MANAGER && await isManager(req.user!.id, expense.userId))
      ) {
        // Get comments for this expense
        const comments = await storage.getCommentsByExpenseId(expense.id);
        
        res.json({ expense, comments });
      } else {
        res.status(403).json({ message: 'Not authorized to view this expense' });
      }
    } catch (error) {
      next(error);
    }
  }
);

// Helper to check if a user is the manager of another user
async function isManager(managerId: number, userId: number): Promise<boolean> {
  const user = await storage.getUser(userId);
  return user?.managerId === managerId;
}

// Update expense status (approve/reject)
router.patch('/:id/status', 
  authenticate, 
  authorize([UserRole.MANAGER, UserRole.ADMIN]),
  validate(updateExpenseStatusSchema),
  async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const { status, comment } = req.body;
      
      const expense = await storage.getExpense(id);
      
      if (!expense) {
        return res.status(404).json({ message: 'Expense not found' });
      }
      
      // Check if expense is already processed
      if (expense.status !== ExpenseStatus.PENDING) {
        return res.status(400).json({ 
          message: `Expense is already ${expense.status}` 
        });
      }
      
      // Check if user is authorized to update this expense
      // Allow if:
      // 1. User is the manager of the expense owner
      // 2. User is an admin
      if (
        req.user!.role === UserRole.ADMIN ||
        (req.user!.role === UserRole.MANAGER && await isManager(req.user!.id, expense.userId))
      ) {
        // Update expense status
        const updatedExpense = await storage.updateExpenseStatus(
          id, 
          { status, comment }, 
          req.user!.id
        );
        
        // Create audit log
        await storage.createAuditLog({
          userId: req.user!.id,
          expenseId: expense.id,
          action: `EXPENSE_${status.toUpperCase()}`,
          details: `Expense ${status} by ${req.user!.username}${comment ? `: ${comment}` : ''}`
        });
        
        // Get expense owner
        const expenseOwner = await storage.getUser(expense.userId);
        
        if (expenseOwner) {
          // Send email notification
          await sendExpenseStatusChangeEmail(
            expenseOwner.email,
            `${expenseOwner.firstName} ${expenseOwner.lastName}`,
            expense.id,
            expense.amount,
            status,
            expense.category,
            comment
          );
        }
        
        res.json(updatedExpense);
      } else {
        res.status(403).json({ message: 'Not authorized to update this expense' });
      }
    } catch (error) {
      next(error);
    }
  }
);

// Get expense receipt
router.get('/:id/receipt', 
  authenticate, 
  async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const expense = await storage.getExpense(id);
      
      if (!expense) {
        return res.status(404).json({ message: 'Expense not found' });
      }
      
      // Check if user is authorized to view this receipt
      if (
        expense.userId === req.user!.id || 
        req.user!.role === UserRole.ADMIN ||
        (req.user!.role === UserRole.MANAGER && await isManager(req.user!.id, expense.userId))
      ) {
        // Check if receipt file exists
        if (!fs.existsSync(expense.receiptUrl)) {
          return res.status(404).json({ message: 'Receipt file not found' });
        }
        
        res.sendFile(path.resolve(expense.receiptUrl));
      } else {
        res.status(403).json({ message: 'Not authorized to view this receipt' });
      }
    } catch (error) {
      next(error);
    }
  }
);

// Get expense statistics
router.get('/stats/summary', 
  authenticate, 
  async (req, res, next) => {
    try {
      let stats;
      
      if (req.user!.role === UserRole.MANAGER) {
        // Get stats for manager's team
        stats = await storage.getExpensesStats(req.user!.id, req.user!.id);
      } else {
        // Get stats for individual user
        stats = await storage.getExpensesStats(req.user!.id);
      }
      
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }
);

// Search expenses
router.get('/search/:query', 
  authenticate, 
  async (req, res, next) => {
    try {
      const { query } = req.params;
      let expenses;
      
      if (req.user!.role === UserRole.ADMIN) {
        // Admins can search all expenses
        expenses = await storage.searchExpenses(query);
      } else if (req.user!.role === UserRole.MANAGER) {
        // Managers can search their team's expenses
        expenses = await storage.searchExpenses(query, undefined, req.user!.id);
      } else {
        // Employees can only search their own expenses
        expenses = await storage.searchExpenses(query, req.user!.id);
      }
      
      res.json(expenses);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
