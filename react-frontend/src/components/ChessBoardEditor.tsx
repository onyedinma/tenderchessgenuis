import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Box, Button, HStack, Text, useToast, VStack, Flex, Image, Icon } from '@chakra-ui/react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { GiChessPawn } from 'react-icons/gi';
import { BsPlusCircle } from 'react-icons/bs';

interface ChessBoardEditorProps {
  initialFen?: string;
  onFenChange?: (fen: string) => void;
  readOnly?: boolean;
  hideCastling?: boolean;
}

// Default starting position
const DEFAULT_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

// Helper function to create a valid Chess object regardless of FEN validity
const createSafeChessObject = (fen: string): Chess => {
  try {
    return new Chess(fen);
  } catch (e) {
    console.warn("Invalid FEN provided, using default starting position", e);
    return new Chess(DEFAULT_FEN);
  }
};

// Helper function to generate a FEN string from the board representation
const generateFen = (board: Array<Array<string | null>>, turn: 'w' | 'b', castling: string, enPassant: string) => {
  let fen = '';
  
  // Add board position
  for (let rank = 0; rank < 8; rank++) {
    let emptySquares = 0;
    for (let file = 0; file < 8; file++) {
      const piece = board[rank][file];
      if (piece === null) {
        emptySquares++;
      } else {
        if (emptySquares > 0) {
          fen += emptySquares;
          emptySquares = 0;
        }
        fen += piece;
      }
    }
    if (emptySquares > 0) {
      fen += emptySquares;
    }
    if (rank < 7) {
      fen += '/';
    }
  }
  
  // Add turn, castling, en passant, halfmove, and fullmove
  fen += ` ${turn} ${castling} ${enPassant} 0 1`;
  
  return fen;
};

// Helper function to parse a FEN string into a board representation
const parseFen = (fen: string | undefined): { 
  board: Array<Array<string | null>>, 
  turn: 'w' | 'b',
  castling: string,
  enPassant: string
} => {
  // If no FEN provided, return default starting position
  if (!fen) {
    return {
      board: Array(8).fill(null).map(() => Array(8).fill(null)),
      turn: 'w',
      castling: 'KQkq',
      enPassant: '-'
    };
  }

  const board = Array(8).fill(null).map(() => Array(8).fill(null));
  const fenParts = fen.split(' ');
  const ranks = fenParts[0].split('/');
  
  // Parse board position
  for (let rank = 0; rank < 8; rank++) {
    let file = 0;
    for (let i = 0; i < ranks[rank].length; i++) {
      const char = ranks[rank][i];
      if (isNaN(parseInt(char))) {
        // It's a piece
        board[rank][file] = char;
        file++;
      } else {
        // It's a number of empty squares
        file += parseInt(char);
      }
    }
  }
  
  // Make sure turn is valid (w or b)
  const turn = fenParts.length > 1 && fenParts[1] === 'b' ? 'b' as const : 'w' as const;
  
  // Make sure castling is valid
  const castling = fenParts.length > 2 ? fenParts[2] : '-';
  
  // Make sure en passant is valid
  const enPassant = fenParts.length > 3 ? fenParts[3] : '-';
  
  return {
    board,
    turn,
    castling,
    enPassant
  };
};

const ChessBoardEditor: React.FC<ChessBoardEditorProps> = ({
  initialFen = DEFAULT_FEN,
  onFenChange,
  readOnly = false,
  hideCastling = false,
}) => {
  // Parse the board state regardless of chess.js validation
  const [boardState, setBoardState] = useState(parseFen(initialFen));
  const [fen, setFen] = useState(initialFen);
  
  // Initialize with a valid chess position, defaulting to starting position if initialFen is invalid
  const [game, setGame] = useState<Chess>(() => createSafeChessObject(initialFen));
  
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>('white');
  const [pieceMode, setPieceMode] = useState(false);
  const [selectedPiece, setSelectedPiece] = useState<string | null>(null);
  const toast = useToast();
  const chessboardRef = useRef(null);
  
  // Prevent position from changing more than once per render cycle
  const stableFen = useMemo(() => fen, [fen]);

  // When initialFen prop changes, update the board state
  useEffect(() => {
    try {
      // Only update if there's a meaningful difference
      if (initialFen && initialFen !== fen) {
        // Update board state
        setBoardState(parseFen(initialFen));
        setFen(initialFen);
        
        // Try to update chess.js game (may fail if not a valid chess position)
        try {
          setGame(new Chess(initialFen));
        } catch (err) {
          console.warn("Invalid chess position, but we'll display it anyway:", err);
          // Keep the current game object
        }
      }
    } catch (e) {
      console.error("Error parsing FEN position:", e);
    }
  }, [initialFen]); // Only depend on initialFen, not on fen

  // When the FEN changes locally, notify parent component, but with a delay
  useEffect(() => {
    // Prevent notification on first render or when initialFen changes
    if (!onFenChange || fen === initialFen) return;
    
    // Use a small timeout to debounce and prevent rapid update cycles
    const timeoutId = setTimeout(() => {
      onFenChange(fen);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [fen, onFenChange, initialFen]);

  // Update FEN only when it actually changes
  const updateFen = useCallback((newFen: string) => {
    if (newFen !== fen) {
      setFen(newFen);
      if (onFenChange) {
        onFenChange(newFen);
      }
    }
  }, [fen, onFenChange]);

  // Generate FEN from board state and update state
  const updateFenFromBoardState = useCallback((newBoardState: {
    board: Array<Array<string | null>>, 
    turn: 'w' | 'b',
    castling: string,
    enPassant: string
  }) => {
    const newFen = generateFen(
      newBoardState.board, 
      newBoardState.turn, 
      newBoardState.castling, 
      newBoardState.enPassant
    );
    updateFen(newFen);
  }, [updateFen]);

  // Handle piece movement
  const onDrop = useCallback((sourceSquare: string, targetSquare: string) => {
    if (readOnly) return false;

    try {
      // Simple solution - just update the board directly without validation
      const newBoard = [...boardState.board.map(row => [...row])];
      
      // Get file and rank indexes
      const sourceFile = sourceSquare.charCodeAt(0) - 'a'.charCodeAt(0);
      const sourceRank = 8 - parseInt(sourceSquare[1]);
      const targetFile = targetSquare.charCodeAt(0) - 'a'.charCodeAt(0);
      const targetRank = 8 - parseInt(targetSquare[1]);
      
      // Get the piece at the source square
      const piece = newBoard[sourceRank][sourceFile];
      
      // If no piece at source, return false
      if (piece === null) return false;
      
      // Move the piece
      newBoard[sourceRank][sourceFile] = null;
      newBoard[targetRank][targetFile] = piece;
      
      // Update board state
      const newBoardState = {
        ...boardState,
        board: newBoard
      };
      setBoardState(newBoardState);
      
      // Generate new FEN
      updateFenFromBoardState(newBoardState);
      
      return true;
    } catch (e) {
      console.error("Error during move:", e);
      return false;
    }
  }, [boardState, setBoardState, readOnly, updateFenFromBoardState]);
  
  // Memoize other callbacks that interact with the chessboard
  const onDragBegin = useCallback((piece: string, sourceSquare: string) => {
    // ... existing onDragBegin logic ...
  }, []);
  
  const onPieceDrop = useCallback((sourceSquare: string, targetSquare: string, piece: string) => {
    // ... existing onPieceDrop logic ...
  }, []);

  // Try to safely update the chess.js game object
  const safeUpdateChessGame = (newFen: string) => {
    try {
      return new Chess(newFen);
    } catch (e) {
      console.warn("Can't update chess.js with invalid position:", e);
      // Return current game as fallback
      return game;
    }
  };

  // Reset to starting position
  const handleStartPos = useCallback(() => {
    const startFen = DEFAULT_FEN;
    setBoardState(parseFen(startFen));
    updateFen(startFen);
    setGame(new Chess(startFen)); // This should always be valid
  }, [updateFen]);

  // Clear the board
  const handleClear = useCallback(() => {
    try {
      // Create a completely empty board with proper typing
      const emptyBoard: Array<Array<string | null>> = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      
      // Create a properly typed board state
      const newBoardState = {
        board: emptyBoard,
        turn: 'w' as const,
        castling: '-',
        enPassant: '-'
      };
      
      // Update state
      setBoardState(newBoardState);
      
      // Generate FEN
      updateFenFromBoardState(newBoardState);
    } catch (e) {
      console.error("Error clearing board:", e);
    }
  }, [updateFenFromBoardState]);

  // Copy FEN to clipboard
  const handleCopyFen = () => {
    navigator.clipboard.writeText(fen)
      .then(() => {
        toast({
          title: "FEN Copied",
          description: "Position copied to clipboard",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      })
      .catch(error => {
        toast({
          title: "Copy Failed",
          description: "Could not copy position",
          status: "error",
          duration: 2000,
          isClosable: true,
        });
        console.error("Error copying FEN:", error);
      });
  };
  
  // Flip the board
  const handleFlipBoard = () => {
    setBoardOrientation(boardOrientation === 'white' ? 'black' : 'white');
  };

  // Toggle piece placement mode
  const handleTogglePieceMode = () => {
    setPieceMode(!pieceMode);
  };
  
  // Set whose turn it is
  const setTurn = (color: 'w' | 'b') => {
    try {
      // Update board state
      const newBoardState = {...boardState, turn: color};
      setBoardState(newBoardState);
      
      // Generate new FEN and update state
      updateFenFromBoardState(newBoardState);
    } catch (e) {
      console.error("Error setting turn:", e);
    }
  };

  // Toggle castling rights
  const toggleCastling = (right: 'K' | 'Q' | 'k' | 'q') => {
    try {
      // Get current castling rights
      let castlingRights = boardState.castling;
      
      // Toggle the specified right
      if (castlingRights.includes(right)) {
        // Remove the right
        castlingRights = castlingRights.replace(right, '');
        // If empty, set to '-'
        if (castlingRights === '') castlingRights = '-';
      } else {
        // Add the right
        if (castlingRights === '-') {
          castlingRights = right;
        } else {
          // Insert in the correct order: KQkq
          const order = ['K', 'Q', 'k', 'q'];
          const rights = castlingRights === '-' ? [] : castlingRights.split('');
          rights.push(right);
          rights.sort((a, b) => order.indexOf(a) - order.indexOf(b));
          castlingRights = rights.join('');
        }
      }
      
      // Update board state with proper typing
      const newBoardState = {
        ...boardState,
        castling: castlingRights
      };
      setBoardState(newBoardState);
      
      // Generate new FEN and update state
      updateFenFromBoardState(newBoardState);
    } catch (e) {
      console.error("Error toggling castling rights:", e);
    }
  };

  // Select a piece for placement
  const handleSelectPiece = (piece: string) => {
    setSelectedPiece(piece === selectedPiece ? null : piece);
  };
  
  // Handle square click for placing/removing pieces - optimized with useMemo
  const handleSquareClick = useCallback((square: string) => {
    if (!pieceMode) return;
    
    try {
      // Get file and rank indexes
      const file = square.charCodeAt(0) - 'a'.charCodeAt(0);
      const rank = 8 - parseInt(square[1]);
      
      // Create a new board state with proper type
      const newBoard = [...boardState.board.map(row => [...row])];
      
      // Remove existing piece (if any)
      newBoard[rank][file] = null;
      
      // If a piece is selected and it's not the delete option, place it
      if (selectedPiece && selectedPiece !== 'del') {
        const pieceColor = selectedPiece[0] === 'w' ? 'w' : 'b';
        const pieceType = selectedPiece[1].toLowerCase();
        
        // Determine the piece character for FEN (uppercase for white, lowercase for black)
        const pieceChar = pieceColor === 'w' ? pieceType.toUpperCase() : pieceType;
        
        // Place the piece
        newBoard[rank][file] = pieceChar;
      }
      
      // Update board state with properly typed object
      const newBoardState = {
        ...boardState,
        board: newBoard
      };
      setBoardState(newBoardState);
      
      // Generate new FEN and update state - but not on every render
      setTimeout(() => {
        updateFenFromBoardState(newBoardState);
      }, 0);
    } catch (e) {
      console.error("Error placing/removing piece:", e);
    }
  }, [pieceMode, boardState, selectedPiece, updateFenFromBoardState]);

  // Stabilize props to prevent unnecessary re-renders
  const chessboardProps = useMemo(() => ({
    position: stableFen,
    onPieceDrop: onDrop,
    onSquareClick: pieceMode ? handleSquareClick : undefined,
    boardWidth: 220,
    id: "chessEditor",
    boardOrientation: boardOrientation,
    customBoardStyle: {
      borderRadius: "4px",
      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
    },
    arePiecesDraggable: !readOnly,
  }), [stableFen, onDrop, pieceMode, handleSquareClick, boardOrientation, readOnly]);

  return (
    <VStack spacing={4} align="stretch">
      <Box width="100%" maxW="240px">
        <Chessboard
          {...chessboardProps}
          key={`board-${stableFen.split(' ')[0]}-${pieceMode}-${boardOrientation}`}
        />
      </Box>

      {pieceMode && !readOnly && (
        <Flex justify="center" wrap="wrap" gap={1} mt={1}>
          {['wP', 'wN', 'wB', 'wR', 'wQ', 'wK', 'bP', 'bN', 'bB', 'bR', 'bQ', 'bK', 'del'].map(piece => (
            <Box 
              key={piece}
              w="28px" 
              h="28px" 
              border="1px solid" 
              borderColor={selectedPiece === piece ? "blue.500" : "gray.300"}
              bg={selectedPiece === piece ? "blue.100" : "white"}
              display="flex"
              alignItems="center"
              justifyContent="center"
              cursor="pointer"
              borderRadius="sm"
              onClick={() => handleSelectPiece(piece)}
            >
              {piece === 'del' ? '❌' : (
                <Text fontSize="20px" lineHeight="1">
                  {piece === 'wP' ? '♙' : 
                   piece === 'wN' ? '♘' : 
                   piece === 'wB' ? '♗' : 
                   piece === 'wR' ? '♖' : 
                   piece === 'wQ' ? '♕' : 
                   piece === 'wK' ? '♔' : 
                   piece === 'bP' ? '♟' : 
                   piece === 'bN' ? '♞' : 
                   piece === 'bB' ? '♝' : 
                   piece === 'bR' ? '♜' : 
                   piece === 'bQ' ? '♛' : 
                   piece === 'bK' ? '♚' : ''}
                </Text>
              )}
            </Box>
          ))}
        </Flex>
      )}

      {!readOnly && (
        <>
          <HStack spacing={2} wrap="wrap">
            <Button colorScheme="blue" onClick={handleStartPos} size="sm">
              Start Position
            </Button>
            <Button colorScheme="red" onClick={handleClear} size="sm">
              Clear Board
            </Button>
            <Button colorScheme="green" onClick={handleCopyFen} size="sm">
              Copy FEN
            </Button>
            <Button colorScheme="purple" onClick={handleFlipBoard} size="sm">
              Flip Board
            </Button>
            <Button 
              colorScheme={pieceMode ? "orange" : "gray"} 
              onClick={handleTogglePieceMode}
              size="sm"
              leftIcon={<Icon as={pieceMode ? GiChessPawn : BsPlusCircle} />}
            >
              {pieceMode ? "Exit Edit" : "Place Pieces"}
            </Button>
          </HStack>
          
          <HStack spacing={2} wrap="wrap">
            <Button 
              size="sm" 
              colorScheme="blue" 
              variant={fen.includes(' w ') ? 'solid' : 'outline'}
              onClick={() => setTurn('w')}
            >
              White's Turn
            </Button>
            <Button 
              size="sm" 
              colorScheme="gray" 
              variant={fen.includes(' b ') ? 'solid' : 'outline'}
              onClick={() => setTurn('b')}
            >
              Black's Turn
            </Button>
          </HStack>
          
          {!hideCastling && (
            <HStack spacing={2} wrap="wrap">
              <Text fontSize="sm" fontWeight="bold">Castling:</Text>
              <Button 
                size="xs" 
                variant={fen.includes('K') ? 'solid' : 'outline'}
                onClick={() => toggleCastling('K')}
                colorScheme="blue"
                title="White kingside castling"
              >
                0-0 W
              </Button>
              <Button 
                size="xs" 
                variant={fen.includes('Q') ? 'solid' : 'outline'}
                onClick={() => toggleCastling('Q')}
                colorScheme="blue"
                title="White queenside castling"
              >
                0-0-0 W
              </Button>
              <Button 
                size="xs" 
                variant={fen.includes('k') ? 'solid' : 'outline'}
                onClick={() => toggleCastling('k')}
                colorScheme="gray"
                title="Black kingside castling"
              >
                0-0 B
              </Button>
              <Button 
                size="xs" 
                variant={fen.includes('q') ? 'solid' : 'outline'}
                onClick={() => toggleCastling('q')}
                colorScheme="gray"
                title="Black queenside castling"
              >
                0-0-0 B
              </Button>
            </HStack>
          )}

          <Text fontSize="sm" fontFamily="monospace" p={2} bg="gray.100" borderRadius="md">
            {fen}
          </Text>
        </>
      )}
    </VStack>
  );
};

export default ChessBoardEditor; 