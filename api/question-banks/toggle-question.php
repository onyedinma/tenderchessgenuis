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
    if (!isset($data['bank_id']) || !isset($data['question_id']) || !isset($data['is_active'])) {
        throw new Exception("Missing required fields");
    }
    
    $bankId = intval($data['bank_id']);
    $questionId = intval($data['question_id']);
    $isActive = $data['is_active'] ? 1 : 0;
    
    // Create database connection
    $conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);
    
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }
    
    // Verify the question exists and belongs to the specified bank
    $checkSql = "SELECT id FROM questions WHERE id = ? AND bank_id = ?";
    $checkStmt = $conn->prepare($checkSql);
    $checkStmt->bind_param("ii", $questionId, $bankId);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();
    
    if ($checkResult->num_rows === 0) {
        throw new Exception("Question not found or doesn't belong to the specified bank");
    }
    
    $checkStmt->close();
    
    // Update the question's active status
    $sql = "UPDATE questions SET is_active = ? WHERE id = ? AND bank_id = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("iii", $isActive, $questionId, $bankId);
    
    if ($stmt->execute()) {
        // Return success response
        echo json_encode([
            'success' => true,
            'message' => 'Question status updated successfully',
            'is_active' => $isActive ? true : false
        ]);
    } else {
        throw new Exception("Error updating question status: " . $stmt->error);
    }
    
    $stmt->close();
    $conn->close();
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?> 