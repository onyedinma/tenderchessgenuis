import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Flex,
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  SimpleGrid,
  Divider,
  Avatar,
  Spinner,
  Badge,
  useToast,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { FaChessBoard, FaTrophy, FaChartLine, FaBook } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const StudentDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [student, setStudent] = useState<any>(null);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check session and get student data
    const checkSession = async () => {
      try {
        console.log("Checking student session...");
        
        // Check if we have local storage data as a backup
        const storedLoginTime = localStorage.getItem('studentLoginTime');
        const storedStudentId = localStorage.getItem('studentId');
        
        console.log("Local storage data:", { storedLoginTime, storedStudentId });
        
        const response = await axios.get('/api/auth/check-session.php', {
          withCredentials: true
        });
        
        console.log("Session check response:", response.data);
        
        if (response.data.loggedIn && response.data.isStudent) {
          console.log("Valid student session found:", response.data.student);
          setStudent(response.data.student);
          // Fetch available quizzes
          fetchQuizzes();
        } else {
          console.error("Session check failed - not logged in as student");
          
          // If we have stored student ID but session expired, we can try to recover
          if (storedStudentId) {
            setSessionError("Your session expired. Please try refreshing the page or log in again.");
          } else {
            // Not logged in as student, redirect to login
            toast({
              title: 'Session expired',
              description: 'Please log in again',
              status: 'warning',
              duration: 3000,
            });
            navigate('/student/login');
          }
        }
      } catch (error) {
        console.error('Session check error:', error);
        setSessionError("There was a problem connecting to the server. Please try refreshing the page.");
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();
  }, [navigate, toast]);

  const fetchQuizzes = async () => {
    try {
      console.log("Fetching quizzes for student...");
      const response = await axios.get('/api/quizzes/get-quizzes.php', {
        withCredentials: true
      });
      
      console.log("Quizzes response:", response.data);
      
      if (response.data.success) {
        setQuizzes(response.data.quizzes || []);
      } else {
        console.error("Quizzes fetch failed:", response.data.message);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      toast({
        title: 'Error',
        description: 'Failed to load quizzes',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleLogout = async () => {
    try {
      console.log("Logging out student...");
      const response = await axios.get('/api/auth/logout.php', {
        withCredentials: true
      });
      
      console.log("Logout response:", response.data);
      
      // Clear local storage
      localStorage.removeItem('studentLoginTime');
      localStorage.removeItem('studentId');
      
      toast({
        title: 'Logged out',
        description: 'You have been logged out successfully',
        status: 'success',
        duration: 3000,
      });
      
      navigate('/student/login');
    } catch (error) {
      console.error('Logout error:', error);
      
      // Even if server logout fails, clear local storage and redirect
      localStorage.removeItem('studentLoginTime');
      localStorage.removeItem('studentId');
      navigate('/student/login');
    }
  };

  const handleSessionError = () => {
    navigate('/student/login');
  };

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
        <Text mt={4}>Loading your dashboard...</Text>
      </Box>
    );
  }
  
  if (sessionError) {
    return (
      <Box textAlign="center" py={10}>
        <Alert status="error" mb={6}>
          <AlertIcon />
          {sessionError}
        </Alert>
        <Button onClick={handleSessionError} colorScheme="blue">
          Go to Login
        </Button>
      </Box>
    );
  }

  return (
    <Box p={5} maxW="1200px" mx="auto">
      <Flex justify="space-between" align="center" mb={8}>
        <HStack spacing={4}>
          <Avatar size="lg" name={student?.name} src={student?.photo} />
          <VStack align="start" spacing={0}>
            <Heading as="h1" size="lg">Welcome, {student?.name}</Heading>
            <Text color="gray.600">{student?.username}</Text>
          </VStack>
        </HStack>
        
        <Button onClick={handleLogout} colorScheme="red" variant="outline">
          Logout
        </Button>
      </Flex>
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={5} mb={8}>
        <Card>
          <CardHeader bg="blue.50" p={4}>
            <HStack>
              <FaChessBoard size="20" />
              <Heading size="md">Available Quizzes</Heading>
            </HStack>
          </CardHeader>
          <CardBody>
            <Text fontSize="2xl" fontWeight="bold">{quizzes.length}</Text>
          </CardBody>
        </Card>
        
        <Card>
          <CardHeader bg="green.50" p={4}>
            <HStack>
              <FaTrophy size="20" />
              <Heading size="md">Completed</Heading>
            </HStack>
          </CardHeader>
          <CardBody>
            <Text fontSize="2xl" fontWeight="bold">0</Text>
          </CardBody>
        </Card>
        
        <Card>
          <CardHeader bg="purple.50" p={4}>
            <HStack>
              <FaChartLine size="20" />
              <Heading size="md">Average Score</Heading>
            </HStack>
          </CardHeader>
          <CardBody>
            <Text fontSize="2xl" fontWeight="bold">-</Text>
          </CardBody>
        </Card>
        
        <Card>
          <CardHeader bg="orange.50" p={4}>
            <HStack>
              <FaBook size="20" />
              <Heading size="md">Study Materials</Heading>
            </HStack>
          </CardHeader>
          <CardBody>
            <Text fontSize="2xl" fontWeight="bold">0</Text>
          </CardBody>
        </Card>
      </SimpleGrid>
      
      <Box mb={8}>
        <Heading as="h2" size="md" mb={4}>Available Quizzes</Heading>
        <Divider mb={4} />
        
        {quizzes.length === 0 ? (
          <Card p={5} textAlign="center">
            <Text>No quizzes available at the moment.</Text>
          </Card>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
            {quizzes.map((quiz) => (
              <Card key={quiz.id}>
                <CardHeader>
                  <Heading size="md">{quiz.title}</Heading>
                </CardHeader>
                <CardBody>
                  <Text>{quiz.description}</Text>
                  <HStack mt={2}>
                    <Badge colorScheme="blue">{quiz.category}</Badge>
                    <Badge colorScheme="green">{quiz.questions_count} questions</Badge>
                    <Badge colorScheme="purple">{quiz.time_limit} minutes</Badge>
                  </HStack>
                </CardBody>
                <CardFooter>
                  <Button 
                    colorScheme="blue" 
                    onClick={() => navigate(`/student/quiz/${quiz.id}`)}
                  >
                    Start Quiz
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </Box>
    </Box>
  );
};

export default StudentDashboard; 