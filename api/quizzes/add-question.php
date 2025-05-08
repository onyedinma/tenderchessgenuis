<?php
require_once '../db/config.php';
header('Content-Type: application/json');

// Get data from POST request
$data = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (!isset($data['bank_id']) || !isset($data['question_text']) || 
    !isset($data['correct_answer']) || !isset($data['position'])) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

$bank_id = intval($data['bank_id']);
$question_text = $data['question_text'];
$correct_answer = $data['correct_answer'];
$position = $data['position'];
$question_order = isset($data['question_order']) ? intval($data['question_order']) : 0;

// If question_order is 0 or not specified, set it to the next available order
$auto_order = ($question_order === 0);

try {
    // Create database connection
    $conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);
    
    // Check connection
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }
    
    // If auto-ordering, find the next available order value
    if ($auto_order) {
        $orderSql = "SELECT MAX(question_order) AS max_order FROM questions WHERE bank_id = ?";
        $orderStmt = $conn->prepare($orderSql);
        $orderStmt->bind_param("i", $bank_id);
        $orderStmt->execute();
        $orderResult = $orderStmt->get_result();
        $row = $orderResult->fetch_assoc();
        $question_order = ($row['max_order'] !== null) ? $row['max_order'] + 1 : 1;
        $orderStmt->close();
    }
    
    // Insert the new question including question_order
    $sql = "INSERT INTO questions (bank_id, question_text, correct_answer, position, question_order) 
            VALUES (?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("isssi", $bank_id, $question_text, $correct_answer, $position, $question_order);
    
    if ($stmt->execute()) {
        $question_id = $conn->insert_id;
        $stmt->close();
        $conn->close();
        
        echo json_encode([
            'success' => true, 
            'message' => 'Question added successfully',
            'question_id' => $question_id,
            'question_order' => $question_order
        ]);
    } else {
        throw new Exception("Error adding question: " . $stmt->error);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?> 