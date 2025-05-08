<?php
// Debug script to check the quizzes API endpoint
// Create a curl request to test the API directly

// Enable error reporting
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Get current session cookie if available
session_start();
$cookie = session_name() . '=' . session_id();

// Target URL to test
$api_url = 'http://localhost/tenderchessgenius/api/quizzes/get-quizzes.php';

echo "<h1>Quiz API Endpoint Debug</h1>";
echo "<p>Testing URL: $api_url</p>";
echo "<p>Current session ID: " . session_id() . "</p>";
echo "<p>Session data: <pre>" . print_r($_SESSION, true) . "</pre></p>";

// Initialize CURL
$ch = curl_init();

// Set curl options
curl_setopt($ch, CURLOPT_URL, $api_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_COOKIE, $cookie);

// Execute the request
$response = curl_exec($ch);
$info = curl_getinfo($ch);
$error = curl_error($ch);

// Display results
echo "<h2>Results</h2>";
echo "<p>HTTP Status Code: " . $info['http_code'] . "</p>";

if ($error) {
    echo "<p>Error: $error</p>";
} else {
    // Split header and body
    $header_size = $info['header_size'];
    $header = substr($response, 0, $header_size);
    $body = substr($response, $header_size);
    
    echo "<h3>Response Headers</h3>";
    echo "<pre>" . htmlspecialchars($header) . "</pre>";
    
    echo "<h3>Response Body</h3>";
    echo "<pre>" . htmlspecialchars($body) . "</pre>";
    
    // Try to decode JSON
    $json = json_decode($body, true);
    if ($json) {
        echo "<h3>Parsed JSON</h3>";
        echo "<pre>" . print_r($json, true) . "</pre>";
    }
}

// Close curl
curl_close($ch);
?> 