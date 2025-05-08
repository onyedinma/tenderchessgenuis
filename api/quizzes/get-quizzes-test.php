<?php
// Simplified version of get-quizzes.php for debugging
// No authentication required to test access

// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Log access
error_log("get-quizzes-test.php accessed - " . date('Y-m-d H:i:s'));

// Set headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // Create sample quiz data
    $quizzes = [
        [
            'id' => 1,
            'title' => 'TEST - Chess Basics Quiz',
            'description' => 'Test your knowledge of basic chess rules and moves.',
            'questions_count' => 10,
            'time_limit' => 15,
            'category' => 'Basics',
            'created_at' => '2023-08-15'
        ],
        [
            'id' => 2,
            'title' => 'TEST - Chess Openings',
            'description' => 'Learn about different chess openings and strategies.',
            'questions_count' => 15,
            'time_limit' => 20,
            'category' => 'Openings',
            'created_at' => '2023-08-20'
        ]
    ];
    
    // Return quiz data
    echo json_encode([
        'success' => true,
        'message' => 'This is the test endpoint without authentication',
        'quizzes' => $quizzes
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?> 