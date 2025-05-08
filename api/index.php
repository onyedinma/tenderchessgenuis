<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Allow cross-origin requests
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Log the request for debugging
$request_uri = $_SERVER['REQUEST_URI'] ?? 'No REQUEST_URI';
$request_method = $_SERVER['REQUEST_METHOD'] ?? 'No REQUEST_METHOD';
$content_type = $_SERVER['CONTENT_TYPE'] ?? 'No CONTENT_TYPE';
$query_string = $_SERVER['QUERY_STRING'] ?? 'No QUERY_STRING';

error_log("API Request: $request_method $request_uri");
error_log("Query String: $query_string");
error_log("Content Type: $content_type");

// Check database connection
$dbStatus = false;
$dbError = '';
try {
    require_once 'db/config.php';
    if (isset($pdo)) {
        $dbStatus = true;
    }
} catch (Exception $e) {
    $dbError = $e->getMessage();
}

// If the path is just /api/, show API info
$apiBaseEndpoints = [
    'auth' => [
        'login' => '/api/auth/login.php',
        'student-login' => '/api/auth/student-login.php',
        'register' => '/api/auth/register.php',
        'logout' => '/api/auth/logout.php',
        'check-session' => '/api/auth/check-session.php'
    ],
    'quizzes' => [
        'list' => '/api/quizzes/get-quizzes.php',
        'single' => '/api/quizzes/get-quiz.php?id={id}',
        'submit' => '/api/quizzes/submit-quiz.php',
        'results' => '/api/quizzes/get-results.php?id={id}'
    ]
];

// Get available auth endpoints
$authEndpoints = [];
if (is_dir(__DIR__ . '/auth')) {
    $files = scandir(__DIR__ . '/auth');
    foreach ($files as $file) {
        if (is_file(__DIR__ . '/auth/' . $file) && pathinfo($file, PATHINFO_EXTENSION) === 'php') {
            $authEndpoints[] = '/api/auth/' . $file;
        }
    }
}

// Get available quiz endpoints
$quizEndpoints = [];
if (is_dir(__DIR__ . '/quizzes')) {
    $files = scandir(__DIR__ . '/quizzes');
    foreach ($files as $file) {
        if (is_file(__DIR__ . '/quizzes/' . $file) && pathinfo($file, PATHINFO_EXTENSION) === 'php') {
            $quizEndpoints[] = '/api/quizzes/' . $file;
        }
    }
}

// Server information
$serverInfo = [
    'php_version' => phpversion(),
    'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
    'document_root' => $_SERVER['DOCUMENT_ROOT'] ?? 'Unknown',
    'script_filename' => $_SERVER['SCRIPT_FILENAME'] ?? 'Unknown'
];

// Return API info
echo json_encode([
    'message' => 'Chess Quiz Application API',
    'version' => '1.0.0',
    'status' => 'active',
    'timestamp' => date('Y-m-d H:i:s'),
    'database' => [
        'connected' => $dbStatus,
        'error' => $dbError
    ],
    'server' => $serverInfo,
    'configured_endpoints' => $apiBaseEndpoints,
    'available_auth_endpoints' => $authEndpoints,
    'available_quiz_endpoints' => $quizEndpoints,
    'request' => [
        'method' => $request_method,
        'uri' => $request_uri,
        'query_string' => $query_string
    ]
]);
?> 