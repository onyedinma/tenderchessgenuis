<?php
// Enable error reporting
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Log each access to this file
error_log("simple-check.php accessed at " . date('Y-m-d H:i:s'));
error_log("REQUEST_URI: " . ($_SERVER['REQUEST_URI'] ?? 'undefined'));
error_log("SCRIPT_NAME: " . ($_SERVER['SCRIPT_NAME'] ?? 'undefined'));

// Allow all cross-origin requests for testing
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Don't try to access database or session, just return a simple response
echo json_encode([
    'success' => true,
    'message' => 'Auth API is accessible',
    'file_path' => __FILE__,
    'timestamp' => date('Y-m-d H:i:s'),
    'server_info' => [
        'php_version' => phpversion(),
        'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
        'request_uri' => $_SERVER['REQUEST_URI'] ?? 'Unknown',
        'script_filename' => $_SERVER['SCRIPT_FILENAME'] ?? 'Unknown'
    ]
]);
?> 