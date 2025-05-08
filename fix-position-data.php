<?php
// Script to fix truncated position data

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/logs/php-errors.log');

echo "<h1>Position Data Fix Script</h1>";

// Connect to database
require_once __DIR__ . '/api/db/config.php';

if (!isset($conn)) {
    die("Database connection failed");
}

// The question ID with the problematic position data
$questionId = 8;

// Correct data
$startingFen = 'k5r1/1p2p3/2bp4/4p3/P7/2PPP3/1R2P1Q1/K7 w - - 0 1';
$solutionFen = 'k5r1/1p2p3/3p4/4p3/P7/2PPP3/1R2P1b1/K7 w - - 0 1';
$algebraicNotation = 'Bxg2';
$moveSequence = json_encode([
    [
        'from' => 'c6',
        'to' => 'g2',
        'san' => 'Bxg2',
        'piece' => 'b',
        'isCapture' => true,
        'isCheck' => false,
        'isCheckmate' => false
    ]
]);

// Store only FEN strings in position field to avoid truncation
$positionData = json_encode([
    'starting_fen' => $startingFen,
    'solution_fen' => $solutionFen
]);

echo "<p>Fixing data for question ID: $questionId</p>";
echo "<p>Position data: $positionData</p>";
echo "<p>Algebraic notation: $algebraicNotation</p>";
echo "<p>Move sequence: $moveSequence</p>";

try {
    // Get the current data
    $selectSql = "SELECT position, algebraic_notation, move_sequence FROM questions WHERE id = :id";
    $selectStmt = $conn->prepare($selectSql);
    $selectStmt->bindParam(':id', $questionId, PDO::PARAM_INT);
    $selectStmt->execute();
    
    if ($selectStmt->rowCount() === 0) {
        die("Question with ID $questionId not found");
    }
    
    $row = $selectStmt->fetch(PDO::FETCH_ASSOC);
    echo "<p>Current position data: " . htmlspecialchars($row['position']) . "</p>";
    echo "<p>Current algebraic notation: " . htmlspecialchars($row['algebraic_notation'] ?? 'None') . "</p>";
    echo "<p>Current move sequence: " . htmlspecialchars($row['move_sequence'] ?? 'None') . "</p>";
    
    // Update with correct data
    $updateSql = "UPDATE questions SET 
                    position = :position, 
                    algebraic_notation = :algebraic_notation, 
                    move_sequence = :move_sequence 
                  WHERE id = :id";
    
    $updateStmt = $conn->prepare($updateSql);
    $updateStmt->bindParam(':position', $positionData, PDO::PARAM_STR);
    $updateStmt->bindParam(':algebraic_notation', $algebraicNotation, PDO::PARAM_STR);
    $updateStmt->bindParam(':move_sequence', $moveSequence, PDO::PARAM_STR);
    $updateStmt->bindParam(':id', $questionId, PDO::PARAM_INT);
    
    if ($updateStmt->execute()) {
        echo "<p style='color:green;'>✅ Question data updated successfully!</p>";
    } else {
        echo "<p style='color:red;'>Failed to update question data: " . implode(', ', $updateStmt->errorInfo()) . "</p>";
    }
    
} catch (Exception $e) {
    echo "<p style='color:red;'>Error: " . $e->getMessage() . "</p>";
}

echo "<p><a href='react-frontend/index.html'>Go back to the application</a></p>";
?> 