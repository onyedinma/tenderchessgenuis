import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Divider,
  Progress,
  Badge,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Alert,
  AlertIcon,
  Spinner,
  Icon,
} from '@chakra-ui/react';
import { FaCheck, FaTimes, FaTrophy, FaClock, FaChessKnight } from 'react-icons/fa';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface QuizResult {
  quizId: number;
  quizTitle: string;
  quizDescription?: string;
  totalPuzzles: number;
  correctAnswers: number;
  score: number;
  timeTaken: number;
  averageTimePerPuzzle?: number;
  submissionDate?: string;
  totalPoints?: number;
  possiblePoints?: number;
  puzzleResults: {
    id: number;
    title: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    timeTaken: number;
    points: number;
    possiblePoints?: number;
    difficulty?: string;
    order?: number;
  }[];
}

const QuizResults: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<QuizResult | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        const response = await api.getQuizResults(id);
        
        if (response.data && response.data.success && response.data.results) {
          setResults(response.data.results);
        } else {
          setError(response.data?.message || 'Failed to load quiz results.');
        }
      } catch (err: any) {
        console.error('Error fetching results:', err);
        setError(err.message || 'Failed to load quiz results.');
      } finally {
        setLoading(false);
      }
    };

    if (!user) {
      setError('You must be logged in to view results.');
      setLoading(false);
      return;
    }

    fetchResults();
  }, [id, user]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="50vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Container maxW="container.lg" py={10}>
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

  if (!results) {
    return (
      <Container maxW="container.lg" py={10}>
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          No results found for this quiz.
        </Alert>
        <Button mt={4} onClick={() => navigate('/quizzes')}>
          Back to Quizzes
        </Button>
      </Container>
    );
  }

  const totalPointsEarned = results.totalPoints || 
    results.puzzleResults.reduce((sum, result) => sum + result.points, 0);
  
  const totalPossiblePoints = results.possiblePoints || 
    results.puzzleResults.reduce((sum, result) => sum + (result.possiblePoints || 10), 0);

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Results header */}
        <Box>
          <Heading size="lg" mb={2}>
            Quiz Results: {results.quizTitle}
          </Heading>
          <Progress
            value={results.score}
            colorScheme={results.score >= 70 ? 'green' : results.score >= 50 ? 'orange' : 'red'}
            height="10px"
            borderRadius="full"
            mb={2}
          />
          <Text fontSize="xl" fontWeight="bold" color={results.score >= 70 ? 'green.500' : results.score >= 50 ? 'orange.500' : 'red.500'}>
            Score: {results.score}%
          </Text>
          {results.submissionDate && (
            <Text fontSize="sm" color="gray.500">
              Completed on: {new Date(results.submissionDate).toLocaleString()}
            </Text>
          )}
        </Box>

        <Divider />

        {/* Stats grid */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5}>
          <Stat
            p={5}
            bg="white"
            boxShadow="md"
            borderRadius="lg"
            borderWidth="1px"
          >
            <StatLabel display="flex" alignItems="center">
              <Icon as={FaTrophy} mr={2} color="green.500" />
              Correct Answers
            </StatLabel>
            <StatNumber>
              {results.correctAnswers} / {results.totalPuzzles}
            </StatNumber>
            <StatHelpText>
              {Math.round((results.correctAnswers / results.totalPuzzles) * 100)}% accuracy
            </StatHelpText>
          </Stat>

          <Stat
            p={5}
            bg="white"
            boxShadow="md"
            borderRadius="lg"
            borderWidth="1px"
          >
            <StatLabel display="flex" alignItems="center">
              <Icon as={FaClock} mr={2} color="blue.500" />
              Total Time
            </StatLabel>
            <StatNumber>{formatTime(results.timeTaken)}</StatNumber>
            <StatHelpText>
              Avg {formatTime(results.averageTimePerPuzzle || Math.round(results.timeTaken / results.totalPuzzles))} per puzzle
            </StatHelpText>
          </Stat>

          <Stat
            p={5}
            bg="white"
            boxShadow="md"
            borderRadius="lg"
            borderWidth="1px"
          >
            <StatLabel display="flex" alignItems="center">
              <Icon as={FaChessKnight} mr={2} color="purple.500" />
              Points Earned
            </StatLabel>
            <StatNumber>
              {totalPointsEarned}
            </StatNumber>
            <StatHelpText>
              Out of {totalPossiblePoints} possible points
            </StatHelpText>
          </Stat>
        </SimpleGrid>

        <Divider />

        {/* Detailed results */}
        <Box>
          <Heading size="md" mb={4}>
            Puzzle Details
          </Heading>
          <VStack spacing={4} align="stretch">
            {results.puzzleResults.map((puzzle) => (
              <Box
                key={puzzle.id}
                p={4}
                borderWidth="1px"
                borderRadius="md"
                boxShadow="sm"
                bg={puzzle.isCorrect ? 'green.50' : 'red.50'}
              >
                <Flex justify="space-between" align="center" mb={2}>
                  <HStack>
                    <Icon
                      as={puzzle.isCorrect ? FaCheck : FaTimes}
                      color={puzzle.isCorrect ? 'green.500' : 'red.500'}
                      boxSize={5}
                    />
                    <Text fontWeight="bold">
                      Puzzle {puzzle.order || puzzle.id}
                      {puzzle.difficulty && (
                        <Badge ml={2} colorScheme={
                          puzzle.difficulty.toLowerCase() === 'easy' ? 'green' :
                          puzzle.difficulty.toLowerCase() === 'medium' ? 'orange' : 'red'
                        }>
                          {puzzle.difficulty}
                        </Badge>
                      )}
                    </Text>
                  </HStack>
                  <Text fontSize="sm">
                    {formatTime(puzzle.timeTaken)}
                  </Text>
                </Flex>
                
                <HStack mt={2} spacing={4}>
                  <Box>
                    <Text fontSize="sm" color="gray.600">Your answer:</Text>
                    <Text fontWeight={puzzle.isCorrect ? 'bold' : 'normal'} color={puzzle.isCorrect ? 'green.600' : 'red.600'}>
                      {puzzle.userAnswer}
                    </Text>
                  </Box>
                  
                  {!puzzle.isCorrect && (
                    <Box>
                      <Text fontSize="sm" color="gray.600">Correct answer:</Text>
                      <Text fontWeight="bold" color="green.600">
                        {puzzle.correctAnswer}
                      </Text>
                    </Box>
                  )}
                  
                  <Box ml="auto">
                    <Text fontSize="sm" color="gray.600">Points:</Text>
                    <Text fontWeight="bold">
                      {puzzle.points} / {puzzle.possiblePoints || 10}
                    </Text>
                  </Box>
                </HStack>
              </Box>
            ))}
          </VStack>
        </Box>
        
        <Box pt={6}>
          <Button colorScheme="blue" onClick={() => navigate('/quizzes')}>
            Back to Quizzes
          </Button>
        </Box>
      </VStack>
    </Container>
  );
};

export default QuizResults; 