import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { User, LoginCredentials, AuthResponse, UserRole } from '@/types';
import { setAuthData, clearAuthData, getToken, getUser, isAuthenticated as checkIsAuthenticated } from '@/lib/auth';
import { useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';

export function useAuth() {
  const [user, setUser] = useState<User | null>(getUser());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(checkIsAuthenticated());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  // Load user from localStorage on initial mount
  useEffect(() => {
    const storedUser = getUser();
    if (storedUser) {
      setUser(storedUser);
      setIsAuthenticated(true);
    }
  }, []);

  // Login function
  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data: AuthResponse = await response.json();
      
      // Store token and user data
      setAuthData(data.token, data.user);
      
      // Update state
      setUser(data.user);
      setIsAuthenticated(true);
      
      // Show success toast
      toast({
        title: 'Login Successful',
        description: `Welcome back, ${data.user.firstName}!`,
      });
      
      return true;
    } catch (error) {
      toast({
        title: 'Login Failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Register function
  const register = useCallback(async (userData: Omit<User, 'id'> & { password: string }) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data: AuthResponse = await response.json();
      
      // Store token and user data
      setAuthData(data.token, data.user);
      
      // Update state
      setUser(data.user);
      setIsAuthenticated(true);
      
      // Show success toast
      toast({
        title: 'Registration Successful',
        description: `Welcome, ${data.user.firstName}!`,
      });
      
      return true;
    } catch (error) {
      toast({
        title: 'Registration Failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Logout function
  const logout = useCallback(() => {
    clearAuthData();
    setUser(null);
    setIsAuthenticated(false);
    
    // Clear all queries from cache
    queryClient.clear();
    
    // Navigate to login page
    navigate('/login');
    
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
  }, [queryClient, navigate, toast]);

  // Check if user has a specific role
  const hasRole = useCallback((role: UserRole): boolean => {
    return !!user && user.role === role;
  }, [user]);

  // Check if user has any of the specified roles
  const hasAnyRole = useCallback((roles: UserRole[]): boolean => {
    return !!user && roles.includes(user.role as UserRole);
  }, [user]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    hasRole,
    hasAnyRole,
  };
}
