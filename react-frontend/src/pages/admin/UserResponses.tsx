import React, { useState } from 'react';
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  HStack,
  Button,
  Flex,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Text,
  Stack,
  Card,
  CardBody,
  Divider,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import { FaSearch, FaEye, FaFilter, FaChessBoard, FaUser } from 'react-icons/fa';

// Mock response data
const mockResponses = [
  {
    id: 1,
    user: { id: 101, name: 'Alex Johnson', email: 'alex@example.com' },
    quiz: { id: 1, title: 'Weekly Tactics Challenge' },
    submission_date: '2023-09-15T14:30:00',
    score: 85,
    time_taken: 12.5,
    puzzles_answered: 5,
    puzzles_correct: 4,
    status: 'Completed',
    answers: [
      { puzzle_id: 1, correct: true, time_taken: 43, answer: 'Qb3' },
      { puzzle_id: 2, correct: true, time_taken: 62, answer: 'Nd2' },
      { puzzle_id: 3, correct: false, time_taken: 128, answer: 'Rd4+' },
      { puzzle_id: 4, correct: true, time_taken: 95, answer: 'Bxh7+' },
      { puzzle_id: 5, correct: true, time_taken: 74, answer: 'Qxf7+' },
    ]
  },
  {
    id: 2,
    user: { id: 102, name: 'Sarah Miller', email: 'sarah@example.com' },
    quiz: { id: 2, title: 'Endgame Training' },
    submission_date: '2023-09-16T10:15:00',
    score: 70,
    time_taken: 15.2,
    puzzles_answered: 5,
    puzzles_correct: 3,
    status: 'Completed',
    answers: [
      { puzzle_id: 3, correct: true, time_taken: 85, answer: 'Ra4+' },
      { puzzle_id: 4, correct: true, time_taken: 72, answer: 'Bxh7+' },
      { puzzle_id: 6, correct: false, time_taken: 130, answer: 'Qd4' },
      { puzzle_id: 7, correct: false, time_taken: 110, answer: 'Nf5' },
      { puzzle_id: 8, correct: true, time_taken: 65, answer: 'Rxe6' },
    ]
  },
  {
    id: 3,
    user: { id: 103, name: 'Michael Brown', email: 'michael@example.com' },
    quiz: { id: 1, title: 'Weekly Tactics Challenge' },
    submission_date: '2023-09-15T16:45:00',
    score: 92,
    time_taken: 11.3,
    puzzles_answered: 5,
    puzzles_correct: 5,
    status: 'Completed',
    answers: [
      { puzzle_id: 1, correct: true, time_taken: 50, answer: 'Qb3' },
      { puzzle_id: 2, correct: true, time_taken: 45, answer: 'Nd2' },
      { puzzle_id: 3, correct: true, time_taken: 78, answer: 'Ra4+' },
      { puzzle_id: 4, correct: true, time_taken: 65, answer: 'Bxh7+' },
      { puzzle_id: 5, correct: true, time_taken: 60, answer: 'Qxf7+' },
    ]
  },
  {
    id: 4,
    user: { id: 104, name: 'Emily Wilson', email: 'emily@example.com' },
    quiz: { id: 3, title: 'Opening Principles' },
    submission_date: '2023-09-18T11:20:00',
    score: 60,
    time_taken: 18.7,
    puzzles_answered: 5,
    puzzles_correct: 3,
    status: 'Completed',
    answers: [
      { puzzle_id: 9, correct: true, time_taken: 95, answer: 'e4' },
      { puzzle_id: 10, correct: false, time_taken: 120, answer: 'Nf6' },
      { puzzle_id: 11, correct: true, time_taken: 85, answer: 'd4' },
      { puzzle_id: 12, correct: false, time_taken: 140, answer: 'Qd5' },
      { puzzle_id: 13, correct: true, time_taken: 75, answer: 'Bc4' },
    ]
  },
  {
    id: 5,
    user: { id: 105, name: 'David Chen', email: 'david@example.com' },
    quiz: { id: 2, title: 'Endgame Training' },
    submission_date: '2023-09-17T14:10:00',
    score: 100,
    time_taken: 14.5,
    puzzles_answered: 5,
    puzzles_correct: 5,
    status: 'Completed',
    answers: [
      { puzzle_id: 3, correct: true, time_taken: 70, answer: 'Ra4+' },
      { puzzle_id: 4, correct: true, time_taken: 65, answer: 'Bxh7+' },
      { puzzle_id: 6, correct: true, time_taken: 80, answer: 'Qg4' },
      { puzzle_id: 7, correct: true, time_taken: 75, answer: 'Ng3' },
      { puzzle_id: 8, correct: true, time_taken: 60, answer: 'Rxe6' },
    ]
  },
];

const quizzes = [
  { id: 1, title: 'Weekly Tactics Challenge' },
  { id: 2, title: 'Endgame Training' },
  { id: 3, title: 'Opening Principles' },
];

const UserResponses: React.FC = () => {
  const [responses, setResponses] = useState(mockResponses);
  const [filteredResponses, setFilteredResponses] = useState(mockResponses);
  const [searchQuery, setSearchQuery] = useState('');
  const [quizFilter, setQuizFilter] = useState('all');
  const [scoreFilter, setScoreFilter] = useState('all');
  const [currentResponse, setCurrentResponse] = useState<any>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Filter responses based on search and filters
  const filterResponses = () => {
    let filtered = [...responses];
    
    // Filter by quiz
    if (quizFilter !== 'all') {
      filtered = filtered.filter(response => response.quiz.id === parseInt(quizFilter));
    }
    
    // Filter by score range
    if (scoreFilter !== 'all') {
      switch (scoreFilter) {
        case 'excellent':
          filtered = filtered.filter(response => response.score >= 90);
          break;
        case 'good':
          filtered = filtered.filter(response => response.score >= 75 && response.score < 90);
          break;
        case 'average':
          filtered = filtered.filter(response => response.score >= 60 && response.score < 75);
          break;
        case 'poor':
          filtered = filtered.filter(response => response.score < 60);
          break;
      }
    }
    
    // Filter by search query (user name or email)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        response => 
          response.user.name.toLowerCase().includes(query) || 
          response.user.email.toLowerCase().includes(query)
      );
    }
    
    setFilteredResponses(filtered);
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle quiz filter change
  const handleQuizFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQuizFilter(e.target.value);
  };

  // Handle score filter change
  const handleScoreFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setScoreFilter(e.target.value);
  };

  // Apply filters when any filter changes
  React.useEffect(() => {
    filterResponses();
  }, [searchQuery, quizFilter, scoreFilter]);

  // View response details
  const handleViewResponse = (response: any) => {
    setCurrentResponse(response);
    onOpen();
  };

  // Get badge color based on score
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'green';
    if (score >= 75) return 'blue';
    if (score >= 60) return 'yellow';
    return 'red';
  };

  return (
    <Box>
      <Heading as="h1" size="xl" mb={6}>
        User Quiz Responses
      </Heading>

      {/* Filters */}
      <Card mb={5}>
        <CardBody>
          <HStack spacing={4} wrap="wrap">
            <FormControl minW={250}>
              <FormLabel>Search Users</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <FaSearch color="gray.300" />
                </InputLeftElement>
                <Input
                  placeholder="Search by name or email"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </InputGroup>
            </FormControl>
            
            <FormControl maxW={200}>
              <FormLabel>Quiz</FormLabel>
              <Select value={quizFilter} onChange={handleQuizFilterChange}>
                <option value="all">All Quizzes</option>
                {quizzes.map(quiz => (
                  <option key={quiz.id} value={quiz.id.toString()}>
                    {quiz.title}
                  </option>
                ))}
              </Select>
            </FormControl>
            
            <FormControl maxW={200}>
              <FormLabel>Score</FormLabel>
              <Select value={scoreFilter} onChange={handleScoreFilterChange}>
                <option value="all">All Scores</option>
                <option value="excellent">Excellent (90-100%)</option>
                <option value="good">Good (75-89%)</option>
                <option value="average">Average (60-74%)</option>
                <option value="poor">Poor (Below 60%)</option>
              </Select>
            </FormControl>
          </HStack>
        </CardBody>
      </Card>

      {/* Responses Table */}
      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>User</Th>
              <Th>Quiz</Th>
              <Th>Date</Th>
              <Th>Score</Th>
              <Th>Time Taken</Th>
              <Th>Correct/Total</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredResponses.map(response => (
              <Tr key={response.id}>
                <Td>
                  <Text fontWeight="bold">{response.user.name}</Text>
                  <Text fontSize="sm" color="gray.500">{response.user.email}</Text>
                </Td>
                <Td>{response.quiz.title}</Td>
                <Td>{new Date(response.submission_date).toLocaleString()}</Td>
                <Td>
                  <Badge colorScheme={getScoreColor(response.score)}>
                    {response.score}%
                  </Badge>
                </Td>
                <Td>{response.time_taken} min</Td>
                <Td>
                  {response.puzzles_correct}/{response.puzzles_answered}
                </Td>
                <Td>
                  <Button
                    leftIcon={<FaEye />}
                    size="sm"
                    colorScheme="blue"
                    onClick={() => handleViewResponse(response)}
                  >
                    View
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* Response Details Modal */}
      {currentResponse && (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Response Details</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Grid templateColumns="repeat(2, 1fr)" gap={4} mb={4}>
                <GridItem>
                  <Flex align="center" mb={2}>
                    <Box as={FaUser} mr={2} color="blue.500" />
                    <Heading size="sm">User Information</Heading>
                  </Flex>
                  <Text><strong>Name:</strong> {currentResponse.user.name}</Text>
                  <Text><strong>Email:</strong> {currentResponse.user.email}</Text>
                </GridItem>
                <GridItem>
                  <Flex align="center" mb={2}>
                    <Box as={FaChessBoard} mr={2} color="green.500" />
                    <Heading size="sm">Quiz Information</Heading>
                  </Flex>
                  <Text><strong>Quiz:</strong> {currentResponse.quiz.title}</Text>
                  <Text><strong>Date:</strong> {new Date(currentResponse.submission_date).toLocaleString()}</Text>
                </GridItem>
              </Grid>

              <Divider my={4} />

              <Flex justify="space-between" mb={4}>
                <Box>
                  <Heading size="sm" mb={2}>Performance Summary</Heading>
                  <Text><strong>Score:</strong> {currentResponse.score}%</Text>
                  <Text><strong>Time Taken:</strong> {currentResponse.time_taken} minutes</Text>
                </Box>
                <Box>
                  <Heading size="sm" mb={2}>Puzzle Stats</Heading>
                  <Text><strong>Correct:</strong> {currentResponse.puzzles_correct} of {currentResponse.puzzles_answered}</Text>
                  <Text><strong>Accuracy:</strong> {Math.round((currentResponse.puzzles_correct / currentResponse.puzzles_answered) * 100)}%</Text>
                </Box>
              </Flex>

              <Divider my={4} />

              <Heading size="sm" mb={3}>Puzzle Responses</Heading>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Puzzle ID</Th>
                    <Th>User Answer</Th>
                    <Th>Correct</Th>
                    <Th>Time (seconds)</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {currentResponse.answers.map((answer: any, index: number) => (
                    <Tr key={index}>
                      <Td>{answer.puzzle_id}</Td>
                      <Td fontFamily="monospace">{answer.answer}</Td>
                      <Td>
                        <Badge colorScheme={answer.correct ? 'green' : 'red'}>
                          {answer.correct ? 'Correct' : 'Incorrect'}
                        </Badge>
                      </Td>
                      <Td>{answer.time_taken}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" onClick={onClose}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
};

export default UserResponses; 