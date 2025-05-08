<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Start or resume the session
session_start();

// Include database configuration
require_once '../db/config.php';

// Set CORS headers
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Check if user is logged in and is an admin
if (!isset($_SESSION['user_id']) || !isset($_SESSION['is_admin']) || $_SESSION['is_admin'] !== true) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Unauthorized. Admin access required.']);
    exit();
}

// Handle POST request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get JSON data from request body
    $json_data = file_get_contents('php://input');
    $data = json_decode($json_data, true);
    
    // Validate required fields
    if (!isset($data['title']) || empty($data['title']) || 
        !isset($data['puzzles']) || empty($data['puzzles']) ||
        !isset($data['duration_minutes']) || 
        !isset($data['user_groups']) || empty($data['user_groups'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing required fields']);
        exit();
    }
    
    try {
        // Begin transaction
        $pdo->beginTransaction();
        
        // Insert quiz into database
        $stmt = $pdo->prepare("
            INSERT INTO quizzes (title, description, scheduled_date, duration_minutes, created_by, status) 
            VALUES (:title, :description, :scheduled_date, :duration_minutes, :created_by, :status)
        ");
        
        $stmt->execute([
            ':title' => $data['title'],
            ':description' => $data['description'] ?? '',
            ':scheduled_date' => $data['scheduled_date'] ?? null,
            ':duration_minutes' => $data['duration_minutes'],
            ':created_by' => $_SESSION['user_id'],
            ':status' => $data['status'] ?? 'Draft'
        ]);
        
        $quiz_id = $pdo->lastInsertId();
        
        // Insert puzzle associations
        $puzzle_stmt = $pdo->prepare("
            INSERT INTO quiz_puzzles (quiz_id, puzzle_id, position) 
            VALUES (:quiz_id, :puzzle_id, :position)
        ");
        
        foreach ($data['puzzles'] as $index => $puzzle_id) {
            $puzzle_stmt->execute([
                ':quiz_id' => $quiz_id,
                ':puzzle_id' => $puzzle_id,
                ':position' => $index + 1
            ]);
        }
        
        // Insert user group associations
        $group_stmt = $pdo->prepare("
            INSERT INTO quiz_user_groups (quiz_id, group_id) 
            VALUES (:quiz_id, :group_id)
        ");
        
        foreach ($data['user_groups'] as $group_id) {
            $group_stmt->execute([
                ':quiz_id' => $quiz_id,
                ':group_id' => $group_id
            ]);
        }
        
        // Commit transaction
        $pdo->commit();
        
        // Return success response
        echo json_encode([
            'success' => true, 
            'message' => 'Quiz created successfully',
            'quiz_id' => $quiz_id
        ]);
        
    } catch (PDOException $e) {
        // Rollback transaction on error
        $pdo->rollBack();
        
        http_response_code(500);
        echo json_encode([
            'success' => false, 
            'message' => 'Database error: ' . $e->getMessage()
        ]);
    }
} else {
    // Method not allowed
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?> 