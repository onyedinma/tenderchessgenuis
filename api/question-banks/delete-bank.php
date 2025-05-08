<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/../db/config.php';

try {
    // Get request data
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Validate required fields
    if (!isset($data['id'])) {
        throw new Exception("Missing required field: id");
    }
    
    $bankId = intval($data['id']);
    
    // Create database connection
    $conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);
    
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }
    
    // Begin transaction
    $conn->begin_transaction();
    
    try {
        // Check if bank exists
        $checkSql = "SELECT id FROM question_banks WHERE id = ?";
        $checkStmt = $conn->prepare($checkSql);
        $checkStmt->bind_param("i", $bankId);
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();
        
        if ($checkResult->num_rows === 0) {
            throw new Exception("Question bank not found");
        }
        
        $checkStmt->close();
        
        // Delete all questions in the bank
        $deleteQuestionsSql = "DELETE FROM questions WHERE bank_id = ?";
        $deleteQuestionsStmt = $conn->prepare($deleteQuestionsSql);
        $deleteQuestionsStmt->bind_param("i", $bankId);
        $deleteQuestionsStmt->execute();
        $deleteQuestionsStmt->close();
        
        // Delete the bank
        $deleteBankSql = "DELETE FROM question_banks WHERE id = ?";
        $deleteBankStmt = $conn->prepare($deleteBankSql);
        $deleteBankStmt->bind_param("i", $bankId);
        $deleteBankStmt->execute();
        $deleteBankStmt->close();
        
        // Commit transaction
        $conn->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Question bank deleted successfully'
        ]);
    } catch (Exception $e) {
        // Rollback on error
        $conn->rollback();
        throw $e;
    }
    
    $conn->close();
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?> 