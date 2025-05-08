<?php
// This is a direct session check file without using the session.php include
// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Log access for debugging
error_log("direct-check.php accessed - " . date('Y-m-d H:i:s'));
error_log("REQUEST_URI: " . ($_SERVER['REQUEST_URI'] ?? 'undefined'));
error_log("SCRIPT_NAME: " . ($_SERVER['SCRIPT_NAME'] ?? 'undefined'));

// Start session directly
session_start();

// Set CORS headers directly
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Log the session data for debugging
$session_data = isset($_SESSION) ? json_encode($_SESSION) : 'No session';
error_log("direct-check.php - Session data: $session_data");

// Check if user is logged in directly
if (isset($_SESSION['user_id']) && !empty($_SESSION['user_id'])) {
    // User is logged in, return user data
    echo json_encode([
        'loggedIn' => true,
        'method' => 'direct',
        'file_path' => __FILE__,
        'user' => [
            'id' => $_SESSION['user_id'],
            'name' => $_SESSION['user_name'] ?? '',
            'email' => $_SESSION['user_email'] ?? '',
            'isAdmin' => $_SESSION['is_admin'] ?? false,
            'roles' => $_SESSION['user_roles'] ?? []
        ]
    ]);
} else {
    // User is not logged in
    echo json_encode([
        'loggedIn' => false,
        'method' => 'direct',
        'file_path' => __FILE__,
        'message' => 'User not logged in'
    ]);
}
?> 