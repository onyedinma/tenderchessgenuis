<?php
require_once '../db/config.php';
header('Content-Type: application/json');

// Get data from POST request
$data = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (!isset($data['question_id']) || !isset($data['question_order'])) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

$question_id = intval($data['question_id']);
$new_order = intval($data['question_order']);
$bank_id = isset($data['bank_id']) ? intval($data['bank_id']) : 0;

try {
    // Create database connection
    $conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);
    
    // Check connection
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }
    
    // Start transaction
    $conn->begin_transaction();
    
    // If bank_id is not provided, get it from the question record
    if ($bank_id <= 0) {
        $bankSql = "SELECT bank_id FROM questions WHERE id = ?";
        $bankStmt = $conn->prepare($bankSql);
        $bankStmt->bind_param("i", $question_id);
        $bankStmt->execute();
        $bankResult = $bankStmt->get_result();
        
        if ($bankResult->num_rows === 0) {
            throw new Exception("Question not found");
        }
        
        $bankRow = $bankResult->fetch_assoc();
        $bank_id = $bankRow['bank_id'];
        $bankStmt->close();
    }
    
    // Get current order of the question
    $currentOrderSql = "SELECT question_order FROM questions WHERE id = ?";
    $currentOrderStmt = $conn->prepare($currentOrderSql);
    $currentOrderStmt->bind_param("i", $question_id);
    $currentOrderStmt->execute();
    $currentOrderResult = $currentOrderStmt->get_result();
    
    if ($currentOrderResult->num_rows === 0) {
        throw new Exception("Question not found");
    }
    
    $currentOrderRow = $currentOrderResult->fetch_assoc();
    $current_order = $currentOrderRow['question_order'];
    $currentOrderStmt->close();
    
    // If moving down (increasing order)
    if ($new_order > $current_order) {
        $updateOthersSql = "UPDATE questions SET question_order = question_order - 1 
                           WHERE bank_id = ? AND question_order > ? AND question_order <= ?";
        $updateOthersStmt = $conn->prepare($updateOthersSql);
        $updateOthersStmt->bind_param("iii", $bank_id, $current_order, $new_order);
        $updateOthersStmt->execute();
        $updateOthersStmt->close();
    } 
    // If moving up (decreasing order)
    else if ($new_order < $current_order) {
        $updateOthersSql = "UPDATE questions SET question_order = question_order + 1 
                           WHERE bank_id = ? AND question_order >= ? AND question_order < ?";
        $updateOthersStmt = $conn->prepare($updateOthersSql);
        $updateOthersStmt->bind_param("iii", $bank_id, $new_order, $current_order);
        $updateOthersStmt->execute();
        $updateOthersStmt->close();
    }
    
    // Update the question's order
    $updateSql = "UPDATE questions SET question_order = ? WHERE id = ?";
    $updateStmt = $conn->prepare($updateSql);
    $updateStmt->bind_param("ii", $new_order, $question_id);
    $updateStmt->execute();
    $updateStmt->close();
    
    // Commit transaction
    $conn->commit();
    $conn->close();
    
    echo json_encode([
        'success' => true, 
        'message' => 'Question order updated successfully'
    ]);
    
} catch (Exception $e) {
    // Rollback transaction on error
    if (isset($conn) && $conn->connect_errno === 0) {
        $conn->rollback();
        $conn->close();
    }
    
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?> 