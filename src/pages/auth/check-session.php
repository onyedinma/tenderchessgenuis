<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Log access for debugging
error_log("src/pages/auth/check-session.php accessed - " . date('Y-m-d H:i:s'));
error_log("Request URI: " . ($_SERVER['REQUEST_URI'] ?? 'none'));
error_log("Request Method: " . ($_SERVER['REQUEST_METHOD'] ?? 'none'));

// Start session
session_start();

// Get the requesting origin
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
$allowed_origins = ['http://localhost:3000', 'http://localhost', 'http://localhost:80'];

// Allow access from any origin during development
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Log the request for debugging
$session_data = isset($_SESSION) ? json_encode($_SESSION) : 'No session';
error_log("check-session.php accessed from SRC directory. Session data: $session_data");
error_log("Session ID: " . session_id());

// Check if user is logged in by checking session variables
if (isset($_SESSION['user_id']) && isset($_SESSION['user_email'])) {
    // Convert user groups to required format if available
    $groups = [];
    if (isset($_SESSION['user_groups']) && is_array($_SESSION['user_groups'])) {
        foreach ($_SESSION['user_groups'] as $group) {
            if (is_array($group) && isset($group['id']) && isset($group['name'])) {
                $groups[] = $group;
            } else if (is_string($group)) {
                // Convert string group to object with id and name
                $groups[] = [
                    'id' => count($groups) + 1, // Generate an ID
                    'name' => $group
                ];
            }
        }
    }
    
    // User is logged in, return user data
    echo json_encode([
        'success' => true,
        'isLoggedIn' => true,
        'user' => [
            'id' => $_SESSION['user_id'],
            'name' => $_SESSION['user_name'] ?? '',
            'email' => $_SESSION['user_email'],
            'role' => $_SESSION['user_role'] ?? 'user',
            'roles' => $_SESSION['user_roles'] ?? ['user'],
            'isAdmin' => isset($_SESSION['is_admin']) ? (bool)$_SESSION['is_admin'] : false,
            'groups' => $groups
        ]
    ]);
} else {
    // User is not logged in
    echo json_encode([
        'success' => true,
        'isLoggedIn' => false,
        'debug' => [
            'sessionId' => session_id(),
            'sessionActive' => session_status() === PHP_SESSION_ACTIVE,
            'timestamp' => date('Y-m-d H:i:s'),
            'serverInfo' => [
                'php_version' => phpversion(),
                'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
                'document_root' => $_SERVER['DOCUMENT_ROOT'] ?? 'Unknown',
                'request_uri' => $_SERVER['REQUEST_URI'] ?? 'Unknown'
            ]
        ]
    ]);
}
?> 