<?php
/**
 * Chess helper functions to analyze positions and determine moves
 */

/**
 * Determines which piece was moved and to which position by comparing two FEN positions
 * 
 * @param string $startFen The starting FEN position
 * @param string $endFen The ending FEN position after the move
 * @return array An array with 'piece', 'from', and 'to' information
 */
function detectMove($startFen, $endFen) {
    // Get the board positions from FEN (first part before the space)
    $startBoard = explode(' ', $startFen)[0];
    $endBoard = explode(' ', $endFen)[0];
    
    // Parse FEN board representations into 2D arrays
    $startPosition = fenToBoard($startBoard);
    $endPosition = fenToBoard($endBoard);
    
    // Find differences between positions
    $differences = findDifferences($startPosition, $endPosition);
    
    // Return the move details
    return $differences;
}

/**
 * Converts FEN board representation to a 2D array
 * 
 * @param string $fen The FEN board representation (first part of FEN)
 * @return array 2D array representing the board
 */
function fenToBoard($fen) {
    $board = [];
    $ranks = explode('/', $fen);
    
    foreach ($ranks as $rankIndex => $rank) {
        $board[$rankIndex] = [];
        $fileIndex = 0;
        
        for ($i = 0; $i < strlen($rank); $i++) {
            $char = $rank[$i];
            
            if (is_numeric($char)) {
                // Empty squares
                for ($j = 0; $j < intval($char); $j++) {
                    $board[$rankIndex][$fileIndex] = '';
                    $fileIndex++;
                }
            } else {
                // Piece
                $board[$rankIndex][$fileIndex] = $char;
                $fileIndex++;
            }
        }
    }
    
    return $board;
}

/**
 * Finds differences between two board positions to determine the move
 * 
 * @param array $startPosition The starting board position
 * @param array $endPosition The ending board position
 * @return array The move details (piece, from, to)
 */
function findDifferences($startPosition, $endPosition) {
    $pieceRemoved = null;
    $fromSquare = null;
    $pieceAdded = null;
    $toSquare = null;
    
    // Find where pieces were removed and added
    for ($rank = 0; $rank < 8; $rank++) {
        for ($file = 0; $file < 8; $file++) {
            $startPiece = $startPosition[$rank][$file] ?? '';
            $endPiece = $endPosition[$rank][$file] ?? '';
            
            if ($startPiece !== '' && $startPiece !== $endPiece) {
                // A piece was moved from this square
                $pieceRemoved = $startPiece;
                $fromSquare = fileRankToAlgebraic($file, $rank);
            }
            
            if ($endPiece !== '' && $startPiece !== $endPiece) {
                // A piece was moved to this square
                $pieceAdded = $endPiece;
                $toSquare = fileRankToAlgebraic($file, $rank);
            }
        }
    }
    
    // Handle special cases like castling, en passant, promotion
    // (simplified for now)
    
    return [
        'piece' => $pieceRemoved,
        'from' => $fromSquare,
        'to' => $toSquare,
        'movedPiece' => getPieceName($pieceRemoved),
        'movedTo' => $toSquare
    ];
}

/**
 * Converts file and rank indices to algebraic notation
 * 
 * @param int $file The file index (0-7)
 * @param int $rank The rank index (0-7)
 * @return string The algebraic notation (e.g., 'e4')
 */
function fileRankToAlgebraic($file, $rank) {
    $files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    return $files[$file] . (8 - $rank);
}

/**
 * Gets the full name of a piece based on its FEN representation
 * 
 * @param string $piece The piece symbol from FEN
 * @return string The full name of the piece
 */
function getPieceName($piece) {
    $pieces = [
        'P' => 'White Pawn',
        'N' => 'White Knight',
        'B' => 'White Bishop',
        'R' => 'White Rook',
        'Q' => 'White Queen',
        'K' => 'White King',
        'p' => 'Black Pawn',
        'n' => 'Black Knight',
        'b' => 'Black Bishop',
        'r' => 'Black Rook',
        'q' => 'Black Queen',
        'k' => 'Black King'
    ];
    
    return $pieces[$piece] ?? 'Unknown';
}

/**
 * Generate the algebraic notation for a chess move by comparing two positions
 * 
 * @param string $startFen The starting FEN position
 * @param string $endFen The ending FEN position after the move
 * @return array The move details including algebraic notation
 * @throws Exception if there is a problem with the move detection
 */
function generateMoveAnswer($startFen, $endFen) {
    try {
        if (empty($startFen) || empty($endFen)) {
            throw new Exception("Empty FEN strings provided");
        }
        
        if ($startFen === $endFen) {
            throw new Exception("Starting and ending FEN are identical");
        }
        
        $move = detectMove($startFen, $endFen);
        
        // Validate move data
        if (empty($move['from']) || empty($move['to']) || empty($move['piece'])) {
            error_log("Invalid move data detected: " . print_r($move, true));
            throw new Exception("Could not determine the move between positions");
        }
        
        // Get the piece symbol for SAN notation
        $pieceSymbol = '';
        if ($move['piece'] !== 'P' && $move['piece'] !== 'p') {
            // For non-pawns, use the uppercase piece letter
            $pieceSymbol = strtoupper($move['piece']);
        }
        
        // Check if this is a capture by examining if there was a piece at the destination in the starting position
        $startBoard = fenToBoard(explode(' ', $startFen)[0]);
        $endBoard = fenToBoard(explode(' ', $endFen)[0]);
        
        // Convert algebraic to file, rank indices
        $toFile = ord($move['to'][0]) - ord('a');
        $toRank = 8 - intval($move['to'][1]);
        
        $isCapture = false;
        if (isset($startBoard[$toRank][$toFile]) && $startBoard[$toRank][$toFile] !== '') {
            $isCapture = true;
        }
        
        // For pawns capturing, include the file
        if (($move['piece'] === 'P' || $move['piece'] === 'p') && $isCapture) {
            $pieceSymbol = strtolower($move['from'][0]);
        }
        
        // Build the move notation
        $notation = $pieceSymbol;
        if ($isCapture) {
            $notation .= 'x';
        }
        $notation .= $move['to'];
        
        // Also return the long form notation for animation purposes
        $longNotation = $move['from'] . $move['to'];
        
        return [
            'san' => $notation,
            'uci' => $longNotation,
            'from' => $move['from'],
            'to' => $move['to'],
            'piece' => $move['piece'],
            'isCapture' => $isCapture
        ];
    } catch (Exception $e) {
        error_log("Error in generateMoveAnswer: " . $e->getMessage());
        error_log("Start FEN: $startFen");
        error_log("End FEN: $endFen");
        
        // Return a minimal result that won't break the application
        return [
            'san' => '',
            'uci' => '',
            'from' => '',
            'to' => '',
            'piece' => '',
            'isCapture' => false
        ];
    }
}
?> 