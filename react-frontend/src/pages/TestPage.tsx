import React from 'react';
import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  Button, 
  VStack, 
  Link as ChakraLink 
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';

const TestPage: React.FC = () => {
  return (
    <Container maxW="container.md" py={10}>
      <VStack spacing={6} align="stretch">
        <Heading>Simple Test Page</Heading>
        <Text>
          This is a simple test page that doesn't make any API calls.
          If you can see this page, your React router is working correctly.
        </Text>
        
        <Box 
          bg="blue.50" 
          p={4} 
          borderRadius="md"
        >
          <Heading size="md" mb={2}>Navigation Links</Heading>
          <VStack align="start" spacing={2}>
            <ChakraLink as={Link} to="/" color="blue.600">Home</ChakraLink>
            <ChakraLink as={Link} to="/login" color="blue.600">Login</ChakraLink>
            <ChakraLink as={Link} to="/register" color="blue.600">Register</ChakraLink>
            <ChakraLink as={Link} to="/api-test" color="blue.600">API Test</ChakraLink>
          </VStack>
        </Box>
        
        <Button colorScheme="blue" onClick={() => alert('Button clicked!')}>
          Click Me
        </Button>
      </VStack>
    </Container>
  );
};

export default TestPage; 