<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Start session to check current session state
session_start();

echo "<h1>Student Session Debug</h1>";

// Display session information
echo "<h2>Session Information</h2>";
echo "<ul>";
echo "<li>Session ID: " . session_id() . "</li>";
echo "<li>Session Status: " . (session_status() === PHP_SESSION_ACTIVE ? 'Active' : 'Not Active') . "</li>";
echo "<li>Session Cookie Parameters:</li>";
echo "<ul>";
$params = session_get_cookie_params();
foreach ($params as $key => $value) {
    echo "<li>$key: " . (is_bool($value) ? ($value ? 'true' : 'false') : $value) . "</li>";
}
echo "</ul>";
echo "</ul>";

// Display current session data
echo "<h2>Current Session Data</h2>";
if (!empty($_SESSION)) {
    echo "<pre>" . print_r($_SESSION, true) . "</pre>";
} else {
    echo "<p>No session data found.</p>";
}

// Display cookie information
echo "<h2>Cookie Information</h2>";
if (!empty($_COOKIE)) {
    echo "<pre>" . print_r($_COOKIE, true) . "</pre>";
} else {
    echo "<p>No cookies found.</p>";
}

// Test setting a session value
$_SESSION['test_value'] = 'Session test at ' . date('Y-m-d H:i:s');
echo "<h2>Test Session Value</h2>";
echo "<p>A test value has been set in the session. Refresh the page to see if it persists.</p>";

// Create database connection to test database configuration
echo "<h2>Database Connection Test</h2>";
try {
    // Include database configuration
    if (file_exists('api/db/config.php')) {
        include_once 'api/db/config.php';
        
        if (isset($pdo)) {
            echo "<p style='color:green;'>Database configuration loaded successfully.</p>";
            
            // Test connection by querying students table
            $stmt = $pdo->query("SELECT COUNT(*) FROM students");
            $count = $stmt->fetchColumn();
            
            echo "<p>Found $count students in the database.</p>";
            
            // Get a sample of student records
            $stmt = $pdo->query("SELECT id, name, username FROM students LIMIT 5");
            $students = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            if (!empty($students)) {
                echo "<p>Sample student records:</p>";
                echo "<table border='1' cellpadding='5'>";
                echo "<tr><th>ID</th><th>Name</th><th>Username</th></tr>";
                
                foreach ($students as $student) {
                    echo "<tr>";
                    echo "<td>" . $student['id'] . "</td>";
                    echo "<td>" . $student['name'] . "</td>";
                    echo "<td>" . $student['username'] . "</td>";
                    echo "</tr>";
                }
                
                echo "</table>";
            }
        } else {
            echo "<p style='color:red;'>PDO not initialized in database configuration.</p>";
        }
    } else {
        echo "<p style='color:red;'>Database configuration file not found.</p>";
    }
} catch (Exception $e) {
    echo "<p style='color:red;'>Database error: " . $e->getMessage() . "</p>";
}

// Test direct API calls
echo "<h2>API Response Test</h2>";

// Function to make an API request
function testApiEndpoint($endpoint, $method = 'GET', $data = null) {
    $ch = curl_init();
    $url = "http://localhost/tenderchessgenius/api/auth/$endpoint";
    
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HEADER, false);
    
    // Include session cookie
    if (session_id()) {
        curl_setopt($ch, CURLOPT_COOKIE, session_name() . '=' . session_id());
    }
    
    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        if ($data) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }
    }
    
    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
        'Content-Type: application/json',
        'Accept: application/json'
    ));
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    
    curl_close($ch);
    
    return [
        'endpoint' => $endpoint,
        'http_code' => $httpCode,
        'response' => $response ? json_decode($response, true) : null,
        'error' => $error
    ];
}

// Test check-session endpoint
$checkSessionResult = testApiEndpoint('check-session.php');
echo "<h3>check-session.php</h3>";
echo "<p>HTTP Status: " . $checkSessionResult['http_code'] . "</p>";
echo "<pre>" . print_r($checkSessionResult['response'], true) . "</pre>";

// Create a temporary student session for testing
$_SESSION['student_id'] = 1;
$_SESSION['student_name'] = 'Test Student';
$_SESSION['student_username'] = 'teststudent';
$_SESSION['is_student'] = true;
$_SESSION['is_admin'] = false;

echo "<h2>Simulated Student Session</h2>";
echo "<p>A temporary student session has been created. Refresh the page and check the API response again.</p>";
echo "<pre>" . print_r($_SESSION, true) . "</pre>";

// Test check-session again with the simulated session
$checkSessionAgain = testApiEndpoint('check-session.php');
echo "<h3>check-session.php (after setting test session)</h3>";
echo "<p>HTTP Status: " . $checkSessionAgain['http_code'] . "</p>";
echo "<pre>" . print_r($checkSessionAgain['response'], true) . "</pre>";

// Display browser and environment info
echo "<h2>Environment Information</h2>";
echo "<ul>";
echo "<li>Server Software: " . $_SERVER['SERVER_SOFTWARE'] . "</li>";
echo "<li>PHP Version: " . phpversion() . "</li>";
echo "<li>User Agent: " . $_SERVER['HTTP_USER_AGENT'] . "</li>";
echo "<li>Remote Address: " . $_SERVER['REMOTE_ADDR'] . "</li>";
echo "<li>Server Name: " . $_SERVER['SERVER_NAME'] . "</li>";
echo "<li>Request Time: " . date('Y-m-d H:i:s', $_SERVER['REQUEST_TIME']) . "</li>";
echo "</ul>";
?> 