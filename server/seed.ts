import { db } from "./db";
import { users, expenses, auditLogs, comments } from "@shared/schema";
import { UserRole, ExpenseStatus, ExpenseCategory } from "@shared/schema";
import bcrypt from "bcryptjs";

async function seedDatabase() {
  console.log("Starting database seeding...");
  
  try {
    // Check if users already exist
    const existingUsers = await db.select().from(users);
    
    if (existingUsers.length === 0) {
      console.log("Seeding users...");
      
      // Create admin user
      const adminUser = await db.insert(users).values({
        username: "admin",
        email: "admin@example.com",
        firstName: "Admin",
        lastName: "User",
        password: await bcrypt.hash("password123", 10),
        role: UserRole.ADMIN,
        managerId: null,
      }).returning();
      
      // Create manager user
      const managerUser = await db.insert(users).values({
        username: "manager",
        email: "manager@example.com",
        firstName: "Manager",
        lastName: "User",
        password: await bcrypt.hash("password123", 10),
        role: UserRole.MANAGER,
        managerId: null,
      }).returning();
      
      // Create employee user
      const employeeUser = await db.insert(users).values({
        username: "employee",
        email: "employee@example.com",
        firstName: "Employee",
        lastName: "User",
        password: await bcrypt.hash("password123", 10),
        role: UserRole.EMPLOYEE,
        managerId: managerUser[0].id,
      }).returning();
      
      console.log("Users seeded successfully.");
      
      // Seed expenses
      console.log("Seeding expenses...");
      
      // Add a few sample expenses
      await db.insert(expenses).values({
        userId: employeeUser[0].id,
        amount: 125.50,
        category: ExpenseCategory.TRAVEL,
        description: "Client meeting travel expenses",
        status: ExpenseStatus.PENDING,
        receiptUrl: "/uploads/sample-receipt-1.jpg"
      });
      
      await db.insert(expenses).values({
        userId: employeeUser[0].id,
        amount: 75.25,
        category: ExpenseCategory.MEALS,
        description: "Team lunch with clients",
        status: ExpenseStatus.APPROVED,
        receiptUrl: "/uploads/sample-receipt-2.jpg"
      });
      
      await db.insert(expenses).values({
        userId: employeeUser[0].id,
        amount: 349.99,
        category: ExpenseCategory.SOFTWARE,
        description: "Software license renewal",
        status: ExpenseStatus.REJECTED,
        receiptUrl: "/uploads/sample-receipt-3.jpg"
      });
      
      console.log("Expenses seeded successfully.");
      
      // Seed audit logs
      console.log("Seeding audit logs...");
      
      await db.insert(auditLogs).values({
        userId: managerUser[0].id,
        expenseId: 2,
        action: "APPROVE_EXPENSE",
        details: "Expense approved by manager"
      });
      
      await db.insert(auditLogs).values({
        userId: managerUser[0].id,
        expenseId: 3,
        action: "REJECT_EXPENSE",
        details: "Expense rejected: Insufficient documentation"
      });
      
      console.log("Audit logs seeded successfully.");
      
      // Seed comments
      console.log("Seeding comments...");
      
      await db.insert(comments).values({
        expenseId: 3,
        userId: managerUser[0].id,
        content: "Please provide more detailed receipts next time."
      });
      
      console.log("Comments seeded successfully.");
      
    } else {
      console.log("Database already has users, skipping seeding.");
    }
    
    console.log("Database seeding completed successfully.");
    
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

// Export for use in server startup
export { seedDatabase };