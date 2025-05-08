<?php
// Simple file to test API path
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Enable error reporting
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Test accessing other API endpoints
$endpoints = [
    'auth/check-session.php',
    'auth/simple-check.php'
];

$results = [];

foreach ($endpoints as $endpoint) {
    $url = "http://{$_SERVER['HTTP_HOST']}/api/$endpoint";
    
    $results[$endpoint] = [
        'url' => $url,
        'exists' => file_exists(__DIR__ . '/' . $endpoint)
    ];
    
    if ($results[$endpoint]['exists']) {
        $results[$endpoint]['stats'] = stat(__DIR__ . '/' . $endpoint);
    }
}

echo json_encode([
    'status' => 'success',
    'message' => 'API accessible',
    'path_info' => [
        'requested_uri' => $_SERVER['REQUEST_URI'] ?? 'unknown',
        'script_name' => $_SERVER['SCRIPT_NAME'] ?? 'unknown',
        'document_root' => $_SERVER['DOCUMENT_ROOT'] ?? 'unknown',
        'server_name' => $_SERVER['SERVER_NAME'] ?? 'unknown',
        'server_port' => $_SERVER['SERVER_PORT'] ?? 'unknown',
        'api_dir' => __DIR__
    ],
    'endpoints' => $results,
    'timestamp' => date('Y-m-d H:i:s')
]);
?> 