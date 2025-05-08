import React, { useState, useEffect, useRef } from 'react';
import { Box, Text, Center, Spinner } from '@chakra-ui/react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';

interface ChessBoardProps {
  fen?: string;
  width?: number | string;
}

// Default starting position
const DEFAULT_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

const ChessBoard: React.FC<ChessBoardProps> = ({ fen, width = '100%' }) => {
  const [validFen, setValidFen] = useState<string>(DEFAULT_FEN);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const boardRef = useRef<any>(null);
  
  // Validate FEN when it changes
  useEffect(() => {
    setIsLoading(true);
    try {
      let finalFen = fen;
      
      console.log("ChessBoard received FEN:", finalFen);
      
      if (!finalFen) {
        console.log("No FEN provided, using default");
        finalFen = DEFAULT_FEN;
      }
      
      // Validate FEN using chess.js
      const chess = new Chess(finalFen);
      console.log("FEN validated successfully:", chess.fen());
      setValidFen(finalFen);
      setError(null);
    } catch (err) {
      console.warn("Invalid FEN provided:", fen, err);
      // Default to starting position but track error
      setValidFen(DEFAULT_FEN);
      setError(`Invalid FEN: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      // Short timeout to ensure rendering
      setTimeout(() => setIsLoading(false), 50);
    }
  }, [fen]);
  
  // Force re-render on window resize
  useEffect(() => {
    const handleResize = () => {
      if (boardRef.current) {
        const currentFen = validFen;
        setValidFen('');
        setTimeout(() => setValidFen(currentFen), 10);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [validFen]);
  
  return (
    <Box 
      width={width} 
      maxW="600px" 
      position="relative"
      className="chess-board-container"
      ref={boardRef}
    >
      {isLoading ? (
        <Center width="100%" height="100%" minH="240px">
          <Spinner color="blue.500" />
        </Center>
      ) : (
        <Chessboard 
          id={`chess-board-${Date.now()}`}
          position={validFen}
          boardWidth={typeof width === 'number' ? width : undefined}
          areArrowsAllowed={false}
          showBoardNotation={true}
          boardOrientation="white"
          customDarkSquareStyle={{ backgroundColor: '#779952' }}
          customLightSquareStyle={{ backgroundColor: '#edeed1' }}
        />
      )}
      
      {error && !isLoading && (
        <Center 
          position="absolute" 
          top="0" 
          left="0" 
          right="0" 
          bottom="0" 
          bg="rgba(255, 0, 0, 0.1)"
          borderRadius="md"
          p={2}
        >
          <Text 
            fontSize="xs" 
            color="red.500" 
            bg="white" 
            p={1} 
            borderRadius="md"
            textAlign="center"
          >
            {error}
          </Text>
        </Center>
      )}
    </Box>
  );
};

export default ChessBoard; 