# Expense Approval Workflow System

## Overview

This repository contains the source code for an expense approval workflow system. It's a full-stack web application that allows employees to submit expenses, managers to approve or reject them, and administrators to manage the system. The application has a React frontend with a Node.js/Express backend, using Drizzle ORM with a PostgreSQL database.

The system implements role-based access control with employee, manager, and admin user roles, and has features for expense submission, approval workflows, reporting, and user management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a modern full-stack architecture with clear separation of concerns:

1. **Frontend**: React-based SPA built with Vite, using modern React patterns and hooks
2. **Backend**: Express.js server providing a RESTful API
3. **Database**: PostgreSQL with Drizzle ORM for data modeling and queries
4. **Authentication**: JWT-based authentication with role-based access control
5. **File Storage**: Local file storage for expense receipts uploaded via multer

The application is structured with shared code between frontend and backend, allowing for type safety across the stack. API routes follow RESTful conventions and are protected with role-based middleware.

## Key Components

### Backend Components

1. **Server Setup (`server/index.ts`)**: 
   - Express server configuration
   - Middleware setup
   - API route registration

2. **Database Layer (`server/db.ts`)**: 
   - Connection to PostgreSQL using Drizzle ORM
   - Uses @neondatabase/serverless for compatibility with serverless environments

3. **Storage Service (`server/storage.ts`)**: 
   - Interface defining all database operations
   - Implementation for users, expenses, audit logs, and comments

4. **Authentication (`server/middleware/auth.ts`)**: 
   - JWT-based authentication
   - Role-based authorization middleware

5. **API Routes**:
   - `/api/auth`: Authentication endpoints (login, register)
   - `/api/expenses`: Expense management endpoints
   - `/api/users`: User management endpoints
   - `/api/reports`: Reporting endpoints

6. **Email Service (`server/services/email.ts`)**: 
   - Nodemailer integration for sending notifications
   - Development test account support

### Frontend Components

1. **App Structure (`client/src/App.tsx`)**: 
   - React component hierarchy
   - Routing using Wouter

2. **UI Components**: 
   - Uses a rich set of Radix UI components via shadcn/ui
   - Custom themed components following a design system

3. **Pages**:
   - Dashboard
   - Expenses management
   - Approval workflows
   - Reporting
   - User management
   - Settings

4. **Authentication & State Management**:
   - Custom auth hooks
   - Local storage for tokens and user data
   - TanStack Query for data fetching and caching

### Shared Components

1. **Database Schema (`shared/schema.ts`)**:
   - Drizzle schema definitions
   - Zod validation schemas for form validation

## Data Flow

1. **Authentication Flow**:
   - User submits login credentials
   - Server validates and returns JWT token
   - Token is stored in local storage
   - Auth state is maintained in React context

2. **Expense Submission Flow**:
   - User submits expense with receipt image
   - Receipt is uploaded to server
   - Expense record is created in database
   - Notifications are sent to approvers

3. **Expense Approval Flow**:
   - Manager views pending approvals
   - Updates expense status (approve/reject)
   - Audit log is created
   - Email notification is sent to submitter

4. **Reporting Flow**:
   - Managers can view expense reports
   - Activity logs track system actions
   - Reports can be exported to CSV

## External Dependencies

### Backend Dependencies
- Express: Web server framework
- Drizzle ORM: Database ORM
- jsonwebtoken: JWT authentication
- bcryptjs: Password hashing
- multer: File uploads
- nodemailer: Email notifications

### Frontend Dependencies
- React: UI framework
- Wouter: Routing
- TanStack Query: Data fetching and caching
- shadcn/ui & Radix UI: UI component library
- Tailwind CSS: Utility-first CSS framework
- react-hook-form: Form handling
- zod: Schema validation

## Deployment Strategy

The application is configured for deployment on Replit with:

1. **Build Process**:
   - Frontend: Vite builds static assets
   - Backend: esbuild compiles server code
   - Combined into a single deployable package

2. **Runtime Environment**:
   - Node.js v20
   - PostgreSQL v16
   - Web server running on port 5000

3. **Environment Variables**:
   - DATABASE_URL: PostgreSQL connection string
   - JWT_SECRET: Secret for JWT tokens
   - SMTP_* variables for email configuration

The system assumes PostgreSQL is available and properly configured. The Drizzle ORM handles database schema creation and migrations.

## Getting Started

To run the application:

1. Ensure PostgreSQL is properly provisioned and DATABASE_URL is set
2. Run `npm run dev` for development
3. For production deployment, run `npm run build` followed by `npm run start`

## Future Considerations

Areas that might need additional development:

1. Comprehensive test suite
2. Cloud storage integration for receipts
3. Advanced reporting features
4. Integration with accounting software
5. Mobile app or responsive improvements