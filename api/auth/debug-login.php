<?php
// Debug login file to help diagnose login issues
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Log access
error_log("Debug Login accessed - " . date('Y-m-d H:i:s'));

// CORS headers
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Start session
session_start();

// Check DB connectivity
$dbInfo = [];

try {
    require_once '../db/config.php';
    $dbInfo['connection'] = 'Connected to database';
    
    // Test query
    $stmt = $pdo->query("SELECT 'connected' AS test");
    $testResult = $stmt->fetch();
    $dbInfo['test_query'] = $testResult;
    
    // Check users table
    $stmt = $pdo->query("SHOW TABLES LIKE 'users'");
    $hasUsersTable = $stmt->rowCount() > 0;
    $dbInfo['has_users_table'] = $hasUsersTable;
    
    if ($hasUsersTable) {
        // Get user count
        $stmt = $pdo->query("SELECT COUNT(*) AS user_count FROM users");
        $userCount = $stmt->fetch();
        $dbInfo['user_count'] = $userCount['user_count'];
        
        // Get structure of users table
        $stmt = $pdo->query("DESCRIBE users");
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $dbInfo['user_table_structure'] = $columns;
    }
    
    // Get query data
    $raw_data = file_get_contents("php://input");
    $data = json_decode($raw_data, true);
    
    if (isset($data['email'])) {
        $email = $data['email'];
        $dbInfo['email_provided'] = $email;
        
        // Check if user exists
        $stmt = $pdo->prepare("SELECT id, name, email FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();
        
        if ($user) {
            $dbInfo['user_found'] = true;
            $dbInfo['user_details'] = [
                'id' => $user['id'],
                'name' => $user['name'],
                'email' => $user['email']
            ];
            
            // Check password (safely)
            if (isset($data['password'])) {
                $dbInfo['password_provided'] = true;
                
                // Get password hash for this user
                $stmt = $pdo->prepare("SELECT password FROM users WHERE email = ?");
                $stmt->execute([$email]);
                $passwordData = $stmt->fetch();
                
                if ($passwordData && isset($passwordData['password'])) {
                    $passwordHash = $passwordData['password'];
                    $dbInfo['password_hash_length'] = strlen($passwordHash);
                    $dbInfo['password_hash_format'] = substr($passwordHash, 0, 7) . '...';
                    
                    // Verify password
                    $passwordMatch = password_verify($data['password'], $passwordHash);
                    $dbInfo['password_match'] = $passwordMatch;
                } else {
                    $dbInfo['password_hash_found'] = false;
                }
            } else {
                $dbInfo['password_provided'] = false;
            }
        } else {
            $dbInfo['user_found'] = false;
        }
    }
    
} catch (PDOException $e) {
    $dbInfo['connection_error'] = $e->getMessage();
}

// Test session
$sessionInfo = [
    'session_id' => session_id(),
    'session_status' => session_status(),
    'session_name' => session_name(),
    'session_cookie_params' => session_get_cookie_params(),
    'session_data' => isset($_SESSION) ? $_SESSION : null
];

// Return debug info
$response = [
    'success' => true,
    'timestamp' => date('Y-m-d H:i:s'),
    'server_info' => [
        'php_version' => PHP_VERSION,
        'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
        'server_name' => $_SERVER['SERVER_NAME'] ?? 'Unknown',
        'request_method' => $_SERVER['REQUEST_METHOD'] ?? 'Unknown',
        'request_uri' => $_SERVER['REQUEST_URI'] ?? 'Unknown',
        'script_filename' => $_SERVER['SCRIPT_FILENAME'] ?? 'Unknown'
    ],
    'database_info' => $dbInfo,
    'session_info' => $sessionInfo,
    'raw_input' => $raw_data ?? 'No input received'
];

echo json_encode($response, JSON_PRETTY_PRINT);
?> 