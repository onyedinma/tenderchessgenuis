<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Log every access to this endpoint
error_log("Student Login API accessed - " . date('Y-m-d H:i:s'));

// Include common session handling
require_once 'session.php';

// Include database configuration
require_once '../db/config.php';

// Get the requesting origin
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
$allowed_origins = ['http://localhost:3000', 'http://localhost', 'http://localhost:80'];

// Log request details
error_log("Student Login API called. Method: " . ($_SERVER['REQUEST_METHOD'] ?? 'UNKNOWN'));
error_log("Origin: " . ($origin ?? 'UNKNOWN'));
error_log("User Agent: " . ($_SERVER['HTTP_USER_AGENT'] ?? 'UNKNOWN'));

// Set CORS headers
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    // If origin not in allowed list, default to the development server
    header("Access-Control-Allow-Origin: http://localhost:3000");
}
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Check if it's a POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    error_log("Student Login API called with invalid method: " . $_SERVER['REQUEST_METHOD']);
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
    exit();
}

// Get POST data
$raw_data = file_get_contents("php://input");
error_log("Raw input data: " . $raw_data);
$data = json_decode($raw_data, true);

// Validate input
if (!isset($data['username']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Username and password are required']);
    exit();
}

$username = trim($data['username']);
$password = $data['password'];

// Log login attempt (without password)
error_log("Student login attempt for username: " . $username);

try {
    // Check if PDO is available
    if (!isset($pdo)) {
        error_log("ERROR: PDO not available in student-login.php");
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database configuration error']);
        exit();
    }
    
    // Find student by username using PDO
    $stmt = $pdo->prepare("SELECT id, name, username, password, photo_path, last_active FROM students WHERE username = ?");
    $stmt->execute([$username]);
    $student = $stmt->fetch();

    // Check if student exists and verify password
    if (!$student) {
        error_log("Student login failed for username: " . $username . " - Student not found");
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid username or password']);
        exit();
    }
    
    // Separate verification step for easier debugging
    $passwordVerified = password_verify($password, $student['password']);
    error_log("Password verification result: " . ($passwordVerified ? 'success' : 'failed') . " for username: " . $username);
    
    if (!$passwordVerified) {
        error_log("Student login failed for username: " . $username . " - Password verification failed");
        error_log("Stored hashed password: " . $student['password']);
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid username or password']);
        exit();
    }

    // Check if student is already logged in
    $checkSessionStmt = $pdo->prepare("
        SELECT session_id 
        FROM active_sessions 
        WHERE user_id = ? AND last_activity > DATE_SUB(NOW(), INTERVAL 30 MINUTE)
    ");
    $checkSessionStmt->execute([$student['id']]);
    $existingSession = $checkSessionStmt->fetch();

    if ($existingSession) {
        // Student is already logged in
        echo json_encode([
            'success' => true,
            'alreadyLoggedIn' => true,
            'message' => 'Already logged in on another device'
        ]);
        exit();
    }

    // Clear any existing session data to start fresh
    $_SESSION = array();
    
    // Set student session
    $_SESSION['student_id'] = $student['id'];
    $_SESSION['student_name'] = $student['name'];
    $_SESSION['student_username'] = $student['username'];
    $_SESSION['is_student'] = true;
    $_SESSION['is_admin'] = false;
    $_SESSION['login_time'] = time();

    // Regenerate session ID for security
    session_regenerate_id(true);
    
    // Update last_active timestamp
    $updateStmt = $pdo->prepare("UPDATE students SET last_active = NOW() WHERE id = ?");
    $updateStmt->execute([$student['id']]);

    // Record the new session
    $insertSessionStmt = $pdo->prepare("
        INSERT INTO active_sessions (user_id, session_id, login_time, last_activity)
        VALUES (?, ?, NOW(), NOW())
        ON DUPLICATE KEY UPDATE 
        session_id = VALUES(session_id),
        login_time = VALUES(login_time),
        last_activity = VALUES(last_activity)
    ");
    $insertSessionStmt->execute([$student['id'], session_id()]);

    // Log successful login
    error_log("Student login successful for: " . $username . " (ID: " . $student['id'] . ")");
    error_log("Session data: " . json_encode($_SESSION));
    error_log("Session ID: " . session_id());
    error_log("Cookies being sent: " . (isset($_COOKIE) ? json_encode($_COOKIE) : 'None'));
    
    // Ensure the session is written to disk before returning
    session_write_close();
    
    // Start the session again to continue using it
    session_start();

    // Return success with student data (excluding password)
    echo json_encode([
        'success' => true,
        'alreadyLoggedIn' => false,
        'message' => 'Login successful',
        'session_id' => session_id(),
        'student' => [
            'id' => $student['id'],
            'name' => $student['name'],
            'username' => $student['username'],
            'photo' => $student['photo_path'],
            'isStudent' => true,
            'loginTime' => $_SESSION['login_time']
        ]
    ]);

} catch (Exception $e) {
    error_log("Database error during student login: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?> 