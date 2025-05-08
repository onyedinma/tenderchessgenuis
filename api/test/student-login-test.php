<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

echo json_encode([
    'test_name' => 'Student Login API Test',
    'timestamp' => date('Y-m-d H:i:s'),
    'step1' => 'Make a direct API call to test student login'
]);

// Test credentials
$username = 'student';
$password = 'password';

// Build request payload
$data = [
    'username' => $username,
    'password' => $password
];

// Initialize cURL session
$ch = curl_init('http://localhost/tenderchessgenius/api/auth/student-login.php');

// Set cURL options
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_COOKIEFILE, '');  // Use in-memory cookie jar
curl_setopt($ch, CURLOPT_COOKIEJAR, '');   // Save cookies to in-memory cookie jar

// Execute cURL request
$response = curl_exec($ch);
$info = curl_getinfo($ch);

// Get any error
$error = curl_error($ch);

// Close cURL session
curl_close($ch);

// Format response
$result = [
    'test_result' => [
        'http_code' => $info['http_code'],
        'total_time' => $info['total_time'],
        'url' => $info['url'],
        'request_size' => $info['request_size'],
        'request_headers' => [
            'Content-Type' => 'application/json',
            'Accept' => 'application/json'
        ],
        'request_body' => json_encode($data),
        'response' => $response ? json_decode($response, true) : null,
        'curl_error' => $error ?: null
    ]
];

// Output the result
echo json_encode($result, JSON_PRETTY_PRINT);
?> 