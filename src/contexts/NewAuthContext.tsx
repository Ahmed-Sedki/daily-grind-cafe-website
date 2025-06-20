import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import newAuthService, { User, LoginCredentials } from '../services/new-auth.service';
import { useToast } from '@/components/ui/use-toast';

// Define the context type
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  emergencyLogin: () => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

// Create the context with undefined default value
const NewAuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const NewAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Check for existing user on mount
  useEffect(() => {
    const storedUser = newAuthService.getUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      console.log('Login initiated from context for user:', username);

      const response = await newAuthService.login({ username, password });
      console.log('Login successful in context:', response);
      setUser(response.user);

      toast({
        title: "Login successful",
        description: `Welcome back, ${response.user.firstName || username}!`,
      });
    } catch (error) {
      console.error('Login error in context:', error);

      // Show a more detailed error message
      let errorMessage = 'An error occurred during login';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        errorMessage = JSON.stringify(error);
      }

      toast({
        variant: "destructive",
        title: "Login failed",
        description: errorMessage,
      });

      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Emergency login function
  const emergencyLogin = async () => {
    try {
      setLoading(true);
      console.log('Emergency login initiated from context');

      const response = await newAuthService.emergencyAdminLogin();
      console.log('Emergency login successful in context:', response);
      setUser(response.user);

      toast({
        title: "Emergency login successful",
        description: "You are now logged in as admin.",
      });
    } catch (error) {
      console.error('Emergency login error in context:', error);

      // Show a more detailed error message
      let errorMessage = 'An error occurred during emergency login';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        errorMessage = JSON.stringify(error);
      }

      toast({
        variant: "destructive",
        title: "Emergency login failed",
        description: errorMessage,
      });

      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    newAuthService.logout();
    setUser(null);

    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  // Context value
  const value = {
    user,
    loading,
    login,
    emergencyLogin,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  };

  return <NewAuthContext.Provider value={value}>{children}</NewAuthContext.Provider>;
};

// Custom hook to use the auth context
export const useNewAuth = () => {
  const context = useContext(NewAuthContext);
  if (context === undefined) {
    throw new Error('useNewAuth must be used within a NewAuthProvider');
  }
  return context;
};
