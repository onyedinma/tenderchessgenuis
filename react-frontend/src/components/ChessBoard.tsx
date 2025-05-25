import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Box, useBreakpointValue, Button, HStack, useMediaQuery } from '@chakra-ui/react';
import { Chess, Move, Square } from 'chess.js';
import { Chessboard } from 'react-chessboard';

interface ChessBoardProps {
  position?: string;
  onMove?: (move: string, fenNotation: string) => void;
  userMove?: string;
  allowMoves?: boolean;
  boardSize?: number | string;
  boardOrientation?: 'white' | 'black';
}

// Default starting position
const DEFAULT_POSITION = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export const ChessBoard: React.FC<ChessBoardProps> = ({ 
  position,
  onMove,
  userMove,
  allowMoves = true,
  boardSize,
  boardOrientation = 'white'
}) => {
  const [game, setGame] = useState<Chess>(() => {
    try {
      const initialPosition = position || DEFAULT_POSITION;
      return new Chess(initialPosition);
    } catch (e) {
      console.warn("Error initializing chess game, using default position:", e);
      return new Chess(DEFAULT_POSITION);
    }
  });
  const [activePosition, setActivePosition] = useState<string>(position || DEFAULT_POSITION);
  const [moveAllowed, setMoveAllowed] = useState(true);
  const [activePiece, setActivePiece] = useState<string | null>(null);
  const [moveSquares, setMoveSquares] = useState<{[key: string]: { backgroundColor: string }}>({});
  const [optionSquares, setOptionSquares] = useState<{[key: string]: { backgroundColor: string }}>({});
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const chessBoardRef = useRef<any>(null);
  const [isMobile] = useMediaQuery("(max-width: 480px)");
  
  // Responsive board width based on screen size
  const responsiveBoardWidth = useBreakpointValue({
    base: Math.min(windowWidth - 24, 260), // Mobile (slightly bigger for touch)
    sm: 280,    // Small screens
    md: 320,    // Medium screens
    lg: 350,    // Large screens
    xl: 380     // Extra large screens
  }) || 280;    // Default fallback size

  // Listen for window resize
  useLayoutEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Reset the game when position changes
  useEffect(() => {
    try {
      console.log("ChessBoard: Setting up with position:", position);
      
      // Ensure we're using a valid position
      const positionToUse = position && position !== 'start' && position !== '' 
        ? position 
        : DEFAULT_POSITION;
      
      // Create a new game instance with the position
      const newGame = new Chess();
      try {
        // Attempt to load the position
        newGame.load(positionToUse);
        // If we got here, the position was loaded successfully
        setGame(newGame);
        setActivePosition(positionToUse);
      } catch (loadError) {
        console.warn("Error loading position, falling back to default:", loadError);
        // If there's an error, use starting position
        newGame.load(DEFAULT_POSITION);
        setGame(newGame);
        setActivePosition(DEFAULT_POSITION);
      }
      
      setMoveAllowed(true);
      setActivePiece(null);
      setMoveSquares({});
      setOptionSquares({});
      
      // If there's a user move, show it on the board
      if (userMove) {
        try {
          console.log("ChessBoard: Applying user move:", userMove);
          // Create a new game to track the move
          const userMoveGame = new Chess();
          userMoveGame.load(positionToUse);
          
          // We'll need to check whose turn it is and potentially modify the FEN to make the move
          const fen = userMoveGame.fen();
          const parts = fen.split(' ');
          // Store the original turn
          const originalTurn = parts[1];
          
          // Find the piece being moved - more flexible regex to handle different notation styles
          const moveMatch = userMove.match(/([KQBNRP])?([a-h][1-8])?(x)?([a-h][1-8])(=[QBNR])?(\+|#)?$/);
          if (moveMatch) {
            const pieceType = moveMatch[1] || 'P';
            const targetSquare = moveMatch[4];
            // Determine color of piece being moved
            let pieceColor = 'w'; // Default to white
            // If move is in SAN format like "e4" or "Nf3", we need to analyze the board
            // For simplicity, let's use the original turn from FEN
            pieceColor = originalTurn;
            
            // Apply the move correctly
            try {
              // Set the turn correctly for this move
              parts[1] = pieceColor;
              const tempFen = parts.join(' ');
              userMoveGame.load(tempFen);
              
              try {
                const moveObj = userMoveGame.move(userMove);
                if (moveObj) {
                  // Show the move on the board
                  setGame(userMoveGame);
                  setMoveAllowed(false);
                  setActivePiece(pieceType.toLowerCase() + pieceColor);
                  // Highlight the move
                  highlightMove(moveObj.from, moveObj.to);
                } else {
                  console.warn('Invalid move format, but not throwing error:', userMove);
                }
              } catch (moveError) {
                console.warn('Invalid move, but continuing without error:', userMove, moveError);
                // Don't throw an error, just continue without applying the move
              }
            } catch (e) {
              console.warn('Error applying user move, but continuing:', e);
              // Don't throw an error here, just continue without applying the move
            }
          } else {
            console.warn('Move format not recognized:', userMove);
          }
        } catch (moveError) {
          console.error("Error applying user move:", moveError);
          // Reset to the valid position we already set
        }
      }
    } catch (e) {
      console.error('Invalid position:', position, e);
      // Fallback to starting position
      try {
        const fallbackGame = new Chess(DEFAULT_POSITION);
        setGame(fallbackGame);
        setActivePosition(DEFAULT_POSITION);
      } catch (fallbackError) {
        console.error('Fatal chess engine error:', fallbackError);
      }
    }
  }, [position, userMove]);

  const highlightMove = (from: Square, to: Square) => {
    const moveSquare = {
      [from]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' },
      [to]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' }
    };
    
    setMoveSquares(moveSquare);
  };

  const resetBoard = () => {
    try {
      const newGame = new Chess(activePosition !== 'start' ? activePosition : undefined);
      setGame(newGame);
      setMoveAllowed(true);
      setActivePiece(null);
      setMoveSquares({});
      setOptionSquares({});
    } catch (e) {
      console.error('Error resetting board:', e);
    }
  };

  const onDrop = (sourceSquare: Square, targetSquare: Square) => {
    if (!allowMoves || !moveAllowed) return false;
    
    try {
      // Get the piece from the source square
      const piece = game.get(sourceSquare);
      if (!piece) return false;
      
      // Create a temporary game to try the move
      const tempGame = new Chess(game.fen());
      
      // Modify the FEN to set the turn to the color of the piece we're moving
      const fenParts = tempGame.fen().split(' ');
      fenParts[1] = piece.color; // set active color to piece color
      const newFen = fenParts.join(' ');
      
      // Load the modified FEN and try the move
      tempGame.load(newFen);
      
      // Try to make the move
      const move = tempGame.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q' // Always promote to queen for simplicity
      });

      // Invalid move
      if (move === null) return false;

      // Update the game state
      setGame(tempGame);
      
      // Highlight the move
      highlightMove(sourceSquare, targetSquare);
      
      // Remember the active piece to prevent moving other pieces
      setActivePiece(piece.type + piece.color);
      setMoveAllowed(false);
      
      // Call the onMove callback if provided
      if (onMove) {
        // Pass the move in algebraic notation (e.g., 'e4', 'Nf3') and the FEN notation
        onMove(move.san, tempGame.fen());
      }

      return true;
    } catch (e) {
      console.error('Error during move:', e);
      return false;
    }
  };

  const onSquareClick = (square: Square) => {
    if (!allowMoves || !moveAllowed) return;
    
    // Get piece on the clicked square
    const piece = game.get(square);
    if (!piece) {
      // If no piece on square and we have a selected piece, try moving to this square
      if (optionSquares[square]) {
        // Find the source square from our option squares
        const sourceSquare = Object.keys(optionSquares).find(key => 
          game.get(key as Square) && optionSquares[square]
        );
        
        if (sourceSquare) {
          onDrop(sourceSquare as Square, square);
        }
      }
      return;
    }
    
    // Create a temporary game to get legal moves for this piece
    const tempGame = new Chess(game.fen());
    
    // Modify FEN to set active color to the piece's color
    const fenParts = tempGame.fen().split(' ');
    fenParts[1] = piece.color;
    const newFen = fenParts.join(' ');
    
    // Load modified FEN
    tempGame.load(newFen);
    
    // Get possible moves for the clicked piece
    const moves = tempGame.moves({
      square,
      verbose: true
    });

    // No legal moves
    if (moves.length === 0) return;

    // Show all possible moves for the selected piece
    const newSquares: {[key: string]: { backgroundColor: string }} = {};
    newSquares[square] = {
      backgroundColor: 'rgba(255, 210, 0, 0.5)'
    };
    
    moves.forEach((move) => {
      newSquares[move.to] = {
        backgroundColor: 'rgba(0, 255, 0, 0.4)'
      };
    });
    
    setOptionSquares(newSquares);
  };
  
  const onPieceDragBegin = (_piece: string, sourceSquare: Square) => {
    if (!allowMoves || !moveAllowed) return;
    
    // Get the piece
    const piece = game.get(sourceSquare);
    if (!piece) return;
    
    // Create a temporary game to get legal moves
    const tempGame = new Chess(game.fen());
    
    // Modify FEN to set active color to the piece's color
    const fenParts = tempGame.fen().split(' ');
    fenParts[1] = piece.color;
    const newFen = fenParts.join(' ');
    
    // Load modified FEN
    tempGame.load(newFen);
    
    // Show possible move targets when dragging a piece
    const moves = tempGame.moves({
      square: sourceSquare,
      verbose: true
    });

    if (moves.length === 0) return;

    const newSquares: {[key: string]: { backgroundColor: string }} = {};
    newSquares[sourceSquare] = {
      backgroundColor: 'rgba(255, 210, 0, 0.5)'
    };
    
    moves.forEach((move) => {
      newSquares[move.to] = {
        backgroundColor: 'rgba(0, 255, 0, 0.4)'
      };
    });
    
    setOptionSquares(newSquares);
  };
  
  const onPieceDragEnd = () => {
    setOptionSquares({});
  };

  // Calculate actual board size - use the specified boardSize prop if provided
  const finalBoardWidth = boardSize || responsiveBoardWidth;

  // Ensure the board width is a number for the Chessboard component
  const numericBoardWidth = typeof finalBoardWidth === 'string' 
    ? parseInt(finalBoardWidth, 10) 
    : finalBoardWidth;

  return (
    <Box 
      width="100%" 
      height="auto" 
      display="flex" 
      flexDirection="column" 
      justifyContent="center" 
      alignItems="center"
      p={1}
    >
      <Box 
        width={finalBoardWidth} 
        maxWidth="100%"
      >
        <Chessboard
          id="student-quiz-board"
          boardOrientation={boardOrientation}
          position={game.fen()}
          onPieceDrop={onDrop}
          onSquareClick={onSquareClick}
          onPieceDragBegin={onPieceDragBegin}
          onPieceDragEnd={onPieceDragEnd}
          customSquareStyles={{
            ...moveSquares,
            ...optionSquares
          }}
          areArrowsAllowed={false}
          boardWidth={numericBoardWidth}
          animationDuration={200}
          ref={chessBoardRef}
          arePremovesAllowed={false}
          customDarkSquareStyle={{ backgroundColor: isMobile ? '#769656' : '#b58863' }}
          customLightSquareStyle={{ backgroundColor: isMobile ? '#eeeed2' : '#f0d9b5' }}
          customBoardStyle={{ 
            borderRadius: '4px', 
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            touchAction: 'manipulation'
          }}
        />
      </Box>
      
      {!moveAllowed && (
        <HStack mt={1}>
          <Button 
            size="xs" 
            colorScheme="blue" 
            onClick={resetBoard}
            width={isMobile ? "100%" : "auto"}
            mt={isMobile ? 2 : 0}
          >
            Reset
          </Button>
        </HStack>
      )}
    </Box>
  );
};

export default ChessBoard; 