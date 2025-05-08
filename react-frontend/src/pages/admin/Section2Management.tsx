import React, { useState } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Grid,
  Button,
  useToast,
  Badge,
  HStack,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  useDisclosure,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  OrderedList,
  ListItem,
  Flex,
} from '@chakra-ui/react';
import { 
  FaPlus, 
  FaChessKing, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaCheck,
  FaArrowUp,
  FaArrowDown,
} from 'react-icons/fa';
import ChessBoardEditor from '../../components/ChessBoardEditor';

interface Question {
  id: number;
  title: string;
  fen: string;
  solution: string;
  isActive: boolean;
  order: number;
}

interface QuestionBank {
  id: number;
  name: string;
  questions: Question[];
  isActive: boolean;
}

const Section2Management: React.FC = () => {
  const [banks, setBanks] = useState<QuestionBank[]>([]);
  const [currentBank, setCurrentBank] = useState<QuestionBank | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedBankId, setSelectedBankId] = useState<number | null>(null);
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

  const handleCreateBank = () => {
    if (banks.length >= 20) {
      toast({
        title: 'Maximum banks reached',
        description: 'You can only create up to 20 question banks',
        status: 'error',
        duration: 3000,
      });
      return;
    }
    setCurrentBank({
      id: Date.now(),
      name: '',
      questions: [],
      isActive: false,
    });
    onBankModalOpen();
  };

  const handleSaveBank = () => {
    if (!currentBank?.name) {
      toast({
        title: 'Bank name required',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    if (currentBank.id) {
      setBanks(prev => prev.map(bank => 
        bank.id === currentBank.id ? currentBank : bank
      ));
    } else {
      setBanks(prev => [...prev, currentBank]);
    }
    onBankModalClose();
  };

  const handleAddQuestion = (bankId: number) => {
    const bank = banks.find(b => b.id === bankId);
    if (!bank) return;

    setCurrentBank(bank);
    setCurrentQuestion({
      id: Date.now(),
      title: '',
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      solution: '',
      isActive: false,
      order: bank.questions.length + 1,
    });
    onQuestionModalOpen();
  };

  const handleSaveQuestion = () => {
    if (!currentBank || !currentQuestion) return;

    if (!currentQuestion.title || !currentQuestion.solution) {
      toast({
        title: 'Required fields missing',
        description: 'Please fill in all required fields',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    const updatedBank = {
      ...currentBank,
      questions: currentQuestion.id 
        ? currentBank.questions.map(q => 
            q.id === currentQuestion.id ? currentQuestion : q
          )
        : [...currentBank.questions, currentQuestion],
    };

    setBanks(prev => prev.map(bank => 
      bank.id === currentBank.id ? updatedBank : bank
    ));
    onQuestionModalClose();
  };

  const handleMoveQuestion = (bankId: number, questionId: number, direction: 'up' | 'down') => {
    setBanks(prev => prev.map(bank => {
      if (bank.id !== bankId) return bank;

      const questions = [...bank.questions];
      const index = questions.findIndex(q => q.id === questionId);
      if (index === -1) return bank;

      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= questions.length) return bank;

      // Swap questions
      const temp = questions[index];
      questions[index] = questions[newIndex];
      questions[newIndex] = temp;

      // Update order numbers
      questions.forEach((q, i) => {
        q.order = i + 1;
      });

      return { ...bank, questions };
    }));
  };

  const handleViewQuestions = (bankId: number) => {
    setSelectedBankId(bankId);
  };

  return (
    <Box p={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <HStack justify="space-between" align="center" mb={2}>
            <Box>
              <Heading size="lg">Section 2 Question Banks</Heading>
              <Text color="gray.600">
                Manage sequential question banks. Each bank requires minimum 10 questions.
              </Text>
            </Box>
            <Button
              colorScheme="blue"
              leftIcon={<Icon as={FaPlus} />}
              onClick={handleCreateBank}
              isDisabled={banks.length >= 20}
            >
              Create New Bank
            </Button>
          </HStack>
        </Box>

        <Grid
          templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
          gap={6}
        >
          {banks.map(bank => (
            <Box
              key={bank.id}
              p={6}
              borderWidth="1px"
              borderRadius="lg"
              shadow="sm"
            >
              <VStack align="stretch" spacing={4}>
                <HStack justify="space-between">
                  <Icon as={FaChessKing} boxSize={6} color="blue.500" />
                  <Badge
                    colorScheme={bank.isActive ? 'green' : 'red'}
                  >
                    {bank.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </HStack>
                <Heading size="md">{bank.name}</Heading>
                <Text color="gray.600">
                  {bank.questions.length} questions
                  {bank.questions.length < 10 && (
                    <Badge colorScheme="red" ml={2}>
                      Needs {10 - bank.questions.length} more
                    </Badge>
                  )}
                </Text>
                <HStack>
                  <Button 
                    colorScheme="blue" 
                    size="sm"
                    leftIcon={<Icon as={FaPlus} />}
                    onClick={() => handleAddQuestion(bank.id)}
                  >
                    Add Question
                  </Button>
                  <Button
                    colorScheme="purple"
                    size="sm"
                    leftIcon={<Icon as={FaEye} />}
                    onClick={() => handleViewQuestions(bank.id)}
                  >
                    View Sequence
                  </Button>
                  <IconButton
                    aria-label="Toggle active state"
                    icon={<Icon as={bank.isActive ? FaCheck : FaEye} />}
                    colorScheme={bank.isActive ? 'green' : 'gray'}
                    size="sm"
                    onClick={() => {
                      if (bank.questions.length >= 10) {
                        setBanks(prev => prev.map(b => 
                          b.id === bank.id ? {...b, isActive: !b.isActive} : b
                        ));
                      } else {
                        toast({
                          title: 'Cannot activate bank',
                          description: 'Bank needs at least 10 questions',
                          status: 'warning',
                          duration: 3000,
                        });
                      }
                    }}
                  />
                </HStack>
              </VStack>
            </Box>
          ))}
        </Grid>

        {banks.length === 0 && (
          <Box
            p={8}
            textAlign="center"
            borderWidth="1px"
            borderRadius="lg"
            borderStyle="dashed"
          >
            <Text color="gray.600">
              No question banks created yet. Click "Create New Bank" to get started.
            </Text>
          </Box>
        )}

        {/* Bank Creation/Edit Modal */}
        <Modal isOpen={isBankModalOpen} onClose={onBankModalClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              {currentBank?.id ? 'Edit Bank' : 'Create New Bank'}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <FormControl isRequired>
                <FormLabel>Bank Name</FormLabel>
                <Input
                  value={currentBank?.name || ''}
                  onChange={(e) => setCurrentBank(prev => 
                    prev ? {...prev, name: e.target.value} : null
                  )}
                  placeholder="Enter bank name"
                />
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={handleSaveBank}>
                Save
              </Button>
              <Button variant="ghost" onClick={onBankModalClose}>
                Cancel
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Question Creation/Edit Modal */}
        <Modal isOpen={isQuestionModalOpen} onClose={onQuestionModalClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              {currentQuestion?.id ? 'Edit Question' : 'Add New Question'}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Question Title</FormLabel>
                  <Input
                    value={currentQuestion?.title || ''}
                    onChange={(e) => setCurrentQuestion(prev => 
                      prev ? {...prev, title: e.target.value} : null
                    )}
                    placeholder="Enter question title"
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Chess Position</FormLabel>
                  <Box borderWidth="1px" borderRadius="md" p={4}>
                    <ChessBoardEditor
                      position={currentQuestion?.fen || ''}
                      onPositionChange={(fen) => setCurrentQuestion(prev => 
                        prev ? {...prev, fen} : null
                      )}
                    />
                  </Box>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Solution</FormLabel>
                  <Input
                    value={currentQuestion?.solution || ''}
                    onChange={(e) => setCurrentQuestion(prev => 
                      prev ? {...prev, solution: e.target.value} : null
                    )}
                    placeholder="Enter solution (e.g., 'Nf3')"
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={handleSaveQuestion}>
                Save Question
              </Button>
              <Button variant="ghost" onClick={onQuestionModalClose}>
                Cancel
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Question Sequence Modal */}
        <Modal 
          isOpen={selectedBankId !== null} 
          onClose={() => setSelectedBankId(null)}
          size="xl"
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              Question Sequence
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <OrderedList spacing={3}>
                {banks.find(b => b.id === selectedBankId)?.questions.map((question, index) => (
                  <ListItem key={question.id}>
                    <Flex justify="space-between" align="center">
                      <Text>{question.title}</Text>
                      <HStack>
                        <IconButton
                          aria-label="Move up"
                          icon={<Icon as={FaArrowUp} />}
                          size="sm"
                          isDisabled={index === 0}
                          onClick={() => handleMoveQuestion(selectedBankId, question.id, 'up')}
                        />
                        <IconButton
                          aria-label="Move down"
                          icon={<Icon as={FaArrowDown} />}
                          size="sm"
                          isDisabled={index === banks.find(b => b.id === selectedBankId)!.questions.length - 1}
                          onClick={() => handleMoveQuestion(selectedBankId, question.id, 'down')}
                        />
                      </HStack>
                    </Flex>
                  </ListItem>
                ))}
              </OrderedList>
            </ModalBody>
            <ModalFooter>
              <Button onClick={() => setSelectedBankId(null)}>Close</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </Box>
  );
};

export default Section2Management; 