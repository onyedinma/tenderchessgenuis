<?php
// Script to update existing puzzles to have a solutionFen value

// Database configuration
$db_host = 'localhost';
$db_name = 'tenderchessgenius';
$db_user = 'root';
$db_pass = '';

try {
    // Connect to the database
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "Connected to database successfully.\n";
    
    // Get all puzzles that don't have a solutionFen value
    $stmt = $pdo->query("SELECT id, fen, correct_move FROM puzzles WHERE solutionFen IS NULL OR solutionFen = ''");
    $puzzles = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Found " . count($puzzles) . " puzzles without a solution FEN.\n";
    
    // Parse each puzzle and generate a solution FEN
    $updated = 0;
    
    foreach ($puzzles as $puzzle) {
        // For each puzzle, we'll apply the correct move to the initial position
        // to generate the solution position
        $initialFen = $puzzle['fen'];
        $correctMove = $puzzle['correct_move'];
        
        // Try to generate a solution FEN
        $solutionFen = generateSolutionFen($initialFen, $correctMove);
        
        if ($solutionFen) {
            // Update the puzzle
            $updateStmt = $pdo->prepare("UPDATE puzzles SET solutionFen = ? WHERE id = ?");
            $updateStmt->execute([$solutionFen, $puzzle['id']]);
            $updated++;
            
            echo "Updated puzzle #{$puzzle['id']} with solution FEN.\n";
        } else {
            echo "Could not generate solution FEN for puzzle #{$puzzle['id']}.\n";
        }
    }
    
    echo "Migration completed. Updated $updated out of " . count($puzzles) . " puzzles.\n";
    
} catch (PDOException $e) {
    die("Error: " . $e->getMessage());
}

/**
 * Generate a solution FEN by applying the correct move to the initial position
 */
function generateSolutionFen($initialFen, $correctMove) {
    // Simple implementation: for puzzles with algebraic notation moves (e2e4 format),
    // we can infer the solution position
    
    // Extract the position part of the FEN
    $fenParts = explode(' ', $initialFen);
    $position = $fenParts[0];
    $turn = isset($fenParts[1]) ? $fenParts[1] : 'w';
    $castling = isset($fenParts[2]) ? $fenParts[2] : 'KQkq';
    $enPassant = isset($fenParts[3]) ? $fenParts[3] : '-';
    
    // Parse the correct move (format: e2e4)
    if (strlen($correctMove) == 4 && 
        $correctMove[0] >= 'a' && $correctMove[0] <= 'h' && 
        $correctMove[1] >= '1' && $correctMove[1] <= '8' &&
        $correctMove[2] >= 'a' && $correctMove[2] <= 'h' && 
        $correctMove[3] >= '1' && $correctMove[3] <= '8') {
        
        // Convert FEN to board array representation
        $board = fenToBoard($position);
        
        // Source and target squares
        $sourceFile = ord($correctMove[0]) - ord('a');
        $sourceRank = 8 - (int)$correctMove[1];
        $targetFile = ord($correctMove[2]) - ord('a');
        $targetRank = 8 - (int)$correctMove[3];
        
        // Get the piece at the source
        $piece = $board[$sourceRank][$sourceFile];
        
        if ($piece) {
            // Move the piece
            $board[$sourceRank][$sourceFile] = null;
            $board[$targetRank][$targetFile] = $piece;
            
            // Convert board back to FEN
            $newPosition = boardToFen($board);
            
            // Toggle the active color
            $newTurn = ($turn === 'w') ? 'b' : 'w';
            
            // Return the full solution FEN
            return "$newPosition $newTurn $castling $enPassant 0 1";
        }
    }
    
    // For more complex move notations, we would need a chess engine
    // Fallback: just use the same FEN with the color toggled
    $newTurn = ($turn === 'w') ? 'b' : 'w';
    return "$position $newTurn $castling $enPassant 0 1";
}

/**
 * Convert FEN position string to a 2D board array
 */
function fenToBoard($fen) {
    $board = array_fill(0, 8, array_fill(0, 8, null));
    $ranks = explode('/', $fen);
    
    for ($rank = 0; $rank < 8; $rank++) {
        $file = 0;
        for ($i = 0; $i < strlen($ranks[$rank]); $i++) {
            $char = $ranks[$rank][$i];
            
            if (is_numeric($char)) {
                $file += (int)$char;
            } else {
                $board[$rank][$file] = $char;
                $file++;
            }
        }
    }
    
    return $board;
}

/**
 * Convert a 2D board array back to FEN position string
 */
function boardToFen($board) {
    $fen = '';
    
    for ($rank = 0; $rank < 8; $rank++) {
        $emptyCount = 0;
        
        for ($file = 0; $file < 8; $file++) {
            if ($board[$rank][$file] === null) {
                $emptyCount++;
            } else {
                if ($emptyCount > 0) {
                    $fen .= $emptyCount;
                    $emptyCount = 0;
                }
                $fen .= $board[$rank][$file];
            }
        }
        
        if ($emptyCount > 0) {
            $fen .= $emptyCount;
        }
        
        if ($rank < 7) {
            $fen .= '/';
        }
    }
    
    return $fen;
}
?> 