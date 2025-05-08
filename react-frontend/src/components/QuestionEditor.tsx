import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  Textarea,
  VStack,
  HStack,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Text,
  Divider,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Tooltip,
  IconButton,
  Flex,
  Code,
  Tag,
  TagLabel,
  TagLeftIcon,
  Link,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  List,
  ListItem,
  ListIcon,
} from '@chakra-ui/react';
import { RepeatIcon, ChevronRightIcon, ChevronLeftIcon, CheckIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import axios from 'axios';
import ChessBoardEditor from './ChessBoardEditor';
import ChessBoard from './ChessBoard';
import { Chess } from 'chess.js';

interface QuestionEditorProps {
  isOpen: boolean;
  onClose: () => void;
  bankId: number;
  sectionType: '1' | '2';
  onQuestionAdded?: () => void;
  questionToEdit?: EditorQuestion | null;
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

interface PositionDifference {
  square: string;
  startPiece: { type: string; color: string } | null;
  solutionPiece: { type: string; color: string } | null;
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({
  isOpen,
  onClose,
  bankId,
  sectionType,
  onQuestionAdded,
  questionToEdit = null,
}) => {
  const [startingPosition, setStartingPosition] = useState<string>(
    'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
  );
  const [solutionPosition, setSolutionPosition] = useState<string>(
    'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
  );
  const [questionText, setQuestionText] = useState("What is the best move in this position?");
  const [correctAnswer, setCorrectAnswer] = useState("e4");
  const [questionOrder, setQuestionOrder] = useState<number>(0);
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingAnswer, setIsGeneratingAnswer] = useState(false);
  const toast = useToast();
  const [algebraicNotation, setAlgebraicNotation] = useState<string>('');
  const [moveSequence, setMoveSequence] = useState<Array<any>>([]);
  const [showingMoveAnimation, setShowingMoveAnimation] = useState(false);

  // Handlers for position changes that prevent cross-contamination
  const handleStartingPositionChange = (newFen: string) => {
    if (newFen !== startingPosition) {
      setStartingPosition(newFen);
    }
  };

  const handleSolutionPositionChange = (newFen: string) => {
    if (newFen !== solutionPosition) {
      setSolutionPosition(newFen);
    }
  };

  const handleFenInputChange = (newFen: string, isSolution: boolean = false) => {
    try {
      // Validate FEN using chess.js
      new Chess(newFen);
      
      if (isSolution) {
        setSolutionPosition(newFen);
      } else {
        setStartingPosition(newFen);
      }
      
      toast({
        title: 'Position updated',
        status: 'success',
        duration: 2000,
      });
    } catch (err) {
      toast({
        title: 'Invalid FEN',
        description: err instanceof Error ? err.message : 'Invalid chess position',
        status: 'error',
        duration: 3000,
      });
    }
  };

  // If editing an existing question, set the initial values
  useEffect(() => {
    // Only reset when opening the modal or editing a different question
    if (isOpen) {
      if (questionToEdit) {
        setStartingPosition(questionToEdit.fen);
        setSolutionPosition(questionToEdit.solutionFen);
        setQuestionOrder(questionToEdit.order);
        if (questionToEdit.question_text) {
          setQuestionText(questionToEdit.question_text);
        }
        if (questionToEdit.correct_answer) {
          setCorrectAnswer(questionToEdit.correct_answer);
        }
        if (questionToEdit.algebraic_notation) {
          setAlgebraicNotation(questionToEdit.algebraic_notation);
        }
        if (questionToEdit.move_sequence) {
          try {
            // Handle different formats of move_sequence
            let sequence = questionToEdit.move_sequence;
            if (typeof sequence === 'string') {
              sequence = sequence.trim();
              if (sequence.length > 0) {
                try {
                  const parsedSequence = JSON.parse(sequence);
                  setMoveSequence(Array.isArray(parsedSequence) ? parsedSequence : []);
                } catch (e) {
                  console.warn("Failed to parse move sequence string, treating as empty array", e);
                  setMoveSequence([]);
                }
              } else {
                setMoveSequence([]);
              }
            } else if (Array.isArray(sequence)) {
              setMoveSequence(sequence);
            } else {
              console.warn("Move sequence is not a string or array, setting empty array");
              setMoveSequence([]);
            }
          } catch (e) {
            console.error("Error handling move sequence:", e);
            setMoveSequence([]);
          }
        } else {
          setMoveSequence([]);
        }
      } else {
        // Reset to default positions when creating a new question
        setStartingPosition('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
        setSolutionPosition('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
        setQuestionText("What is the best move in this position?");
        setCorrectAnswer("e4");
        setQuestionOrder(0);
        setAlgebraicNotation('');
        setMoveSequence([]);
      }
    }
  }, [questionToEdit, isOpen]);

  // Auto-generate the correct answer based on the positions
  const handleGenerateAnswer = async () => {
    try {
      if (startingPosition === solutionPosition) {
        toast({
          title: 'Invalid positions',
          description: 'Starting and solution positions must be different to generate an answer',
          status: 'error',
          duration: 3000,
        });
        return;
      }

      setIsGeneratingAnswer(true);

      // Create chess instances for both positions
      const startGame = new Chess(startingPosition);
      const solutionGame = new Chess(solutionPosition);

      // Find the move by comparing piece positions
      const startBoard = startGame.board();
      const solutionBoard = solutionGame.board();
      
      let fromSquare = '';
      let toSquare = '';
      let piece = '';
      let isCapture = false;
      let capturedPiece = '';

      // Find all differences between the positions
      const differences: PositionDifference[] = [];
      for (let rank = 0; rank < 8; rank++) {
        for (let file = 0; file < 8; file++) {
          const startPiece = startBoard[rank][file];
          const solutionPiece = solutionBoard[rank][file];
          const square = `${String.fromCharCode(97 + file)}${8 - rank}`;
          
          if (startPiece !== solutionPiece) {
            differences.push({
              square,
              startPiece,
              solutionPiece
            });
          }
        }
      }

      console.log('Position differences:', differences);

      // Find the moving piece and its destination
      for (const diff of differences) {
        if (diff.startPiece && !diff.solutionPiece) {
          // This is where a piece moved from
          fromSquare = diff.square;
          piece = diff.startPiece.type;
        } else if (!diff.startPiece && diff.solutionPiece) {
          // This is where a piece moved to
          toSquare = diff.square;
        } else if (diff.startPiece && diff.solutionPiece && 
                  (diff.startPiece.type !== diff.solutionPiece.type || 
                   diff.startPiece.color !== diff.solutionPiece.color)) {
          // This is a capture where the piece was replaced
          toSquare = diff.square;
          isCapture = true;
          capturedPiece = diff.startPiece.type;
        }
      }

      console.log('Debug move detection:', {
        fromSquare,
        toSquare,
        piece,
        isCapture,
        capturedPiece,
        startFen: startingPosition,
        solutionFen: solutionPosition,
        differences
      });

      if (!fromSquare || !toSquare) {
        throw new Error('Could not determine the move between positions');
      }

      // Get all legal moves in the starting position
      const moves = startGame.moves({ verbose: true });
      console.log('All legal moves:', moves);

      // Check if our move is valid
      console.log(`Looking for move from ${fromSquare} to ${toSquare}`);
      
      // Find the move that matches our from and to squares
      const matchingMove = moves.find(move => 
        move.from === fromSquare && 
        move.to === toSquare
      );

      console.log('Matching move:', matchingMove);

      if (!matchingMove) {
        // Try a more direct approach - manually set algebraic notation
        let algebraicNotation = '';
        
        if (piece === 'p') {
          // Pawn move
          algebraicNotation = isCapture ? `${fromSquare[0]}x${toSquare}` : toSquare;
        } else {
          // Piece move
          const pieceSymbol = piece.toUpperCase();
          algebraicNotation = isCapture ? 
            `${pieceSymbol}x${toSquare}` : 
            `${pieceSymbol}${toSquare}`;
        }
        
        console.log('Manually generated notation:', algebraicNotation);
        
        // Store the move details
        const moveDetail = {
          from: fromSquare,
          to: toSquare,
          san: algebraicNotation,
          piece: piece,
          isCapture: isCapture,
          isCheck: false,
          isCheckmate: false,
        };

        // Update the state
        setCorrectAnswer(algebraicNotation);
        setAlgebraicNotation(algebraicNotation);
        setMoveSequence([moveDetail]);
        
        toast({
          title: 'Answer generated',
          description: `Generated move: ${algebraicNotation} (simplified)`,
          status: 'success',
          duration: 3000,
        });
      } else {
        // Use the matching move
        const algebraicNotation = matchingMove.san;
        
        // Store the move details for replay animation
        const moveDetail = {
          from: fromSquare,
          to: toSquare,
          san: algebraicNotation,
          piece: piece,
          isCapture: isCapture,
          isCheck: algebraicNotation.includes('+'),
          isCheckmate: algebraicNotation.includes('#'),
        };

        // Update the state with the generated answer
        setCorrectAnswer(algebraicNotation);
        setAlgebraicNotation(algebraicNotation);
        setMoveSequence([moveDetail]);

        toast({
          title: 'Answer generated',
          description: `Generated move: ${algebraicNotation}`,
          status: 'success',
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error generating answer:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate answer',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsGeneratingAnswer(false);
    }
  };

  const handleSaveQuestion = async () => {
    try {
      setIsLoading(true);

      // Validate that positions are different
      if (startingPosition === solutionPosition) {
        toast({
          title: 'Invalid positions',
          description: 'Starting and solution positions cannot be the same',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        setIsLoading(false);
        return;
      }

      if (!questionText.trim()) {
        toast({
          title: 'Missing question text',
          description: 'Please enter a question text',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        setIsLoading(false);
        return;
      }

      if (!correctAnswer.trim()) {
        toast({
          title: 'Missing correct answer',
          description: 'Please enter the correct answer',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        setIsLoading(false);
        return;
      }

      // Format move sequence for storage
      let formattedMoveSequence = [];
      try {
        if (moveSequence.length > 0) {
          // Ensure the move sequence is a proper array of objects without circular references
          formattedMoveSequence = moveSequence.map(move => ({
            from: move.from || '',
            to: move.to || '',
            san: move.san || '',
            piece: move.piece || '',
            isCapture: !!move.isCapture,
            isCheck: !!move.isCheck,
            isCheckmate: !!move.isCheckmate
          }));
        }
      } catch (e) {
        console.warn('Error formatting move sequence:', e);
        formattedMoveSequence = [];
      }

      // Store only FEN strings in the position field to avoid truncation
      const positionData = {
        starting_fen: startingPosition,
        solution_fen: solutionPosition
      };

      const questionData = {
        bank_id: bankId,
        question_text: questionText,
        correct_answer: correctAnswer,
        position: JSON.stringify(positionData),
        question_order: questionOrder,
        question_id: questionToEdit ? questionToEdit.id : undefined,
        ...(questionToEdit ? { is_active: questionToEdit.is_active } : {}),
        // Store these in their dedicated columns instead of in the position JSON
        algebraic_notation: algebraicNotation || '',
        move_sequence: JSON.stringify(formattedMoveSequence)
      };

      // Log the data we're sending for debugging purposes
      console.log('Sending question data:', JSON.stringify(questionData, null, 2));

      const endpoint = questionToEdit
        ? '/api/question-banks/update-question.php'
        : '/api/question-banks/add-question.php';

      const response = await axios.post(endpoint, questionData);
      
      console.log('API response:', response.data);

      if (response.status === 200 && 
          (!response.data || 
           (typeof response.data === 'string' && response.data.trim() === '') ||
           (response.data && response.data.success))) {
        
        toast({
          title: questionToEdit ? 'Question updated' : 'Question added',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        // Call the callback if provided
        if (onQuestionAdded) {
          onQuestionAdded();
        }
        
        // Close the modal
        onClose();
      } else {
        // Enhanced error handling for API response
        const errorMessage = response.data && response.data.message 
          ? response.data.message 
          : 'Server returned an error without details';
        console.error('API returned error:', response.data);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error saving question:', error);
      
      // Create a more descriptive error message for the user
      let errorDescription = 'Failed to save question';
      if (error instanceof Error) {
        errorDescription = error.message;
        console.error('Error details:', error.stack);
      } else if (error && typeof error === 'object' && 'response' in error) {
        // Handle axios error
        const axiosError = error as any;
        console.error('Axios error response:', axiosError.response);
        if (axiosError.response && axiosError.response.data) {
          errorDescription = axiosError.response.data.message || `Server error: ${axiosError.response.status}`;
        }
      }
      
      toast({
        title: 'Error',
        description: errorDescription,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add this function to replay the move animation
  const replayMoveAnimation = () => {
    if (moveSequence.length === 0) return;
    
    setShowingMoveAnimation(true);
    // Animation would be handled in the UI
    // This is just a placeholder for the actual animation logic
    
    setTimeout(() => {
      setShowingMoveAnimation(false);
    }, 2000); // Animation duration
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay 
        bg="blackAlpha.300"
        backdropFilter="blur(10px)"
      />
      <ModalContent 
        maxW="900px" 
        mx={4} 
        borderRadius="lg" 
        shadow="xl"
        bg="white"
        overflow="hidden"
      >
        <Box 
          bg="blue.500" 
          color="white" 
          py={4} 
          px={6}
          position="relative"
        >
          <ModalHeader p={0} fontSize="xl" fontWeight="bold">
            {questionToEdit ? 'Edit Chess Question' : 'Add New Chess Question'}
          </ModalHeader>
          <ModalCloseButton color="white" top="4" right="4" />
        </Box>
        
        <ModalBody p={0}>
          <Tabs 
            onChange={setActiveTab} 
            index={activeTab} 
            variant="enclosed"
            colorScheme="blue"
          >
            <TabList 
              px={4} 
              pt={4} 
              borderBottomWidth="1px" 
              borderBottomColor="gray.200"
              bg="white"
            >
              <Tab 
                _selected={{ 
                  color: 'blue.600', 
                  fontWeight: 'semibold', 
                  borderBottomColor: 'blue.500' 
                }}
                borderTopRadius="md"
                py={3}
                px={4}
              >
                Initial Position
              </Tab>
              <Tab 
                _selected={{ 
                  color: 'blue.600', 
                  fontWeight: 'semibold', 
                  borderBottomColor: 'blue.500' 
                }}
                borderTopRadius="md"
                py={3}
                px={4}
              >
                Solution Position
              </Tab>
              <Tab 
                _selected={{ 
                  color: 'blue.600', 
                  fontWeight: 'semibold', 
                  borderBottomColor: 'blue.500' 
                }}
                borderTopRadius="md"
                py={3}
                px={4}
              >
                Question Details
              </Tab>
              <Tab 
                _selected={{ 
                  color: 'blue.600', 
                  fontWeight: 'semibold', 
                  borderBottomColor: 'blue.500' 
                }}
                borderTopRadius="md"
                py={3}
                px={4}
              >
                Preview
              </Tab>
            </TabList>
            
            <TabPanels>
              <TabPanel p={6}>
                <VStack spacing={6} align="stretch">
                  <Box 
                    p={4} 
                    borderRadius="md" 
                    bg="blue.50" 
                    borderWidth="1px" 
                    borderColor="blue.200"
                  >
                    <VStack align="start" spacing={2}>
                      <Text fontSize="lg" fontWeight="bold" color="blue.700">Initial Chess Position</Text>
                      <Text fontSize="sm" color="blue.600">
                        This is the position that will be shown to the student. Set up the board by dragging pieces
                        or using the piece placement mode.
                      </Text>
                    </VStack>
                  </Box>
                  
                  <FormControl>
                    <FormLabel fontWeight="semibold">Chess Position (FEN)</FormLabel>
                    <Input
                      value={startingPosition}
                      onChange={(e) => handleFenInputChange(e.target.value)}
                      placeholder="Paste FEN string here"
                    />
                    <FormHelperText>
                      Paste a valid FEN string to set the starting position
                    </FormHelperText>
                  </FormControl>
                  
                  <Box 
                    display="flex" 
                    justifyContent="center" 
                    py={4} 
                    bg="gray.50" 
                    borderRadius="md"
                    borderWidth="1px"
                    borderColor="gray.200"
                    p={4}
                  >
                    <ChessBoardEditor 
                      initialFen={startingPosition}
                      onFenChange={handleStartingPositionChange}
                    />
                  </Box>
                  
                  <HStack justify="flex-end" pt={2}>
                    <Button 
                      colorScheme="blue" 
                      onClick={() => setActiveTab(1)}
                      rightIcon={<ChevronRightIcon />}
                      size="md"
                    >
                      Next: Set Solution
                    </Button>
                  </HStack>
                </VStack>
              </TabPanel>
              
              <TabPanel p={6}>
                <VStack spacing={6} align="stretch">
                  <Box 
                    p={4} 
                    borderRadius="md" 
                    bg="green.50" 
                    borderWidth="1px" 
                    borderColor="green.200"
                  >
                    <VStack align="start" spacing={2}>
                      <Text fontSize="lg" fontWeight="bold" color="green.700">Solution Position</Text>
                      <Text fontSize="sm" color="green.600">
                        This is the position that represents the correct answer. Set up the board to show
                        what the position should look like after the student makes the correct move(s).
                      </Text>
                    </VStack>
                  </Box>
                  
                  <FormControl>
                    <FormLabel fontWeight="semibold">Solution Position (FEN)</FormLabel>
                    <Input
                      value={solutionPosition}
                      onChange={(e) => handleFenInputChange(e.target.value, true)}
                      placeholder="Paste FEN string here"
                    />
                    <FormHelperText>
                      Paste a valid FEN string to set the solution position
                    </FormHelperText>
                  </FormControl>
                  
                  <Box 
                    display="flex" 
                    justifyContent="center" 
                    py={4} 
                    bg="gray.50" 
                    borderRadius="md"
                    borderWidth="1px"
                    borderColor="gray.200"
                    p={4}
                  >
                    <ChessBoardEditor 
                      initialFen={solutionPosition}
                      onFenChange={handleSolutionPositionChange}
                    />
                  </Box>
                  
                  <HStack justify="space-between" pt={2}>
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveTab(0)}
                      leftIcon={<ChevronLeftIcon />}
                      size="md"
                    >
                      Back: Initial Position
                    </Button>
                    <HStack spacing={3}>
                      <Button 
                        colorScheme="teal" 
                        onClick={handleGenerateAnswer}
                        isLoading={isGeneratingAnswer}
                        leftIcon={<RepeatIcon />}
                        size="md"
                      >
                        Generate Answer
                      </Button>
                      <Button 
                        colorScheme="blue" 
                        onClick={() => setActiveTab(2)}
                        rightIcon={<ChevronRightIcon />}
                        size="md"
                      >
                        Next: Question Details
                      </Button>
                    </HStack>
                  </HStack>
                </VStack>
              </TabPanel>
              
              <TabPanel p={6}>
                <VStack spacing={6} align="stretch">
                  <Box 
                    p={4} 
                    borderRadius="md" 
                    bg="purple.50" 
                    borderWidth="1px" 
                    borderColor="purple.200"
                  >
                    <VStack align="start" spacing={2}>
                      <Text fontSize="lg" fontWeight="bold" color="purple.700">Question Details</Text>
                      <Text fontSize="sm" color="purple.600">
                        Define the question text, correct answer, and ordering for this chess problem.
                      </Text>
                    </VStack>
                  </Box>
                  
                  <FormControl isRequired>
                    <FormLabel fontWeight="semibold">Question Text</FormLabel>
                    <Textarea
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      placeholder="e.g., What is the best move in this position?"
                      rows={4}
                      bg="gray.50"
                      borderColor="gray.300"
                      _hover={{ borderColor: "purple.400" }}
                      _focus={{ 
                        borderColor: "purple.400",
                        boxShadow: "0 0 0 1px var(--chakra-colors-purple-400)"
                      }}
                    />
                    <FormHelperText>
                      Enter clear instructions for what the student should do
                    </FormHelperText>
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel
                      fontWeight="semibold"
                      display="flex"
                      alignItems="center"
                    >
                      Correct Answer
                      <Tooltip label="Auto-generate answer based on the difference between starting and solution positions">
                        <IconButton
                          aria-label="Generate answer"
                          icon={<RepeatIcon />}
                          size="sm"
                          ml={2}
                          onClick={handleGenerateAnswer}
                          isLoading={isGeneratingAnswer}
                          colorScheme="teal"
                        />
                      </Tooltip>
                    </FormLabel>
                    <Input
                      value={correctAnswer}
                      onChange={(e) => setCorrectAnswer(e.target.value)}
                      placeholder="e.g., e4, Nf3, etc."
                      bg="gray.50"
                      borderColor="gray.300"
                      _hover={{ borderColor: "purple.400" }}
                      _focus={{ 
                        borderColor: "purple.400",
                        boxShadow: "0 0 0 1px var(--chakra-colors-purple-400)"
                      }}
                    />
                    <FormHelperText>
                      Enter the correct move in algebraic notation (e.g., e4, Nf3) or descriptive text.
                      You can also auto-generate this after setting both positions.
                    </FormHelperText>
                  </FormControl>
                  
                  <FormControl mt={4}>
                    <FormLabel fontWeight="semibold">Algebraic Notation</FormLabel>
                    <Flex align="center" gap={2}>
                      <Input
                        value={algebraicNotation}
                        onChange={(e) => setAlgebraicNotation(e.target.value)}
                        placeholder="e.g. Nf3, e4, Bxc6+"
                        isReadOnly={isGeneratingAnswer}
                        bg="gray.50"
                      />
                      <Tooltip label="Generate from positions">
                        <IconButton
                          aria-label="Generate algebraic notation"
                          icon={<RepeatIcon />}
                          colorScheme="blue"
                          onClick={handleGenerateAnswer}
                          isLoading={isGeneratingAnswer}
                        />
                      </Tooltip>
                    </Flex>
                    <FormHelperText>
                      The move in standard algebraic notation (SAN). This will be used to animate the solution.
                    </FormHelperText>
                  </FormControl>
                  
                  {moveSequence.length > 0 && (
                    <Box 
                      mt={4} 
                      p={4} 
                      borderWidth="1px" 
                      borderRadius="md" 
                      bg="blue.50"
                      borderColor="blue.200"
                    >
                      <Text fontWeight="bold" mb={2}>Move Details:</Text>
                      <List spacing={2}>
                        {moveSequence.map((move, index) => (
                          <ListItem key={index} display="flex" alignItems="center">
                            <ListIcon as={ArrowForwardIcon} color="blue.500" />
                            <HStack spacing={2}>
                              <Tag colorScheme="blue" variant="subtle">
                                {move.san}
                              </Tag>
                              <Text>
                                {move.from} → {move.to}
                              </Text>
                              {move.isCapture && (
                                <Tag colorScheme="red" size="sm">Capture</Tag>
                              )}
                            </HStack>
                          </ListItem>
                        ))}
                      </List>
                      <Button 
                        mt={3} 
                        leftIcon={<RepeatIcon />} 
                        size="sm" 
                        colorScheme="blue" 
                        variant="outline"
                        onClick={replayMoveAnimation}
                        isDisabled={showingMoveAnimation}
                      >
                        Replay Move
                      </Button>
                    </Box>
                  )}
                  
                  <FormControl>
                    <FormLabel fontWeight="semibold">Question Order</FormLabel>
                    <NumberInput
                      value={questionOrder}
                      onChange={(valueString) => setQuestionOrder(parseInt(valueString) || 0)}
                      min={0}
                      max={999}
                      bg="gray.50"
                      borderRadius="md"
                    >
                      <NumberInputField
                        borderColor="gray.300"
                        _hover={{ borderColor: "purple.400" }}
                        _focus={{ 
                          borderColor: "purple.400",
                          boxShadow: "0 0 0 1px var(--chakra-colors-purple-400)"
                        }}
                      />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <FormHelperText>
                      Leave as 0 for automatic ordering
                    </FormHelperText>
                  </FormControl>
                  
                  <HStack justify="space-between" pt={2}>
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveTab(1)}
                      leftIcon={<ChevronLeftIcon />}
                      size="md"
                    >
                      Back: Solution Position
                    </Button>
                    <Button 
                      colorScheme="blue" 
                      onClick={() => setActiveTab(3)}
                      rightIcon={<ChevronRightIcon />}
                      size="md"
                    >
                      Next: Preview
                    </Button>
                  </HStack>
                </VStack>
              </TabPanel>
              
              <TabPanel p={6}>
                <VStack spacing={6} align="stretch">
                  <Box 
                    p={4} 
                    borderRadius="md" 
                    bg="orange.50" 
                    borderWidth="1px" 
                    borderColor="orange.200"
                  >
                    <VStack align="start" spacing={2}>
                      <Text fontSize="lg" fontWeight="bold" color="orange.700">Preview Question</Text>
                      <Text fontSize="sm" color="orange.600">
                        Review the complete question before saving. This is how it will appear to students.
                      </Text>
                    </VStack>
                  </Box>
                  
                  <Box 
                    p={6} 
                    borderWidth={1} 
                    borderRadius="md" 
                    bg="white"
                    shadow="md"
                    borderColor="gray.200"
                  >
                    <VStack align="stretch" spacing={6}>
                      <Text fontWeight="bold" fontSize="xl" color="gray.800">
                        {questionText}
                      </Text>
                      
                      <Box
                        bg="gray.50"
                        p={4}
                        borderRadius="md"
                        borderWidth="1px"
                        borderColor="gray.200"
                      >
                        <VStack>
                          <Text fontWeight="semibold" color="gray.700">Initial Position</Text>
                          {startingPosition ? (
                            <ChessBoard 
                              fen={startingPosition} 
                              width={240} 
                            />
                          ) : (
                            <Text p={4} color="red.500">Invalid starting position</Text>
                          )}
                          <Text fontSize="xs" color="gray.500">FEN: {startingPosition}</Text>
                        </VStack>
                      </Box>
                      
                      <FormControl>
                        <FormLabel fontWeight="semibold" color="teal.600">Correct Answer</FormLabel>
                        <Input 
                          value={correctAnswer} 
                          isReadOnly 
                          bg="teal.50" 
                          color="teal.800"
                          borderColor="teal.200"
                          fontWeight="medium"
                        />
                      </FormControl>
                      
                      <Divider />
                      
                      <Box
                        bg="gray.50"
                        p={4}
                        borderRadius="md"
                        borderWidth="1px"
                        borderColor="gray.200"
                      >
                        <VStack>
                          <Text fontWeight="semibold" color="gray.700">Solution Position</Text>
                          {solutionPosition ? (
                            <ChessBoard 
                              fen={solutionPosition}
                              width={240}
                            />
                          ) : (
                            <Text p={4} color="red.500">Invalid solution position</Text>
                          )}
                          <Text fontSize="xs" color="gray.500">FEN: {solutionPosition}</Text>
                        </VStack>
                      </Box>
                    </VStack>
                  </Box>
                  
                  <HStack justify="space-between" pt={2}>
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveTab(2)}
                      leftIcon={<ChevronLeftIcon />}
                      size="md"
                    >
                      Back: Question Details
                    </Button>
                    <Button 
                      colorScheme="green" 
                      onClick={handleSaveQuestion}
                      isLoading={isLoading}
                      leftIcon={<CheckIcon />}
                      size="md"
                    >
                      {questionToEdit ? 'Update Question' : 'Save Question'}
                    </Button>
                  </HStack>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default QuestionEditor; 