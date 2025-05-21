// User-related types
export enum UserRole {
  EMPLOYEE = 'employee',
  MANAGER = 'manager',
  ADMIN = 'admin'
}

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  managerId?: number | null;
}

// Expense-related types
export enum ExpenseStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export enum ExpenseCategory {
  TRAVEL = 'travel',
  MEALS = 'meals',
  OFFICE = 'office',
  CONFERENCE = 'conference',
  SOFTWARE = 'software',
  OTHER = 'other'
}

export interface Expense {
  id: number;
  userId: number;
  amount: number;
  category: ExpenseCategory;
  description: string;
  status: ExpenseStatus;
  receiptUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: number;
  expenseId: number;
  userId: number;
  content: string;
  createdAt: string;
}

export interface ExpenseWithComments {
  expense: Expense;
  comments: Comment[];
}

// Auth-related types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Stats-related types
export interface ExpenseStats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

// Audit-related types
export interface AuditLog {
  id: number;
  userId: number;
  expenseId?: number;
  action: string;
  details: string;
  createdAt: string;
  userName?: string;
  userRole?: string;
  expense?: {
    id: number;
    amount: number;
    category: string;
    status: string;
    ownerName: string;
  };
}

// Form-related types
export interface NewExpenseFormValues {
  amount: number;
  category: ExpenseCategory;
  description: string;
  receipt: File | null;
}

export interface RejectFormValues {
  comment: string;
}
