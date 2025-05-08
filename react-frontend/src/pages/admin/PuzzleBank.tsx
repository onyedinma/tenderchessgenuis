import React, { useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Input,
  FormControl,
  FormLabel,
  Select,
  Textarea,
  useToast,
  Stack,
  Image,
  HStack,
  Text,
} from '@chakra-ui/react';
import { FaEdit, FaTrash, FaPlus, FaEye } from 'react-icons/fa';
import ChessBoardEditor from '../../components/ChessBoardEditor';
import ChessBoard from '../../components/ChessBoard';

// Mock data for puzzles
const mockPuzzles = [
  {
    id: 1,
    title: "Queen's Gambit Trap",
    difficulty: 'Medium',
    category: 'Opening',
    fen: 'rnbqkbnr/ppp2ppp/4p3/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3',
    solutionFen: 'rnbqkbnr/ppp2ppp/4p3/3p4/2PP4/1Q6/PP2PPPP/RNB1KBNR b KQkq - 1 3',
    solution: 'Qb3',
    imageUrl: 'https://via.placeholder.com/150',
  },
  {
    id: 2,
    title: 'Knight Fork Tactic',
    difficulty: 'Easy',
    category: 'Tactics',
    fen: 'r3k2r/pb1p1ppp/1p6/2p5/4n3/2N5/PPP2PPP/R3KB1R b KQkq - 0 13',
    solutionFen: 'r3k2r/pb1p1ppp/1p6/2p5/8/2N5/PPPn1PPP/R3KB1R w KQkq - 0 14',
    solution: 'Nd2',
    imageUrl: 'https://via.placeholder.com/150',
  },
  {
    id: 3,
    title: 'Rook Endgame',
    difficulty: 'Hard',
    category: 'Endgame',
    fen: '8/8/8/8/4k3/R7/4K3/8 w - - 0 1',
    solutionFen: '8/8/8/8/R3k3/8/4K3/8 b - - 1 1',
    solution: 'Ra4+',
    imageUrl: 'https://via.placeholder.com/150',
  },
  {
    id: 4,
    title: 'Bishop Sacrifice',
    difficulty: 'Medium',
    category: 'Middlegame',
    fen: 'r1bqr1k1/pp3pbp/2p3p1/3p4/3P4/2NBPN2/PPQ2PPP/R4RK1 w - - 0 12',
    solutionFen: 'r1bqr1k1/pp3pBp/2p3p1/3p4/3P4/2N1PN2/PPQ2PPP/R4RK1 b - - 0 12',
    solution: 'Bxh7+',
    imageUrl: 'https://via.placeholder.com/150',
  },
];

// Puzzle form initial state
const initialPuzzleState = {
  id: 0,
  title: '',
  difficulty: 'Medium',
  category: 'Tactics',
  fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', // Starting position
  solutionFen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1', // Default solution position
  solution: '',
  imageUrl: '',
};

const PuzzleBank: React.FC = () => {
  const [puzzles, setPuzzles] = useState(mockPuzzles);
  const [currentPuzzle, setCurrentPuzzle] = useState(initialPuzzleState);
  const [isEditing, setIsEditing] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isViewOpen,
    onOpen: onViewOpen,
    onClose: onViewClose,
  } = useDisclosure();
  const toast = useToast();

  const handleAddNew = () => {
    setCurrentPuzzle(initialPuzzleState);
    setIsEditing(false);
    onOpen();
  };

  const handleEdit = (puzzle: typeof initialPuzzleState) => {
    // Ensure puzzle has solutionFen property even if it's an older puzzle
    const puzzleWithSolution = {
      ...puzzle,
      solutionFen: puzzle.solutionFen || puzzle.fen
    };
    setCurrentPuzzle(puzzleWithSolution);
    setIsEditing(true);
    onOpen();
  };

  const handleView = (puzzle: typeof initialPuzzleState) => {
    // Ensure puzzle has solutionFen property even if it's an older puzzle
    const puzzleWithSolution = {
      ...puzzle,
      solutionFen: puzzle.solutionFen || puzzle.fen
    };
    setCurrentPuzzle(puzzleWithSolution);
    onViewOpen();
  };

  const handleDelete = (id: number) => {
    setPuzzles(puzzles.filter(puzzle => puzzle.id !== id));
    toast({
      title: 'Puzzle deleted',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentPuzzle(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    // Use solutionFen as both the puzzle position and solution
    const updatedPuzzle = {
      ...currentPuzzle,
      fen: currentPuzzle.solutionFen || currentPuzzle.fen, // Use solutionFen as the puzzle position
      solution: currentPuzzle.solutionFen || currentPuzzle.fen // Use solutionFen as the solution string
    };
    
    if (isEditing) {
      setPuzzles(puzzles.map(p => (p.id === currentPuzzle.id ? updatedPuzzle : p)));
      toast({
        title: 'Puzzle updated',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } else {
      const newPuzzle = {
        ...updatedPuzzle,
        id: puzzles.length > 0 ? Math.max(...puzzles.map(p => p.id)) + 1 : 1,
      };
      setPuzzles([...puzzles, newPuzzle]);
      toast({
        title: 'New puzzle added',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    }
    onClose();
  };

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading as="h1" size="xl">
          Puzzle Bank
        </Heading>
        <Button leftIcon={<FaPlus />} colorScheme="blue" onClick={handleAddNew}>
          Add New Puzzle
        </Button>
      </Flex>

      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Title</Th>
              <Th>Difficulty</Th>
              <Th>Category</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {puzzles.map(puzzle => (
              <Tr key={puzzle.id}>
                <Td>{puzzle.id}</Td>
                <Td>{puzzle.title}</Td>
                <Td>
                  <Badge
                    colorScheme={
                      puzzle.difficulty === 'Easy'
                        ? 'green'
                        : puzzle.difficulty === 'Medium'
                        ? 'orange'
                        : 'red'
                    }
                  >
                    {puzzle.difficulty}
                  </Badge>
                </Td>
                <Td>{puzzle.category}</Td>
                <Td>
                  <HStack spacing={2}>
                    <IconButton
                      aria-label="View puzzle"
                      icon={<FaEye />}
                      size="sm"
                      colorScheme="blue"
                      onClick={() => handleView(puzzle)}
                    />
                    <IconButton
                      aria-label="Edit puzzle"
                      icon={<FaEdit />}
                      size="sm"
                      colorScheme="teal"
                      onClick={() => handleEdit(puzzle)}
                    />
                    <IconButton
                      aria-label="Delete puzzle"
                      icon={<FaTrash />}
                      size="sm"
                      colorScheme="red"
                      onClick={() => handleDelete(puzzle.id)}
                    />
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* Add/Edit Puzzle Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent maxW="900px">
          <ModalHeader>{isEditing ? 'Edit Puzzle' : 'Add New Puzzle'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Title</FormLabel>
                <Input
                  name="title"
                  value={currentPuzzle.title}
                  onChange={handleInputChange}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Difficulty</FormLabel>
                <Select
                  name="difficulty"
                  value={currentPuzzle.difficulty}
                  onChange={handleInputChange}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </Select>
              </FormControl>

              <FormControl mt={4}>
                <FormLabel>Category</FormLabel>
                <Select
                  name="category"
                  value={currentPuzzle.category}
                  onChange={handleInputChange}
                  placeholder="Select category"
                >
                  <option value="Opening">Opening</option>
                  <option value="Middlegame">Middlegame</option>
                  <option value="Endgame">Endgame</option>
                  <option value="Tactics">Tactics</option>
                  <option value="Strategy">Strategy</option>
                </Select>
              </FormControl>

              <Flex direction={["column", "column", "row"]} gap={4} align="start">
                <FormControl mt={4} flex="1">
                  <FormLabel>Puzzle Position</FormLabel>
                  <ChessBoardEditor 
                    initialFen={currentPuzzle.fen} 
                    onFenChange={(fen) => {
                      if (fen !== currentPuzzle.fen) {
                        setCurrentPuzzle(prev => ({...prev, fen}));
                      }
                    }}
                    hideCastling={true}
                  />
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Set up the initial puzzle position. This is what the user will see.
                  </Text>
                </FormControl>

                <FormControl mt={4} flex="1">
                  <FormLabel>Solution Position</FormLabel>
                  <ChessBoardEditor 
                    initialFen={currentPuzzle.solutionFen || currentPuzzle.fen} 
                    onFenChange={(fen) => {
                      if (fen !== currentPuzzle.solutionFen) {
                        setCurrentPuzzle(prev => ({...prev, solutionFen: fen}));
                      }
                    }}
                    hideCastling={true}
                  />
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Set up the position after the solution moves are played.
                    This position will be used as both the puzzle position and solution when saved.
                  </Text>
                </FormControl>
              </Flex>

              <FormControl mt={4}>
                <FormLabel>Solution</FormLabel>
                <Text fontSize="md" p={2} bg="gray.50" borderRadius="md">
                  The FEN string generated by the Solution Position chessboard above will be used as the solution.
                </Text>
                <Text fontSize="xs" color="gray.500" mt={1}>
                  When a user creates a position matching this FEN, they will have successfully solved the puzzle.
                </Text>
              </FormControl>

              <FormControl>
                <FormLabel>Image URL (Optional)</FormLabel>
                <Input
                  name="imageUrl"
                  value={currentPuzzle.imageUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/your-image.jpg"
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Optionally add an image URL to display alongside the puzzle.
                </Text>
              </FormControl>
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSubmit}>
              {isEditing ? 'Save Changes' : 'Add Puzzle'}
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* View Puzzle Modal */}
      <Modal isOpen={isViewOpen} onClose={onViewClose} size="xl">
        <ModalOverlay />
        <ModalContent maxW="900px">
          <ModalHeader>Puzzle Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <Box>
                <Heading size="md">{currentPuzzle.title}</Heading>
                <Flex mt={2} justifyContent="space-between">
                  <Badge colorScheme={
                    currentPuzzle.difficulty === 'Easy'
                      ? 'green'
                      : currentPuzzle.difficulty === 'Medium'
                      ? 'orange'
                      : 'red'
                  }>
                    {currentPuzzle.difficulty}
                  </Badge>
                  <Badge colorScheme="purple">{currentPuzzle.category}</Badge>
                </Flex>
              </Box>

              <Flex direction={["column", "column", "row"]} gap={6} align="start">
                <Box flex="1">
                  <Text fontWeight="bold" fontSize="lg" mb={2}>Puzzle Position:</Text>
                  <Box boxShadow="md" borderRadius="md" p={2}>
                    <ChessBoardEditor 
                      initialFen={currentPuzzle.fen} 
                      readOnly={true}
                      hideCastling={true}
                    />
                  </Box>
                  <Text fontFamily="monospace" fontSize="xs" mt={2} color="gray.600" noOfLines={1} overflow="hidden" textOverflow="ellipsis">
                    {currentPuzzle.fen}
                  </Text>
                </Box>
                
                <Box flex="1">
                  <Text fontWeight="bold" fontSize="lg" mb={2}>Solution Position:</Text>
                  <Box boxShadow="md" borderRadius="md" p={2}>
                    <ChessBoardEditor 
                      initialFen={currentPuzzle.solutionFen || currentPuzzle.fen} 
                      readOnly={true}
                      hideCastling={true}
                    />
                  </Box>
                  <Text fontFamily="monospace" fontSize="xs" mt={2} color="gray.600" noOfLines={1} overflow="hidden" textOverflow="ellipsis">
                    {currentPuzzle.solutionFen || currentPuzzle.fen}
                  </Text>
                </Box>
              </Flex>

              {currentPuzzle.imageUrl && (
                <Box>
                  <Image
                    src={currentPuzzle.imageUrl}
                    alt={currentPuzzle.title}
                    borderRadius="md"
                  />
                </Box>
              )}

              <Box>
                <Text fontWeight="bold">Solution:</Text>
                <Text fontFamily="monospace" fontSize="sm">{currentPuzzle.solution}</Text>
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Users solve the puzzle by recreating this FEN position.
                </Text>
              </Box>
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onViewClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default PuzzleBank; 