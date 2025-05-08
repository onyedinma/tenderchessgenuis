<?php
// Ensure no whitespace or errors are output before our JSON
ob_start();

// Set headers for JSON response
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Error handling
error_reporting(E_ALL);
ini_set('display_errors', 0); // Don't display errors to the client
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../../logs/php-errors.log');

// Global error handler to catch all errors
function exception_error_handler($severity, $message, $file, $line) {
    if (!(error_reporting() & $severity)) {
        // This error code is not included in error_reporting
        return;
    }
    error_log("PHP Error [$severity]: $message in $file on line $line");
    // Convert all errors to ErrorExceptions
    throw new ErrorException($message, 0, $severity, $file, $line);
}
set_error_handler("exception_error_handler");

try {
    // Make sure database connection is available
    require_once '../db/config.php';
    if (!isset($conn) || !$conn) {
        throw new Exception("Database connection failed");
    }
    
    require_once __DIR__ . '/chess-helper.php';

    // Get request data
    $postData = file_get_contents("php://input");
    if (empty($postData)) {
        throw new Exception("No data received in request");
    }
    
    // Log raw input for debugging
    error_log("Raw input: " . $postData);
    
    $data = json_decode($postData, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Invalid JSON received: " . json_last_error_msg());
    }
    
    // Log the received data for debugging
    error_log("Received update request: " . print_r($data, true));
    
    // Validate required fields
    if (!isset($data['bank_id']) || !isset($data['question_id']) || !isset($data['position'])) {
        throw new Exception("Missing required fields");
    }
    
    $bankId = intval($data['bank_id']);
    $questionId = intval($data['question_id']);
    $position = $data['position'];
    $questionText = isset($data['question_text']) ? $data['question_text'] : 'Chess Position';
    $correctAnswer = isset($data['correct_answer']) ? $data['correct_answer'] : 'See Solution';
    $questionOrder = isset($data['question_order']) ? intval($data['question_order']) : 0;
    
    // Get algebraic_notation and move_sequence from their own fields
    $algebraicNotation = isset($data['algebraic_notation']) ? $data['algebraic_notation'] : '';
    $moveSequence = isset($data['move_sequence']) ? $data['move_sequence'] : '[]';
    
    // Parse the position JSON safely
    try {
        $positionData = json_decode($position, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception("Failed to decode position data: " . json_last_error_msg());
        }
    } catch (Exception $e) {
        error_log("Position decoding error: " . $e->getMessage() . ", Position: " . $position);
        throw new Exception("Invalid position data: " . $e->getMessage());
    }
    
    // Validate position data - should only contain FEN strings now
    if (!isset($positionData['starting_fen']) || !isset($positionData['solution_fen'])) {
        throw new Exception("Invalid position data format - missing required FEN strings");
    }
    
    // Log the values we're updating
    error_log("Updating question $questionId with:");
    error_log("Starting FEN: " . $positionData['starting_fen']);
    error_log("Solution FEN: " . $positionData['solution_fen']);
    error_log("Algebraic notation: $algebraicNotation");
    error_log("Move sequence: $moveSequence");
    
    // Verify the question exists
    try {
        $checkSql = "SELECT id, is_active FROM questions WHERE id = :question_id AND bank_id = :bank_id";
        $checkStmt = $conn->prepare($checkSql);
        $checkStmt->bindParam(':question_id', $questionId, PDO::PARAM_INT);
        $checkStmt->bindParam(':bank_id', $bankId, PDO::PARAM_INT);
        $checkStmt->execute();
        
        if ($checkStmt->rowCount() === 0) {
            throw new Exception("Question not found or doesn't belong to the specified bank");
        }
        
        $question = $checkStmt->fetch(PDO::FETCH_ASSOC);
        $isActive = $question['is_active'];
    } catch (PDOException $e) {
        error_log("Database error checking question: " . $e->getMessage());
        throw new Exception("Database error: " . $e->getMessage());
    }
    
    // Get question order if needed
    if ($questionOrder === 0) {
        try {
            $orderSql = "SELECT question_order FROM questions WHERE id = :question_id";
            $orderStmt = $conn->prepare($orderSql);
            $orderStmt->bindParam(':question_id', $questionId, PDO::PARAM_INT);
            $orderStmt->execute();
            $orderRow = $orderStmt->fetch(PDO::FETCH_ASSOC);
            $questionOrder = $orderRow['question_order'];
        } catch (PDOException $e) {
            error_log("Database error getting question order: " . $e->getMessage());
            // Don't throw here, just use 0 as fallback
            $questionOrder = 0;
        }
    }
    
    // Log the values we're about to update
    error_log("Updating question $questionId with text: $questionText, answer: $correctAnswer, order: $questionOrder");
    error_log("Algebraic notation: $algebraicNotation, Move sequence: $moveSequence");
    
    // Update the question
    try {
        $sql = "UPDATE questions 
                SET question_text = :question_text, 
                    correct_answer = :correct_answer, 
                    position = :position, 
                    question_order = :question_order, 
                    algebraic_notation = :algebraic_notation, 
                    move_sequence = :move_sequence 
                WHERE id = :question_id AND bank_id = :bank_id";
        
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':question_text', $questionText, PDO::PARAM_STR);
        $stmt->bindParam(':correct_answer', $correctAnswer, PDO::PARAM_STR);
        $stmt->bindParam(':position', $position, PDO::PARAM_STR);
        $stmt->bindParam(':question_order', $questionOrder, PDO::PARAM_INT);
        $stmt->bindParam(':algebraic_notation', $algebraicNotation, PDO::PARAM_STR);
        $stmt->bindParam(':move_sequence', $moveSequence, PDO::PARAM_STR);
        $stmt->bindParam(':question_id', $questionId, PDO::PARAM_INT);
        $stmt->bindParam(':bank_id', $bankId, PDO::PARAM_INT);
        
        if (!$stmt->execute()) {
            $errorInfo = $stmt->errorInfo();
            throw new Exception("Database error: " . implode(", ", $errorInfo));
        }
        
        // Return the updated question
        $response = [
            'success' => true,
            'message' => 'Question updated successfully',
            'question' => [
                'id' => $questionId,
                'fen' => $positionData['starting_fen'],
                'solutionFen' => $positionData['solution_fen'],
                'order' => $questionOrder,
                'is_active' => $isActive ? true : false,
                'algebraicNotation' => $algebraicNotation,
                'moveSequence' => $moveSequence
            ]
        ];
        
        // Clear any buffered output before sending response
        if (ob_get_length()) ob_end_clean();
        
        echo json_encode($response);
        error_log("Success response sent: " . json_encode($response));
    } catch (PDOException $e) {
        error_log("Database error updating question: " . $e->getMessage());
        throw new Exception("Database error: " . $e->getMessage());
    }
    
} catch (Exception $e) {
    error_log("Error in update-question.php: " . $e->getMessage());
    
    // Clear any buffered output before sending error response
    if (ob_get_length()) ob_end_clean();
    
    $response = [
        'success' => false,
        'message' => $e->getMessage()
    ];
    
    echo json_encode($response);
    error_log("Error response sent: " . json_encode($response));
}
?> 