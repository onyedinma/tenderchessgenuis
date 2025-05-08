<?php
// Directory and file check script

// Enable error reporting
ini_set('display_errors', 1);
error_reporting(E_ALL);

echo "<h1>Directory and File Structure Check</h1>";

// Function to check if a path exists and is readable/writable
function checkPath($path, $label) {
    echo "<h3>Checking: $label ($path)</h3>";
    echo "<ul>";
    
    // Check if exists
    if (file_exists($path)) {
        echo "<li style='color:green'>✓ Exists</li>";
        
        // Check if it's a directory or file
        if (is_dir($path)) {
            echo "<li>Is a directory</li>";
            
            // Check permissions
            echo "<li>Permissions: " . substr(sprintf('%o', fileperms($path)), -4) . "</li>";
            echo "<li>" . (is_readable($path) ? "<span style='color:green'>✓ Readable</span>" : "<span style='color:red'>✗ Not readable</span>") . "</li>";
            echo "<li>" . (is_writable($path) ? "<span style='color:green'>✓ Writable</span>" : "<span style='color:red'>✗ Not writable</span>") . "</li>";
            
            // List directory contents
            echo "<li>Directory contents:<ul>";
            $files = scandir($path);
            foreach ($files as $file) {
                if ($file != '.' && $file != '..') {
                    $fullPath = $path . '/' . $file;
                    $type = is_dir($fullPath) ? "DIR" : "FILE";
                    echo "<li>$type: $file</li>";
                }
            }
            echo "</ul></li>";
        } else {
            echo "<li>Is a file</li>";
            
            // Check permissions
            echo "<li>Permissions: " . substr(sprintf('%o', fileperms($path)), -4) . "</li>";
            echo "<li>" . (is_readable($path) ? "<span style='color:green'>✓ Readable</span>" : "<span style='color:red'>✗ Not readable</span>") . "</li>";
            echo "<li>" . (is_writable($path) ? "<span style='color:green'>✓ Writable</span>" : "<span style='color:red'>✗ Not writable</span>") . "</li>";
            echo "<li>File size: " . filesize($path) . " bytes</li>";
        }
    } else {
        echo "<li style='color:red'>✗ Path does not exist</li>";
    }
    
    echo "</ul>";
    echo "<hr>";
}

// Current script path - to help determine absolute paths
$scriptPath = __FILE__;
$serverRoot = $_SERVER['DOCUMENT_ROOT'];
$scriptDir = dirname($scriptPath);

echo "<p>Server document root: $serverRoot</p>";
echo "<p>Current script directory: $scriptDir</p>";

// Check main project directory
$projectRoot = dirname($scriptDir);
checkPath($projectRoot, "Project Root");

// Check API directory
$apiDir = $projectRoot . '/api';
checkPath($apiDir, "API Directory");

// Check quizzes API directory
$quizzesDir = $apiDir . '/quizzes';
checkPath($quizzesDir, "Quizzes API Directory");

// Check specific API files
$quizzesFile = $quizzesDir . '/get-quizzes.php';
checkPath($quizzesFile, "Quizzes API File");

$testFile = $quizzesDir . '/get-quizzes-test.php';
checkPath($testFile, "Test Quizzes API File");

// Show server information
echo "<h2>Server Information</h2>";
echo "<ul>";
echo "<li>PHP Version: " . phpversion() . "</li>";
echo "<li>Web Server: " . $_SERVER['SERVER_SOFTWARE'] . "</li>";
echo "<li>Server Name: " . $_SERVER['SERVER_NAME'] . "</li>";
echo "<li>Server Port: " . $_SERVER['SERVER_PORT'] . "</li>";
echo "<li>Current URL: " . (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]</li>";
echo "</ul>";

// Try to access the API directly through file_get_contents
echo "<h2>Direct API Request Test</h2>";

$testUrl = "http://localhost/tenderchessgenius/api/quizzes/get-quizzes-test.php";
echo "<p>Testing URL: $testUrl</p>";

$context = stream_context_create(array(
    'http' => array(
        'ignore_errors' => true
    )
));

$result = @file_get_contents($testUrl, false, $context);
if ($result === false) {
    echo "<p style='color:red'>Error: Unable to access the API URL directly. Check server configuration.</p>";
    echo "<p>Error details: " . error_get_last()['message'] . "</p>";
} else {
    echo "<p style='color:green'>Success: API URL accessible.</p>";
    echo "<pre>" . htmlspecialchars($result) . "</pre>";
}
?> 