import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Card,
  CardBody,
  Flex,
  Progress,
  Spinner,
  Badge,
  useToast,
  Alert,
  AlertIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  useDisclosure,
  IconButton,
  Tooltip,
  useBreakpointValue,
  AlertTitle,
  AlertDescription,
  Center
} from '@chakra-ui/react';
import { FaExchangeAlt } from 'react-icons/fa';
import axios from 'axios';
import ChessBoard from '../../components/ChessBoard';

interface Question {
  id: number;
  question_text: string;
  position: string;
  fen: string;
  correct_answer: string;
  question_order: number;
  quiz_id: number;
  section_type: string;
  bank?: { name: string };
}

// Define a type for user answers
interface UserAnswer {
  move: string;
  fenNotation: string;
}

const QuizPage: React.FC = () => {
  const { bankId: quizId } = useParams<{ bankId: string }>();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, UserAnswer>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState<{correct: number, total: number, percentage: number} | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [finalTime, setFinalTime] = useState<number>(0);
  const [timerInterval, setTimerInterval] = useState<ReturnType<typeof setInterval> | null>(null);
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>('white');
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isSection1, setIsSection1] = useState(false);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const toast = useToast();

  // Determine layout based on screen size
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Load questions for this bank
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        console.log(`Fetching questions for quiz ID: ${quizId}`);
        
        // First get bank info to check if it's Section 1
        const bankResponse = await axios.get(`/api/question-banks/get-bank.php?id=${quizId}`);
        const isSection1Bank = bankResponse.data.section_type === '1';
        setIsSection1(isSection1Bank);

        // Fetch questions based on section type
        if (isSection1Bank) {
          // Use the active highlighted questions API for Section 1
          const response = await axios.get('/api/question-banks/get-active-highlighted.php');
          if (response.data.success) {
            if (response.data.questions.length === 0) {
              setError('No active questions are currently available. Please wait for the administrator to activate questions.');
              return;
            }
            setQuestions(response.data.questions);
          } else {
            setError(response.data.message || 'Failed to load questions');
            return;
          }
        } else {
          const response = await axios.get(`/api/question-banks/get-questions.php?quiz_id=${quizId}`);
          if (response.data.success) {
            setQuestions(response.data.questions);
          } else {
            setError(response.data.message || 'Failed to load questions');
            return;
          }
        }
        
        setStartTime(new Date());
        
        // Start timer
        const interval = setInterval(() => {
          setElapsedTime(prev => prev + 1);
        }, 1000);
        
        setTimerInterval(interval);
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError('Failed to load questions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (quizId) {
      fetchQuestions();
    }

    // Cleanup timer on unmount
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [quizId]);

  useEffect(() => {
    if (questions.length > 0) {
      setTimeLeft(300); // 5 minutes per question
    }
  }, [questions, currentQuestionIndex]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  const handleMove = (move: string, fenNotation: string) => {
    if (quizCompleted) return;
    
    const currentQuestion = questions[currentQuestionIndex];
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: {
        move,
        fenNotation
      }
    }));
    
    // Automatically advance to next question after a move
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const confirmSubmit = () => {
    // Check if all questions have answers
    const answeredCount = Object.keys(userAnswers).length;
    
    if (answeredCount < questions.length) {
      toast({
        title: 'Incomplete quiz',
        description: `You've answered ${answeredCount} of ${questions.length} questions. Are you sure you want to submit?`,
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
    }
    
    onOpen();
  };

  const handleSubmitQuiz = async () => {
    if (quizCompleted) return;
    
    try {
      console.log('Starting quiz submission process...');
      console.log('Current session state:', document.cookie);
      
      setIsSubmitting(true);
      
      // Save the final time
      setFinalTime(elapsedTime);
      
      // Stop timer
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }
      
      // Prepare answers data
      const answersData = Object.entries(userAnswers).map(([questionId, answerData]) => ({
        questionId: parseInt(questionId),
        answer: answerData.move,
        fenNotation: answerData.fenNotation
      }));
      
      // Calculate time taken
      const endTime = new Date();
      const timeTaken = startTime ? Math.floor((endTime.getTime() - startTime.getTime()) / 1000) : 0;
      
      const submissionData = {
        bankId: parseInt(quizId || '0'),
        answers: answersData,
        timeTaken
      };
      
      console.log('Preparing to submit quiz data:', submissionData);
      console.log('Current quiz state:', {
        quizId,
        questions,
        userAnswers,
        startTime,
        endTime,
        timeTaken
      });
      
      // Submit to backend using the correct endpoint and parameter name
      console.log('Sending POST request to /api/question-banks/submit-answers.php');
      const response = await axios.post('/api/question-banks/submit-answers.php', submissionData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Quiz submission response:', response.data);
      
      if (response.data.success) {
        setQuizCompleted(true);
        toast({
          title: 'Quiz completed',
          description: 'Your answers have been submitted successfully!',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        console.error('Quiz submission failed:', response.data);
        setError(response.data.message || 'Failed to submit quiz');
      }
    } catch (err) {
      console.error('Error submitting quiz:', err);
      if (axios.isAxiosError(err) && err.response) {
        console.error('Server response:', err.response.data);
        setError(`Error: ${err.response.data.message || err.message}`);
      } else {
        setError('An error occurred while submitting your answers.');
      }
    } finally {
      setIsSubmitting(false);
      onClose();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const returnToDashboard = () => {
    navigate('/student/dashboard');
  };

  // Extract FEN from position string (which could be a JSON string or direct FEN)
  const getFenFromPosition = (position: string): string => {
    try {
      // Try to parse as JSON object
      const posObj = JSON.parse(position);
      // If it has starting_fen property, use that
      if (posObj && posObj.starting_fen) {
        return posObj.starting_fen;
      }
      // Otherwise try any fen property or return the position as is
      return posObj.fen || position;
    } catch (e) {
      // If not valid JSON, return position as is (might be a direct FEN)
      return position;
    }
  };

  // Function to toggle board orientation
  const toggleBoardOrientation = () => {
    setBoardOrientation(prev => prev === 'white' ? 'black' : 'white');
  };

  const handleAnswerSubmit = async () => {
    if (!selectedAnswer) {
      toast({
        title: 'Please select an answer',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const currentQuestion = questions[currentQuestionIndex];
      const response = await axios.post('/api/quizzes/submit-answer.php', {
        question_id: currentQuestion.id,
        answer: selectedAnswer,
        quiz_id: quizId,
        section_type: currentQuestion.section_type
      });

      if (response.data.correct) {
        toast({
          title: 'Correct!',
          status: 'success',
          duration: 3000,
        });
      } else {
        toast({
          title: 'Incorrect',
          description: `The correct answer was: ${currentQuestion.correct_answer}`,
          status: 'error',
          duration: 5000,
        });
      }

      // For Section 1, we don't automatically move to next question
      if (!isSection1) {
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
          setSelectedAnswer('');
        } else {
          navigate('/student/dashboard');
        }
      } else {
        // For Section 1, show a message to wait for next question
        toast({
          title: 'Answer submitted',
          description: 'Please wait for the administrator to highlight the next question.',
          status: 'info',
          duration: 5000,
        });
      }
    } catch (err) {
      toast({
        title: 'Error submitting answer',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (error) {
    return (
      <Container maxW="container.md" py={8}>
        <Alert status="warning">
          <AlertIcon />
          <AlertTitle>No Questions Available</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </Container>
    );
  }

  if (questions.length === 0) {
    return (
      <Container maxW="container.md" py={8}>
        <Alert status="info">
          <AlertIcon />
          <AlertTitle>No Questions Available</AlertTitle>
          <AlertDescription>There are no questions available in this bank.</AlertDescription>
        </Alert>
      </Container>
    );
  }

  if (quizCompleted) {
    return (
      <Container maxW="container.lg" py={10}>
        <Card borderRadius="lg" shadow="md" p={6}>
          <VStack spacing={6} align="stretch">
            <Heading size="lg" textAlign="center" color="green.600">Quiz Completed!</Heading>
            
            <Box textAlign="center">
              <Text fontSize="lg">Your answers have been submitted successfully!</Text>
              <Text mt={2}>Time taken: {formatTime(finalTime)}</Text>
            </Box>
            
            <HStack spacing={4} justifyContent="center">
              <Button 
                colorScheme="blue" 
                size="lg" 
                onClick={returnToDashboard}
              >
                Return to Dashboard
              </Button>
              
              <Button
                colorScheme="teal"
                size="lg"
                onClick={() => navigate(`/student/submissions/${quizId}`)}
              >
                View Submissions
              </Button>
            </HStack>
          </VStack>
        </Card>
      </Container>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={6}>
        <Box w="100%">
          <HStack justify="space-between" mb={2}>
            <Badge colorScheme={isSection1 ? "green" : "blue"} p={2} borderRadius="md">
              {isSection1 ? "Section 1" : "Section 2"}
            </Badge>
            <Text>
              Question {currentQuestionIndex + 1} of {questions.length}
            </Text>
          </HStack>
          <Progress value={progressPercentage} colorScheme="blue" />
        </Box>

        <Card w="100%">
          <CardBody>
            <VStack spacing={6}>
              {/* Display bank info */}
              {currentQuestion.bank && (
                <Badge alignSelf="start" colorScheme="purple">
                  {currentQuestion.bank.name}
                </Badge>
              )}
              
              <Box w="100%">
                <ChessBoard position={currentQuestion.position} />
              </Box>

              <Text fontSize="lg" fontWeight="bold">{currentQuestion.question_text}</Text>

              <VStack spacing={4} w="100%">
                {['a', 'b', 'c', 'd'].map((option) => (
                  <Button
                    key={option}
                    w="100%"
                    variant={selectedAnswer === option ? 'solid' : 'outline'}
                    colorScheme={selectedAnswer === option ? 'blue' : 'gray'}
                    onClick={() => setSelectedAnswer(option)}
                  >
                    {option.toUpperCase()}
                  </Button>
                ))}
              </VStack>

              <HStack spacing={4} w="100%" justify="space-between">
                <Text fontWeight="semibold">Time Left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</Text>
                <Button
                  colorScheme="blue"
                  onClick={handleAnswerSubmit}
                  isLoading={isSubmitting}
                  isDisabled={!selectedAnswer}
                >
                  Submit Answer
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      </VStack>

      {/* Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="sm">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontSize="md">Confirm Submission</ModalHeader>
          <ModalBody>
            <Text fontSize="sm">Are you sure you want to submit your answers?</Text>
            <Text fontSize="sm" mt={1}>
              You've answered {Object.keys(userAnswers).length} out of {questions.length} questions.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={2} size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" size="sm" onClick={handleSubmitQuiz} isLoading={isSubmitting}>
              Submit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default QuizPage; 