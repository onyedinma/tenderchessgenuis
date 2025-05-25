import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Heading,
  Text,
  Switch,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useToast,
  Divider,
  Card,
  CardHeader,
  CardBody,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { getQuizzes, createQuiz, getQuizById, submitQuiz } from '../../services/api';

interface Student {
  id: number;
  name: string;
  answer: string;
  timestamp: string;
  is_correct: boolean;
}

interface QuestionBank {
  id: number;
  name: string;
  section_type: '1' | '2';
}

const AdminControl = () => {
  const [section1Enabled, setSection1Enabled] = useState(false);
  const [section2Enabled, setSection2Enabled] = useState(false);
  const [section1Timer, setSection1Timer] = useState(30);
  const [section2Timer, setSection2Timer] = useState(45);
  const [selectedBank, setSelectedBank] = useState('');
  const [questionBanks, setQuestionBanks] = useState<QuestionBank[]>([]);
  const [responses, setResponses] = useState<Student[]>([]);
  const [selectedResponse, setSelectedResponse] = useState<number | null>(null);
  const toast = useToast();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInitialState();
    fetchQuestionBanks();
    fetchQuizzes();
  }, []);

  const fetchInitialState = async () => {
    try {
      const response = await getQuizzes();
      if (response.data && response.data.success) {
        setSection1Enabled(response.data.section1_enabled);
        setSection2Enabled(response.data.section2_enabled);
        setSection1Timer(response.data.section1_timer);
        setSection2Timer(response.data.section2_timer);
      } else {
        toast({
          title: 'Error',
          description: response.data.message || 'Failed to fetch settings',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch settings',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const fetchQuestionBanks = async () => {
    try {
      const response = await getQuizzes();
      if (response.data && response.data.success) {
        setQuestionBanks(response.data.banks);
      } else {
        toast({
          title: 'Error',
          description: response.data.message || 'Failed to fetch question banks',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error fetching question banks:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch question banks',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleSettingsUpdate = async () => {
    try {
      const response = await submitQuiz(0, {
        section1_enabled: section1Enabled,
        section2_enabled: section2Enabled,
        section1_timer: section1Timer,
        section2_timer: section2Timer
      });

      if (response.data && response.data.success) {
        toast({
          title: 'Success',
          description: 'Section settings updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Error',
          description: response.data.message || 'Failed to update section settings',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error updating section settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to update section settings',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleBankSelect = async (bankId: string) => {
    try {
      const response = await submitQuiz(0, {
        bank_id: bankId,
      });
      if (response.data && response.data.success) {
        setSelectedBank(bankId);
        toast({
          title: 'Success',
          description: 'Question bank activated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        fetchResponses(bankId);
      } else {
        toast({
          title: 'Error',
          description: response.data.message || 'Failed to activate question bank',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error activating question bank:', error);
      toast({
        title: 'Error',
        description: 'Failed to activate question bank',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const fetchResponses = async (bankId: string) => {
    try {
      const response = await getQuizzes();
      if (response.data && response.data.success) {
        setResponses(response.data.responses);
      } else {
        toast({
          title: 'Error',
          description: response.data.message || 'Failed to fetch responses',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error fetching responses:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch responses',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const displayResponse = async (studentId: number) => {
    try {
      const response = await submitQuiz(studentId, { display: true });
      if (response.data && response.data.success) {
        setSelectedResponse(studentId);
        toast({
          title: 'Success',
          description: 'Response displayed successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Error',
          description: response.data.message || 'Failed to display response',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error displaying response:', error);
      toast({
        title: 'Error',
        description: 'Failed to display response',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const fetchQuizzes = async () => {
    try {
      const response = await getQuizzes();
      if (response.data && response.data.success) {
        setQuizzes(response.data.quizzes);
      } else {
        toast({
          title: 'Error',
          description: response.data.message || 'Failed to fetch quizzes',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch quizzes',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleCreateQuiz = async (quizData: any) => {
    try {
      const response = await createQuiz(quizData);
      if (response.data && response.data.success) {
        toast({
          title: 'Success',
          description: 'Quiz created successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        fetchQuizzes();
      } else {
        toast({
          title: 'Error',
          description: response.data.message || 'Failed to create quiz',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error creating quiz:', error);
      toast({
        title: 'Error',
        description: 'Failed to create quiz',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleUpdateQuiz = async (quizId: number, quizData: any) => {
    try {
      const response = await submitQuiz(quizId, quizData);
      if (response.data && response.data.success) {
        toast({
          title: 'Success',
          description: 'Quiz updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        fetchQuizzes();
      } else {
        toast({
          title: 'Error',
          description: response.data.message || 'Failed to update quiz',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error updating quiz:', error);
      toast({
        title: 'Error',
        description: 'Failed to update quiz',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDeleteQuiz = async (quizId: number) => {
    try {
      const response = await submitQuiz(quizId, { delete: true });
      if (response.data && response.data.success) {
        toast({
          title: 'Success',
          description: 'Quiz deleted successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        fetchQuizzes();
      } else {
        toast({
          title: 'Error',
          description: response.data.message || 'Failed to delete quiz',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error deleting quiz:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete quiz',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={4}>
      <VStack spacing={8} align="stretch">
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

        <Card>
          <CardHeader>
            <Heading size="md">Timer Settings</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Section 1 Timer (minutes)</FormLabel>
                <NumberInput
                  value={section1Timer}
                  onChange={(_, value) => setSection1Timer(value)}
                  min={1}
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
                <FormLabel>Section 2 Timer (minutes)</FormLabel>
                <NumberInput
                  value={section2Timer}
                  onChange={(_, value) => setSection2Timer(value)}
                  min={1}
                  isDisabled={!section2Enabled}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <Button 
                colorScheme="blue" 
                onClick={handleSettingsUpdate}
                mt={4}
              >
                Update Timer Settings
              </Button>
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <Heading size="md">Question Control</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Select Question Bank</FormLabel>
                <Select
                  value={selectedBank}
                  onChange={(e) => handleBankSelect(e.target.value)}
                  placeholder="Select a question bank"
                >
                  {questionBanks.map((bank) => (
                    <option key={bank.id} value={bank.id}>
                      {bank.name} (Section {bank.section_type})
                    </option>
                  ))}
                </Select>
              </FormControl>

              <Divider />

              <Box>
                <Heading size="sm" mb={4}>
                  Student Responses
                </Heading>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Name</Th>
                      <Th>Answer</Th>
                      <Th>Time</Th>
                      <Th>Status</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {responses.map((student) => (
                      <Tr key={student.id}>
                        <Td>{student.name}</Td>
                        <Td>{student.answer}</Td>
                        <Td>{student.timestamp}</Td>
                        <Td>
                          <Badge
                            colorScheme={student.is_correct ? 'green' : 'red'}
                          >
                            {student.is_correct ? 'Correct' : 'Incorrect'}
                          </Badge>
                        </Td>
                        <Td>
                          <Button
                            size="sm"
                            colorScheme="blue"
                            isDisabled={selectedResponse === student.id}
                            onClick={() => displayResponse(student.id)}
                          >
                            Display
                          </Button>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default AdminControl; 