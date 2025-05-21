import { User, UserRole } from "@/types";

// Constants
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// Helper to store auth data
export const setAuthData = (token: string, user: User) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

// Helper to clear auth data
export const clearAuthData = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

// Helper to get stored token
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

// Helper to get stored user
export const getUser = (): User | null => {
  const userJson = localStorage.getItem(USER_KEY);
  if (!userJson) return null;
  
  try {
    return JSON.parse(userJson) as User;
  } catch (e) {
    console.error('Failed to parse user data:', e);
    return null;
  }
};

// Helper to check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getToken() && !!getUser();
};

// Helper to check if user has a specific role
export const hasRole = (role: UserRole): boolean => {
  const user = getUser();
  return !!user && user.role === role;
};

// Helper to check if user has any of the specified roles
export const hasAnyRole = (roles: UserRole[]): boolean => {
  const user = getUser();
  return !!user && roles.includes(user.role as UserRole);
};
