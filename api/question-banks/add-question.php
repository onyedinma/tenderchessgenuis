<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/../db/config.php';
require_once __DIR__ . '/chess-helper.php'; // Include the chess helper functions

try {
    // Get request data
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Validate required fields
    if (!isset($data['bank_id']) || !isset($data['position'])) {
        throw new Exception("Missing required fields");
    }
    
    $bankId = intval($data['bank_id']);
    $position = $data['position'];
    $questionText = isset($data['question_text']) ? $data['question_text'] : 'Chess Position';
    $questionOrder = isset($data['question_order']) ? intval($data['question_order']) : 0;
    
    // Parse the position JSON
    $positionData = json_decode($position, true);
    if (!isset($positionData['starting_fen']) || !isset($positionData['solution_fen'])) {
        throw new Exception("Invalid position data format");
    }
    
    // Auto-generate correct answer if not provided
    if (!isset($data['correct_answer']) || empty($data['correct_answer'])) {
        $correctAnswer = generateMoveAnswer($positionData['starting_fen'], $positionData['solution_fen']);
    } else {
        $correctAnswer = $data['correct_answer'];
    }
    
    // The database connection is already established in config.php and stored in $conn (which is an alias for $pdo)
    
    // Verify the bank exists
    $bankCheckSql = "SELECT id, section_type FROM question_banks WHERE id = :bank_id";
    $bankCheckStmt = $conn->prepare($bankCheckSql);
    $bankCheckStmt->bindParam(':bank_id', $bankId, PDO::PARAM_INT);
    $bankCheckStmt->execute();
    
    if ($bankCheckStmt->rowCount() === 0) {
        throw new Exception("Question bank not found");
    }
    
    $bank = $bankCheckStmt->fetch();
    
    // If question_order is 0 or not specified, set it to the next available order
    if ($questionOrder === 0) {
        $orderSql = "SELECT MAX(question_order) AS max_order FROM questions WHERE bank_id = :bank_id";
        $orderStmt = $conn->prepare($orderSql);
        $orderStmt->bindParam(':bank_id', $bankId, PDO::PARAM_INT);
        $orderStmt->execute();
        $row = $orderStmt->fetch();
        $questionOrder = ($row['max_order'] !== null) ? $row['max_order'] + 1 : 1;
    }
    
    // Insert the question
    $sql = "INSERT INTO questions (bank_id, question_text, correct_answer, position, question_order, is_active) 
            VALUES (:bank_id, :question_text, :correct_answer, :position, :question_order, 1)";
    
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':bank_id', $bankId, PDO::PARAM_INT);
    $stmt->bindParam(':question_text', $questionText, PDO::PARAM_STR);
    $stmt->bindParam(':correct_answer', $correctAnswer, PDO::PARAM_STR);
    $stmt->bindParam(':position', $position, PDO::PARAM_STR);
    $stmt->bindParam(':question_order', $questionOrder, PDO::PARAM_INT);
    
    if ($stmt->execute()) {
        $questionId = $conn->lastInsertId();
        
        // Create a move object for additional details
        $moveDetails = detectMove($positionData['starting_fen'], $positionData['solution_fen']);
        
        // Return the newly created question
        echo json_encode([
            'success' => true,
            'message' => 'Question added successfully',
            'question' => [
                'id' => (int)$questionId,
                'fen' => $positionData['starting_fen'],
                'solutionFen' => $positionData['solution_fen'],
                'order' => $questionOrder,
                'is_active' => true,
                'correctAnswer' => $correctAnswer,
                'moveDetails' => $moveDetails
            ]
        ]);
    } else {
        throw new Exception("Error adding question: " . implode(', ', $stmt->errorInfo()));
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?> 