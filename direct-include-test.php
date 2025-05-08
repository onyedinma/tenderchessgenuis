<?php
// Direct include test to check for errors in the quizzes API file

// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

echo "<h1>Direct Include Test - Quizzes API</h1>";

// Start session
session_start();

echo "<h2>Current Session</h2>";
echo "<pre>" . print_r($_SESSION, true) . "</pre>";

// Create test session data
$_SESSION['test'] = true;
$_SESSION['student_id'] = 1;
$_SESSION['student_name'] = 'Test Student';
$_SESSION['is_student'] = true;

echo "<h2>Updated Session</h2>";
echo "<pre>" . print_r($_SESSION, true) . "</pre>";

// Try direct include
echo "<h2>Including get-quizzes.php file directly:</h2>";
echo "<div style='border: 1px solid #ddd; padding: 10px; background: #f9f9f9;'>";

// Capture output instead of displaying directly
ob_start();
try {
    // Include the file
    include_once('api/quizzes/get-quizzes.php');
} catch (Exception $e) {
    echo "Exception caught: " . $e->getMessage();
}
$output = ob_get_clean();

// Display the output
echo "<pre>" . htmlspecialchars($output) . "</pre>";
echo "</div>";

// Try file_get_contents approach
echo "<h2>Using file_get_contents to access API:</h2>";

$context = stream_context_create([
    'http' => [
        'method' => 'GET',
        'header' => 'Cookie: ' . session_name() . '=' . session_id() . "\r\n"
    ]
]);

$apiUrl = 'http://localhost/tenderchessgenius/api/quizzes/get-quizzes.php';
$result = @file_get_contents($apiUrl, false, $context);

if ($result === false) {
    echo "<p style='color:red'>Error fetching API via file_get_contents</p>";
    echo "<p>" . error_get_last()['message'] . "</p>";
} else {
    echo "<pre>" . htmlspecialchars($result) . "</pre>";
}

// Try curl approach
echo "<h2>Using CURL to access API:</h2>";

if (function_exists('curl_init')) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $apiUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_COOKIE, session_name() . '=' . session_id());
    
    $curlResult = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    echo "<p>HTTP Status Code: " . $httpCode . "</p>";
    
    if ($curlResult === false) {
        echo "<p style='color:red'>Error fetching API via CURL: " . curl_error($ch) . "</p>";
    } else {
        echo "<pre>" . htmlspecialchars($curlResult) . "</pre>";
    }
    
    curl_close($ch);
} else {
    echo "<p style='color:red'>CURL is not available on this server</p>";
}
?> 