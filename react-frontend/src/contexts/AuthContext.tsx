import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkSession, login as apiLogin, logout as apiLogout } from '../services/api';

// Define user type
export interface User {
  id: number;
  name: string;
  email: string;
  roles: string[];
  isAdmin: boolean;
  isStudent?: boolean;
}

// Define context type
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  isAdmin: boolean;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const checkAuthStatus = async () => {
    try {
      console.log('Starting session check...');
      const response = await checkSession();
      console.log('Session check response:', response);

      if (response.data.data.loggedIn) {
        const userData = response.data.data.user;
        // Check if this is a student session
        const isStudent = response.data.data.userRoles?.includes('student') || false;
        setUser({
          ...userData,
          isStudent
        });
        setIsLoading(false);
      } else {
        console.log('User is not logged in');
        setUser(null);
        setIsLoading(false);
        
        // Check for student session in localStorage
        const storedStudentId = localStorage.getItem('storedStudentId');
        const storedLoginTime = localStorage.getItem('storedLoginTime');
        
        if (storedStudentId && storedLoginTime) {
          const loginTime = parseInt(storedLoginTime);
          const currentTime = Date.now();
          const sessionAge = currentTime - loginTime;
          
          // If session is less than 24 hours old
          if (sessionAge < 24 * 60 * 60 * 1000) {
            // Don't redirect if already on student pages
            if (!window.location.pathname.includes('/student')) {
              navigate('/student/login');
            }
            return;
          }
        }
        
        // Redirect to login if not on login page
        if (!window.location.pathname.includes('/login')) {
          navigate('/login');
        }
      }
    } catch (err) {
      console.error('Session check error:', err);
      setError('Failed to check authentication status');
      setUser(null);
      setIsLoading(false);
      
      // Check for student session in localStorage
      const storedStudentId = localStorage.getItem('storedStudentId');
      if (storedStudentId && !window.location.pathname.includes('/student')) {
        navigate('/student/login');
      } else {
        navigate('/login');
      }
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const response = await apiLogin(email, password);
      
      if (response.data.success) {
        // Wait for checkAuthStatus to complete and get the updated user data
        await checkAuthStatus();
        
        // Get the latest user data from the response
        const isAdmin = response.data.user?.isAdmin || false;
        
        // Navigate based on user role
        if (isAdmin) {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(response.data.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await apiLogout();
      setUser(null);
      // Clear student session data
      localStorage.removeItem('storedStudentId');
      localStorage.removeItem('storedLoginTime');
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
      setError('Failed to logout');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      error,
      isAdmin: user?.isAdmin || false
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Create custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 