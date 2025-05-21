import { users, expenses, auditLogs, comments } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, asc, like, ilike, or, inArray } from "drizzle-orm";
import type {
  User,
  InsertUser,
  Expense,
  InsertExpense,
  AuditLog,
  InsertAuditLog,
  Comment,
  InsertComment,
  ExpenseStatus,
  UpdateExpenseStatus
} from "@shared/schema";

// Interface for all storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(): Promise<User[]>;
  getUsersByRole(role: string): Promise<User[]>;
  getUsersByManagerId(managerId: number): Promise<User[]>;
  
  // Expense operations
  createExpense(expense: InsertExpense): Promise<Expense>;
  getExpense(id: number): Promise<Expense | undefined>;
  getExpensesByUserId(userId: number): Promise<Expense[]>;
  getPendingExpensesByManagerId(managerId: number): Promise<Expense[]>;
  updateExpenseStatus(id: number, update: UpdateExpenseStatus, approverId: number): Promise<Expense>;
  getExpensesStats(userId: number, managerId?: number): Promise<{ 
    pending: number, 
    approved: number, 
    rejected: number, 
    total: number 
  }>;
  searchExpenses(query: string, userId?: number, managerId?: number): Promise<Expense[]>;
  
  // Audit log operations
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getRecentAuditLogs(limit?: number): Promise<AuditLog[]>;
  getAuditLogsByUserId(userId: number): Promise<AuditLog[]>;
  getAuditLogsByExpenseId(expenseId: number): Promise<AuditLog[]>;
  
  // Comment operations
  createComment(comment: InsertComment): Promise<Comment>;
  getCommentsByExpenseId(expenseId: number): Promise<Comment[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role));
  }

  async getUsersByManagerId(managerId: number): Promise<User[]> {
    return await db.select().from(users).where(eq(users.managerId, managerId));
  }

  // Expense operations
  async createExpense(expense: InsertExpense): Promise<Expense> {
    const [result] = await db
      .insert(expenses)
      .values(expense)
      .returning();
    return result;
  }

  async getExpense(id: number): Promise<Expense | undefined> {
    const [expense] = await db.select().from(expenses).where(eq(expenses.id, id));
    return expense;
  }

  async getExpensesByUserId(userId: number): Promise<Expense[]> {
    return await db
      .select()
      .from(expenses)
      .where(eq(expenses.userId, userId))
      .orderBy(desc(expenses.createdAt));
  }

  async getPendingExpensesByManagerId(managerId: number): Promise<Expense[]> {
    // Get all employees under this manager
    const employees = await this.getUsersByManagerId(managerId);
    const employeeIds = employees.map(emp => emp.id);
    
    if (employeeIds.length === 0) return [];

    return await db
      .select()
      .from(expenses)
      .where(
        and(
          inArray(expenses.userId, employeeIds),
          eq(expenses.status, 'pending')
        )
      )
      .orderBy(desc(expenses.createdAt));
  }

  async updateExpenseStatus(
    id: number, 
    update: UpdateExpenseStatus, 
    approverId: number
  ): Promise<Expense> {
    const [updatedExpense] = await db
      .update(expenses)
      .set({
        status: update.status,
        updatedAt: new Date()
      })
      .where(eq(expenses.id, id))
      .returning();
    
    // If there's a comment, add it
    if (update.comment) {
      await this.createComment({
        expenseId: id,
        userId: approverId,
        content: update.comment
      });
    }
    
    return updatedExpense;
  }

  async getExpensesStats(
    userId: number, 
    managerId?: number
  ): Promise<{ pending: number; approved: number; rejected: number; total: number }> {
    let whereClause;
    
    if (managerId) {
      // For managers - get stats for their team
      const employees = await this.getUsersByManagerId(managerId);
      const employeeIds = employees.map(emp => emp.id);
      
      if (employeeIds.length === 0) {
        return { pending: 0, approved: 0, rejected: 0, total: 0 };
      }
      
      whereClause = inArray(expenses.userId, employeeIds);
    } else {
      // For individual users
      whereClause = eq(expenses.userId, userId);
    }
    
    const pendingCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(expenses)
      .where(and(whereClause, eq(expenses.status, 'pending')));
    
    const approvedCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(expenses)
      .where(and(whereClause, eq(expenses.status, 'approved')));
    
    const rejectedCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(expenses)
      .where(and(whereClause, eq(expenses.status, 'rejected')));
    
    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(expenses)
      .where(whereClause);

    const totalAmount = await db
      .select({ sum: sql<number>`sum(amount)` })
      .from(expenses)
      .where(
        and(
          whereClause,
          eq(expenses.status, 'approved'),
          sql`extract(month from ${expenses.createdAt}) = extract(month from current_date)`,
          sql`extract(year from ${expenses.createdAt}) = extract(year from current_date)`
        )
      );
    
    return {
      pending: pendingCount[0]?.count || 0,
      approved: approvedCount[0]?.count || 0,
      rejected: rejectedCount[0]?.count || 0,
      total: totalAmount[0]?.sum || 0
    };
  }

  async searchExpenses(
    query: string, 
    userId?: number, 
    managerId?: number
  ): Promise<Expense[]> {
    let whereClause;
    
    if (managerId) {
      // For managers - search within their team's expenses
      const employees = await this.getUsersByManagerId(managerId);
      const employeeIds = employees.map(emp => emp.id);
      
      if (employeeIds.length === 0) return [];
      
      whereClause = inArray(expenses.userId, employeeIds);
    } else if (userId) {
      // For individual users
      whereClause = eq(expenses.userId, userId);
    } else {
      // For admins - search all expenses
      whereClause = sql`1=1`;
    }
    
    // Add search condition
    whereClause = and(
      whereClause,
      or(
        ilike(expenses.description, `%${query}%`),
        ilike(expenses.category, `%${query}%`)
      )
    );
    
    return await db
      .select()
      .from(expenses)
      .where(whereClause)
      .orderBy(desc(expenses.createdAt));
  }

  // Audit log operations
  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const [result] = await db
      .insert(auditLogs)
      .values(log)
      .returning();
    return result;
  }

  async getRecentAuditLogs(limit: number = 10): Promise<AuditLog[]> {
    return await db
      .select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit);
  }

  async getAuditLogsByUserId(userId: number): Promise<AuditLog[]> {
    return await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.userId, userId))
      .orderBy(desc(auditLogs.createdAt));
  }

  async getAuditLogsByExpenseId(expenseId: number): Promise<AuditLog[]> {
    return await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.expenseId, expenseId))
      .orderBy(desc(auditLogs.createdAt));
  }

  // Comment operations
  async createComment(comment: InsertComment): Promise<Comment> {
    const [result] = await db
      .insert(comments)
      .values(comment)
      .returning();
    return result;
  }

  async getCommentsByExpenseId(expenseId: number): Promise<Comment[]> {
    return await db
      .select()
      .from(comments)
      .where(eq(comments.expenseId, expenseId))
      .orderBy(asc(comments.createdAt));
  }
}

export const storage = new DatabaseStorage();
