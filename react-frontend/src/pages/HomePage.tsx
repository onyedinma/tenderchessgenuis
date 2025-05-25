import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  VStack,
  Button,
  HStack,
  Flex,
  Image,
  useColorModeValue,
  Container,
  Divider
} from '@chakra-ui/react';
import { FaChessKing, FaUserGraduate, FaUserShield } from 'react-icons/fa';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const HomePage: React.FC = () => {
  const { user, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  const bgGradient = useColorModeValue(
    'linear(to-b, blue.50, white)',
    'linear(to-b, gray.800, gray.900)'
  );
  
  const cardBg = useColorModeValue('white', 'gray.700');
  
  // Redirect logged-in users to appropriate dashboards
  useEffect(() => {
    if (!isLoading && user) {
      // If user is already logged in, redirect to appropriate page
      if (isAdmin) {
        console.log('Admin user already logged in, redirecting to admin dashboard');
        navigate('/admin');
      } else {
        navigate('/home');
      }
    }
  }, [isLoading, user, navigate, isAdmin]);
  
  // If still loading or user is logged in, don't render login choices
  if (isLoading || user) {
    return null;
  }
  
  return (
    <Box minH="100vh" bgGradient={bgGradient}>
      <Container maxW="container.xl" py={10}>
        <VStack spacing={10} align="center" textAlign="center">
          {/* Hero Section */}
          <VStack spacing={4} pt={10}>
            <Flex fontSize="6xl" color="blue.500">
              <FaChessKing />
            </Flex>
            <Heading as="h1" size="2xl" fontWeight="bold">
              Chess Quiz Show
            </Heading>
            <Text fontSize="xl" maxW="3xl" color="gray.600">
              Welcome to the Chess Quiz Show platform! Choose your login type below to continue.
            </Text>
          </VStack>
          
          <Divider maxW="md" />
          
          {/* Login Options */}
          <Flex 
            direction={{ base: 'column', md: 'row' }} 
            gap={8} 
            width="100%" 
            justify="center"
            align="stretch"
          >
            {/* Administrator Option */}
            <Box 
              bg={cardBg}
              p={8}
              borderRadius="lg"
              boxShadow="lg"
              flex={1}
              maxW={{ base: '100%', md: '400px' }}
              border="1px"
              borderColor="gray.200"
            >
              <VStack spacing={6} height="100%">
                <Flex 
                  boxSize="80px" 
                  bg="blue.500" 
                  color="white" 
                  borderRadius="full" 
                  justify="center" 
                  align="center"
                  fontSize="3xl"
                >
                  <FaUserShield />
                </Flex>
                <Heading as="h2" size="lg">Administrator</Heading>
                <Text color="gray.600">
                  Login to access the admin dashboard, manage students, quizzes, and view analytics.
                </Text>
                <Button 
                  as={RouterLink} 
                  to="/login" 
                  colorScheme="blue" 
                  size="lg" 
                  width="100%"
                  mt="auto"
                >
                  Admin Login
                </Button>
              </VStack>
            </Box>
            
            {/* Student Option */}
            <Box 
              bg={cardBg}
              p={8}
              borderRadius="lg"
              boxShadow="lg"
              flex={1}
              maxW={{ base: '100%', md: '400px' }}
              border="1px"
              borderColor="gray.200"
            >
              <VStack spacing={6} height="100%">
                <Flex 
                  boxSize="80px" 
                  bg="green.500" 
                  color="white" 
                  borderRadius="full" 
                  justify="center" 
                  align="center"
                  fontSize="3xl"
                >
                  <FaUserGraduate />
                </Flex>
                <Heading as="h2" size="lg">Student</Heading>
                <Text color="gray.600">
                  Login to take quizzes, track your progress, and improve your chess knowledge.
                </Text>
                <Button 
                  as={RouterLink} 
                  to="/student/login" 
                  colorScheme="green" 
                  size="lg" 
                  width="100%"
                  mt="auto"
                >
                  Student Login
                </Button>
              </VStack>
            </Box>
          </Flex>
        </VStack>
      </Container>
    </Box>
  );
};

export default HomePage; 