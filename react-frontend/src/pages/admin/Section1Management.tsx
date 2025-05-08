import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  SimpleGrid,
  Button,
  HStack,
  useToast,
  Card,
  CardHeader,
  CardBody,
  Badge,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
  Divider,
  Icon,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  FormHelperText,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Textarea,
  Alert,
  AlertIcon,
  Flex,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { 
  FaPlus, 
  FaCheck, 
  FaTimes, 
  FaEdit, 
  FaChessBoard, 
  FaArrowLeft, 
  FaTrash, 
  FaChessPawn,
  FaEye,
  FaSave,
  FaExternalLinkAlt
} from 'react-icons/fa';
import { Link as RouterLink } from 'react-router-dom';

// Define interfaces for the component
interface QuestionBank {
  id: number;
  name: string;
  section_type: '1' | '2';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  questionCount: number;
}

interface Question {
  id: number;
  bank_id: number;
  question_text: string;
  correct_answer: string;
  position: string; // FEN notation
  question_order: number;
  created_at: string;
}

// Simplified Chess board component (in a real app, this would be a more robust component)
const ChessBoard: React.FC<{ position: string }> = ({ position }) => {
  return (
    <Box 
      w="100%" 
      maxW="300px" 
      h="300px" 
      border="1px solid"
      borderColor="gray.300"
      borderRadius="md"
      p={2}
      position="relative"
      bg="gray.100"
    >
      <VStack justify="center" h="100%">
        <Icon as={FaChessPawn} boxSize={12} color="gray.400" />
        <Text color="gray.500" fontSize="sm" textAlign="center">
          Chess board preview
          <br />
          Position: {position.substring(0, 20)}...
        </Text>
      </VStack>
    </Box>
  );
};

// Main component
const Section1Management: React.FC = () => {
  const [questionBanks, setQuestionBanks] = useState<QuestionBank[]>([]);
  const [selectedBank, setSelectedBank] = useState<QuestionBank | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [bankFormData, setBankFormData] = useState({
    id: 0,
    name: '',
    isNew: true
  });
  const [questionFormData, setQuestionFormData] = useState<Partial<Question>>({
    question_text: '',
    correct_answer: '',
    position: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', // Default FEN
    question_order: 0
  });
  
  const toast = useToast();
  const { 
    isOpen: isBankModalOpen, 
    onOpen: onBankModalOpen, 
    onClose: onBankModalClose 
  } = useDisclosure();
  const {
    isOpen: isQuestionModalOpen,
    onOpen: onQuestionModalOpen,
    onClose: onQuestionModalClose
  } = useDisclosure();
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Mock data for development
  useEffect(() => {
    // This would be replaced with an API call
    const mockBanks: QuestionBank[] = [
      {
        id: 1,
        name: 'Basic Checkmates',
        section_type: '1',
        is_active: true,
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
        questionCount: 22
      },
      {
        id: 2,
        name: 'Opening Tactics',
        section_type: '1',
        is_active: false,
        created_at: '2023-01-02',
        updated_at: '2023-01-02',
        questionCount: 18
      },
      {
        id: 3,
        name: 'Endgame Positions',
        section_type: '1',
        is_active: false,
        created_at: '2023-01-03',
        updated_at: '2023-01-03',
        questionCount: 25
      }
    ];
    
    setQuestionBanks(mockBanks);
  }, []);

  // Load questions for a selected bank
  useEffect(() => {
    if (selectedBank) {
      setLoading(true);
      
      // In a real app, this would be an API call
      // Mock data for development
      const mockQuestions: Question[] = Array.from({ length: selectedBank.questionCount }, (_, i) => ({
        id: i + 1,
        bank_id: selectedBank.id,
        question_text: `What is the best move in this position? ${i + 1}`,
        correct_answer: `e${i % 8 + 1}`,
        position: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        question_order: i + 1,
        created_at: new Date().toISOString()
      }));
      
      setTimeout(() => {
        setQuestions(mockQuestions);
        setLoading(false);
      }, 500); // Simulate API delay
    }
  }, [selectedBank]);

  const toggleBankActive = (bankId: number) => {
    // Check if bank has at least 20 questions
    const bank = questionBanks.find(b => b.id === bankId);
    if (!bank) return;

    if (bank.questionCount < 20) {
      toast({
        title: 'Cannot activate bank',
        description: 'Bank must have at least 20 questions',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // In a real app, this would make an API call
    setQuestionBanks(banks => 
      banks.map(b => 
        b.id === bankId 
          ? { ...b, is_active: !b.is_active } 
          : b.is_active && b.id !== bankId && !b.is_active 
            ? { ...b, is_active: false } // Deactivate other banks
            : b
      )
    );

    toast({
      title: bank.is_active ? 'Bank deactivated' : 'Bank activated',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleCreateBank = () => {
    setBankFormData({
      id: 0,
      name: '',
      isNew: true
    });
    onBankModalOpen();
  };

  const handleEditBank = (bank: QuestionBank) => {
    setBankFormData({
      id: bank.id,
      name: bank.name,
      isNew: false
    });
    onBankModalOpen();
  };

  const handleSaveBank = () => {
    if (!bankFormData.name.trim()) {
      toast({
        title: 'Bank name required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // In a real app, this would be an API call
    if (bankFormData.isNew) {
      // Generate a new ID (in a real app, this would come from the server)
      const newId = Math.max(0, ...questionBanks.map(b => b.id)) + 1;
      
      // Create new bank
      const newBank: QuestionBank = {
        id: newId,
        name: bankFormData.name,
        section_type: '1',
        is_active: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        questionCount: 0
      };
      
      setQuestionBanks([...questionBanks, newBank]);
      
      toast({
        title: 'Bank created',
        description: 'Question bank has been created',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } else {
      // Update existing bank
      setQuestionBanks(questionBanks.map(bank => 
        bank.id === bankFormData.id
          ? { ...bank, name: bankFormData.name, updated_at: new Date().toISOString() }
          : bank
      ));
      
      toast({
        title: 'Bank updated',
        description: 'Question bank has been updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
    
    onBankModalClose();
  };

  const handleAddQuestion = () => {
    if (!selectedBank) return;
    
    setQuestionFormData({
      bank_id: selectedBank.id,
      question_text: '',
      correct_answer: '',
      position: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      question_order: questions.length + 1
    });
    
    onQuestionModalOpen();
  };

  const handleEditQuestion = (question: Question) => {
    setQuestionFormData({
      id: question.id,
      bank_id: question.bank_id,
      question_text: question.question_text,
      correct_answer: question.correct_answer,
      position: question.position,
      question_order: question.question_order
    });
    
    onQuestionModalOpen();
  };

  const handleSaveQuestion = () => {
    if (!selectedBank) return;
    
    if (!questionFormData.question_text || !questionFormData.correct_answer) {
      toast({
        title: 'Required fields missing',
        description: 'Please fill in all required fields',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    const newQuestion: Question = {
      id: questionFormData.id || Math.max(0, ...questions.map(q => q.id)) + 1,
      bank_id: selectedBank.id,
      question_text: questionFormData.question_text || '',
      correct_answer: questionFormData.correct_answer || '',
      position: questionFormData.position || '',
      question_order: questionFormData.question_order || questions.length + 1,
      created_at: new Date().toISOString()
    };
    
    if (questionFormData.id) {
      // Update existing question
      setQuestions(questions.map(q => 
        q.id === questionFormData.id ? newQuestion : q
      ));
      
      toast({
        title: 'Question updated',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } else {
      // Add new question
      setQuestions([...questions, newQuestion]);
      
      // Update question count in the bank
      setQuestionBanks(banks => 
        banks.map(bank => 
          bank.id === selectedBank.id
            ? { ...bank, questionCount: bank.questionCount + 1 }
            : bank
        )
      );
      
      toast({
        title: 'Question added',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    }
    
    onQuestionModalClose();
  };

  const handleDeleteQuestion = (questionId: number) => {
    if (!selectedBank) return;
    
    // In a real app, this would be an API call with confirmation
    setQuestions(questions.filter(q => q.id !== questionId));
    
    // Update question count in the bank
    setQuestionBanks(banks => 
      banks.map(bank => 
        bank.id === selectedBank.id
          ? { ...bank, questionCount: bank.questionCount - 1 }
          : bank
      )
    );
    
    toast({
      title: 'Question deleted',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <Box p={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading mb={2}>
            {selectedBank ? (
              <HStack>
                <IconButton
                  aria-label="Back to banks"
                  icon={<Icon as={FaArrowLeft} />}
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedBank(null)}
                />
                <Text>
                  {selectedBank.name}
                </Text>
                <Badge 
                  colorScheme={selectedBank.is_active ? 'green' : 'gray'}
                  ml={2}
                >
                  {selectedBank.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </HStack>
            ) : (
              'Section 1 Management'
            )}
          </Heading>
          <Text color="gray.600">
            {selectedBank 
              ? `Manage questions for this bank. Minimum 20 questions required.` 
              : `Manage Section 1 question banks and questions`
            }
          </Text>
          <ChakraLink as={RouterLink} to="/admin/question-banks" color="blue.500" display="inline-flex" alignItems="center" mt={2}>
            <Text>Try our new Chess Question Editor</Text>
            <Icon as={FaExternalLinkAlt} ml={1} boxSize={3} />
          </ChakraLink>
        </Box>
        
        {!selectedBank ? (
          // Question Banks List
          <Card bg={bgColor} borderColor={borderColor} shadow="sm">
            <CardHeader>
              <HStack justifyContent="space-between">
                <Heading size="md">Question Banks</Heading>
                <Button 
                  leftIcon={<Icon as={FaPlus} />} 
                  colorScheme="blue"
                  size="sm"
                  isDisabled={questionBanks.length >= 20}
                  onClick={handleCreateBank}
                >
                  New Bank
                </Button>
              </HStack>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={5}>
                {questionBanks.map(bank => (
                  <Card key={bank.id} variant="outline" overflow="hidden">
                    <CardHeader bg={bank.is_active ? 'blue.50' : undefined} pb={2}>
                      <HStack justifyContent="space-between">
                        <Heading size="sm">{bank.name}</Heading>
                        <HStack>
                          <Button 
                            size="xs" 
                            colorScheme="blue" 
                            variant="ghost"
                            onClick={() => handleEditBank(bank)}
                            title="Edit bank name"
                          >
                            <Icon as={FaEdit} />
                          </Button>
                          <Badge 
                            colorScheme={bank.is_active ? 'green' : 'gray'}
                            variant="subtle"
                            px={2}
                            py={1}
                            borderRadius="full"
                          >
                            {bank.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </HStack>
                      </HStack>
                    </CardHeader>
                    <CardBody pt={3}>
                      <VStack align="stretch" spacing={3}>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">Questions:</Text>
                          <HStack>
                            <Badge 
                              colorScheme={bank.questionCount >= 20 ? 'green' : 'red'}
                            >
                              {bank.questionCount}
                            </Badge>
                            <Text fontSize="xs" color="gray.500">
                              / 20 min
                            </Text>
                          </HStack>
                        </HStack>
                        
                        <Divider />
                        
                        <HStack>
                          <Button 
                            size="sm" 
                            leftIcon={<Icon as={FaChessBoard} />}
                            colorScheme="blue"
                            variant="outline"
                            width="full"
                            onClick={() => setSelectedBank(bank)}
                          >
                            Manage Questions
                          </Button>
                          
                          <Button
                            size="sm"
                            colorScheme={bank.is_active ? 'red' : 'green'}
                            variant="ghost"
                            onClick={() => toggleBankActive(bank.id)}
                            isDisabled={bank.questionCount < 20}
                            leftIcon={
                              <Icon 
                                as={bank.is_active ? FaTimes : FaCheck} 
                              />
                            }
                          >
                            {bank.is_active ? 'Deactivate' : 'Activate'}
                          </Button>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
                
                {/* Empty state when no banks exist */}
                {questionBanks.length === 0 && (
                  <Card variant="outline" p={6} textAlign="center">
                    <VStack spacing={3}>
                      <Icon as={FaChessBoard} boxSize={10} color="gray.400" />
                      <Text color="gray.500">
                        No question banks created yet.
                      </Text>
                      <Button 
                        leftIcon={<Icon as={FaPlus} />} 
                        colorScheme="blue"
                        size="sm"
                        onClick={handleCreateBank}
                      >
                        Create First Bank
                      </Button>
                    </VStack>
                  </Card>
                )}
              </SimpleGrid>
            </CardBody>
          </Card>
        ) : (
          // Question Management for Selected Bank
          <Card bg={bgColor} borderColor={borderColor} shadow="sm">
            <CardHeader>
              <HStack justifyContent="space-between">
                <Heading size="md">Questions</Heading>
                <Button 
                  leftIcon={<Icon as={FaPlus} />} 
                  colorScheme="blue"
                  size="sm"
                  onClick={handleAddQuestion}
                >
                  Add Question
                </Button>
              </HStack>
            </CardHeader>
            <CardBody>
              {loading ? (
                <Text textAlign="center" py={8}>Loading questions...</Text>
              ) : (
                <>
                  {selectedBank.questionCount < 20 && (
                    <Alert status="warning" mb={4} borderRadius="md">
                      <AlertIcon />
                      <Text>
                        This bank needs at least {20 - selectedBank.questionCount} more
                        {selectedBank.questionCount === 19 ? ' question' : ' questions'} to be activable.
                      </Text>
                    </Alert>
                  )}
                  
                  {questions.length === 0 ? (
                    <Box py={8} textAlign="center">
                      <VStack spacing={3}>
                        <Icon as={FaChessBoard} boxSize={10} color="gray.400" />
                        <Text color="gray.500">
                          No questions in this bank yet.
                        </Text>
                        <Button 
                          leftIcon={<Icon as={FaPlus} />} 
                          colorScheme="blue"
                          size="sm"
                          onClick={handleAddQuestion}
                        >
                          Add First Question
                        </Button>
                      </VStack>
                    </Box>
                  ) : (
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th width="5%">#</Th>
                          <Th width="65%">Question</Th>
                          <Th width="15%">Answer</Th>
                          <Th width="15%" isNumeric>Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {questions.map((question) => (
                          <Tr key={question.id}>
                            <Td>{question.question_order}</Td>
                            <Td>
                              <Text noOfLines={2}>{question.question_text}</Text>
                            </Td>
                            <Td>{question.correct_answer}</Td>
                            <Td isNumeric>
                              <HStack justify="flex-end" spacing={1}>
                                <IconButton
                                  size="sm"
                                  colorScheme="blue"
                                  aria-label="View"
                                  icon={<Icon as={FaEye} />}
                                  variant="ghost"
                                  onClick={() => handleEditQuestion(question)}
                                />
                                <IconButton
                                  size="sm"
                                  colorScheme="red"
                                  aria-label="Delete"
                                  icon={<Icon as={FaTrash} />}
                                  variant="ghost"
                                  onClick={() => handleDeleteQuestion(question.id)}
                                />
                              </HStack>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  )}
                </>
              )}
            </CardBody>
          </Card>
        )}

        {/* Bank Creation/Edit Modal */}
        <Modal isOpen={isBankModalOpen} onClose={onBankModalClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              {bankFormData.isNew ? 'Create New Question Bank' : 'Edit Question Bank'}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <FormControl isRequired>
                <FormLabel>Bank Name</FormLabel>
                <Input
                  value={bankFormData.name}
                  onChange={(e) => setBankFormData({...bankFormData, name: e.target.value})}
                  placeholder="Enter a descriptive name"
                />
                <FormHelperText>
                  Create a name that describes the type of questions in this bank.
                </FormHelperText>
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onBankModalClose}>
                Cancel
              </Button>
              <Button colorScheme="blue" onClick={handleSaveBank}>
                {bankFormData.isNew ? 'Create Bank' : 'Save Changes'}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Question Creation/Edit Modal */}
        <Modal isOpen={isQuestionModalOpen} onClose={onQuestionModalClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              {questionFormData.id ? 'Edit Question' : 'Add New Question'}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <FormControl isRequired>
                  <FormLabel>Question Text</FormLabel>
                  <Textarea
                    value={questionFormData.question_text || ''}
                    onChange={(e) => setQuestionFormData({
                      ...questionFormData, 
                      question_text: e.target.value
                    })}
                    placeholder="Enter the question text"
                    rows={3}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Correct Answer</FormLabel>
                  <Input
                    value={questionFormData.correct_answer || ''}
                    onChange={(e) => setQuestionFormData({
                      ...questionFormData, 
                      correct_answer: e.target.value
                    })}
                    placeholder="Enter the correct answer (e.g., e4, Nf3)"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Chess Position (FEN)</FormLabel>
                  <Input
                    value={questionFormData.position || ''}
                    onChange={(e) => setQuestionFormData({
                      ...questionFormData, 
                      position: e.target.value
                    })}
                    placeholder="Enter FEN notation"
                  />
                  <FormHelperText>
                    FEN notation describes the chess board position
                  </FormHelperText>
                </FormControl>

                <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
                  <FormControl flex="1">
                    <FormLabel>Question Order</FormLabel>
                    <Input
                      type="number"
                      value={questionFormData.question_order || ''}
                      onChange={(e) => setQuestionFormData({
                        ...questionFormData, 
                        question_order: parseInt(e.target.value)
                      })}
                      placeholder="Order number"
                    />
                  </FormControl>
                  
                  <Box flex="1">
                    <FormLabel>Chess Board Preview</FormLabel>
                    <ChessBoard position={questionFormData.position || ''} />
                  </Box>
                </Flex>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onQuestionModalClose}>
                Cancel
              </Button>
              <Button 
                colorScheme="blue" 
                leftIcon={<Icon as={FaSave} />} 
                onClick={handleSaveQuestion}
              >
                {questionFormData.id ? 'Update Question' : 'Add Question'}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </Box>
  );
};

export default Section1Management; 