import { useState } from "react";
import { Link, useLocation } from "wouter";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useAuth } from "@/hooks/use-auth";
import { UserRole } from "@/types";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function Sidebar() {
  const { user, logout, hasAnyRole } = useAuth();
  const [location] = useLocation();

  // Define navigation items based on user role
  const navItems = [
    { 
      href: "/dashboard", 
      label: "Dashboard", 
      icon: "dashboard",
      roles: [UserRole.EMPLOYEE, UserRole.MANAGER, UserRole.ADMIN] 
    },
    { 
      href: "/expenses", 
      label: "My Expenses", 
      icon: "receipt_long",
      roles: [UserRole.EMPLOYEE, UserRole.MANAGER, UserRole.ADMIN] 
    },
    { 
      href: "/approvals", 
      label: "Approvals", 
      icon: "approval",
      roles: [UserRole.MANAGER, UserRole.ADMIN] 
    },
    { 
      href: "/team", 
      label: "Team Members", 
      icon: "people",
      roles: [UserRole.MANAGER, UserRole.ADMIN] 
    },
    { 
      href: "/reports", 
      label: "Reports", 
      icon: "insights",
      roles: [UserRole.MANAGER, UserRole.ADMIN] 
    },
    { 
      href: "/settings", 
      label: "Settings", 
      icon: "settings",
      roles: [UserRole.EMPLOYEE, UserRole.MANAGER, UserRole.ADMIN] 
    },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex flex-col w-full h-full bg-white shadow-md">
      <div className="px-4 py-6 flex items-center justify-center border-b border-gray-200">
        <h1 className="text-xl font-medium text-primary">ExpenseFlow</h1>
      </div>
      
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          // Only show items for which the user has the required role
          if (!hasAnyRole(item.roles)) return null;
          
          const isActive = location === item.href;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md group ${
                isActive 
                  ? "text-white bg-primary" 
                  : "text-neutral-dark hover:bg-neutral-light"
              }`}
            >
              <span 
                className={`material-icons mr-3 ${
                  isActive ? "text-white" : "text-neutral-main"
                }`}
              >
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      
      <Separator />
      
      <div className="px-4 py-4">
        {user && (
          <div className="flex items-center">
            <UserAvatar user={user} className="w-8 h-8" />
            <div className="ml-3">
              <p className="text-sm font-medium text-neutral-dark">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-neutral-main capitalize">
                {user.role}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto text-neutral-main hover:text-neutral-dark"
              onClick={handleLogout}
            >
              <span className="material-icons text-sm">logout</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
