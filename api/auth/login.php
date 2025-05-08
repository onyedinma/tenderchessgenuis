<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Log every access to this endpoint
error_log("Login API accessed - " . date('Y-m-d H:i:s'));

// Include common session handling
require_once 'session.php';

// Include database configuration
require_once '../db/config.php';

// Get the requesting origin
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
$allowed_origins = ['http://localhost:3000', 'http://localhost', 'http://localhost:80'];

// Log request details
error_log("Login API called. Method: " . ($_SERVER['REQUEST_METHOD'] ?? 'UNKNOWN'));
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
    error_log("Login API called with invalid method: " . $_SERVER['REQUEST_METHOD']);
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
    exit();
}

// Get POST data
$raw_data = file_get_contents("php://input");
error_log("Raw input data: " . $raw_data);
$data = json_decode($raw_data, true);

// Validate input
if (!isset($data['email']) || !isset($data['password'])) {
    error_log("Login API error: Missing email or password");
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email and password are required']);
    exit();
}

$email = trim($data['email']);
$password = $data['password'];

// Log login attempt (without password)
error_log("Login attempt for email: " . $email);

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    error_log("Login API error: Invalid email format for: " . $email);
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email format']);
    exit();
}

try {
    // First check if PDO is available
    if (!isset($pdo)) {
        error_log("Login API error: PDO not initialized, check db/config.php");
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database configuration error']);
        exit();
    }
    
    // Find user by email
    $stmt = $pdo->prepare("SELECT id, name, email, password, role FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    // Check if user exists and verify password
    if (!$user) {
        error_log("Login failed for email: " . $email . " - User not found");
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
        exit();
    }
    
    // Log the stored hash for debugging (without revealing the full hash)
    $hash_excerpt = substr($user['password'], 0, 10) . '...';
    error_log("Password verification: Hash in DB (excerpt): " . $hash_excerpt);

    // Verify password
    $password_verified = password_verify($password, $user['password']);
    error_log("Password verification result: " . ($password_verified ? 'Success' : 'Failed'));
    
    if (!$password_verified) {
        error_log("Login failed for email: " . $email . " - Invalid password");
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
        exit();
    }

    // Get user roles
    $stmt = $pdo->prepare("SELECT r.id, r.name FROM roles r JOIN user_roles ur ON r.id = ur.role_id WHERE ur.user_id = ?");
    $stmt->execute([$user['id']]);
    $roles = $stmt->fetchAll();
    
    // Check if roles were found
    if (empty($roles)) {
        error_log("Warning: No roles found for user ID: " . $user['id']);
    } else {
        error_log("Roles found for user: " . implode(', ', array_column($roles, 'name')));
    }

    // Set user session
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_name'] = $user['name'];
    $_SESSION['user_email'] = $user['email'];
    $_SESSION['user_role'] = $user['role'];
    $_SESSION['user_roles'] = array_column($roles, 'name');
    $_SESSION['is_admin'] = in_array('admin', $_SESSION['user_roles']);
    $_SESSION['is_student'] = false; // Ensure not marked as student

    // Log successful login and session data
    error_log("Login successful for: " . $email . " (ID: " . $user['id'] . ")");
    error_log("Session data: " . json_encode($_SESSION));
    error_log("Session ID: " . session_id());
    error_log("Is admin: " . ($_SESSION['is_admin'] ? 'true' : 'false'));

    // Return success with user data (excluding password)
    echo json_encode([
        'success' => true,
        'message' => 'Login successful',
        'user' => [
            'id' => $user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'role' => $user['role'],
            'roles' => $_SESSION['user_roles'],
            'isAdmin' => $_SESSION['is_admin']
        ]
    ]);

} catch (PDOException $e) {
    error_log("Database error during login: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?> 