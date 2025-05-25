import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  VStack, 
  Heading, 
  Text, 
  Code, 
  Container,
  Divider,
  useToast,
  ButtonGroup,
  Input,
  FormControl,
  FormLabel,
  HStack
} from '@chakra-ui/react';
import { api, testApi, testCors, checkApiStatus } from '../services/api';

const ApiTest: React.FC = () => {
  const [results, setResults] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('test@example.com');
  const [password, setPassword] = useState<string>('password123');
  const toast = useToast();

  const testEndpoints = async () => {
    try {
      setLoading(true);
      setResults({});

      // Test basic API endpoint
      const apiResponse = await testApi();
      setResults(prev => ({ ...prev, api: apiResponse.data }));

      // Test CORS
      const corsResponse = await testCors();
      setResults(prev => ({ ...prev, cors: corsResponse.data }));

      // Test API status
      const statusResponse = await checkApiStatus();
      setResults(prev => ({ ...prev, status: statusResponse.data }));

    } catch (err) {
      console.error('Error testing endpoints:', err);
      setError('Failed to test endpoints');
    } finally {
      setLoading(false);
    }
  };
  
  const testPaths = async () => {
    setLoading(true);
    setResults('');
    
    try {
      const pathResults = await api.testPaths();
      setResults(JSON.stringify(pathResults, null, 2));
      
      toast({
        title: 'Path tests completed',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      setResults(`Error during path tests: ${error.message}`);
      toast({
        title: 'Path tests failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };
  
  const testLogin = async () => {
    setLoading(true);
    setResults('');
    
    try {
      const loginResponse = await api.login(email, password);
      setResults(JSON.stringify(loginResponse.data, null, 2));
      
      toast({
        title: 'Login test completed',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // After login, check session
      try {
        const sessionResponse = await api.checkSession();
        setResults(prev => prev + '\n\nSession after login:\n' + 
          JSON.stringify(sessionResponse.data, null, 2));
      } catch (error) {
        console.error('Session check after login failed', error);
      }
    } catch (error: any) {
      setResults(`Error during login test: ${error.message}\n\n${error.response?.data ? JSON.stringify(error.response.data, null, 2) : ''}`);
      toast({
        title: 'Login test failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const debugLogin = async () => {
    setLoading(true);
    setResults('');
    
    try {
      const response = await api.debugLogin(email, password);
      setResults(JSON.stringify(response.data, null, 2));
      
      toast({
        title: 'Debug login completed',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      setResults(`Error during debug login: ${error.message}\n\n${error.response?.data ? JSON.stringify(error.response.data, null, 2) : ''}`);
      toast({
        title: 'Debug login failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="container.md" py={10}>
      <VStack spacing={6} align="stretch">
        <Heading>API Connection Test</Heading>
        <Text>
          This page tests the connection between the React frontend and PHP backend.
          Click the buttons below to test various API endpoints and path configurations.
        </Text>
        
        <ButtonGroup spacing={4}>
          <Button 
            colorScheme="blue" 
            isLoading={loading}
            onClick={testEndpoints}
          >
            Run API Tests
          </Button>
          
          <Button 
            colorScheme="green" 
            isLoading={loading}
            onClick={testPaths}
          >
            Test API Paths
          </Button>
        </ButtonGroup>
        
        <Divider my={2} />
        
        <Heading size="md">Test Login</Heading>
        <FormControl>
          <FormLabel>Email</FormLabel>
          <Input 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email"
            mb={2}
          />
          
          <FormLabel>Password</FormLabel>
          <Input 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            type="password"
            mb={3}
          />
          
          <Button 
            colorScheme="purple" 
            isLoading={loading}
            onClick={testLogin}
            width="100%"
            mb={3}
          >
            Test Login
          </Button>
          
          <Button 
            colorScheme="teal" 
            isLoading={loading}
            onClick={debugLogin}
            width="100%"
          >
            Debug Login (More Info)
          </Button>
        </FormControl>
        
        {results && (
          <>
            <Divider my={4} />
            <Heading size="md">Test Results:</Heading>
            <Box 
              bg="gray.50" 
              p={4} 
              borderRadius="md" 
              whiteSpace="pre-wrap"
              fontFamily="monospace"
              fontSize="sm"
              overflowX="auto"
            >
              {results}
            </Box>
          </>
        )}
      </VStack>
    </Container>
  );
};

export default ApiTest; 