import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/api';
import { User } from '../types';

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  error: string | null;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: () => {},
  error: null,
  checkAuth: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Function to check authentication status
  const checkAuth = async () => {
    try {
      setIsLoading(true);
      
      // Only try to get the profile if we have a token
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Try to get the current user profile
          const currentUser = await authService.getProfile();
          if (currentUser) {
            setUser(currentUser);
            console.log("Auth check successful, user logged in:", currentUser.email);
          }
        } catch (error) {
          console.error('Auth check error:', error);
          // Clear any invalid tokens
          localStorage.removeItem('token');
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } finally {
      setIsLoading(false);
      setAuthChecked(true);
    }
  };

  useEffect(() => {
    // Check if user is already logged in
    if (!authChecked) {
      checkAuth();
    }
  }, [authChecked]);

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { user, token } = await authService.login(credentials);
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      
      setUser(user);
      setAuthChecked(false); // Reset auth check status to enable rechecking after login
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Handle different error types
      if (err.response) {
        // Server responded with an error status
        if (err.response.status === 401) {
          setError('Invalid email or password');
        } else {
          setError(err.response.data?.message || 'Login failed');
        }
      } else if (err.request) {
        // Request was made but no response received
        setError('No response from server. Please try again later.');
      } else {
        // Something else happened
        setError('Login failed. Please try again.');
      }
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setAuthChecked(true); // Mark as checked to prevent auto-login attempts
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    error,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext; 