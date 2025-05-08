<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../../config/database.php';

try {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['student_id'])) {
        throw new Exception("Missing student_id parameter");
    }
    
    $studentId = (int)$data['student_id'];
    
    // Clear any previously displayed responses
    $clearQuery = "UPDATE displayed_responses SET is_displayed = 0";
    mysqli_query($conn, $clearQuery);
    
    // Set the new response to be displayed
    $query = "INSERT INTO displayed_responses (student_id, is_displayed, display_timestamp) 
              VALUES (?, 1, NOW())
              ON DUPLICATE KEY UPDATE is_displayed = 1, display_timestamp = NOW()";
    
    $stmt = mysqli_prepare($conn, $query);
    mysqli_stmt_bind_param($stmt, 'i', $studentId);
    
    if (mysqli_stmt_execute($stmt)) {
        // Get student response details
        $responseQuery = "SELECT s.name, sr.answer, sr.submitted_at, sr.is_correct
                         FROM students s
                         JOIN student_responses sr ON s.id = sr.student_id
                         WHERE s.id = ?";
        
        $responseStmt = mysqli_prepare($conn, $responseQuery);
        mysqli_stmt_bind_param($responseStmt, 'i', $studentId);
        mysqli_stmt_execute($responseStmt);
        $result = mysqli_stmt_get_result($responseStmt);
        $response = mysqli_fetch_assoc($result);
        
        echo json_encode([
            'success' => true,
            'student_id' => $studentId,
            'response' => $response
        ]);
    } else {
        throw new Exception("Failed to update displayed response");
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

mysqli_close($conn);
?> 