<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Error handling
error_reporting(E_ALL);
ini_set('display_errors', 0); // Don't display errors to the client
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../../logs/php-errors.log');

// Global error handler
function exception_error_handler($severity, $message, $file, $line) {
    if (!(error_reporting() & $severity)) {
        return;
    }
    error_log("PHP Error [$severity]: $message in $file on line $line");
    throw new ErrorException($message, 0, $severity, $file, $line);
}
set_error_handler("exception_error_handler");

try {
    require_once __DIR__ . '/../db/config.php';
    
    // Validate bank_id parameter
    if (!isset($_GET['bank_id'])) {
        throw new Exception("Missing bank_id parameter");
    }
    
    $bankId = intval($_GET['bank_id']);
    error_log("Fetching questions for bank ID: $bankId");
    
    // Verify the bank exists
    $bankCheckSql = "SELECT id, name, section_type FROM question_banks WHERE id = :bank_id";
    $bankCheckStmt = $conn->prepare($bankCheckSql);
    $bankCheckStmt->bindParam(':bank_id', $bankId, PDO::PARAM_INT);
    $bankCheckStmt->execute();
    
    if ($bankCheckStmt->rowCount() === 0) {
        throw new Exception("Question bank not found");
    }
    
    $bank = $bankCheckStmt->fetch();
    
    // Get all questions for the bank
    $sql = "SELECT id, question_text, correct_answer, position, question_order, is_active, 
            algebraic_notation, move_sequence, bank_id, created_at
            FROM questions 
            WHERE bank_id = :bank_id 
            ORDER BY question_order ASC";
    
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':bank_id', $bankId, PDO::PARAM_INT);
    $stmt->execute();
    
    $questions = [];
    
    while ($row = $stmt->fetch()) {
        // Log the raw position data from database for debugging
        error_log("Raw position data for question {$row['id']}: " . $row['position']);
        
        // Handle position data
        $validPosition = true;
        $positionData = null;
        $fen = '';
        $solutionFen = '';
        
        try {
            // Parse the position JSON to get FEN strings
            $positionData = json_decode($row['position'], true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                error_log("Error decoding position JSON for question {$row['id']}: " . json_last_error_msg());
                $validPosition = false;
            }
            
            if ($validPosition && isset($positionData['starting_fen'])) {
                $fen = $positionData['starting_fen'];
            } else {
                error_log("No starting_fen in position data for question {$row['id']}");
                $validPosition = false;
            }
            
            if ($validPosition && isset($positionData['solution_fen'])) {
                $solutionFen = $positionData['solution_fen'];
            } else {
                error_log("No solution_fen in position data for question {$row['id']}");
                $validPosition = false;
            }
        } catch (Exception $e) {
            error_log("Exception parsing position for question {$row['id']}: " . $e->getMessage());
            $validPosition = false;
        }
        
        // If we couldn't parse the position, set default values
        if (!$validPosition) {
            $fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
            $solutionFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
            
            // Set a basic position data with only FEN strings
            $positionData = [
                'starting_fen' => $fen,
                'solution_fen' => $solutionFen
            ];
            
            // Re-encode for consistency
            $row['position'] = json_encode($positionData);
        }
        
        // Get algebraic notation from its dedicated column
        $algebraicNotation = $row['algebraic_notation'] ?? '';
        
        // Process move sequence from its dedicated column
        $moveSequence = [];
        if (isset($row['move_sequence']) && !empty($row['move_sequence'])) {
            try {
                $moveSequence = json_decode($row['move_sequence'], true);
                if (json_last_error() !== JSON_ERROR_NONE) {
                    error_log("Error decoding move sequence for question {$row['id']}: " . json_last_error_msg());
                    $moveSequence = [];
                }
            } catch (Exception $e) {
                error_log("Exception parsing move sequence for question {$row['id']}: " . $e->getMessage());
                $moveSequence = [];
            }
        }
        
        // Build the question object
        $question = [
            'id' => $row['id'],
            'bank_id' => $row['bank_id'],
            'fen' => $fen,
            'solutionFen' => $solutionFen,
            'order' => $row['question_order'],
            'is_active' => $row['is_active'] ? true : false,
            'question_text' => $row['question_text'],
            'correct_answer' => $row['correct_answer'],
            'algebraic_notation' => $algebraicNotation,
            'move_sequence' => $moveSequence,
            'created_at' => $row['created_at'],
            // Include the original position JSON for backward compatibility
            'position' => $row['position']
        ];
        
        $questions[] = $question;
    }
    
    // Log the response for debugging
    error_log("Returning " . count($questions) . " questions for bank $bankId");
    
    // Clear any existing output buffers
    while (ob_get_level()) {
        ob_end_clean();
    }
    
    // Return the questions as JSON
    echo json_encode([
        'success' => true,
        'bank' => [
            'id' => $bank['id'],
            'name' => $bank['name'],
            'section_type' => $bank['section_type']
        ],
        'questions' => $questions
    ]);
    
} catch (Exception $e) {
    error_log("Error in get-questions.php: " . $e->getMessage());
    
    // Clear any existing output buffers
    while (ob_get_level()) {
        ob_end_clean();
    }
    
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?> 