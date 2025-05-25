import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Badge,
  IconButton,
  useToast,
  Flex,
  Spacer,
  Divider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
  Select,
  Input,
  Textarea,
  FormControl,
  FormLabel,
  FormHelperText,
  Image,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  Switch,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Grid,
  GridItem,
  InputGroup,
  InputLeftElement,
  useBreakpointValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Portal,
} from '@chakra-ui/react';
import { FaHighlighter, FaEye, FaChessBoard, FaTrash, FaEdit, FaArrowUp, FaArrowDown, FaStar, FaPlus, FaCheck, FaTimes, FaChessPawn, FaExternalLinkAlt, FaFilter, FaSearch, FaTimesCircle } from 'react-icons/fa';
import { AddIcon, DeleteIcon, EditIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { api } from '../../services/api';
import ChessBoard from '../../components/ChessBoard';
import { Link as RouterLink } from 'react-router-dom';

interface Question {
  id: number;
  quiz_id: number;
  question_text: string;
  correct_answer: string;
  position: string;
  question_order: number;
  created_at: string;
  bank?: QuestionBank;
}

interface HighlightedQuestion {
  id: number;
  question_id: number;
  quiz_id?: number;
  active: boolean;
  created_at: string;
  highlighted_by?: number;
  notes?: string;
  display_order: number;
  question?: Question;
  bank?: QuestionBank;
  bank_id: number;
  // Additional fields that might be directly on the highlighted question
  question_text?: string;
  correct_answer?: string;
  position?: string;
  position_fen?: string;
  position_pgn?: string;
  section_type?: string;
}

interface QuestionBank {
  id: number;
  name: string;
  section_type: string;
  question_count: number;
  is_active: boolean;
}

const HighlightedQuestions: React.FC = () => {
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.700');
  const highlightedBg = useColorModeValue('blue.50', 'blue.900');
  const tableSize = useBreakpointValue({ base: 'sm', md: 'md' });
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const [questionBanks, setQuestionBanks] = useState<QuestionBank[]>([]);
  const [selectedBank, setSelectedBank] = useState<QuestionBank | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [highlightedQuestions, setHighlightedQuestions] = useState<HighlightedQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [highlightLoading, setHighlightLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [notesInput, setNotesInput] = useState('');
  const [orderInput, setOrderInput] = useState(0);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBankFilter, setSelectedBankFilter] = useState<number | string>('all');
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>('all');

  // Fetch data on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        console.log("Starting to load initial data...");
        await Promise.all([
          fetchQuestionBanks(),
          fetchAllQuestions(),
          fetchHighlightedQuestions()
        ]);
        console.log("All data loaded successfully");
        // Set isLoading to false after all data is loaded
        setIsLoading(false);
      } catch (err) {
        console.error("Error loading initial data:", err);
        setError("Failed to load data. Please refresh the page.");
        setIsLoading(false);
      }
    };
    
    loadInitialData();
  }, []);

  // Apply filters when filter states or questions change
  useEffect(() => {
    console.log("Applying filters to", allQuestions.length, "questions");
    applyFilters();
  }, [searchTerm, selectedBankFilter, selectedSectionFilter, allQuestions, highlightedQuestions]);

  // Apply filters to the questions list
  const applyFilters = () => {
    let filtered = [...allQuestions];
    console.log("Starting with", filtered.length, "questions");
    
    // Filter out questions that are already highlighted
    if (highlightedQuestions.length > 0) {
      const highlightedIds = highlightedQuestions.map(hq => hq.question_id);
      filtered = filtered.filter(q => !highlightedIds.includes(q.id));
      console.log("After removing highlighted questions:", filtered.length, "questions remain");
    }
    
    // Apply section filter next
    if (selectedSectionFilter !== 'all') {
      filtered = filtered.filter(q => q.bank?.section_type === selectedSectionFilter);
      console.log("After section filter:", filtered.length, "questions remain");
    }
    
    // Apply bank filter next
    if (selectedBankFilter !== 'all') {
      filtered = filtered.filter(q => q.bank?.id === Number(selectedBankFilter) || q.quiz_id === Number(selectedBankFilter));
      console.log("After bank filter:", filtered.length, "questions remain");
    }
    
    // Apply search filter last
    if (searchTerm) {
      filtered = filtered.filter(q => 
        q.question_text.toLowerCase().includes(searchTerm.toLowerCase())
      );
      console.log("After search filter:", filtered.length, "questions remain");
    }
    
    console.log("Final filtered questions:", filtered.length);
    setFilteredQuestions(filtered);
  };

  // Fetch banks
  const fetchQuestionBanks = async () => {
    try {
      console.log("Fetching question banks...");
      setLoading(true);
      const response = await api.get('/question-banks/get-banks.php');
      if (response.data && response.data.success) {
        console.log("Fetched", response.data.banks.length, "question banks");
        setQuestionBanks(response.data.banks);
        return response.data.banks;
      } else {
        console.error("Failed to fetch banks:", response.data.message);
        toast({
          title: 'Error',
          description: response.data.message || 'Failed to fetch question banks',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        throw new Error(response.data.message || 'Failed to fetch question banks');
      }
    } catch (error) {
      console.error('Error fetching banks:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch question banks',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Fetch all questions from all banks
  const fetchAllQuestions = async () => {
    try {
      console.log("Fetching all questions...");
      setLoading(true);
      const response = await api.get('/question-banks/get-all-questions.php');
      if (response.data && response.data.success) {
        console.log("Fetched", response.data.questions.length, "questions");
        setAllQuestions(response.data.questions);
        setFilteredQuestions(response.data.questions);
        return response.data.questions;
      } else {
        console.error("Failed to fetch questions:", response.data.message);
        toast({
          title: 'Error',
          description: response.data.message || 'Failed to fetch questions',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        throw new Error(response.data.message || 'Failed to fetch questions');
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
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Fetch highlighted questions
  const fetchHighlightedQuestions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/question-banks/get-highlighted.php');
      
      if (response.data && response.data.success && Array.isArray(response.data.questions)) {
        setQuestions(response.data.questions);
      } else {
        toast({
          title: 'Error fetching highlighted questions',
          description: 'Invalid response format from server',
          status: 'error',
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error fetching highlighted questions:', error);
      toast({
        title: 'Error fetching highlighted questions',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch questions when a bank is selected
  const fetchQuestions = async (quizId: number) => {
    try {
      setQuestionLoading(true);
      const response = await api.get(`/question-banks/get-questions.php?quiz_id=${quizId}`);
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
    } finally {
      setQuestionLoading(false);
    }
  };

  // Handle bank selection
  const handleBankSelect = (bank: QuestionBank) => {
    setSelectedBank(bank);
    fetchQuestions(bank.id);
  };

  // Extract FEN from position
  const extractFen = (position: string): string => {
    try {
      const positionData = JSON.parse(position);
      return positionData.starting_fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    } catch (e) {
      console.error('Error parsing position:', e);
      return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    }
  };

  // Highlight a question
  const highlightQuestion = async () => {
    if (!selectedQuestion) return;
    
    try {
      setLoading(true);
      const response = await api.post('/question-banks/highlight-question.php', {
        questionId: selectedQuestion.id,
        notes: notesInput,
        displayOrder: orderInput
      });
      
      if (response.data && response.data.success) {
        toast({
          title: 'Success',
          description: 'Question highlighted successfully',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        onClose();
        setNotesInput('');
        setOrderInput(0);
        setSelectedQuestion(null);
        // Refresh highlighted questions
        fetchHighlightedQuestions();
      } else {
        toast({
          title: 'Error',
          description: response.data.message || 'Failed to highlight question',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error highlighting question:', error);
      toast({
        title: 'Error',
        description: 'Failed to highlight question',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Unhighlight a question
  const unhighlightQuestion = async (questionId: number, shouldDelete: boolean = false) => {
    try {
      setLoading(true);
      console.log(`Unhighlighting question with ID: ${questionId}, delete: ${shouldDelete}`);
      const response = await api.post('/question-banks/unhighlight-question.php', {
        question_id: questionId,
        delete: shouldDelete
      });
      
      if (response.data && response.data.success) {
        toast({
          title: 'Success',
          description: shouldDelete ? 'Question removed from highlighted list' : 'Question unhighlighted successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        // Update the highlighted questions list
        await fetchHighlightedQuestions();
        
        // Update the filtered questions list by reapplying filters
        // This will add the unhighlighted question back to the available list
        applyFilters();
      } else {
        toast({
          title: 'Error',
          description: response.data.message || 'Failed to unhighlight question',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error unhighlighting question:', error);
      toast({
        title: 'Error',
        description: 'Failed to unhighlight question',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Open highlight modal for a question
  const openHighlightModal = (question: Question) => {
    setSelectedQuestion(question);
    setOrderInput(highlightedQuestions.length + 1); // Set default order to next in line
    onOpen();
  };

  // Add direct highlight function
  const highlightQuestionDirect = async (question: Question) => {
    try {
      setHighlightLoading(true);
      const response = await api.post('/question-banks/highlight-question.php', {
        questionId: question.id,
        notes: '',
        displayOrder: highlightedQuestions.length + 1
      });
      if (response.data && response.data.success) {
        toast({
          title: 'Success',
          description: 'Question highlighted successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        // Update the highlighted questions list with the new question
        await fetchHighlightedQuestions();
        
        // Update the filtered questions list by reapplying filters
        // This will remove the highlighted question from the available list
        applyFilters();
      } else {
        toast({
          title: 'Error',
          description: response.data.message || 'Failed to highlight question',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to highlight question',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setHighlightLoading(false);
    }
  };

  // Activate highlighted questions for students
  const activateHighlightedQuestions = async () => {
    try {
      setHighlightLoading(true);
      const response = await api.post('/question-banks/activate-highlighted.php');
      
      if (response.data && response.data.success) {
        toast({
          title: 'Success',
          description: `${response.data.activated_count} questions activated for students`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        fetchHighlightedQuestions(); // Refresh to show updated active statuses
      } else {
        toast({
          title: 'Error',
          description: response.data.message || 'Failed to activate questions',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to activate questions',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setHighlightLoading(false);
    }
  };

  // Deactivate highlighted questions for students
  const deactivateHighlightedQuestions = async () => {
    try {
      setHighlightLoading(true);
      const response = await api.post('/question-banks/deactivate-highlighted.php');
      
      if (response.data && response.data.success) {
        toast({
          title: 'Success',
          description: `${response.data.deactivated_count} questions deactivated for students`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        fetchHighlightedQuestions(); // Refresh to show updated active statuses
      } else {
        toast({
          title: 'Error',
          description: response.data.message || 'Failed to deactivate questions',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to deactivate questions',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setHighlightLoading(false);
    }
  };

  const handleToggleHighlight = async (questionId: number) => {
    try {
      await api.post('/question-banks/toggle-highlight.php', { question_id: questionId });
      toast({
        title: 'Question highlight status updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchHighlightedQuestions();
    } catch (error) {
      console.error('Error toggling highlight:', error);
      toast({
        title: 'Error',
        description: 'Failed to toggle highlight',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (error) {
    return (
      <Box p={4}>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </Box>
    );
  }

  // Get unique section types for filtering
  const sectionTypes = ['all', ...new Set(questionBanks.map(bank => bank.section_type))];

  return (
    <Box p={4}>
      <VStack spacing={6} align="stretch">
        <Heading size="lg">Highlight & Activate Questions</Heading>
        
        {/* Instructions */}
        <Alert status="info" variant="subtle">
          <AlertIcon />
          <Text>
            Select questions from any bank to highlight them. Then, activate highlighted questions to make them visible to students.
          </Text>
        </Alert>
        
        {/* Filters */}
        <Card>
          <CardHeader>
            <Heading size="md">Filter Questions</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              <FormControl>
                <FormLabel>Search</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <FaSearch color="gray.300" />
                  </InputLeftElement>
                  <Input 
                    placeholder="Search questions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </FormControl>
              
              <FormControl>
                <FormLabel>Filter by Section</FormLabel>
                <Select 
                  value={selectedSectionFilter} 
                  onChange={(e) => {
                    setSelectedSectionFilter(e.target.value);
                    // Reset bank filter when section changes
                    setSelectedBankFilter('all');
                  }}
                >
                  <option value="all">All Sections</option>
                  {sectionTypes.filter(t => t !== 'all').map(section => (
                    <option key={section} value={section}>
                      Section {section}
                    </option>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>Filter by Bank</FormLabel>
                <Select 
                  value={selectedBankFilter} 
                  onChange={(e) => setSelectedBankFilter(e.target.value)}
                >
                  <option value="all">All Banks</option>
                  {questionBanks
                    .filter(bank => selectedSectionFilter === 'all' || bank.section_type === selectedSectionFilter)
                    .map(bank => (
                      <option key={bank.id} value={bank.id}>
                        {bank.name}
                      </option>
                  ))}
                </Select>
              </FormControl>
            </SimpleGrid>
          </CardBody>
        </Card>
        
        {/* All Questions (Highlightable) */}
        <Card>
          <CardHeader>
            <HStack>
              <Heading size="md">Available Questions (Not Highlighted)</Heading>
              <Badge colorScheme="blue">{filteredQuestions.length} questions</Badge>
            </HStack>
          </CardHeader>
          <CardBody>
            {isLoading || loading ? (
              <Flex justify="center" py={4}><Spinner /></Flex>
            ) : filteredQuestions.length === 0 ? (
              <Alert status="info">
                <AlertIcon />
                No questions found with the current filters.
              </Alert>
            ) : (
              <TableContainer>
                <Table size={tableSize} variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Question</Th>
                      <Th>Bank</Th>
                      <Th>Section</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredQuestions.map((question) => (
                      <Tr key={question.id}>
                        <Td>{question.question_text}</Td>
                        <Td>
                          <Badge colorScheme="purple">
                            {question.bank?.name || `Bank #${question.quiz_id}`}
                          </Badge>
                        </Td>
                        <Td>
                          <Badge colorScheme={
                            question.bank?.section_type === '1' ? 'green' : 'orange'
                          }>
                            Section {question.bank?.section_type || 'Unknown'}
                          </Badge>
                        </Td>
                        <Td>
                          <Button 
                            size="sm" 
                            colorScheme="blue" 
                            leftIcon={<FaHighlighter />}
                            isLoading={highlightLoading} 
                            onClick={() => highlightQuestionDirect(question)}
                          >
                            Highlight
                          </Button>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            )}
          </CardBody>
        </Card>
        
        {/* Currently Highlighted Questions */}
        <Card>
          <CardHeader>
            <HStack>
              <Heading size="md">Currently Highlighted Questions (Ready for Display)</Heading>
              <Badge colorScheme="green">{highlightedQuestions.length} questions</Badge>
            </HStack>
          </CardHeader>
          <CardBody>
            {highlightLoading && !highlightedQuestions.length ? (
              <Flex justify="center" py={4}><Spinner /></Flex>
            ) : (
              <TableContainer>
                <Table size={tableSize} variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Order</Th>
                      <Th>Question</Th>
                      <Th>Bank</Th>
                      <Th>Section</Th>
                      <Th>Status</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {highlightedQuestions.length === 0 ? (
                      <Tr>
                        <Td colSpan={6}>
                          <Alert status="info">
                            <AlertIcon />
                            No questions have been highlighted yet. Highlight questions from the list above.
                          </Alert>
                        </Td>
                      </Tr>
                    ) : (
                      highlightedQuestions.map((hq) => {
                        // Get question text either from nested question object or directly from the highlighted question
                        const questionText = hq.question?.question_text || hq.question_text || 'Missing question text';
                        // Get bank name either from nested bank object or construct from other data
                        const bankName = hq.bank?.name || `Bank #${hq.bank_id || hq.quiz_id || 'Unknown'}`;
                        // Get section type from either nested bank or directly from the highlighted question
                        const sectionType = hq.bank?.section_type || hq.section_type || 'Unknown';
                        
                        return (
                          <Tr key={hq.id}>
                            <Td>{hq.display_order}</Td>
                            <Td>{questionText}</Td>
                            <Td>
                              <Badge colorScheme="purple">
                                {bankName}
                              </Badge>
                            </Td>
                            <Td>
                              <Badge colorScheme={
                                sectionType === '1' ? 'green' : 'orange'
                              }>
                                Section {sectionType}
                              </Badge>
                            </Td>
                            <Td>
                              <Badge colorScheme={hq.active ? 'green' : 'gray'}>
                                {hq.active ? 'Active' : 'Inactive'}
                              </Badge>
                            </Td>
                            <Td>
                              <Button
                                aria-label="Remove highlight"
                                leftIcon={<FaTimes />}
                                size="sm"
                                colorScheme="red"
                                isLoading={highlightLoading}
                                onClick={() => {
                                  // Log the highlighted question for debugging
                                  console.log("Unhighlighting highlighted question:", hq);
                                  // Use the highlight ID if question_id is undefined
                                  unhighlightQuestion(hq.question_id || hq.id);
                                }}
                              >
                                Remove
                              </Button>
                            </Td>
                          </Tr>
                        );
                      })
                    )}
                  </Tbody>
                </Table>
              </TableContainer>
            )}
          </CardBody>
          <CardFooter>
            <HStack spacing={4} width="full">
              <Button 
                colorScheme="green" 
                size="lg" 
                flex={1}
                isLoading={highlightLoading}
                leftIcon={<FaChessPawn />}
                onClick={activateHighlightedQuestions}
                isDisabled={highlightedQuestions.length === 0}
              >
                Activate Highlighted Questions for Students
              </Button>
              <Button 
                colorScheme="red" 
                size="lg" 
                flex={1}
                isLoading={highlightLoading}
                leftIcon={<FaTimesCircle />}
                onClick={deactivateHighlightedQuestions}
                isDisabled={highlightedQuestions.length === 0}
              >
                Deactivate Highlighted Questions
              </Button>
            </HStack>
          </CardFooter>
        </Card>
        
        {/* Navigation Options */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <Button
            as={RouterLink}
            to="/admin/question-banks"
            colorScheme="teal"
            leftIcon={<FaChessBoard />}
          >
            Manage Question Banks
          </Button>
          <Button
            as={RouterLink}
            to="/admin/show-controls"
            colorScheme="purple"
            leftIcon={<FaEye />}
          >
            Show Control Panel
          </Button>
        </SimpleGrid>
      </VStack>
    </Box>
  );
};

export default HighlightedQuestions; 