import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

// Hook to access user data
export const useUser = () => {
  const { user, isLoading } = useContext(AuthContext);
  return { user, isLoading };
};

// Hook for login functionality
export const useLogin = () => {
  const { login, error, isLoading, clearError } = useContext(AuthContext);
  return { login, error, isLoading, clearError };
};

// Hook for registration functionality
export const useRegister = () => {
  const { register, error, isLoading, clearError } = useContext(AuthContext);
  return { register, error, isLoading, clearError };
};

// Hook for logout functionality
export const useLogout = () => {
  const { logout } = useContext(AuthContext);
  return logout;
};

// Hook for accessing the full auth context
export const useAuth = () => {
  return useContext(AuthContext);
}; 