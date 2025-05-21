import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import authRoutes from "./routes/auth";
import expenseRoutes from "./routes/expenses";
import userRoutes from "./routes/users";
import reportRoutes from "./routes/reports";
import { authenticate } from "./middleware/auth";
import path from "path";
import fs from "fs";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  // Serve static files from uploads directory
  app.use('/uploads', authenticate, (req, res, next) => {
    // Only allow authenticated users to access uploads
    res.sendFile(path.join(uploadsDir, req.path), (err) => {
      if (err) {
        next(err);
      }
    });
  });

  // Register route handlers
  app.use('/api/auth', authRoutes);
  app.use('/api/expenses', expenseRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/reports', reportRoutes);
  
  // Health check route
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  const httpServer = createServer(app);

  return httpServer;
}
