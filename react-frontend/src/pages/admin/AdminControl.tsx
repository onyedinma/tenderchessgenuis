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
import axios from 'axios';

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

export default function AdminControl() {
  const [section2Enabled, setSection2Enabled] = useState(false);
  const [timerSection1, setTimerSection1] = useState(0);
  const [timerSection2, setTimerSection2] = useState(0);
  const [selectedBank, setSelectedBank] = useState('');
  const [questionBanks, setQuestionBanks] = useState<QuestionBank[]>([]);
  const [responses, setResponses] = useState<Student[]>([]);
  const [selectedResponse, setSelectedResponse] = useState<number | null>(null);
  const toast = useToast();

  useEffect(() => {
    fetchInitialState();
    fetchQuestionBanks();
  }, []);

  const fetchInitialState = async () => {
    try {
      const response = await axios.get('/api/admin/get-settings.php');
      setSection2Enabled(response.data.section2_enabled);
      setTimerSection1(response.data.timer_section1);
      setTimerSection2(response.data.timer_section2);
    } catch (error) {
      toast({
        title: 'Error fetching settings',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const fetchQuestionBanks = async () => {
    try {
      const response = await axios.get('/api/question-banks/get-banks.php');
      setQuestionBanks(response.data.banks);
    } catch (error) {
      toast({
        title: 'Error fetching question banks',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleSection2Toggle = async () => {
    try {
      await axios.post('/api/admin/toggle-section2.php', {
        enabled: !section2Enabled,
      });
      setSection2Enabled(!section2Enabled);
      toast({
        title: `Section 2 ${!section2Enabled ? 'enabled' : 'disabled'}`,
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error toggling Section 2',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleTimerUpdate = async (section: '1' | '2', value: number) => {
    try {
      await axios.post('/api/admin/update-timer.php', {
        section,
        duration: value,
      });
      if (section === '1') {
        setTimerSection1(value);
      } else {
        setTimerSection2(value);
      }
      toast({
        title: `Timer updated for Section ${section}`,
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error updating timer',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleBankSelect = async (bankId: string) => {
    try {
      await axios.post('/api/admin/set-active-bank.php', {
        bank_id: bankId,
      });
      setSelectedBank(bankId);
      toast({
        title: 'Question bank activated',
        status: 'success',
        duration: 3000,
      });
      fetchResponses(bankId);
    } catch (error) {
      toast({
        title: 'Error activating question bank',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const fetchResponses = async (bankId: string) => {
    try {
      const response = await axios.get(`/api/admin/get-responses.php?bank_id=${bankId}`);
      setResponses(response.data.responses);
    } catch (error) {
      toast({
        title: 'Error fetching responses',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const displayResponse = async (studentId: number) => {
    try {
      await axios.post('/api/admin/display-response.php', {
        student_id: studentId,
      });
      setSelectedResponse(studentId);
      toast({
        title: 'Response displayed',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error displaying response',
        status: 'error',
        duration: 3000,
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
                <FormLabel htmlFor="section2-toggle" mb="0">
                  Enable Section 2
                </FormLabel>
                <Switch
                  id="section2-toggle"
                  isChecked={section2Enabled}
                  onChange={handleSection2Toggle}
                />
              </FormControl>
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
                  value={timerSection1}
                  onChange={(_, value) => handleTimerUpdate('1', value)}
                  min={1}
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
                  value={timerSection2}
                  onChange={(_, value) => handleTimerUpdate('2', value)}
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
} 