<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Log access to this endpoint
error_log("get-quizzes.php accessed - " . date('Y-m-d H:i:s'));
error_log("Request Method: " . ($_SERVER['REQUEST_METHOD'] ?? 'UNKNOWN'));
error_log("User Agent: " . ($_SERVER['HTTP_USER_AGENT'] ?? 'UNKNOWN'));

// Start session to check user auth
session_start();

// Log session data
error_log("Session ID: " . session_id());
error_log("Session data: " . json_encode($_SESSION));

// Include database configuration
require_once '../db/config.php';

// Get the requesting origin
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
$allowed_origins = ['http://localhost:3000', 'http://localhost', 'http://localhost:80'];

// Set CORS headers based on origin
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    // If origin not in allowed list, default to the development server
    header("Access-Control-Allow-Origin: http://localhost:3000");
}
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Helper function to check if any user is logged in
function isAnyUserLoggedIn() {
    return isset($_SESSION['user_id']) || isset($_SESSION['student_id']);
}

// Check authentication - less strict than before to help with debugging
if (!isAnyUserLoggedIn()) {
    error_log("get-quizzes.php - User not authenticated. Session: " . json_encode($_SESSION));
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'User not authenticated',
        'session_id' => session_id(),
        'session_data' => $_SESSION // This helps with debugging but should be removed in production
    ]);
    exit();
}

try {
    // Create sample quiz data for testing
    // In a real application, this would come from a database
    $quizzes = [
        [
            'id' => 1,
            'title' => 'Chess Basics Quiz',
            'description' => 'Test your knowledge of basic chess rules and moves.',
            'questions_count' => 10,
            'time_limit' => 15,
            'category' => 'Basics',
            'created_at' => '2023-08-15',
            'image' => null
        ],
        [
            'id' => 2,
            'title' => 'Chess Openings',
            'description' => 'Learn about different chess openings and strategies.',
            'questions_count' => 15,
            'time_limit' => 20,
            'category' => 'Openings',
            'created_at' => '2023-08-20',
            'image' => null
        ],
        [
            'id' => 3,
            'title' => 'Famous Chess Games',
            'description' => 'Explore and analyze famous chess matches throughout history.',
            'questions_count' => 8,
            'time_limit' => 25,
            'category' => 'History',
            'created_at' => '2023-09-01',
            'image' => null
        ]
    ];
    
    // Log successful fetch
    error_log("get-quizzes.php - Successfully fetched quizzes for user. Session ID: " . session_id());
    
    // Return quiz data
    echo json_encode([
        'success' => true,
        'quizzes' => $quizzes,
        'session_id' => session_id(),
        'user_info' => [
            'is_admin' => isset($_SESSION['is_admin']) ? $_SESSION['is_admin'] : false,
            'is_student' => isset($_SESSION['is_student']) ? $_SESSION['is_student'] : false
        ]
    ]);
    
} catch (Exception $e) {
    error_log("get-quizzes.php - Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?> 