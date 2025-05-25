import React, { useState } from 'react';
import { useToast } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { login, checkSession } from '../services/api';

const StudentLogin = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await login(email, password);
      if (response.data && response.data.success) {
        toast({
          title: 'Success',
          description: 'Login successful',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        navigate('/dashboard');
      } else {
        toast({
          title: 'Error',
          description: response.data.message || 'Login failed',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Error',
        description: 'Login failed',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const checkExistingSession = async () => {
    try {
      const response = await checkSession();
      if (response.data && response.data.success) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Session check error:', error);
    }
  };

  return (
    <div>
      {/* Render your component content here */}
    </div>
  );
};

export default StudentLogin; 