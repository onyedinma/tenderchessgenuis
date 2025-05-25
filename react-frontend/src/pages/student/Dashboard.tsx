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
  AlertIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Switch,
  Spacer,
  IconButton,
  Tooltip,
  useColorModeValue,
  Stack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Portal,
} from '@chakra-ui/react';
import { FaChessBoard, FaTrophy, FaChartLine, FaBook, FaSync } from 'react-icons/fa';
import { AddIcon, DeleteIcon, EditIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@chakra-ui/react';
import { api } from '../../services/api';

interface Student {
  id: number;
  name: string;
  username: string;
  email: string;
  photo?: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  questions_count: number;
  time_limit: number;
  category: string;
  created_at: string;
  section_type: string;
  image: string | null;
  bank?: {
    id: string;
  };
}

interface Section {
  section_type: string;
  questions: Quiz[];
}

const StudentDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now());
  const [isPolling, setIsPolling] = useState(true);
  const [section1Timer, setSection1Timer] = useState<number>(0);
  const [section2Timer, setSection2Timer] = useState<number>(0);
  const [section1Enabled, setSection1Enabled] = useState<boolean>(false);
  const [section2Enabled, setSection2Enabled] = useState<boolean>(false);
  const toast = useToast();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [recentQuizzes, setRecentQuizzes] = useState<Quiz[]>([]);

  // Function to check if student is in an active quiz
  const checkActiveQuiz = () => {
    return window.location.hash.includes('/student/section/');
  };

  useEffect(() => {
    // Check session and get student data
    const checkSession = async () => {
      try {
        console.log("Checking student session...");
        
        // Check if we have local storage data as a backup
        const storedLoginTime = localStorage.getItem('studentLoginTime');
        const storedStudentId = localStorage.getItem('studentId');
        
        console.log("Local storage data:", { storedLoginTime, storedStudentId });
        
        const response = await api.get('/auth/check-session.php');
        
        console.log("Session check response:", response.data);
        
        // Check if the response has the expected data structure
        if (response.data && response.data.data) {
          const { loggedIn, user } = response.data.data;

          // Log the details from response.data.data
          console.log("Session check data details:", { loggedIn, user, userRoles: user?.roles });

          if (loggedIn && user && user.roles.includes('student')) {
            console.log("Valid student session found:", user);
          setStudent({
              id: user.id,
              name: user.name,
              username: user.email,
              email: user.email || '',
              photo: user.photo || null
          });
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
        } else {
          // Handle unexpected response structure
          console.error("Session check failed - unexpected response structure:", response.data);
           setSessionError("There was a problem processing session data. Please try refreshing.");
        }
      } catch (error: any) {
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
      const response = await api.get('/api/quizzes/get-quizzes.php');
      
      console.log("Quizzes response:", response.data);
      
      if (response.data.success) {
        // Store section timers and enabled status
        setSection1Timer(response.data.section1_timer || 0);
        setSection2Timer(response.data.section2_timer || 0);
        setSection1Enabled(response.data.section1_enabled || false);
        setSection2Enabled(response.data.section2_enabled || false);

        // Check if the sections have changed
        const currentSections = JSON.stringify(response.data.sections);
        const previousSections = JSON.stringify(sections);
        
        if (currentSections !== previousSections) {
          setSections(response.data.sections);
          setLastUpdateTime(Date.now());
          
          // Show toast notification if sections changed
          if (response.data.sections.length > 0) {
            const newSections = response.data.sections.filter((s: Section) => 
              !sections.some(prev => prev.section_type === s.section_type)
            );
            const removedSections = sections.filter(prev => 
              !response.data.sections.some((s: Section) => s.section_type === prev.section_type)
            );

            if (newSections.length > 0) {
              toast({
                title: 'New Section Available',
                description: `${newSections.map((s: Section) => `Section ${s.section_type}`).join(', ')} is now available.`,
                status: 'success',
                duration: 5000,
                isClosable: true,
              });
            }

            if (removedSections.length > 0) {
              toast({
                title: 'Section Unavailable',
                description: `${removedSections.map(s => `Section ${s.section_type}`).join(', ')} is no longer available.`,
                status: 'warning',
                duration: 5000,
                isClosable: true,
              });
            }
          }
        }
      } else {
        console.error("Quizzes fetch failed:", response.data.message);
        setError(response.data.message || 'Failed to fetch quizzes');
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      setError('Failed to load quizzes. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      console.log("Logging out student...");
      const response = await api.get('/api/auth/logout.php');
      
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

  // Initial fetch
  useEffect(() => {
    fetchQuizzes();
  }, []);

  // Set up polling for quiz updates
  useEffect(() => {
    // Don't start polling if we're in a quiz
    if (checkActiveQuiz()) {
      setIsPolling(false);
      return;
    }

    const pollInterval = setInterval(() => {
      // Only fetch if we're still on the dashboard
      if (!checkActiveQuiz()) {
        fetchQuizzes();
      } else {
        setIsPolling(false);
        clearInterval(pollInterval);
      }
    }, 10000);

    // Cleanup function
    return () => {
      clearInterval(pollInterval);
      setIsPolling(false);
    };
  }, [sections]);

  // Add visibility change handler
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden || checkActiveQuiz()) {
        setIsPolling(false);
      } else {
        setIsPolling(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/dashboard/simple-stats.php');
      
      if (response.data && response.data.success) {
        setStats(response.data.stats);
      } else {
        toast({
          title: 'Error fetching dashboard data',
          description: 'Invalid response format from server',
          status: 'error',
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error fetching dashboard data',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentQuizzes = async () => {
    try {
      const response = await api.get('/api/dashboard/recent-quizzes.php');
      
      if (response.data && response.data.success && Array.isArray(response.data.quizzes)) {
        setRecentQuizzes(response.data.quizzes);
      } else {
        toast({
          title: 'Error fetching recent quizzes',
          description: 'Invalid response format from server',
          status: 'error',
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error fetching recent quizzes:', error);
      toast({
        title: 'Error fetching recent quizzes',
        status: 'error',
        duration: 3000,
      });
    }
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
              <Heading size="md">Available Sections</Heading>
            </HStack>
          </CardHeader>
          <CardBody>
            <Text fontSize="2xl" fontWeight="bold">{sections.length}</Text>
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
        <Heading as="h2" size="md" mb={4}>Available Assessment Sections (Highlighted Questions)</Heading>
        <Divider mb={4} />
        
        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}
        
        {sections.length === 0 ? (
          <Card p={5} textAlign="center">
            <Text>No assessment sections available at the moment.</Text>
          </Card>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
            {sections
              .filter(section => 
                (section.section_type === '1' && section1Enabled) || 
                (section.section_type === '2' && section2Enabled)
              )
              .map((section) => (
                <Card key={section.section_type}>
                  <CardHeader bgGradient={section.section_type === '1' ? 'linear(to-r, blue.100, blue.200)' : 'linear(to-r, purple.100, purple.200)'} p={4}>
                    <Heading size="md">Section {section.section_type}</Heading>
                </CardHeader>
                <CardBody>
                    <Text>{section.questions.length} highlighted questions available</Text>
                  <HStack mt={2}>
                      <Badge colorScheme={section.section_type === '1' ? 'blue' : 'purple'}>
                        Section {section.section_type}
                    </Badge>
                      <Badge colorScheme="green">{section.questions.length} highlighted questions</Badge>
                      <Badge colorScheme="orange">{section.section_type === '1' ? section1Timer : section2Timer} minutes</Badge>
                  </HStack>
                </CardBody>
                <CardFooter>
                  <Button 
                      colorScheme={section.section_type === '1' ? 'blue' : 'purple'} 
                    onClick={() => {
                      try {
                          // Navigate to the section quiz using section_type
                          const quizUrl = `/student/section/${section.section_type}`;
                        console.log(`Navigating to section quiz: ${quizUrl}`);
                          navigate(quizUrl);
                      } catch (err) {
                        console.error('Navigation error:', err);
                          toast({
                            title: 'Error',
                            description: 'Failed to navigate to section quiz',
                            status: 'error',
                            duration: 3000,
                          });
                      }
                    }}
                  >
                    Start Assessment
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </Box>

      <HStack justify="space-between" mt={8}>
        <Box>
          <Text fontSize="sm" color="gray.500">
            Last updated: {new Date(lastUpdateTime).toLocaleTimeString()}
            {!isPolling && !checkActiveQuiz() && (
              <Text as="span" ml={2} color="orange.500">
                (Auto-refresh paused)
              </Text>
            )}
          </Text>
        </Box>
        <Button
          leftIcon={<Icon as={FaSync} />}
          size="sm"
          onClick={() => fetchQuizzes()}
          isLoading={loading}
        >
          Refresh
        </Button>
      </HStack>
    </Box>
  );
};

export default StudentDashboard; 