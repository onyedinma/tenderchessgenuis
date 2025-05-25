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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Select,
  IconButton,
  useToast,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import { FaCheck, FaTimes, FaTrophy, FaClock, FaChessKnight, FaSortAmountDown, FaUser, FaUsers } from 'react-icons/fa';
import axios from 'axios';
import QuestionAnswerCard, { extractFenFromPosition } from '../../components/QuestionAnswerCard';

interface Submission {
  id: number;
  user_id: number;
  student_name: string;
  bank_id: number;
  bank_name: string;
  section_type: string;
  time_taken: number;
  correct_count: number;
  total_count: number;
  percentage_score: number;
  total_points: number;
  earned_points: number;
  created_at: string;
  answers?: Answer[];
}

interface Answer {
  id: number;
  question_id: number;
  question_text: string;
  correct_answer: string;
  user_answer: string;
  is_correct: boolean;
  points_earned: number;
  position?: string;
  fen_notation?: string;
}

interface Stats {
  avg_score: number;
  max_score: number;
  min_score: number;
  avg_time: number;
  submission_count: number;
}

interface TopStudent {
  user_id: number;
  student_name: string;
  percentage_score: number;
  earned_points: number;
  time_taken: number;
}

interface ComparisonData {
  stats: Stats;
  top_students: TopStudent[];
}

const SubmissionComparison: React.FC = () => {
  const { bankId } = useParams<{ bankId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [includeAnswers, setIncludeAnswers] = useState(false);
  const [viewMode, setViewMode] = useState<'individual' | 'comparison'>('individual');

  // Fetch submissions and comparison data
  useEffect(() => {
    const fetchData = async () => {
      if (!bankId) return;
      
      try {
        setLoading(true);
        
        let url = `/api/question-banks/get-student-submissions.php?bank_id=${bankId}`;
        
        // Add comparison parameter if in comparison mode
        if (viewMode === 'comparison') {
          url += '&compare=true';
        }
        
        // Include answers if requested
        if (includeAnswers) {
          url += '&include_answers=true';
        }
        
        const response = await axios.get(url, { 
          withCredentials: true
        });
        
        if (response.data && response.data.success) {
          setSubmissions(response.data.submissions);
          
          if (response.data.comparison) {
            setComparisonData(response.data.comparison);
          }
          
          if (response.data.submissions.length > 0) {
            setSelectedSubmission(response.data.submissions[0]);
          }
        } else {
          setError(response.data?.message || 'Failed to load submission data.');
        }
      } catch (err: any) {
        console.error('Error fetching submissions:', err);
        
        // Handle authentication errors
        if (err.response && err.response.status === 401) {
          setError('Your session has expired. Please log in again.');
          
          // Show a toast to inform the user
          toast({
            title: 'Session expired',
            description: 'Please log in again to view submissions',
            status: 'warning',
            duration: 5000,
            isClosable: true,
          });
          
          // Redirect to login after a short delay
          setTimeout(() => {
            navigate('/student/login');
          }, 2000);
        } else {
          setError(err.message || 'Failed to load submission data.');
        }
      } finally {
        setLoading(false);
      }
    };

    // The authentication check is now handled by the wrapper component
    fetchData();
  }, [bankId, viewMode, includeAnswers, toast, navigate]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
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
        <Button mt={4} onClick={() => navigate('/student/dashboard')}>
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  if (submissions.length === 0) {
    return (
      <Container maxW="container.lg" py={10}>
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          No submissions found for this quiz.
        </Alert>
        <Button mt={4} onClick={() => navigate('/student/dashboard')}>
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="lg" mb={2}>
            {selectedSubmission ? `${selectedSubmission.bank_name} - Submissions` : 'Quiz Submissions'}
          </Heading>
          <HStack spacing={4}>
            <Button 
              leftIcon={<FaUser />} 
              colorScheme={viewMode === 'individual' ? 'blue' : 'gray'}
              onClick={() => setViewMode('individual')}
            >
              Individual View
            </Button>
            <Button 
              leftIcon={<FaUsers />} 
              colorScheme={viewMode === 'comparison' ? 'blue' : 'gray'}
              onClick={() => setViewMode('comparison')}
            >
              Comparison View
            </Button>
            <Button 
              variant={includeAnswers ? 'solid' : 'outline'} 
              colorScheme="teal" 
              onClick={() => setIncludeAnswers(!includeAnswers)}
            >
              {includeAnswers ? 'Hide Answers' : 'Show Answers'}
            </Button>
          </HStack>
        </Box>

        <Divider />

        {/* Main content */}
        {viewMode === 'individual' ? (
          <Box>
            {/* Student selection */}
            <Box mb={4}>
              <Text fontWeight="bold" mb={2}>Select Submission:</Text>
              <Select 
                value={selectedSubmission?.id || ''}
                onChange={(e) => {
                  const submission = submissions.find(s => s.id === parseInt(e.target.value));
                  if (submission) setSelectedSubmission(submission);
                }}
              >
                {submissions.map(sub => (
                  <option key={sub.id} value={sub.id}>
                    {sub.student_name} - {formatDate(sub.created_at)} - Score: {sub.percentage_score}%
                  </option>
                ))}
              </Select>
            </Box>

            {/* Individual submission details */}
            {selectedSubmission && (
              <>
                {/* Stats cards */}
                <SimpleGrid columns={{ base: 1, md: 4 }} spacing={5} mb={5}>
                  <Stat
                    p={5}
                    bg="white"
                    boxShadow="md"
                    borderRadius="lg"
                    borderWidth="1px"
                  >
                    <StatLabel display="flex" alignItems="center">
                      <FaTrophy style={{ marginRight: '8px', color: '#48BB78' }} />
                      Score
                    </StatLabel>
                    <StatNumber>
                      {selectedSubmission.percentage_score}%
                    </StatNumber>
                    <StatHelpText>
                      {selectedSubmission.correct_count} / {selectedSubmission.total_count} correct
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
                      <FaClock style={{ marginRight: '8px', color: '#4299E1' }} />
                      Time Taken
                    </StatLabel>
                    <StatNumber>{formatTime(selectedSubmission.time_taken)}</StatNumber>
                    <StatHelpText>
                      Completed {formatDate(selectedSubmission.created_at)}
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
                      <FaChessKnight style={{ marginRight: '8px', color: '#805AD5' }} />
                      Points
                    </StatLabel>
                    <StatNumber>
                      {selectedSubmission.earned_points}
                    </StatNumber>
                    <StatHelpText>
                      Out of {selectedSubmission.total_points} possible
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
                      <FaUser style={{ marginRight: '8px', color: '#DD6B20' }} />
                      Student
                    </StatLabel>
                    <StatNumber fontSize="lg">
                      {selectedSubmission.student_name}
                    </StatNumber>
                    <StatHelpText>
                      Section {selectedSubmission.section_type}
                    </StatHelpText>
                  </Stat>
                </SimpleGrid>

                {/* Answers (if requested and available) */}
                {includeAnswers && selectedSubmission.answers && (
                  <Box mt={4}>
                    <Heading size="md" mb={4}>
                      Quiz Answers
                    </Heading>
                    <VStack spacing={4} align="stretch">
                      {selectedSubmission.answers.map((answer, index) => (
                        <QuestionAnswerCard
                          key={answer.id}
                          questionNumber={index + 1}
                          questionText={answer.question_text}
                          position={answer.position || ''}
                          userAnswer={answer.user_answer}
                          correctAnswer={answer.correct_answer}
                          isCorrect={answer.is_correct}
                          pointsEarned={answer.points_earned}
                          totalPoints={10}
                          fenNotation={answer.fen_notation}
                        />
                      ))}
                    </VStack>
                  </Box>
                )}
              </>
            )}
          </Box>
        ) : (
          <Box>
            {/* Comparison view */}
            <Tabs isFitted variant="enclosed">
              <TabList mb="1em">
                <Tab>Performance Overview</Tab>
                <Tab>Top Students</Tab>
                <Tab>All Submissions</Tab>
              </TabList>
              
              <TabPanels>
                {/* Performance Overview */}
                <TabPanel>
                  {comparisonData && (
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5}>
                      <Stat
                        p={5}
                        bg="white"
                        boxShadow="md"
                        borderRadius="lg"
                        borderWidth="1px"
                      >
                        <StatLabel>Average Score</StatLabel>
                        <StatNumber>{Math.round(comparisonData.stats.avg_score)}%</StatNumber>
                        <StatHelpText>
                          Range: {Math.round(comparisonData.stats.min_score)}% - {Math.round(comparisonData.stats.max_score)}%
                        </StatHelpText>
                        <Progress 
                          mt={2} 
                          value={comparisonData.stats.avg_score} 
                          colorScheme={comparisonData.stats.avg_score >= 70 ? 'green' : comparisonData.stats.avg_score >= 50 ? 'orange' : 'red'}
                          size="sm"
                          borderRadius="full"
                        />
                      </Stat>
                      
                      <Stat
                        p={5}
                        bg="white"
                        boxShadow="md"
                        borderRadius="lg"
                        borderWidth="1px"
                      >
                        <StatLabel>Average Time</StatLabel>
                        <StatNumber>{formatTime(comparisonData.stats.avg_time)}</StatNumber>
                        <StatHelpText>
                          Based on {comparisonData.stats.submission_count} submissions
                        </StatHelpText>
                      </Stat>
                      
                      <Stat
                        p={5}
                        bg="white"
                        boxShadow="md"
                        borderRadius="lg"
                        borderWidth="1px"
                      >
                        <StatLabel>Highest Score</StatLabel>
                        <StatNumber>{Math.round(comparisonData.stats.max_score)}%</StatNumber>
                        <StatHelpText>
                          By {comparisonData.top_students[0]?.student_name || 'N/A'}
                        </StatHelpText>
                      </Stat>
                    </SimpleGrid>
                  )}
                </TabPanel>
                
                {/* Top Students */}
                <TabPanel>
                  {comparisonData && (
                    <TableContainer boxShadow="sm" borderWidth="1px" borderRadius="md">
                      <Table variant="simple">
                        <Thead bg="gray.50">
                          <Tr>
                            <Th>Rank</Th>
                            <Th>Student Name</Th>
                            <Th>Score</Th>
                            <Th>Points</Th>
                            <Th>Time Taken</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {comparisonData.top_students.map((student, index) => (
                            <Tr key={student.user_id}>
                              <Td>
                                {index === 0 ? (
                                  <Badge colorScheme="yellow" p={1} borderRadius="full">
                                    <Flex align="center">
                                      <FaTrophy style={{ marginRight: '4px' }} />
                                      {index + 1}
                                    </Flex>
                                  </Badge>
                                ) : (
                                  index + 1
                                )}
                              </Td>
                              <Td>{student.student_name}</Td>
                              <Td>{student.percentage_score}%</Td>
                              <Td>{student.earned_points}</Td>
                              <Td>{formatTime(student.time_taken)}</Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  )}
                </TabPanel>
                
                {/* All Submissions */}
                <TabPanel>
                  <TableContainer boxShadow="sm" borderWidth="1px" borderRadius="md">
                    <Table variant="simple">
                      <Thead bg="gray.50">
                        <Tr>
                          <Th>Student</Th>
                          <Th>Date</Th>
                          <Th>Score</Th>
                          <Th>Time</Th>
                          <Th>Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {submissions.map((sub) => (
                          <Tr key={sub.id}>
                            <Td>{sub.student_name}</Td>
                            <Td>{formatDate(sub.created_at)}</Td>
                            <Td>
                              <Badge colorScheme={sub.percentage_score >= 70 ? 'green' : sub.percentage_score >= 50 ? 'orange' : 'red'}>
                                {sub.percentage_score}%
                              </Badge>
                            </Td>
                            <Td>{formatTime(sub.time_taken)}</Td>
                            <Td>
                              <Button 
                                size="sm" 
                                colorScheme="blue"
                                onClick={() => {
                                  setSelectedSubmission(sub);
                                  setViewMode('individual');
                                }}
                              >
                                View Details
                              </Button>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
        )}
      </VStack>
    </Container>
  );
};

export default SubmissionComparison; 