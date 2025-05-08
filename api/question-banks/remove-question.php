<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../db/config.php';

try {
    // Get request data
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Validate required fields
    if (!isset($data['bank_id']) || !isset($data['question_id'])) {
        throw new Exception("Missing required fields");
    }
    
    $bankId = intval($data['bank_id']);
    $questionId = intval($data['question_id']);
    
    // Create database connection
    $conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);
    
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }
    
    // Verify the question exists and belongs to the specified bank
    $checkSql = "SELECT id, question_order FROM questions WHERE id = ? AND bank_id = ?";
    $checkStmt = $conn->prepare($checkSql);
    $checkStmt->bind_param("ii", $questionId, $bankId);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();
    
    if ($checkResult->num_rows === 0) {
        throw new Exception("Question not found or doesn't belong to the specified bank");
    }
    
    $questionData = $checkResult->fetch_assoc();
    $questionOrder = $questionData['question_order'];
    $checkStmt->close();
    
    // Start a transaction to ensure database consistency
    $conn->begin_transaction();
    
    // Delete the question
    $sql = "DELETE FROM questions WHERE id = ? AND bank_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $questionId, $bankId);
    
    if (!$stmt->execute()) {
        $conn->rollback();
        throw new Exception("Error deleting question: " . $stmt->error);
    }
    
    $stmt->close();
    
    // Update the order of the remaining questions to maintain sequence
    $updateOrderSql = "UPDATE questions 
                      SET question_order = question_order - 1 
                      WHERE bank_id = ? AND question_order > ?";
    $updateOrderStmt = $conn->prepare($updateOrderSql);
    $updateOrderStmt->bind_param("ii", $bankId, $questionOrder);
    
    if (!$updateOrderStmt->execute()) {
        $conn->rollback();
        throw new Exception("Error updating question order: " . $updateOrderStmt->error);
    }
    
    $updateOrderStmt->close();
    
    // Commit the transaction
    $conn->commit();
    
    // Return success response
    echo json_encode([
        'success' => true,
        'message' => 'Question removed successfully'
    ]);
    
    $conn->close();
    
} catch (Exception $e) {
    // If transaction is active, roll it back
    if (isset($conn) && $conn->connect_error === false) {
        $conn->rollback();
        $conn->close();
    }
    
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?> 