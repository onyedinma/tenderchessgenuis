import React, { useState, useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
import { getQuizzes, submitQuiz, getStudentSubmissions, updateSectionSettings } from '../../services/api';
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Card,
  CardHeader,
  CardBody,
  Divider,
  HStack,
  Icon,
  Badge,
  Flex,
  Spinner,
  RadioGroup,
  Radio,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Alert,
  AlertIcon,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatGroup,
  useColorModeValue,
  SimpleGrid,
  Switch,
} from '@chakra-ui/react';
import { 
  FaClock, 
  FaUsers, 
  FaChessBoard, 
  FaChessPawn, 
  FaEye, 
  FaHighlighter, 
  FaCheck, 
  FaTimes, 
  FaSync 
} from 'react-icons/fa';
import { Link as RouterLink } from 'react-router-dom';

interface TimerSettings {
  section1Duration: number;
  section2Duration: number;
}

type Question = {
  id: number;
  question_id: number;
  quiz_id: number;
  question_text: string;
  position: string;
  active: boolean;
  display_order: number;
  bank: {
    id: number;
    name: string;
    section_type: string;
  };
};

type StudentProgress = {
  student_id: number;
  student_name: string;
  answered_count: number;
  correct_count: number;
  last_activity: string;
  current_question_id: number | null;
};

const ShowControls: React.FC = () => {
  const [timerSettings, setTimerSettings] = useState<TimerSettings>({
    section1Duration: 60,
    section2Duration: 120,
  });
  const [section1Enabled, setSection1Enabled] = useState(false);
  const [section2Enabled, setSection2Enabled] = useState(false);
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [studentProgress, setStudentProgress] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const toast = useToast();
  const highlightedBg = useColorModeValue('blue.50', 'blue.900');

  useEffect(() => {
    fetchInitialState();
    fetchActiveQuestions();
    fetchStudentProgress();
    
    // Set up polling for real-time updates
    const interval = setInterval(() => {
      fetchActiveQuestions(false);
      fetchStudentProgress(false);
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const fetchInitialState = async () => {
    try {
      const response = await getQuizzes();
      if (response.data && response.data.success) {
        setSection1Enabled(response.data.section1_enabled);
        setSection2Enabled(response.data.section2_enabled);
        setTimerSettings({
          section1Duration: response.data.section1_timer * 60, // Convert to seconds
          section2Duration: response.data.section2_timer * 60
        });
      } else {
        setError(response.data.message || 'Failed to fetch section settings');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setError('Failed to fetch section settings');
    }
  };

  const handleSettingsUpdate = async () => {
    try {
      const response = await updateSectionSettings({
        section1_enabled: section1Enabled,
        section2_enabled: section2Enabled,
        section1_timer: Math.floor(timerSettings.section1Duration / 60), // Convert to minutes
        section2_timer: Math.floor(timerSettings.section2Duration / 60)
      });

      if (response.data && response.data.success) {
        toast({
          title: 'Settings updated',
          description: 'Section settings have been updated successfully',
          status: 'success',
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: 'Error updating settings',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const fetchActiveQuestions = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const response = await getQuizzes();
      if (response.data && response.data.success) {
        // Assuming the response data has a 'sections' array
        const sections = response.data.sections || [];
        // Flatten the questions from all sections and filter for active ones
        const allQuestions = sections.reduce((acc: Question[], section: any) => {
          // Ensure section and section.questions are valid before processing
          if (section && Array.isArray(section.questions)) {
            const activeInSection = section.questions.filter((q: any) => q.active);
             // Map questions to the expected Question type, including the bank property
            const mappedQuestions = activeInSection.map((q: any) => ({
              id: q.id,
              question_id: q.question_id,
              quiz_id: q.quiz_id,
              question_text: q.question_text,
              position: q.position,
              active: q.active,
              display_order: q.display_order,
              bank: {
                id: q.bank_id,
                name: section.section_type === '1' ? 'Section 1 Bank' : 'Section 2 Bank', // Placeholder name, adjust if needed
                section_type: section.section_type,
              },
            }));
            return acc.concat(mappedQuestions);
          } else {
            console.warn('Invalid section structure received:', section);
            return acc;
          }
        }, []);
        setActiveQuestions(allQuestions);
      } else {
        setError(response.data.message || 'Failed to fetch active questions');
        setActiveQuestions([]); // Set to empty array on failure
      }
    } catch (error) {
      console.error('Error fetching active questions:', error);
      setError('Failed to fetch active questions. Please try again.');
      setActiveQuestions([]); // Set to empty array on error
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const fetchStudentProgress = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      // TODO: Determine the correct bankId(s) to fetch student progress for
      // For now, using a placeholder bankId (e.g., 1) to fix the TypeError
      const placeholderBankId = 1; // Replace with actual logic to get bank ID
      const response = await getStudentSubmissions(placeholderBankId);
      
      if (response.data && response.data.success) {
        // Assuming the response data structure includes a 'submissions' array
        setStudentProgress(response.data.submissions || []);
      } else {
         console.error('Failed to fetch student progress:', response?.data?.message);
         setStudentProgress([]); // Set to empty array on failure
      }
    } catch (error) {
      console.error('Error fetching student progress:', error);
      setStudentProgress([]); // Set to empty array on error
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchActiveQuestions(false),
      fetchStudentProgress(false)
    ]);
    setRefreshing(false);
    
    toast({
      title: 'Refreshed',
      description: 'The data has been refreshed',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleTimerChange = (section: 1 | 2, value: number) => {
    setTimerSettings(prev => ({
      ...prev,
      [section === 1 ? 'section1Duration' : 'section2Duration']: value,
    }));
  };

  const handleTimerSettingsUpdate = async () => {
    try {
      const response = await updateSectionSettings({
        section1_enabled: section1Enabled,
        section2_enabled: section2Enabled,
        section1_timer: Math.floor(timerSettings.section1Duration / 60), // Convert to minutes
        section2_timer: Math.floor(timerSettings.section2Duration / 60)
      });

      if (response.data && response.data.success) {
        toast({
          title: 'Timer settings updated',
          description: 'Timer settings have been saved successfully',
          status: 'success',
          duration: 3000,
        });
        // Refresh the settings to ensure we have the latest values
        await fetchInitialState();
      }
    } catch (error) {
      toast({
        title: 'Error updating timer settings',
        status: 'error',
        duration: 3000,
      });
    }
  };

  // Group questions by section
  const section1Questions = activeQuestions.filter(q => q.bank.section_type === '1');
  const section2Questions = activeQuestions.filter(q => q.bank.section_type === '2');

  // Stats
  // Ensure studentProgress is an array before accessing its properties
  const studentProgressArray = Array.isArray(studentProgress) ? studentProgress : [];
  const totalActiveQuestions = activeQuestions.length;
  const activeSection1Count = section1Questions.length;
  const activeSection2Count = section2Questions.length;
  const connectedStudents = studentProgressArray.length;
  const totalAnswersSubmitted = studentProgressArray.reduce((sum, student) => sum + (student?.answered_count || 0), 0);
  const totalCorrectAnswers = studentProgressArray.reduce((sum, student) => sum + (student?.correct_count || 0), 0);
  const averageScore = connectedStudents > 0 
    ? Math.round((totalCorrectAnswers / Math.max(totalAnswersSubmitted, 1)) * 100) 
    : 0;

  if (loading) {
    return (
      <Flex justify="center" align="center" height="400px">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Box p={8}>
      <VStack spacing={8} align="stretch">
        <HStack justify="space-between">
          <Box>
            <Heading mb={2}>Show Controls</Heading>
            <Text color="gray.600">
              Monitor active questions and student progress
            </Text>
          </Box>
          <Button
            leftIcon={<Icon as={FaSync} />}
            colorScheme="blue"
            isLoading={refreshing}
            onClick={handleRefresh}
          >
            Refresh Data
          </Button>
        </HStack>

        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}

        {/* Section Controls */}
        <Card>
          <CardHeader>
            <Heading size="md">Section Control</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="section1-toggle" mb="0">
                  Enable Section 1
                </FormLabel>
                <Switch
                  id="section1-toggle"
                  isChecked={section1Enabled}
                  onChange={(e) => setSection1Enabled(e.target.checked)}
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="section2-toggle" mb="0">
                  Enable Section 2
                </FormLabel>
                <Switch
                  id="section2-toggle"
                  isChecked={section2Enabled}
                  onChange={(e) => setSection2Enabled(e.target.checked)}
                />
              </FormControl>

              <Button 
                colorScheme="blue" 
                onClick={handleSettingsUpdate}
                mt={4}
              >
                Update Section Settings
              </Button>
            </VStack>
          </CardBody>
        </Card>

        {/* Stats Overview */}
        <Card>
          <CardHeader>
            <Heading size="md">Quiz Status</Heading>
          </CardHeader>
          <CardBody>
            <StatGroup>
              <Stat>
                <StatLabel>Active Questions</StatLabel>
                <StatNumber>{totalActiveQuestions}</StatNumber>
                <StatHelpText>
                  Section 1: {activeSection1Count} | Section 2: {activeSection2Count}
                </StatHelpText>
              </Stat>
              
              <Stat>
                <StatLabel>Connected Students</StatLabel>
                <StatNumber>{connectedStudents}</StatNumber>
                <StatHelpText>
                  Taking the quiz right now
                </StatHelpText>
              </Stat>
              
              <Stat>
                <StatLabel>Answers Submitted</StatLabel>
                <StatNumber>{totalAnswersSubmitted}</StatNumber>
                <StatHelpText>
                  {totalCorrectAnswers} correct ({averageScore}%)
                </StatHelpText>
              </Stat>
            </StatGroup>
          </CardBody>
        </Card>

        {/* Active Questions */}
        <Card>
          <CardHeader>
            <HStack justify="space-between">
              <Heading size="md">Active Questions</Heading>
              <Button
                as={RouterLink}
                to="/admin/highlighted-questions"
                colorScheme="blue"
                size="sm"
                leftIcon={<Icon as={FaHighlighter} />}
              >
                Manage Highlighted Questions
              </Button>
            </HStack>
          </CardHeader>
          <CardBody>
            {activeQuestions.length === 0 ? (
              <Alert status="info">
                <AlertIcon />
                No questions are currently active. Go to the Highlight Questions page to highlight and activate questions.
              </Alert>
            ) : (
              <TableContainer>
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Order</Th>
                      <Th>Question</Th>
                      <Th>Bank</Th>
                      <Th>Section</Th>
                      <Th>Status</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {activeQuestions.map((question) => (
                      <Tr key={question.id} bg={highlightedBg}>
                        <Td>{question.display_order}</Td>
                        <Td>{question.question_text}</Td>
                        <Td>
                          <Badge colorScheme="purple">
                            {question.bank.name}
                          </Badge>
                        </Td>
                        <Td>
                          <Badge colorScheme={question.bank.section_type === '1' ? 'green' : 'orange'}>
                            Section {question.bank.section_type}
                          </Badge>
                        </Td>
                        <Td>
                          <Badge colorScheme="green">Active</Badge>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            )}
          </CardBody>
        </Card>

        {/* Student Progress */}
        <Card>
          <CardHeader>
            <Heading size="md">Student Progress</Heading>
          </CardHeader>
          <CardBody>
            {studentProgress.length === 0 ? (
              <Alert status="info">
                <AlertIcon />
                No students are currently taking the quiz.
              </Alert>
            ) : (
              <TableContainer>
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Student</Th>
                      <Th>Questions Answered</Th>
                      <Th>Score</Th>
                      <Th>Last Activity</Th>
                      <Th>Status</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {studentProgress.map((student) => {
                      const scorePercentage = student.answered_count > 0 
                        ? Math.round((student.correct_count / student.answered_count) * 100) 
                        : 0;
                        
                      return (
                        <Tr key={student.student_id}>
                          <Td>{student.student_name}</Td>
                          <Td>{student.answered_count}</Td>
                          <Td>
                            <HStack spacing={2}>
                              <Text>{student.correct_count}/{student.answered_count}</Text>
                              <Badge colorScheme={scorePercentage >= 70 ? 'green' : 'orange'}>
                                {scorePercentage}%
                              </Badge>
                            </HStack>
                          </Td>
                          <Td>{new Date(student.last_activity).toLocaleTimeString()}</Td>
                          <Td>
                            <Badge colorScheme={student.current_question_id ? 'green' : 'gray'}>
                              {student.current_question_id ? 'Active' : 'Idle'}
                            </Badge>
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </TableContainer>
            )}
          </CardBody>
        </Card>

        {/* Timer Settings */}
        <Card>
          <CardHeader>
            <Heading size="md">Timer Settings</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <FormControl>
                <FormLabel>
                  <HStack spacing={2}>
                    <Icon as={FaClock} />
                    <Text>Section 1 Duration (minutes)</Text>
                  </HStack>
                </FormLabel>
                <NumberInput
                  min={1}
                  max={60}
                  value={Math.floor(timerSettings.section1Duration / 60)}
                  onChange={(_, value) => handleTimerChange(1, value * 60)}
                  isDisabled={!section1Enabled}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel>
                  <HStack spacing={2}>
                    <Icon as={FaClock} />
                    <Text>Section 2 Duration (minutes)</Text>
                  </HStack>
                </FormLabel>
                <NumberInput
                  min={1}
                  max={60}
                  value={Math.floor(timerSettings.section2Duration / 60)}
                  onChange={(_, value) => handleTimerChange(2, value * 60)}
                  isDisabled={!section2Enabled}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            </SimpleGrid>

            <Button
              mt={6}
              colorScheme="green"
              leftIcon={<Icon as={FaCheck} />}
              onClick={handleTimerSettingsUpdate}
              isDisabled={!section1Enabled && !section2Enabled}
            >
              Save Timer Settings
            </Button>
          </CardBody>
        </Card>

        {/* Navigation */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <Button
            as={RouterLink}
            to="/admin/question-banks"
            colorScheme="teal"
            leftIcon={<Icon as={FaChessBoard} />}
          >
            Manage Question Banks
          </Button>
          <Button
            as={RouterLink}
            to="/admin/highlighted-questions"
            colorScheme="purple"
            leftIcon={<Icon as={FaHighlighter} />}
          >
            Highlight Questions
          </Button>
        </SimpleGrid>
      </VStack>
    </Box>
  );
};

export default ShowControls; 