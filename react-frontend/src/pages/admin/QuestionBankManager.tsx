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
  Switch,
  useBreakpointValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Portal,
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
import { api } from '../../services/api';
import ChessBoard from '../../components/ChessBoard';
import QuestionEditor from '../../components/QuestionEditor';

interface QuestionBank {
  id: number;
  name: string;
  section: '1' | '2';
  question_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Question {
  id: number;
  quiz_id: number;
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
    section: '1',
  });
  const [questionToEdit, setQuestionToEdit] = useState<EditorQuestion | null>(null);
  const [loading, setLoading] = useState(false);

  // Effects
  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    try {
      const timestamp = new Date().getTime();
      const response = await api.get(`/question-banks/get-banks.php?_=${timestamp}`);
      if (response.data && response.data.success) {
        setBanks(response.data.banks);
      } else {
        toast({
          title: 'Error',
          description: response.data.message || 'Failed to fetch banks',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error fetching banks:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch banks',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const fetchQuestions = async (bankId: number) => {
    try {
      const response = await api.get(`/question-banks/get-questions.php?bank_id=${bankId}`);
      if (response.data && response.data.success) {
        setQuestions(response.data.questions);
      } else {
        toast({
          title: 'Error',
          description: response.data.message || 'Failed to fetch questions',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch questions',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleBankCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if we've reached the 20 bank limit for this section
    const sectionBanks = banks.filter(bank => bank.section === newBank.section);
    if (sectionBanks.length >= 20) {
      toast({
        title: 'Maximum banks reached',
        description: `Section ${newBank.section} already has 20 banks.`,
        status: 'error',
        duration: 3000,
      });
      return;
    }

    try {
      await api.post('/question-banks/create-bank.php', newBank);
      toast({
        title: 'Question bank created successfully',
        status: 'success',
        duration: 3000,
      });
      setNewBank({ name: '', section: '1' });
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
        await api.post('/question-banks/delete-bank.php', { id });
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
    if (bank.section === '1' && bank.question_count < 20) {
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
      await api.post('/question-banks/toggle-bank.php', { 
        id: bankId,
        is_active: !bank.is_active 
      });

      // Update local state
      setBanks(currentBanks =>
        currentBanks.map(b => {
          if (b.id === bankId) {
            return { ...b, is_active: !b.is_active };
          }
          if (b.section === bank.section && b.id !== bankId) {
            return { ...b, is_active: false };
          }
          return b;
        })
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
        await api.post('/question-banks/remove-question.php', {
          quiz_id: selectedBank?.id,
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
      
      console.log("Editing question with raw position data:", question.position);
      
      // Parse the full position data
      const positionData = JSON.parse(question.position);
      console.log("Parsed position data:", positionData);
      
      // Extract starting FEN using our helper function
      const initialFen = extractFenFromPosition(question.position);
      
      // Extract solution FEN - similar logic to extract FEN but for solution
      let solutionFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      try {
        if (positionData.solution_fen) {
          solutionFen = positionData.solution_fen;
        } else if (positionData.solutionFen) {
          solutionFen = positionData.solutionFen;
        } else if (positionData.position && typeof positionData.position === 'string') {
          const nestedPosition = JSON.parse(positionData.position);
          if (nestedPosition.solution_fen) {
            solutionFen = nestedPosition.solution_fen;
          } else if (nestedPosition.solutionFen) {
            solutionFen = nestedPosition.solutionFen;
          }
        }
      } catch (e) {
        console.error("Error extracting solution FEN:", e);
      }
      
      console.log("Extracted FENs - Initial:", initialFen, "Solution:", solutionFen);
      
      // Extract other position-related data
      let algebraicNotation = '';
      let moveSequence = '';
      
      if (positionData.algebraic_notation) {
        algebraicNotation = positionData.algebraic_notation;
      }
      
      if (positionData.move_sequence) {
        moveSequence = typeof positionData.move_sequence === 'string' ? 
          positionData.move_sequence : 
          JSON.stringify(positionData.move_sequence);
      }
      
      const transformedQuestion = {
        id: question.id,
        fen: initialFen,
        solutionFen: solutionFen,
        order: question.question_order,
        is_active: question.is_active,
        question_text: question.question_text,
        correct_answer: question.correct_answer,
        algebraic_notation: algebraicNotation,
        move_sequence: moveSequence
      };
      
      console.log("Transformed question for editor:", transformedQuestion);
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
        await api.post('/question-banks/update-question.php', {
          ...questionData,
          bank_id: selectedBank?.id,
          question_id: questionToEdit.id
        });
      } else {
        await api.post('/question-banks/add-question.php', {
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
      
      // Check for new format (used by latest version of QuestionEditor)
      if (positionData && positionData.starting_fen) {
        console.log("Extracted FEN (starting_fen):", positionData.starting_fen);
        return positionData.starting_fen;
      }
      
      // Check for older format versions
      if (positionData && positionData.fen) {
        console.log("Extracted FEN (fen):", positionData.fen);
        return positionData.fen;
      }
      
      // If the position data has a 'position' field (nested structure)
      if (positionData && positionData.position && typeof positionData.position === 'string') {
        try {
          const nestedPosition = JSON.parse(positionData.position);
          if (nestedPosition.starting_fen) {
            console.log("Extracted FEN (nested starting_fen):", nestedPosition.starting_fen);
            return nestedPosition.starting_fen;
          }
          if (nestedPosition.fen) {
            console.log("Extracted FEN (nested fen):", nestedPosition.fen);
            return nestedPosition.fen;
          }
        } catch (nestedError) {
          console.error("Error parsing nested position:", nestedError);
        }
      }
      
      // Default FEN as fallback
      console.warn("Using default FEN - could not find valid FEN in position data:", positionData);
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
                    .filter(bank => bank.section === section)
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
                            {bank.question_count < 20 && bank.section === '1' && (
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
                            console.log(`Question ${question.id} position: ${fen}`);
                            
                            if (!fen) {
                              throw new Error('No valid FEN found in position data');
                            }
                            
                            return (
                              <ChessBoard 
                                position={fen} 
                                boardSize={100}
                                allowMoves={false}
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
                    value={newBank.section}
                    onChange={(e) => setNewBank({ ...newBank, section: e.target.value as '1' | '2' })}
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
        sectionType={selectedBank?.section || '1'}
        onQuestionAdded={() => {
          if (selectedBank) {
            console.log('Question added or updated - refreshing questions for bank:', selectedBank.id);
            fetchQuestions(selectedBank.id);
            
            // Also refresh the bank list to update question counts
            console.log('Refreshing bank list after question changes');
            fetchBanks();
          }
        }}
        questionToEdit={questionToEdit}
      />
    </Box>
  );
} 