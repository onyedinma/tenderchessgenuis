<?php
// Common session configuration for all API endpoints

// Log debug information
error_log("Session file loaded - " . date('Y-m-d H:i:s'));
error_log("Current session ID before starting: " . (session_id() ? session_id() : 'None'));

// Set session cookie parameters before starting the session
// This helps ensure cookies work properly across subdomains if needed
session_set_cookie_params([
    'lifetime' => 86400, // 24 hours
    'path' => '/',
    'domain' => '', // Use the current domain
    'secure' => false, // Set to true in production with HTTPS
    'httponly' => true, // Prevent JavaScript access to the cookie
    'samesite' => 'Lax' // Allows cookies to be sent in top-level navigations
]);

// Check if a session cookie exists and verify it
if (isset($_COOKIE[session_name()])) {
    error_log("Session cookie exists: " . $_COOKIE[session_name()]);
    
    // Start the session with the existing cookie
    session_id($_COOKIE[session_name()]);
} else {
    error_log("No session cookie found");
}

// Start or resume session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
    error_log("Session started - New ID: " . session_id());
}

// Set security headers
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');

// Get the requesting origin for CORS
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
$allowed_origins = ['http://localhost:3000', 'http://localhost', 'http://localhost:80'];

// Set CORS headers
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    // Default to development server if origin not in allowed list
    header("Access-Control-Allow-Origin: http://localhost:3000");
}
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Log session info for debugging
error_log("Session file: session.php accessed - " . date('Y-m-d H:i:s'));
error_log("Session ID after initialization: " . session_id());
error_log("Request Method: " . ($_SERVER['REQUEST_METHOD'] ?? 'none'));
error_log("Request URI: " . ($_SERVER['REQUEST_URI'] ?? 'none'));

// Debug session data if available
if (!empty($_SESSION)) {
    error_log("Session data: " . json_encode($_SESSION));
}

// Common function to check if user is logged in
function isLoggedIn() {
    return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
}

// Common function to check if student is logged in
function isStudentLoggedIn() {
    // More detailed logging to help debug issues
    if (isset($_SESSION['student_id'])) {
        error_log("isStudentLoggedIn: student_id exists: " . $_SESSION['student_id']);
    } else {
        error_log("isStudentLoggedIn: student_id NOT SET");
    }
    
    if (isset($_SESSION['is_student'])) {
        error_log("isStudentLoggedIn: is_student flag: " . ($_SESSION['is_student'] ? 'true' : 'false'));
    } else {
        error_log("isStudentLoggedIn: is_student flag NOT SET");
    }
    
    return isset($_SESSION['student_id']) && 
           !empty($_SESSION['student_id']) && 
           isset($_SESSION['is_student']) && 
           $_SESSION['is_student'] === true;
}

// Common function to check if any type of user is logged in (admin or student)
function isAnyUserLoggedIn() {
    return isLoggedIn() || isStudentLoggedIn();
}

// Common function to require login
function requireLogin() {
    if (!isLoggedIn()) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Authentication required']);
        exit;
    }
}

// Common function to require student login
function requireStudentLogin() {
    if (!isStudentLoggedIn()) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Student authentication required']);
        exit;
    }
}
?> 