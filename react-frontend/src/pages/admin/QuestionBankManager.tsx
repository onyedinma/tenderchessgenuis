import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  Select,
  FormControl,
  FormLabel,
  VStack,
  HStack,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Text,
  Alert,
  AlertIcon,
  Badge,
  IconButton,
  Tooltip,
  Collapse,
  Divider,
  FormHelperText,
  ModalFooter,
  Flex,
  Heading,
  Image,
  SimpleGrid,
  useColorModeValue,
  Stack,
  Center,
  Card,
  CardHeader,
  CardBody,
  Icon,
} from '@chakra-ui/react';
import { 
  AddIcon, 
  DeleteIcon, 
  ViewIcon, 
  EditIcon, 
  ChevronDownIcon, 
  ChevronUpIcon, 
  InfoIcon, 
  CheckCircleIcon,
} from '@chakra-ui/icons';
import axios from 'axios';
import ChessBoard from '../../components/ChessBoard';
import QuestionEditor from '../../components/QuestionEditor';

interface QuestionBank {
  id: number;
  name: string;
  section_type: '1' | '2';
  question_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Question {
  id: number;
  bank_id: number;
  question_text: string;
  correct_answer: string;
  position: string;
  question_order: number;
  is_active: boolean;
  created_at: string;
}

interface EditorQuestion {
  id: number;
  fen: string;
  solutionFen: string;
  order: number;
  is_active: boolean;
  question_text: string;
  correct_answer: string;
  algebraic_notation?: string;
  move_sequence?: string;
}

export default function QuestionBankManager() {
  // All hooks must be called in the same order on every render
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Disclosure hooks
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { 
    isOpen: isQuestionEditorOpen, 
    onOpen: onQuestionEditorOpen, 
    onClose: onQuestionEditorClose 
  } = useDisclosure();

  // State hooks
  const [banks, setBanks] = useState<QuestionBank[]>([]);
  const [selectedBank, setSelectedBank] = useState<QuestionBank | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newBank, setNewBank] = useState({
    name: '',
    section_type: '1',
  });
  const [questionToEdit, setQuestionToEdit] = useState<EditorQuestion | null>(null);
  const [loading, setLoading] = useState(false);

  // Effects
  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/question-banks/get-banks.php');
      
      if (response.data && response.data.success && Array.isArray(response.data.banks)) {
        setBanks(response.data.banks);
      } else {
        toast({
          title: 'Error fetching question banks',
          description: 'Invalid response format from server',
          status: 'error',
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error fetching banks:', error);
      toast({
        title: 'Error fetching question banks',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async (bankId: number) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/question-banks/get-questions.php?bank_id=${bankId}`);
      
      console.log("API response:", response.data);
      
      if (response.data && response.data.success && Array.isArray(response.data.questions)) {
        // Validate position data for each question
        const validatedQuestions = response.data.questions.map((question: any) => {
          // Log what we received from the API
          console.log(`Processing question ${question.id} from API:`, question);
          
          // Construct a proper Question object
          const validatedQuestion: Question = {
            id: question.id,
            bank_id: question.bank_id || bankId,
            question_text: question.question_text || '',
            correct_answer: question.correct_answer || '',
            question_order: question.order || 0,
            is_active: question.is_active || false,
            created_at: question.created_at || new Date().toISOString(),
            position: ''
          };

          // Use the position data if available, otherwise construct it
          if (question.position && typeof question.position === 'string') {
            console.log(`Using existing position for question ${question.id}`);
            validatedQuestion.position = question.position;
          } else {
            console.log(`Constructing position for question ${question.id} from FEN fields`);
            // Construct position from FEN values
            const positionData = {
              starting_fen: question.fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
              solution_fen: question.solutionFen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
              algebraic_notation: question.algebraic_notation || '',
              move_sequence: question.move_sequence || []
            };
            
            validatedQuestion.position = JSON.stringify(positionData);
          }
          
          // Double-check by extracting the FEN
          try {
            const fen = extractFenFromPosition(validatedQuestion.position);
            console.log(`Validated FEN for question ${question.id}:`, fen);
          } catch (e) {
            console.error(`Error validating FEN for question ${question.id}:`, e);
          }
          
          return validatedQuestion;
        });
        
        setQuestions(validatedQuestions);
      } else {
        setQuestions([]);
        toast({
          title: 'Error fetching questions',
          description: 'Invalid response format from server',
          status: 'error',
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      setQuestions([]);
      toast({
        title: 'Error fetching questions',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBankCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if we've reached the 20 bank limit for this section
    const sectionBanks = banks.filter(bank => bank.section_type === newBank.section_type);
    if (sectionBanks.length >= 20) {
      toast({
        title: 'Maximum banks reached',
        description: `Section ${newBank.section_type} already has 20 banks.`,
        status: 'error',
        duration: 3000,
      });
      return;
    }

    try {
      await axios.post('/api/question-banks/create-bank.php', newBank);
      toast({
        title: 'Question bank created successfully',
        status: 'success',
        duration: 3000,
      });
      setNewBank({ name: '', section_type: '1' });
      fetchBanks();
      onClose();
    } catch (error) {
      toast({
        title: 'Error creating question bank',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleBankDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this question bank?')) {
      try {
        await axios.post('/api/question-banks/delete-bank.php', { id });
        toast({
          title: 'Question bank deleted successfully',
          status: 'success',
          duration: 3000,
        });
        fetchBanks();
        if (selectedBank?.id === id) {
          setSelectedBank(null);
          setQuestions([]);
        }
      } catch (error) {
        toast({
          title: 'Error deleting question bank',
          status: 'error',
          duration: 3000,
        });
      }
    }
  };

  const handleBankSelect = (bank: QuestionBank | null) => {
    if (selectedBank?.id === bank?.id) {
      setSelectedBank(null);
      setQuestions([]);
    } else if (bank) {
      setSelectedBank(bank);
      fetchQuestions(bank.id);
    }
  };

  const toggleBankActive = async (bankId: number) => {
    const bank = banks.find(b => b.id === bankId);
    if (!bank) return;

    // Check minimum questions requirement for Section 1
    if (bank.section_type === '1' && bank.question_count < 20) {
      toast({
        title: 'Cannot activate bank',
        description: 'Section 1 banks must have at least 20 questions',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await axios.post('/api/question-banks/toggle-bank.php', { 
        id: bankId,
        is_active: !bank.is_active 
      });

      // Update local state
      setBanks(banks => 
        banks.map(b => 
          b.id === bankId 
            ? { ...b, is_active: !b.is_active } 
            : b.is_active && b.id !== bankId && b.section_type === bank.section_type
              ? { ...b, is_active: false } // Deactivate other banks in same section
              : b
        )
      );

      toast({
        title: bank.is_active ? 'Bank deactivated' : 'Bank activated',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error toggling bank status',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleQuestionDelete = async (questionId: number) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await axios.post('/api/question-banks/remove-question.php', {
          bank_id: selectedBank?.id,
          question_id: questionId,
        });
        toast({
          title: 'Question deleted successfully',
          status: 'success',
          duration: 3000,
        });
        if (selectedBank) {
          fetchQuestions(selectedBank.id);
        }
      } catch (error) {
        toast({
          title: 'Error deleting question',
          status: 'error',
          duration: 3000,
        });
      }
    }
  };

  const handleAddQuestion = () => {
    setQuestionToEdit(null);
    onQuestionEditorOpen();
  };

  const handleEditQuestion = (question: Question) => {
    try {
      // Check if position data exists before trying to parse it
      if (!question.position) {
        throw new Error('Position data is missing or undefined');
      }
      
      // Use our helper function to get the starting FEN
      const fen = extractFenFromPosition(question.position);
      
      // Parse the full position data
      const positionData = JSON.parse(question.position);
      
      // Validate required fields in position data
      if (!positionData.starting_fen) {
        positionData.starting_fen = fen; // Use extracted FEN if missing in the object
      }
      
      if (!positionData.solution_fen) {
        throw new Error('Solution FEN is missing in position data');
      }
      
      console.log("Editing question with position:", positionData);
      
      const transformedQuestion = {
        id: question.id,
        fen: positionData.starting_fen || '',
        solutionFen: positionData.solution_fen || '',
        order: question.question_order,
        is_active: question.is_active,
        question_text: question.question_text,
        correct_answer: question.correct_answer,
        algebraic_notation: positionData.algebraic_notation || '',
        move_sequence: positionData.move_sequence ? 
          (typeof positionData.move_sequence === 'string' ? 
            positionData.move_sequence : 
            JSON.stringify(positionData.move_sequence)
          ) : ''
      };
      setQuestionToEdit(transformedQuestion);
      onQuestionEditorOpen();
    } catch (error) {
      console.error('Error parsing question position data:', error);
      toast({
        title: 'Error',
        description: `Failed to parse question position data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleQuestionSave = async (questionData: any) => {
    try {
      if (questionToEdit) {
        await axios.post('/api/question-banks/update-question.php', {
          ...questionData,
          bank_id: selectedBank?.id,
          question_id: questionToEdit.id
        });
      } else {
        await axios.post('/api/question-banks/add-question.php', {
          ...questionData,
          bank_id: selectedBank?.id
        });
      }

      toast({
        title: questionToEdit ? 'Question updated' : 'Question added',
        status: 'success',
        duration: 3000,
      });

      if (selectedBank) {
        fetchQuestions(selectedBank.id);
      }
      onQuestionEditorClose();
    } catch (error) {
      toast({
        title: 'Error saving question',
        status: 'error',
        duration: 3000,
      });
    }
  };

  // Helper function to extract FEN from position data
  const extractFenFromPosition = (position: string): string => {
    try {
      if (!position) return '';
      
      // Try to parse as JSON
      const positionData = JSON.parse(position);
      
      // Return the starting FEN if available
      if (positionData && positionData.starting_fen) {
        console.log("Extracted FEN:", positionData.starting_fen);
        return positionData.starting_fen;
      }
      
      // Default FEN as fallback
      return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    } catch (e) {
      console.error("Error extracting FEN:", e);
      return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    }
  };

  return (
    <Box p={4}>
      <VStack spacing={6} align="stretch">
        <Flex justify="space-between" align="center">
          <Heading size="lg">Question Bank Manager</Heading>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={onOpen}
          >
            Create New Bank
          </Button>
        </Flex>

        <Tabs variant="enclosed">
          <TabList>
            <Tab>Section 1</Tab>
            <Tab>Section 2</Tab>
          </TabList>

          <TabPanels>
            {['1', '2'].map((section) => (
              <TabPanel key={section}>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                  {banks
                    .filter(bank => bank.section_type === section)
                    .map(bank => (
                      <Card
                        key={bank.id}
                        borderWidth="1px"
                        borderColor={borderColor}
                        bg={bgColor}
                        cursor="pointer"
                        onClick={() => handleBankSelect(bank)}
                        _hover={{ shadow: 'md' }}
                      >
                        <CardHeader>
                          <Flex justify="space-between" align="center">
                            <Heading size="md">{bank.name}</Heading>
                            <HStack>
                              <Badge colorScheme={bank.is_active ? 'green' : 'gray'}>
                                {bank.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                              <IconButton
                                aria-label="Toggle bank active"
                                icon={bank.is_active ? <CheckCircleIcon /> : <InfoIcon />}
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleBankActive(bank.id);
                                }}
                              />
                              <IconButton
                                aria-label="Delete bank"
                                icon={<DeleteIcon />}
                                size="sm"
                                colorScheme="red"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleBankDelete(bank.id);
                                }}
                              />
                            </HStack>
                          </Flex>
                        </CardHeader>
                        <CardBody>
                          <VStack align="stretch" spacing={2}>
                            <Text>Questions: {bank.question_count}</Text>
                            <Text fontSize="sm" color="gray.500">
                              Created: {new Date(bank.created_at).toLocaleDateString()}
                            </Text>
                            {bank.question_count < 20 && bank.section_type === '1' && (
                              <Alert status="warning" size="sm">
                                <AlertIcon />
                                Needs {20 - bank.question_count} more questions
                              </Alert>
                            )}
                          </VStack>
                        </CardBody>
                      </Card>
                    ))}
                </SimpleGrid>
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>

        {selectedBank && (
          <Box mt={6}>
            <Flex justify="space-between" align="center" mb={4}>
              <Heading size="md">Questions in {selectedBank.name}</Heading>
              <Button
                leftIcon={<AddIcon />}
                colorScheme="blue"
                onClick={handleAddQuestion}
              >
                Add Question
              </Button>
            </Flex>

            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Order</Th>
                  <Th>Question</Th>
                  <Th>Position</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {questions.map((question) => (
                  <Tr key={question.id}>
                    <Td>{question.question_order}</Td>
                    <Td>{question.question_text}</Td>
                    <Td>
                      <Box w="100px" h="100px">
                        {(() => {
                          try {
                            // Check if position exists before parsing
                            if (!question.position) {
                              throw new Error('Position data is missing');
                            }
                            
                            // Get the FEN directly from position data
                            const fen = extractFenFromPosition(question.position);
                            
                            // Log the actual position data for debugging
                            console.log(`Question ${question.id} position:`, fen);
                            
                            if (!fen) {
                              throw new Error('No valid FEN found in position data');
                            }
                            
                            return (
                              <ChessBoard 
                                fen={fen} 
                                width={100}
                              />
                            );
                          } catch (e) {
                            console.error("Error parsing position data:", e);
                            // Provide more specific error message
                            return (
                              <Text fontSize="xs" color="red.500">
                                {e instanceof Error ? e.message : 'Invalid position data'}
                              </Text>
                            );
                          }
                        })()}
                      </Box>
                    </Td>
                    <Td>
                      <Badge colorScheme={question.is_active ? 'green' : 'gray'}>
                        {question.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <IconButton
                          aria-label="Edit question"
                          icon={<EditIcon />}
                          size="sm"
                          onClick={() => handleEditQuestion(question)}
                        />
                        <IconButton
                          aria-label="Delete question"
                          icon={<DeleteIcon />}
                          size="sm"
                          colorScheme="red"
                          onClick={() => handleQuestionDelete(question.id)}
                        />
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}
      </VStack>

      {/* Create Bank Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Question Bank</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleBankCreate}>
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Bank Name</FormLabel>
                  <Input
                    value={newBank.name}
                    onChange={(e) => setNewBank({ ...newBank, name: e.target.value })}
                    placeholder="Enter bank name"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Section</FormLabel>
                  <Select
                    value={newBank.section_type}
                    onChange={(e) => setNewBank({ ...newBank, section_type: e.target.value as '1' | '2' })}
                  >
                    <option value="1">Section 1</option>
                    <option value="2">Section 2</option>
                  </Select>
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="blue" type="submit">
                Create Bank
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Question Editor Modal */}
      <QuestionEditor
        isOpen={isQuestionEditorOpen}
        onClose={onQuestionEditorClose}
        bankId={selectedBank?.id || 0}
        sectionType={selectedBank?.section_type || '1'}
        onQuestionAdded={() => {
          if (selectedBank) {
            fetchQuestions(selectedBank.id);
          }
        }}
        questionToEdit={questionToEdit}
      />
    </Box>
  );
} 