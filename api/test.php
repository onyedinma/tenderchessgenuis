<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Allow cross-origin requests during development
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

// Log the request
error_log("API Test endpoint accessed: " . $_SERVER['REQUEST_METHOD']);

// Return a simple JSON response
echo json_encode([
    'status' => 'success',
    'message' => 'API is working correctly',
    'timestamp' => date('Y-m-d H:i:s'),
    'server_data' => [
        'remote_addr' => $_SERVER['REMOTE_ADDR'],
        'http_user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'Not available',
        'request_uri' => $_SERVER['REQUEST_URI'],
        'request_method' => $_SERVER['REQUEST_METHOD'],
        'document_root' => $_SERVER['DOCUMENT_ROOT'],
        'script_filename' => $_SERVER['SCRIPT_FILENAME'],
    ]
]);
?> 