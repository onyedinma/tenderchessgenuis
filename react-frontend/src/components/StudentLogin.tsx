import React, { useState } from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Button,
  Heading,
  Text,
  useToast,
  VStack,
  InputGroup,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AlreadyLoggedInModal from './AlreadyLoggedInModal';

interface StudentLoginProps {
  onLoginSuccess?: (studentData: any) => void;
}

const StudentLogin: React.FC<StudentLoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showAlreadyLoggedInModal, setShowAlreadyLoggedInModal] = useState(false);
  
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogoutOtherSession = async () => {
    try {
      await axios.post('/api/auth/logout.php', {}, { withCredentials: true });
      setShowAlreadyLoggedInModal(false);
      // Retry login after logout
      handleSubmit(new Event('submit') as any);
    } catch (err) {
      console.error('Error logging out other session:', err);
      toast({
        title: 'Error',
        description: 'Failed to log out other session. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('Username and password are required');
      return;
    }
    
    try {
      setLoading(true);
      
      console.log("Sending student login request with credentials", { username });
      
      const response = await axios.post('/api/auth/student-login.php', {
        username,
        password
      }, {
        withCredentials: true
      });
      
      console.log("Student login response:", response.data);
      
      if (response.data.success) {
        if (response.data.alreadyLoggedIn) {
          setShowAlreadyLoggedInModal(true);
          return;
        }

        console.log("Session ID from login response:", response.data.session_id);
        
        localStorage.setItem('studentLoginTime', Date.now().toString());
        localStorage.setItem('studentId', response.data.student.id.toString());
        
        toast({
          title: 'Login successful',
          description: `Welcome back, ${response.data.student.name}!`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        try {
          const sessionCheck = await axios.get('/api/auth/check-session.php', {
            withCredentials: true
          });
          console.log("Session check after login:", sessionCheck.data);
          
          if (!sessionCheck.data.loggedIn) {
            console.error("Session validation failed immediately after login");
          }
        } catch (sessionErr) {
          console.error("Error checking session after login:", sessionErr);
        }
        
        if (onLoginSuccess) {
          onLoginSuccess(response.data.student);
        } else {
          navigate('/student/dashboard');
        }
      } else {
        setError(response.data.message || 'Login failed');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.response) {
        console.error('Response data:', err.response.data);
        console.error('Response status:', err.response.status);
        console.error('Response headers:', err.response.headers);
        setError(err.response.data?.message || 'An error occurred while logging in');
      } else if (err.request) {
        console.error('No response received:', err.request);
        setError('No response received from server');
      } else {
        console.error('Error message:', err.message);
        setError('An error occurred while logging in');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Box maxW="md" mx="auto" p={6} borderRadius="md" boxShadow="lg" bg="white">
        <VStack spacing={6}>
          <Heading as="h2" size="lg">Student Login</Heading>
          
          {error && (
            <Text color="red.500" fontWeight="medium">
              {error}
            </Text>
          )}
          
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Username</FormLabel>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      icon={showPassword ? <FaEyeSlash /> : <FaEye />}
                      variant="ghost"
                      onClick={() => setShowPassword(!showPassword)}
                      size="sm"
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>
              
              <Button
                type="submit"
                colorScheme="blue"
                width="100%"
                mt={4}
                isLoading={loading}
              >
                Log In
              </Button>
            </VStack>
          </form>
        </VStack>
      </Box>

      <AlreadyLoggedInModal
        isOpen={showAlreadyLoggedInModal}
        onClose={() => setShowAlreadyLoggedInModal(false)}
        onLogout={handleLogoutOtherSession}
      />
    </>
  );
};

export default StudentLogin; 