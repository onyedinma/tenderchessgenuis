import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  Button,
  Card,
  CardBody,
  Spinner,
  Alert,
  AlertIcon,
  Progress,
  useToast,
  HStack,
  IconButton,
  Tooltip,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Flex
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ChessBoard from '../../components/ChessBoard';
import { FaExchangeAlt, FaClock } from 'react-icons/fa';
import { getQuestionsBySectionType, submitQuizAnswers } from '../../services/api';

interface Question {
  id: number;
  question_text: string;
  question_type: string;
  position_fen: string | null;
  position_pgn: string | null;
  explanation: string | null;
  points: number;
  order_index: number;
  is_highlighted: number;
  bank_name: string;
  section_type: string;
  bank_id: number;
}

interface SectionInfo {
  section_type: string;
  title: string;
  description: string;
  time_limit: number;
  question_count: number;
}

interface UserAnswer {
  move: string;
  fenNotation: string;
}

const SectionQuiz: React.FC = () => {
  const { sectionId } = useParams<{ sectionId: string }>();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [sectionInfo, setSectionInfo] = useState<SectionInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, UserAnswer>>({});
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>('white');
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [score, setScore] = useState<{correct: number, total: number, percentage: number} | null>(null);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const toast = useToast();

  // Format time for display (convert seconds to MM:SS)
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Submit quiz function (memoized to prevent recreation in useEffect)
  const submitQuiz = useCallback(async (isAutoSubmit = false) => {
    if (isSubmitting || quizCompleted) return;

    try {
      setIsSubmitting(true);
      
      if (isAutoSubmit) {
        toast({
          title: "Time's up!",
          description: 'Your quiz has been automatically submitted.',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
      }

      // Prepare answers data
      const answersData = Object.entries(userAnswers).map(([questionId, answerData]) => ({
        questionId: parseInt(questionId),
        answer: answerData.move,
        fenNotation: answerData.fenNotation,
      }));

      // Calculate time taken (use section time limit minus timeLeft)
      const totalTime = sectionInfo && sectionInfo.time_limit ? sectionInfo.time_limit * 60 : 0;
      const timeTaken = totalTime - timeLeft;

      // Get the bank ID from the first question (all questions in a section belong to the same bank)
      const bankId = questions[0]?.bank_id || 10; // Default to 10 if not found

      // Send to backend using the submitQuizAnswers API function
      const response = await submitQuizAnswers(bankId, answersData, timeTaken);

      if (response.data.success) {
        // Assuming the backend returns score information on success
        setScore({
            correct: response.data.correct_answers_count || 0,
            total: response.data.total_questions_count || answersData.length,
            percentage: response.data.percentage_correct || 0,
        });
        setQuizCompleted(true);
        onOpen(); // Open the results modal
      } else {
        setError(response.data.message || 'Failed to submit quiz');
        // Consider showing an error toast or modal instead of just setting state
        toast({
            title: 'Submission failed',
            description: response.data.message || 'Failed to submit quiz.',
            status: 'error',
            duration: 5000,
            isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      setError('Failed to submit quiz. Please try again.');
       toast({
            title: 'Submission Error',
            description: 'Failed to submit quiz. Please try again.',
            status: 'error',
            duration: 5000,
            isClosable: true,
        });
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, quizCompleted, userAnswers, sectionInfo, timeLeft, toast, onOpen, questions]);

  useEffect(() => {
    const fetchSectionQuestions = async () => {
      try {
        setLoading(true);
        
        // Validate section type
        if (sectionId !== '1' && sectionId !== '2') {
          setError('Invalid section type. Must be 1 or 2.');
          toast({
            title: 'Invalid Section',
            description: 'The requested section type is invalid.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          navigate('/student/dashboard');
          return;
        }
        
        // Use the API function to fetch questions by section type
        const response = await getQuestionsBySectionType(sectionId);
        
        console.log('Section questions response:', response.data);
        
        if (response.data.success) {
          setQuestions(response.data.questions || []);
          setSectionInfo(response.data.section_info);
          
          // Initialize timer based on section time limit (convert minutes to seconds)
          if (response.data.section_info && response.data.section_info.time_limit) {
            setTimeLeft(response.data.section_info.time_limit * 60);
          }
        } else {
          setError('Failed to load section questions: ' + response.data.message);
          toast({
            title: 'Loading Error',
            description: response.data.message || 'Failed to load section questions.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      } catch (error) {
        console.error('Error fetching section questions:', error);
        setError('Error connecting to the server. Please try again later.');
        toast({
          title: 'Network Error',
          description: 'Error connecting to the server. Please try again later.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    if (sectionId) {
      fetchSectionQuestions();
    } else {
      setError('Missing section ID');
      setLoading(false);
      toast({
        title: 'Missing Info',
        description: 'Section ID is missing.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [sectionId, toast, navigate]);

  // Timer countdown effect
  useEffect(() => {
    if (loading || quizCompleted || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          // Auto-submit when time expires
          submitQuiz(true);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [loading, quizCompleted, timeLeft, submitQuiz]);

  const handleMove = (move: string, fenNotation: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    // Ensure currentQuestion is defined before accessing its id
    if (currentQuestion) {
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: {
        move,
        fenNotation
      }
    }));
    
    toast({
      title: 'Move recorded',
      description: `Your move: ${move}`,
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
    }
  };

  const toggleBoardOrientation = () => {
    setBoardOrientation(prev => prev === 'white' ? 'black' : 'white');
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleManualSubmit = () => {
    // Show a confirmation modal before manual submission if needed
    submitQuiz(false);
  };

  const returnToDashboard = () => {
    navigate('/student/dashboard');
  };

  const currentQuestion = questions[currentQuestionIndex];

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
        <Text mt={4}>Loading section questions...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" py={10}>
        <Alert status="error" mb={6}>
          <AlertIcon />
          {error}
        </Alert>
      </Box>
    );
  }

  if (!sectionInfo || questions.length === 0) {
    return (
      <Box textAlign="center" py={10}>
               <Alert status="info" mb={6}>
          <AlertIcon />
                No questions found for this section.
        </Alert>
      </Box>
    );
  }

  const progressPercentage = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
  
  return (
    <Box className="container mx-auto p-4">
      <VStack spacing={6} align="stretch">
        <Heading as="h1" size="xl" textAlign="center">
          {sectionInfo.title} {/* Use section title */}
        </Heading>

        {quizCompleted ? (
          <Box textAlign="center" py={10}>
            <Heading as="h2" size="lg" mb={4}>Quiz Completed!</Heading>
            {score && (
                <VStack spacing={3}>
                    <Text fontSize="xl">You answered {score.correct} out of {score.total} questions correctly.</Text>
                    <Text fontSize="xl">Score: {score.percentage.toFixed(2)}%</Text>
                </VStack>
            )}
            <Button mt={6} colorScheme="blue" onClick={returnToDashboard}>Return to Dashboard</Button>
          </Box>
        ) : (
          <>
            <Flex justifyContent="space-between" alignItems="center">
                <Badge colorScheme="blue" fontSize="lg">Question {currentQuestionIndex + 1} of {questions.length}</Badge>
                <HStack spacing={2}>
            <FaClock />
                     <Text fontSize="lg" fontWeight="bold">{formatTime(timeLeft)}</Text>
          </HStack>
        </Flex>
        
            <Progress value={progressPercentage} size="lg" colorScheme="green" hasStripe isAnimated />

        <Card>
          <CardBody>
                {/* Display question text */}
                <Text fontSize="lg" mb={4}>{currentQuestion?.question_text}</Text>

                {/* Chess board for position-based questions */}
                {currentQuestion?.position_fen && (
                  <Box width="100%" maxWidth="500px" mx="auto" mb={4}>
                    <ChessBoard
                      position={currentQuestion.position_fen}
                      onMove={(move, fen) => handleMove(move, fen)}
                      boardOrientation={boardOrientation}
                      allowMoves={true}
                    />
                </Box>
              )}
              
                {/* Board orientation toggle and other controls */}
                <HStack justifyContent="center" spacing={4} mt={4}>
                   {currentQuestion?.position_fen && (
                     <Tooltip label="Flip Board">
                       <IconButton
                          aria-label="Flip board"
                          icon={<FaExchangeAlt />}
                          onClick={toggleBoardOrientation}
                        />
                     </Tooltip>
                   )}
                </HStack>

                {/* Navigation buttons */}
                <HStack justifyContent="space-between" mt={6}>
                <Button
                  onClick={handlePreviousQuestion}
                    isDisabled={currentQuestionIndex === 0}
                >
                  Previous
                </Button>
                {currentQuestionIndex === questions.length - 1 ? (
                  <Button
                    colorScheme="green"
                    onClick={handleManualSubmit}
                      isDisabled={isSubmitting}
                  >
                    Submit Quiz
                  </Button>
                ) : (
                  <Button
                    onClick={handleNextQuestion}
                      isDisabled={currentQuestionIndex === questions.length - 1}
                  >
                    Next
                  </Button>
                )}
                </HStack>
          </CardBody>
        </Card>
          </>
        )}
      </VStack>

      {/* Quiz Completion Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Quiz Submitted</ModalHeader>
          <ModalBody>
            <Text>Your quiz has been submitted successfully.</Text>
            {score && (
                <VStack spacing={3} mt={4}>
                    <Text fontSize="lg">Correct Answers: {score.correct}</Text>
                    <Text fontSize="lg">Total Questions: {score.total}</Text>
                    <Text fontSize="lg">Score: {score.percentage.toFixed(2)}%</Text>
            </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={returnToDashboard}>Return to Dashboard</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </Box>
  );
};

export default SectionQuiz; 