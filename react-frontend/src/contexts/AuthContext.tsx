import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, login as apiLogin, register as apiRegister, logout as apiLogout, checkSession } from '../services/api';

// Define user type
export interface User {
  id: number;
  name: string;
  email: string;
  roles: string[];
  isAdmin: boolean;
  groups?: Array<{ id: number; name: string }>;
}

// Define context type
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: () => boolean;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Check if user is logged in on initial load
  useEffect(() => {
    const performSessionCheck = async () => {
      try {
        setIsLoading(true);
        console.log('Starting session check...');
        const response = await checkSession();
        
        console.log('Session check response:', response);
        
        // Handle case where response is undefined
        if (!response) {
          console.error('No response received from session check');
          setUser(null);
          return;
        }
        
        // Handle case where response.data is undefined
        if (!response.data) {
          console.error('No data in session check response');
          setUser(null);
          return;
        }
        
        // Handle case where response.data.data is undefined
        if (!response.data.data) {
          console.error('No nested data in session check response');
          setUser(null);
          return;
        }
        
        const { loggedIn, user: userData } = response.data.data;
        
        if (loggedIn === true && userData) {
          console.log('User is logged in:', userData);
          setUser({
            id: userData.id,
            name: userData.name,
            email: userData.email,
            roles: userData.roles || [],
            isAdmin: userData.isAdmin === true
          });
        } else {
          console.log('User is not logged in');
          setUser(null);
        }
      } catch (err: any) {
        console.error('Session check error:', err);
        console.error('Error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    performSessionCheck();
  }, []);

  // Login function with improved error handling
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiLogin(email, password);
      
      if (response.data && response.data.success) {
        const userData = response.data.user;
        setUser(userData);
        
        if (userData.isAdmin) {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred during login';
      console.error('Login error:', err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Register function with improved error handling
  const register = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiRegister(name, email, password);
      
      if (response.data && response.data.success) {
        navigate('/login');
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred during registration';
      console.error('Registration error:', err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function with improved error handling
  const logout = async () => {
    try {
      await apiLogout();
      setUser(null);
      setError(null);
      navigate('/login');
    } catch (err: any) {
      console.error('Logout error:', err);
      setError('Failed to logout properly. Please try again.');
    }
  };

  const isAdmin = () => {
    return user?.isAdmin === true;
  };

  // Context value
  const value = {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Create custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext; 