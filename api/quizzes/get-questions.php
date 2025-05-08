<?php
require_once '../db/config.php';
header('Content-Type: application/json');

// Get the bank_id from the request
$bank_id = isset($_GET['bank_id']) ? intval($_GET['bank_id']) : 0;

if ($bank_id <= 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid bank ID']);
    exit;
}

try {
    // Create a database connection
    $conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);
    
    // Check connection
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }
    
    // Prepare the SQL query to get questions from a bank, now ordered by question_order
    $sql = "SELECT id, question_text, correct_answer, position, question_order
            FROM questions
            WHERE bank_id = ?
            ORDER BY question_order ASC"; // Order by the new field
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $bank_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $questions = [];
    
    // Fetch the questions
    while ($row = $result->fetch_assoc()) {
        $questions[] = [
            'id' => $row['id'],
            'question_text' => $row['question_text'],
            'correct_answer' => $row['correct_answer'],
            'position' => $row['position'] ?: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', // Default FEN if empty
            'question_order' => $row['question_order'] // Include the new field
        ];
    }
    
    $stmt->close();
    $conn->close();
    
    // Return the questions as JSON
    echo json_encode(['success' => true, 'questions' => $questions]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?> 