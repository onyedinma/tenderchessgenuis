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
    if (!isset($data['id'])) {
        throw new Exception("Missing student ID");
    }
    
    $studentId = intval($data['id']);
    
    // Create database connection
    $conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);
    
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }
    
    // Check if student exists
    $checkSql = "SELECT photo_path FROM students WHERE id = ?";
    $checkStmt = $conn->prepare($checkSql);
    $checkStmt->bind_param("i", $studentId);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();
    
    if ($checkResult->num_rows === 0) {
        throw new Exception("Student not found");
    }
    
    // Get photo path to delete if exists
    $row = $checkResult->fetch_assoc();
    $photoPath = $row['photo_path'];
    
    // Start transaction
    $conn->begin_transaction();
    
    // Delete student
    $sql = "DELETE FROM students WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $studentId);
    
    if ($stmt->execute()) {
        // Commit transaction
        $conn->commit();
        
        // Delete photo file if exists
        if ($photoPath && file_exists('../../' . $photoPath)) {
            unlink('../../' . $photoPath);
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'Student deleted successfully'
        ]);
    } else {
        // Rollback transaction
        $conn->rollback();
        throw new Exception("Error deleting student: " . $stmt->error);
    }
    
    $stmt->close();
    $conn->close();
    
} catch (Exception $e) {
    // Ensure rollback if connection exists and is active
    if (isset($conn) && $conn->connect_errno === 0) {
        $conn->rollback();
    }
    
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?> 