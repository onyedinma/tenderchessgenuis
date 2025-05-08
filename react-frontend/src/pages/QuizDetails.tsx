import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  Badge,
  VStack,
  HStack,
  Divider,
  Spinner,
  Alert,
  AlertIcon,
  useToast,
} from '@chakra-ui/react';
import api from '../services/api';

interface Quiz {
  id: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  timeLimit: number;
  puzzleCount: number;
  groupName: string;
}

const QuizDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuizDetails = async () => {
      try {
        setLoading(true);
        const response = await api.getQuizById(id as string);
        if (response.data && response.data.success) {
          setQuiz(response.data.quiz);
        } else {
          setError(response.data?.message || 'Failed to load quiz details');
        }
      } catch (err) {
        setError('An error occurred while fetching quiz details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchQuizDetails();
    }
  }, [id]);

  const handleStartQuiz = () => {
    navigate(`/take-quiz/${id}`);
  };

  const handleViewResults = () => {
    navigate(`/quiz-results/${id}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatTimeLimit = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ${minutes > 0 ? `${minutes} minute${minutes > 1 ? 's' : ''}` : ''}`;
    }
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  };

  if (loading) {
    return (
      <Container maxW="container.md" centerContent py={10}>
        <Spinner size="xl" />
        <Text mt={4}>Loading quiz details...</Text>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="container.md" py={10}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          {error}
        </Alert>
        <Button mt={4} onClick={() => navigate('/quizzes')}>
          Back to Quizzes
        </Button>
      </Container>
    );
  }

  if (!quiz) {
    return (
      <Container maxW="container.md" py={10}>
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          Quiz not found
        </Alert>
        <Button mt={4} onClick={() => navigate('/quizzes')}>
          Back to Quizzes
        </Button>
      </Container>
    );
  }

  const now = new Date();
  const startTime = new Date(quiz.startTime);
  const endTime = new Date(quiz.endTime);
  const isUpcoming = now < startTime;
  const isActive = now >= startTime && now <= endTime;
  const isPast = now > endTime;

  return (
    <Container maxW="container.md" py={10}>
      <VStack spacing={6} align="stretch">
        <Box>
          <HStack>
            <Heading as="h1" size="xl">
              {quiz.title}
            </Heading>
            <Badge
              ml={2}
              colorScheme={isUpcoming ? 'yellow' : isActive ? 'green' : 'gray'}
              fontSize="md"
              py={1}
              px={2}
              borderRadius="md"
            >
              {isUpcoming ? 'Upcoming' : isActive ? 'Active' : 'Completed'}
            </Badge>
          </HStack>
          <Text color="gray.600" mt={2}>
            Group: {quiz.groupName}
          </Text>
        </Box>

        <Divider />

        <Box>
          <Text fontSize="lg" mb={4}>
            {quiz.description}
          </Text>
          <VStack spacing={3} align="stretch">
            <HStack>
              <Text fontWeight="bold" minW="150px">
                Start Time:
              </Text>
              <Text>{formatDate(quiz.startTime)}</Text>
            </HStack>
            <HStack>
              <Text fontWeight="bold" minW="150px">
                End Time:
              </Text>
              <Text>{formatDate(quiz.endTime)}</Text>
            </HStack>
            <HStack>
              <Text fontWeight="bold" minW="150px">
                Time Limit:
              </Text>
              <Text>{formatTimeLimit(quiz.timeLimit)}</Text>
            </HStack>
            <HStack>
              <Text fontWeight="bold" minW="150px">
                Number of Puzzles:
              </Text>
              <Text>{quiz.puzzleCount}</Text>
            </HStack>
          </VStack>
        </Box>

        <Box pt={4}>
          {isActive && (
            <Button
              colorScheme="blue"
              size="lg"
              width="100%"
              onClick={handleStartQuiz}
            >
              Start Quiz
            </Button>
          )}
          
          {isUpcoming && (
            <Alert status="warning" borderRadius="md">
              <AlertIcon />
              This quiz is not yet available. It will start on {formatDate(quiz.startTime)}.
            </Alert>
          )}
          
          {isPast && (
            <VStack spacing={4} width="100%">
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                This quiz has ended. You can view your results if you participated.
              </Alert>
              <Button
                colorScheme="blue"
                variant="outline"
                size="lg"
                width="100%"
                onClick={handleViewResults}
              >
                View Results
              </Button>
            </VStack>
          )}
        </Box>
      </VStack>
    </Container>
  );
};

export default QuizDetails; 