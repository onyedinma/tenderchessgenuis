<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Log access for debugging
error_log("check-session.php accessed - " . date('Y-m-d H:i:s'));

// Include common session management
require_once 'session.php';

// Get the requesting origin
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
$allowed_origins = ['http://localhost:3000', 'http://localhost', 'http://localhost:80'];

// Set CORS headers
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    // If origin not in allowed list, default to the development server
    header("Access-Control-Allow-Origin: http://localhost:3000");
}
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Log session info
$session_data = isset($_SESSION) ? json_encode($_SESSION) : 'No session';
error_log("check-session.php - Session data: $session_data");
error_log("check-session.php - Session ID: " . session_id());
error_log("check-session.php - Cookie data: " . (isset($_COOKIE) ? json_encode($_COOKIE) : 'No cookies'));

// First, check if we have a student session
$studentLoggedIn = isStudentLoggedIn();
error_log("Student logged in check result: " . ($studentLoggedIn ? 'true' : 'false'));

// Then check if we have an admin session
$adminLoggedIn = isLoggedIn();
error_log("Admin logged in check result: " . ($adminLoggedIn ? 'true' : 'false'));

// Check if user is logged in
if ($adminLoggedIn) {
    // Admin is logged in, return user data
    error_log("check-session.php - Admin user logged in: ID " . $_SESSION['user_id']);
    
    echo json_encode([
        'loggedIn' => true,
        'user' => [
            'id' => $_SESSION['user_id'],
            'name' => $_SESSION['user_name'] ?? '',
            'email' => $_SESSION['user_email'] ?? '',
            'isAdmin' => $_SESSION['is_admin'] ?? false,
            'roles' => $_SESSION['user_roles'] ?? []
        ]
    ]);
} elseif ($studentLoggedIn) {
    // Student is logged in, return student data
    error_log("check-session.php - Student logged in: ID " . $_SESSION['student_id']);
    
    echo json_encode([
        'loggedIn' => true,
        'isStudent' => true,
        'student' => [
            'id' => $_SESSION['student_id'],
            'name' => $_SESSION['student_name'] ?? '',
            'username' => $_SESSION['student_username'] ?? '',
            'loginTime' => $_SESSION['login_time'] ?? time()
        ],
        'session_id' => session_id()
    ]);
} else {
    // No valid session found
    error_log("check-session.php - No valid session found");
    
    // Check session variables directly
    $hasStudentId = isset($_SESSION['student_id']);
    $hasIsStudent = isset($_SESSION['is_student']);
    $isStudentValue = $_SESSION['is_student'] ?? 'not set';
    
    error_log("Session inspection - has student_id: " . ($hasStudentId ? 'yes' : 'no'));
    error_log("Session inspection - has is_student: " . ($hasIsStudent ? 'yes' : 'no')); 
    error_log("Session inspection - is_student value: " . $isStudentValue);
    
    echo json_encode([
        'loggedIn' => false,
        'message' => 'User not logged in',
        'session_exists' => !empty($_SESSION),
        'session_id' => session_id()
    ]);
}
?> 