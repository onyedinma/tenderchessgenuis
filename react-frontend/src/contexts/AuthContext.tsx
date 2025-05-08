import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

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
    const checkSession = async () => {
      try {
        setIsLoading(true);
        const response = await api.checkSession();
        
        console.log('Session check response:', response.data);
        
        // Handle check-session.php response format
        if (response.data && response.data.loggedIn === true && response.data.user) {
          // Set user data from the response
          setUser({
            id: response.data.user.id,
            name: response.data.user.name,
            email: response.data.user.email,
            roles: response.data.user.roles || [],
            isAdmin: response.data.user.isAdmin === true
          });
        } else {
          // Not logged in or session expired
          setUser(null);
        }
      } catch (err) {
        console.error('Session check error:', err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.login(email, password);
      
      console.log('Login response:', response.data);
      
      if (response.data && response.data.success) {
        const userData = response.data.user;
        setUser(userData);
        
        // Redirect based on user role
        if (userData.isAdmin) {
          // Redirect admin users to the admin dashboard
          console.log('Admin user detected, redirecting to admin dashboard');
          navigate('/admin');
        } else {
          // Redirect regular users to home
          navigate('/');
        }
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || err.message || 'An error occurred during login');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.register(name, email, password);
      
      if (response.data && response.data.success) {
        navigate('/login');
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'An error occurred during registration');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await api.logout();
      setUser(null);
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
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