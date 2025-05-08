import React from 'react';
import { Navigate } from 'react-router-dom';
import { Box, Spinner, Center, Alert, AlertIcon, AlertTitle, AlertDescription } from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';

interface AdminRouteProps {
  element: React.ReactElement;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ element }) => {
  const { user, isLoading, isAdmin } = useAuth();

  if (isLoading) {
    return (
      <Center minH="200px">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }

  // Check if user is logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Verify the user has admin role
  if (!isAdmin()) {
    return (
      <Box m={5}>
        <Alert status="error" variant="solid" borderRadius="md">
          <AlertIcon />
          <AlertTitle mr={2}>Access Denied</AlertTitle>
          <AlertDescription>You don't have permission to access this area.</AlertDescription>
        </Alert>
      </Box>
    );
  }

  return element;
};

export default AdminRoute; 