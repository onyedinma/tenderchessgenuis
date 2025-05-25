import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Button,
  Badge,
  VStack,
  HStack,
  Divider,
  Spinner,
  Alert,
  AlertIcon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
} from '@chakra-ui/react';
import { api, getQuizzes } from '../services/api';

interface Quiz {
  id: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  timeLimit: number;
  groupName: string;
  isActive: boolean;
}

const QuizList: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await getQuizzes();
      if (response.data && response.data.success) {
        setQuizzes(response.data.quizzes);
      } else {
        setError(response.data?.message || 'Failed to load quizzes');
      }
    } catch (err) {
      console.error('Error fetching quizzes:', err);
      setError('An error occurred while fetching quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleQuizClick = (quizId: number) => {
    navigate(`/quizzes/${quizId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Filter quizzes into categories
  const activeQuizzes = quizzes.filter(quiz => {
    const now = new Date();
    const startTime = new Date(quiz.startTime);
    const endTime = new Date(quiz.endTime);
    return now >= startTime && now <= endTime;
  });

  const upcomingQuizzes = quizzes.filter(quiz => {
    const now = new Date();
    const startTime = new Date(quiz.startTime);
    return now < startTime;
  });

  const pastQuizzes = quizzes.filter(quiz => {
    const now = new Date();
    const endTime = new Date(quiz.endTime);
    return now > endTime;
  });

  const QuizCard = ({ quiz }: { quiz: Quiz }) => {
    const now = new Date();
    const startTime = new Date(quiz.startTime);
    const endTime = new Date(quiz.endTime);
    const isUpcoming = now < startTime;
    const isActive = now >= startTime && now <= endTime;
    const isPast = now > endTime;

    return (
      <Box
        p={5}
        shadow="md"
        borderWidth="1px"
        borderRadius="lg"
        bg="white"
        _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
        transition="all 0.2s"
        onClick={() => handleQuizClick(quiz.id)}
        cursor="pointer"
      >
        <VStack align="stretch" spacing={3}>
          <HStack justify="space-between">
            <Heading size="md" noOfLines={1}>
              {quiz.title}
            </Heading>
            <Badge
              colorScheme={isUpcoming ? 'yellow' : isActive ? 'green' : 'gray'}
              py={1}
              px={2}
              borderRadius="md"
            >
              {isUpcoming ? 'Upcoming' : isActive ? 'Active' : 'Completed'}
            </Badge>
          </HStack>
          
          <Text color="gray.600" fontSize="sm">
            Group: {quiz.groupName}
          </Text>
          
          <Divider />
          
          <HStack justify="space-between">
            <Text fontSize="sm">
              {isUpcoming 
                ? `Starts: ${formatDate(quiz.startTime)}` 
                : isPast 
                  ? `Ended: ${formatDate(quiz.endTime)}` 
                  : `Ends: ${formatDate(quiz.endTime)}`}
            </Text>
            
            <Button
              size="sm"
              colorScheme={isActive ? 'blue' : 'gray'}
              variant={isActive ? 'solid' : 'outline'}
            >
              {isActive ? 'Start Now' : isUpcoming ? 'View Details' : 'View Results'}
            </Button>
          </HStack>
        </VStack>
      </Box>
    );
  };

  if (loading) {
    return (
      <Container maxW="container.lg" centerContent py={10}>
        <Spinner size="xl" />
        <Text mt={4}>Loading quizzes...</Text>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="container.lg" py={10}>
        <Alert status="error" borderRadius="md" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
        <Button onClick={fetchQuizzes}>Try Again</Button>
      </Container>
    );
  }

  return (
    <Container maxW="container.lg" py={10}>
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="xl">
          Chess Quizzes
        </Heading>
        
        <Tabs variant="enclosed" colorScheme="blue">
          <TabList>
            <Tab>Active ({activeQuizzes.length})</Tab>
            <Tab>Upcoming ({upcomingQuizzes.length})</Tab>
            <Tab>Past ({pastQuizzes.length})</Tab>
          </TabList>
          
          <TabPanels>
            <TabPanel>
              {activeQuizzes.length > 0 ? (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {activeQuizzes.map(quiz => (
                    <QuizCard key={quiz.id} quiz={quiz} />
                  ))}
                </SimpleGrid>
              ) : (
                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  No active quizzes at the moment. Check the upcoming tab.
                </Alert>
              )}
            </TabPanel>
            
            <TabPanel>
              {upcomingQuizzes.length > 0 ? (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {upcomingQuizzes.map(quiz => (
                    <QuizCard key={quiz.id} quiz={quiz} />
                  ))}
                </SimpleGrid>
              ) : (
                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  No upcoming quizzes scheduled. Check back later.
                </Alert>
              )}
            </TabPanel>
            
            <TabPanel>
              {pastQuizzes.length > 0 ? (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {pastQuizzes.map(quiz => (
                    <QuizCard key={quiz.id} quiz={quiz} />
                  ))}
                </SimpleGrid>
              ) : (
                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  No past quizzes found.
                </Alert>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Container>
  );
};

export default QuizList; 