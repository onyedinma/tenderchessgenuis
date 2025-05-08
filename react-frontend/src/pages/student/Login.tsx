import React from 'react';
import { Box, Heading, Text, VStack, Image, Flex, useBreakpointValue } from '@chakra-ui/react';
import StudentLogin from '../../components/StudentLogin';
import { useNavigate } from 'react-router-dom';

const StudentLoginPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Responsive layout adjustments
  const flexDirection = useBreakpointValue({ base: 'column', md: 'row' }) as 'column' | 'row';
  const textAlign = useBreakpointValue({ base: 'center', md: 'left' }) as 'center' | 'left';
  
  const handleLoginSuccess = () => {
    navigate('/student/dashboard');
  };
  
  return (
    <Box minH="100vh" bg="gray.50" py={10}>
      <Box maxW="1200px" mx="auto" px={4}>
        <Flex 
          direction={flexDirection}
          align="center"
          justify="center"
          gap={10}
        >
          {/* Left side - Branding/Info */}
          <Box flex={1} mb={{ base: 8, md: 0 }}>
            <VStack align={textAlign} spacing={6}>
              <Image 
                src="/logo.png" 
                alt="Chess Quiz Show Logo" 
                boxSize="100px"
                fallbackSrc="https://via.placeholder.com/100?text=Chess" 
              />
              <Heading as="h1" size="xl" color="blue.600">
                Chess Quiz Show
              </Heading>
              <Text fontSize="lg" color="gray.600">
                Welcome back, student! Log in to access your quizzes, track your progress,
                and enhance your chess knowledge.
              </Text>
              <Text color="gray.500" fontSize="sm">
                If you don't have a student account, please contact your teacher or administrator.
              </Text>
            </VStack>
          </Box>
          
          {/* Right side - Login Form */}
          <Box flex={1}>
            <StudentLogin onLoginSuccess={handleLoginSuccess} />
          </Box>
        </Flex>
      </Box>
    </Box>
  );
};

export default StudentLoginPage; 