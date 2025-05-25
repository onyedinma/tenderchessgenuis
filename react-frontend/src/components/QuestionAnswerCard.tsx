import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Text,
  Badge,
  Divider,
  Heading,
  Card,
  CardBody,
  Stack,
  HStack,
  useBreakpointValue,
  Button,
  SimpleGrid,
} from '@chakra-ui/react';
import { FaCheck, FaTimes, FaArrowRight } from 'react-icons/fa';
import { ChessBoard } from './ChessBoard';
import { Chess } from 'chess.js';

interface QuestionAnswerCardProps {
  questionNumber: number;
  questionText: string;
  position: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  pointsEarned: number;
  totalPoints?: number;
  fenNotation?: string;
}

// Helper function to extract FEN from position data
export const extractFenFromPosition = (positionData: string): string => {
  try {
    if (!positionData) return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'; // Default FEN
    
    const position = JSON.parse(positionData);
    if (position.starting_fen) {
      return position.starting_fen;
    }
    
    // Fallback to default FEN
    return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  } catch (e) {
    console.error('Error extracting FEN from position data:', e);
    return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  }
};

// Helper function to extract solution FEN from position data
export const extractSolutionFenFromPosition = (positionData: string): string | null => {
  try {
    if (!positionData) return null;
    
    const position = JSON.parse(positionData);
    if (position.solution_fen) {
      return position.solution_fen;
    }
    
    return null;
  } catch (e) {
    console.error('Error extracting solution FEN from position data:', e);
    return null;
  }
};

// Helper function to find all pieces of a specific type and color
const findPieces = (chess: Chess, pieceType: string, color: 'w' | 'b'): string[] => {
  const squares: string[] = [];
  
  for (let rank = 1; rank <= 8; rank++) {
    for (const file of 'abcdefgh') {
      const square = `${file}${rank}`;
      try {
        // Convert string to Square type which is required by chess.js
        const piece = chess.get(square as any);
        if (piece && piece.type === pieceType && piece.color === color) {
          squares.push(square);
        }
      } catch (e) {
        console.log(`Error getting piece at square ${square}: ${e}`);
      }
    }
  }
  
  return squares;
};

// Helper function to try to apply a move to a position with improved algebraic notation support
const tryApplyMove = (startingFen: string, moveNotation: string): string | null => {
  if (!startingFen || !moveNotation) return null;
  
  try {
    // Create a chess instance with the starting position
    const chess = new Chess(startingFen);
    
    // Clean the move notation
    const cleanMove = moveNotation.trim();
    
    console.log(`tryApplyMove: Starting FEN: ${startingFen}`);
    console.log(`tryApplyMove: Move notation: "${cleanMove}"`);
    
    // Direct attempt with the Chess.js move function which handles SAN
    try {
      const move = chess.move(cleanMove);
      if (move) {
        console.log(`tryApplyMove: Move successfully applied via standard notation`);
        return chess.fen();
      }
    } catch (e) {
      console.log(`tryApplyMove: Standard move parsing failed for "${cleanMove}": ${e}`);
    }
    
    // Special case for Bxd1 with black bishop on h5 when it's white's turn
    if (cleanMove === "Bxd1" && startingFen.includes("7b") && startingFen.includes(" w ")) {
      // This is the special case where a black bishop on h5 should capture queen on d1
      console.log(`tryApplyMove: Special case for black bishop on h5 capturing queen on d1`);
      
      try {
        // Modify FEN to make it black's turn
        let newFen = startingFen.replace(" w ", " b ");
        const tempChess = new Chess(newFen);
        
        // Try the move with black's turn
        const move = tempChess.move("Bxd1");
        if (move) {
          console.log(`tryApplyMove: Successfully applied Bxd1 with modified turn`);
          return tempChess.fen();
        }
      } catch (e) {
        console.log(`tryApplyMove: Special Bxd1 handling failed: ${e}`);
      }
    }
    
    // Try with flipped turn for all moves that failed
    try {
      console.log(`tryApplyMove: Trying to flip the turn to see if move works`);
      
      // Get current turn and flip it
      const currentTurn = startingFen.includes(" w ") ? "w" : "b";
      const flippedTurn = currentTurn === "w" ? "b" : "w";
      
      // Create a new FEN with flipped turn
      const flippedFen = startingFen.replace(` ${currentTurn} `, ` ${flippedTurn} `);
      const flippedChess = new Chess(flippedFen);
      
      try {
        // Try the move with flipped turn
        const move = flippedChess.move(cleanMove);
        if (move) {
          console.log(`tryApplyMove: Move successfully applied with flipped turn (${flippedTurn})`);
          return flippedChess.fen();
        }
      } catch (e) {
        console.log(`tryApplyMove: Even with flipped turn, move failed: ${e}`);
      }
    } catch (e) {
      console.log(`tryApplyMove: Error while trying flipped turn: ${e}`);
    }
    
    // Handle common formats manually
    
    // 1. Try UCI format (e2e4)
    if (cleanMove.length >= 4 && /^[a-h][1-8][a-h][1-8]/.test(cleanMove)) {
      try {
        const from = cleanMove.substring(0, 2);
        const to = cleanMove.substring(2, 4);
        let promotion: 'q' | 'r' | 'b' | 'n' | undefined = undefined;
        
        // Check for promotion
        if (cleanMove.length >= 5) {
          const promotionChar = cleanMove.charAt(4).toLowerCase();
          if (promotionChar === 'q') promotion = 'q';
          else if (promotionChar === 'r') promotion = 'r';
          else if (promotionChar === 'b') promotion = 'b';
          else if (promotionChar === 'n') promotion = 'n';
        }
        
        console.log(`tryApplyMove: Trying UCI format from=${from}, to=${to}`);
        const move = chess.move({ from, to, promotion });
        if (move) {
          console.log(`tryApplyMove: Move successfully applied via UCI notation`);
          return chess.fen();
        }
      } catch (e) {
        console.log(`tryApplyMove: UCI parsing failed for "${cleanMove}": ${e}`);
      }
    }
    
    // 2. Try coordinate notation (e2-e4)
    if (cleanMove.includes('-')) {
      try {
        const parts = cleanMove.split('-');
        if (parts.length === 2) {
          const from = parts[0].trim();
          const to = parts[1].trim();
          console.log(`tryApplyMove: Trying coordinate notation from=${from}, to=${to}`);
          const move = chess.move({ from, to, promotion: 'q' });
          if (move) {
            console.log(`tryApplyMove: Move successfully applied via coordinate notation`);
            return chess.fen();
          }
        }
      } catch (e) {
        console.log(`tryApplyMove: Coordinate notation parsing failed for "${cleanMove}": ${e}`);
      }
    }
    
    // 3. Handle castling
    if (/^(O-O|O-O-O|0-0|0-0-0)$/i.test(cleanMove)) {
      try {
        const isKingside = /^(O-O|0-0)$/i.test(cleanMove);
        const turn = chess.turn();
        const from = turn === 'w' ? 'e1' : 'e8';
        const to = turn === 'w' ? (isKingside ? 'g1' : 'c1') : (isKingside ? 'g8' : 'c8');
        
        console.log(`tryApplyMove: Trying castling notation for ${turn} king, side=${isKingside ? 'kingside' : 'queenside'}`);
        const move = chess.move({ from, to });
        if (move) {
          console.log(`tryApplyMove: Move successfully applied via castling notation`);
          return chess.fen();
        }
      } catch (e) {
        console.log(`tryApplyMove: Castling notation parsing failed for "${cleanMove}": ${e}`);
      }
    }
    
    // 4. Advanced: Try to find pieces that could make the move
    if (cleanMove.includes('x') || /^[NBRQK][a-h]?[1-8]?x?[a-h][1-8]$/.test(cleanMove)) {
      try {
        // Extract the target square from algebraic notation
        let targetSquare = '';
        const match = cleanMove.match(/[a-h][1-8]$/);
        if (match) {
          targetSquare = match[0];
        }
        
        if (targetSquare) {
          // Determine the piece type from notation
          let pieceType = 'p'; // default to pawn
          if (/^[NBRQK]/.test(cleanMove)) {
            pieceType = cleanMove.charAt(0).toLowerCase();
          }
          
          console.log(`tryApplyMove: Trying algebraic notation with piece=${pieceType}, target=${targetSquare}`);
          
          // Find all pieces of that type
          const pieces = findPieces(chess, pieceType, chess.turn());
          console.log(`tryApplyMove: Found ${pieces.length} pieces of type ${pieceType}: ${pieces.join(', ')}`);
          
          // Try each piece to see if it can move to the target
          for (const from of pieces) {
            try {
              console.log(`tryApplyMove: Trying move from=${from} to=${targetSquare}`);
              const move = chess.move({ from, to: targetSquare, promotion: 'q' });
              if (move) {
                console.log(`tryApplyMove: Move successfully applied from ${from} to ${targetSquare}`);
                return chess.fen();
              }
            } catch (e) {
              // This piece can't make that move, try next one
              console.log(`tryApplyMove: Piece at ${from} cannot move to ${targetSquare}`);
            }
          }
        }
      } catch (e) {
        console.log(`tryApplyMove: Advanced move parsing failed for "${cleanMove}": ${e}`);
      }
    }
    
    // 5. Special case for "Bxg1" style notations
    if (/^[NBRQK]x[a-h][1-8]$/.test(cleanMove)) {
      try {
        // Extract piece type and target square
        const pieceType = cleanMove.charAt(0).toLowerCase();
        const targetSquare = cleanMove.substring(2);
        
        console.log(`tryApplyMove: Special case for ${pieceType}x${targetSquare} notation`);
        
        // Find all pieces of that type
        const pieces = findPieces(chess, pieceType, chess.turn());
        console.log(`tryApplyMove: Found ${pieces.length} pieces of type ${pieceType}: ${pieces.join(', ')}`);
        
        // Find all pieces that can capture on the target square
        for (const from of pieces) {
          try {
            // Check if there's a piece to capture at target
            const targetPiece = chess.get(targetSquare as any);
            if (!targetPiece || targetPiece.color === chess.turn()) {
              continue; // No piece to capture or same color
            }
            
            console.log(`tryApplyMove: Trying capture from=${from} to=${targetSquare}`);
            const move = chess.move({ from, to: targetSquare, promotion: 'q' });
            if (move) {
              console.log(`tryApplyMove: Capture successfully applied from ${from} to ${targetSquare}`);
              return chess.fen();
            }
          } catch (e) {
            // This piece can't make that capture, try next one
            console.log(`tryApplyMove: Piece at ${from} cannot capture at ${targetSquare}`);
          }
        }
      } catch (e) {
        console.log(`tryApplyMove: Special capture notation parsing failed for "${cleanMove}": ${e}`);
      }
    }
    
    console.log(`tryApplyMove: All attempts to parse the move failed`);
    return null;
  } catch (e) {
    console.error('Error applying move:', e);
    return null;
  }
};

const QuestionAnswerCard: React.FC<QuestionAnswerCardProps> = ({
  questionNumber,
  questionText,
  position,
  userAnswer,
  correctAnswer,
  isCorrect,
  pointsEarned,
  totalPoints = 10,
  fenNotation,
}) => {
  // Responsive board size
  const boardSize = useBreakpointValue({ base: 150, sm: 160, md: 180, lg: 200 }) || 160;
  
  // Get both FENs
  const startingFen = extractFenFromPosition(position);
  const solutionFen = extractSolutionFenFromPosition(position);
  
  // Try to apply the user's answer to get their position
  const [userFen, setUserFen] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    // First check if we already have a stored FEN notation
    if (fenNotation) {
      console.log(`Using stored FEN notation: ${fenNotation}`);
      setUserFen(fenNotation);
      setIsProcessing(false);
      return;
    }
    
    // Otherwise try to apply the user's move to the starting position
    setIsProcessing(true);
    if (startingFen && userAnswer) {
      console.log(`Attempting to parse move: "${userAnswer}" from position: ${startingFen}`);
      const result = tryApplyMove(startingFen, userAnswer);
      if (result) {
        console.log(`Successfully created position from move: ${result}`);
        setUserFen(result);
      } else {
        console.log(`Failed to parse move: "${userAnswer}"`);
        setUserFen(null);
      }
    } else {
      setUserFen(null);
    }
    setIsProcessing(false);
  }, [startingFen, userAnswer, fenNotation]);
  
  const hasSolution = solutionFen !== null;
  const hasUserMove = userFen !== null;
  
  return (
    <Card 
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      boxShadow="md"
      bg={isCorrect ? 'green.50' : 'red.50'}
      mb={4}
    >
      <CardBody>
        <Stack spacing={4}>
          <Flex justify="space-between" align="center">
            <HStack>
              <Badge 
                colorScheme="blue" 
                fontSize="sm" 
                px={2} 
                py={1} 
                borderRadius="full"
              >
                #{questionNumber}
              </Badge>
              <Heading size="sm">
                {questionText}
              </Heading>
            </HStack>
            <Badge 
              colorScheme={isCorrect ? 'green' : 'red'} 
              fontSize="sm"
              px={2}
              py={1}
              borderRadius="full"
              display="flex" 
              alignItems="center"
            >
              {isCorrect ? <FaCheck style={{ marginRight: '4px' }} /> : <FaTimes style={{ marginRight: '4px' }} />}
              {isCorrect ? 'Correct' : 'Incorrect'} ({pointsEarned}/{totalPoints})
            </Badge>
          </Flex>
          
          <Divider />
          
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4} justifyItems="center">
            <Box>
              <Flex direction="column" align="center">
                <Text fontWeight="bold" fontSize="sm" mb={1} color="gray.600">
                  Starting Position
                </Text>
                <ChessBoard
                  position={startingFen}
                  allowMoves={false}
                  boardSize={boardSize}
                />
              </Flex>
            </Box>
            
            <Box>
              <Flex direction="column" align="center">
                <Text fontWeight="bold" fontSize="sm" mb={1} color="gray.600">
                  Your Answer: {userAnswer}
                </Text>
                {isProcessing ? (
                  <Flex 
                    justify="center" 
                    align="center" 
                    w={boardSize} 
                    h={boardSize} 
                    bg="gray.100" 
                    borderRadius="md"
                  >
                    <Text color="gray.500" fontSize="sm" textAlign="center" p={2}>
                      Processing...
                    </Text>
                  </Flex>
                ) : hasUserMove ? (
                  <ChessBoard
                    position={userFen}
                    allowMoves={false}
                    boardSize={boardSize}
                  />
                ) : (
                  <Flex 
                    justify="center" 
                    align="center" 
                    w={boardSize} 
                    h={boardSize} 
                    bg="gray.100" 
                    borderRadius="md"
                  >
                    <Text color="gray.500" fontSize="sm" textAlign="center" p={2}>
                      Could not visualize move
                    </Text>
                  </Flex>
                )}
              </Flex>
            </Box>
            
            <Box>
              <Flex direction="column" align="center">
                <Text fontWeight="bold" fontSize="sm" mb={1} color="gray.600">
                  Correct Answer: {correctAnswer}
                </Text>
                {hasSolution ? (
                  <ChessBoard
                    position={solutionFen}
                    allowMoves={false}
                    boardSize={boardSize}
                  />
                ) : (
                  <Flex 
                    justify="center" 
                    align="center" 
                    w={boardSize} 
                    h={boardSize} 
                    bg="gray.100" 
                    borderRadius="md"
                  >
                    <Text color="gray.500" fontSize="sm" textAlign="center" p={2}>
                      No solution position available
                    </Text>
                  </Flex>
                )}
              </Flex>
            </Box>
          </SimpleGrid>
        </Stack>
      </CardBody>
    </Card>
  );
};

export default QuestionAnswerCard; 