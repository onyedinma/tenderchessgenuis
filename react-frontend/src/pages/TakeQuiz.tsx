import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Progress,
  useToast,
  Image,
  Radio,
  RadioGroup,
  Stack,
  Badge,
  Card,
  CardBody,
  IconButton
} from '@chakra-ui/react';
import { FaChessPawn, FaArrowRight, FaArrowLeft, FaClock } from 'react-icons/fa';

// Mock data - would be replaced with API calls
interface Puzzle {
  id: number;
  fen: string;
  imageUrl: string;
  question: string;
  options: string[];
  correctAnswer: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface Quiz {
  id: number;
  title: string;
  description: string;
  timeLimit: number; // in minutes
  puzzles: Puzzle[];
}

const TakeQuiz: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [loading, setLoading] = useState<boolean>(true);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  useEffect(() => {
    // Simulate fetching quiz data
    setLoading(true);
    setTimeout(() => {
      // Mock quiz data
      const mockQuiz: Quiz = {
        id: parseInt(id || '1'),
        title: 'Tactics Training: Forks and Pins',
        description: 'Test your tactical vision with these fork and pin puzzles.',
        timeLimit: 10, // 10 minutes
        puzzles: [
          {
            id: 1,
            fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
            imageUrl: 'https://lichess1.org/export/fen.png?fen=r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R',
            question: 'White to move. What is the best continuation?',
            options: [
              'Bxf7+ followed by Nxe5',
              'Nxe5 attacking the queen and knight',
              'Nc3 developing the knight',
              'd3 protecting the bishop'
            ],
            correctAnswer: 'Bxf7+ followed by Nxe5',
            difficulty: 'medium'
          },
          {
            id: 2,
            fen: 'r1bqkb1r/ppp2ppp/2np1n2/4p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R',
            imageUrl: 'https://lichess1.org/export/fen.png?fen=r1bqkb1r/ppp2ppp/2np1n2/4p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R',
            question: 'White to move. Find the tactic.',
            options: [
              'Nxe5 winning a pawn',
              'Bxf7+ followed by Ng5+',
              'd4 controlling the center',
              'O-O castling to safety'
            ],
            correctAnswer: 'Bxf7+ followed by Ng5+',
            difficulty: 'hard'
          },
          {
            id: 3,
            fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R',
            imageUrl: 'https://lichess1.org/export/fen.png?fen=r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R',
            question: 'White to move. What is the best move?',
            options: [
              'Bb5 pinning the knight',
              'Bc4 developing toward the weak f7 square',
              'd4 challenging the center',
              'Nc3 developing naturally'
            ],
            correctAnswer: 'Bb5 pinning the knight',
            difficulty: 'easy'
          },
        ]
      };
      
      setQuiz(mockQuiz);
      setTimeRemaining(mockQuiz.timeLimit * 60); // Convert minutes to seconds
      setUserAnswers(new Array(mockQuiz.puzzles.length).fill(''));
      setLoading(false);
    }, 1000);
  }, [id]);
  
  // Timer logic
  useEffect(() => {
    if (!loading && quiz && timeRemaining > 0) {
      const timerInterval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerInterval);
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timerInterval);
    }
  }, [loading, quiz, timeRemaining]);
  
  // Format time as mm:ss
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleAnswerSelect = (value: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentPuzzleIndex] = value;
    setUserAnswers(newAnswers);
  };
  
  const handleNextPuzzle = () => {
    if (currentPuzzleIndex < (quiz?.puzzles.length || 0) - 1) {
      setCurrentPuzzleIndex(currentPuzzleIndex + 1);
    }
  };
  
  const handlePrevPuzzle = () => {
    if (currentPuzzleIndex > 0) {
      setCurrentPuzzleIndex(currentPuzzleIndex - 1);
    }
  };
  
  const handleSubmitQuiz = () => {
    setIsSubmitting(true);
    
    // Check if all questions are answered
    const unansweredCount = userAnswers.filter(answer => answer === '').length;
    if (unansweredCount > 0) {
      const confirmSubmit = window.confirm(
        `You have ${unansweredCount} unanswered ${
          unansweredCount === 1 ? 'puzzle' : 'puzzles'
        }. Are you sure you want to submit?`
      );
      
      if (!confirmSubmit) {
        setIsSubmitting(false);
        return;
      }
    }
    
    // Simulate sending results to server
    setTimeout(() => {
      // In a real app, you would send the answers to your backend
      // and get back results or redirect to results page
      
      toast({
        title: 'Quiz submitted!',
        description: 'Redirecting to results page...',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      
      // Navigate to results page
      navigate(`/quiz-results/${id}`);
    }, 1500);
  };
  
  if (loading) {
    return (
      <Container maxW="container.lg" centerContent py={8}>
        <VStack spacing={4}>
          <Heading>Loading Quiz...</Heading>
          <Progress size="xs" isIndeterminate w="100%" />
        </VStack>
      </Container>
    );
  }
  
  if (!quiz) {
    return (
      <Container maxW="container.lg" centerContent py={8}>
        <VStack spacing={4}>
          <Heading>Quiz Not Found</Heading>
          <Text>The quiz you're looking for doesn't exist or has been removed.</Text>
          <Button colorScheme="blue" onClick={() => navigate('/quizzes')}>
            Back to Quizzes
          </Button>
        </VStack>
      </Container>
    );
  }
  
  const currentPuzzle = quiz.puzzles[currentPuzzleIndex];
  const progress = ((currentPuzzleIndex + 1) / quiz.puzzles.length) * 100;
  
  return (
    <Container maxW="container.xl" py={6}>
      <VStack spacing={6} align="stretch">
        <Flex justify="space-between" align="center">
          <Heading size="lg">{quiz.title}</Heading>
          <HStack>
            <Badge colorScheme="red" fontSize="md">
              <HStack spacing={1}>
                <FaClock />
                <Text>{formatTime(timeRemaining)}</Text>
              </HStack>
            </Badge>
            <Badge colorScheme="blue" fontSize="md">
              {currentPuzzleIndex + 1} / {quiz.puzzles.length}
            </Badge>
          </HStack>
        </Flex>
        
        <Progress value={progress} size="sm" colorScheme="blue" borderRadius="md" />
        
        <Card variant="outline" boxShadow="md">
          <CardBody>
            <VStack spacing={6} align="stretch">
              <Flex direction={{ base: 'column', md: 'row' }} gap={6}>
                <Box flex="1" minH="300px" position="relative">
                  <Image 
                    src={currentPuzzle.imageUrl} 
                    alt="Chess position" 
                    w="100%" 
                    maxH="400px"
                    objectFit="contain"
                    borderRadius="md"
                    fallbackSrc="https://via.placeholder.com/400x400?text=Chess+Position"
                  />
                  <Badge 
                    position="absolute" 
                    top={2} 
                    right={2}
                    colorScheme={
                      currentPuzzle.difficulty === 'easy' ? 'green' : 
                      currentPuzzle.difficulty === 'medium' ? 'yellow' : 'red'
                    }
                  >
                    {currentPuzzle.difficulty}
                  </Badge>
                </Box>
                
                <VStack flex="1" spacing={6} align="stretch">
                  <Box>
                    <Heading size="md" mb={2}>
                      <FaChessPawn /> Puzzle #{currentPuzzleIndex + 1}
                    </Heading>
                    <Text fontSize="lg">{currentPuzzle.question}</Text>
                  </Box>
                  
                  <RadioGroup 
                    onChange={handleAnswerSelect} 
                    value={userAnswers[currentPuzzleIndex]}
                  >
                    <Stack spacing={4}>
                      {currentPuzzle.options.map((option, index) => (
                        <Radio key={index} value={option} colorScheme="blue" size="lg">
                          {option}
                        </Radio>
                      ))}
                    </Stack>
                  </RadioGroup>
                </VStack>
              </Flex>
            </VStack>
          </CardBody>
        </Card>
        
        <Flex justify="space-between" mt={4}>
          <Button
            leftIcon={<FaArrowLeft />}
            onClick={handlePrevPuzzle}
            isDisabled={currentPuzzleIndex === 0}
            colorScheme="gray"
          >
            Previous
          </Button>
          
          <HStack>
            {currentPuzzleIndex === quiz.puzzles.length - 1 ? (
              <Button
                colorScheme="green"
                onClick={handleSubmitQuiz}
                isLoading={isSubmitting}
                loadingText="Submitting"
              >
                Submit Quiz
              </Button>
            ) : (
              <Button
                rightIcon={<FaArrowRight />}
                onClick={handleNextPuzzle}
                colorScheme="blue"
              >
                Next
              </Button>
            )}
          </HStack>
        </Flex>
      </VStack>
    </Container>
  );
};

export default TakeQuiz; 