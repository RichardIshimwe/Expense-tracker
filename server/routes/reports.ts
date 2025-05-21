import { Router } from 'express';
import { storage } from '../storage';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole, ExpenseStatus } from '@shared/schema';
import { Parser } from 'json2csv';

const router = Router();

// Get activity logs
router.get('/activity-logs', 
  authenticate, 
  async (req, res, next) => {
    try {
      let logs;
      
      if (req.user!.role === UserRole.ADMIN) {
        // Admins can see all logs
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
        logs = await storage.getRecentAuditLogs(limit);
      } else {
        // Users can only see their own logs
        logs = await storage.getAuditLogsByUserId(req.user!.id);
      }
      
      // Fetch related user details for each log
      const logsWithDetails = await Promise.all(logs.map(async log => {
        const user = await storage.getUser(log.userId);
        let expenseDetails = null;
        
        if (log.expenseId) {
          const expense = await storage.getExpense(log.expenseId);
          if (expense) {
            const expenseOwner = await storage.getUser(expense.userId);
            expenseDetails = {
              id: expense.id,
              amount: expense.amount,
              category: expense.category,
              status: expense.status,
              ownerName: expenseOwner ? `${expenseOwner.firstName} ${expenseOwner.lastName}` : 'Unknown',
            };
          }
        }
        
        return {
          ...log,
          userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
          userRole: user?.role,
          expense: expenseDetails,
        };
      }));
      
      res.json(logsWithDetails);
    } catch (error) {
      next(error);
    }
  }
);

// Export expenses as CSV
router.get('/export/expenses', 
  authenticate, 
  authorize([UserRole.ADMIN, UserRole.MANAGER]),
  async (req, res, next) => {
    try {
      let expenses;
      let fileName = 'expenses';
      
      // Filter by status if provided
      const status = req.query.status as ExpenseStatus | undefined;
      
      if (req.user!.role === UserRole.ADMIN) {
        // Admins can export all expenses
        expenses = await db.select().from(expenses);
        if (status) {
          expenses = expenses.filter(e => e.status === status);
          fileName += `-${status}`;
        }
      } else if (req.user!.role === UserRole.MANAGER) {
        // Managers can export their team's expenses
        const teamMembers = await storage.getUsersByManagerId(req.user!.id);
        const teamMemberIds = teamMembers.map(tm => tm.id);
        
        if (teamMemberIds.length === 0) {
          return res.json([]);
        }
        
        expenses = await db
          .select()
          .from(expenses)
          .where(inArray(expenses.userId, teamMemberIds));
          
        if (status) {
          expenses = expenses.filter(e => e.status === status);
          fileName += `-${status}`;
        }
        
        fileName += '-team';
      }
      
      // If no expenses, return empty array
      if (!expenses || expenses.length === 0) {
        return res.json([]);
      }
      
      // Fetch user details for each expense
      const expensesWithUserDetails = await Promise.all(expenses.map(async expense => {
        const user = await storage.getUser(expense.userId);
        return {
          id: expense.id,
          amount: expense.amount,
          category: expense.category,
          description: expense.description,
          status: expense.status,
          submittedBy: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
          submittedDate: expense.createdAt.toISOString().split('T')[0],
          updatedDate: expense.updatedAt.toISOString().split('T')[0],
        };
      }));
      
      // Convert to CSV
      const fields = [
        'id', 
        'amount', 
        'category', 
        'description', 
        'status', 
        'submittedBy', 
        'submittedDate', 
        'updatedDate'
      ];
      
      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(expensesWithUserDetails);
      
      // Set headers for file download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${fileName}-${new Date().toISOString().split('T')[0]}.csv`);
      
      res.send(csv);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
