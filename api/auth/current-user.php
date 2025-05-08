<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Start session
session_start();

// Set CORS headers
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Check if the request method is GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed. Please use GET.'
    ]);
    exit();
}

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Not authenticated',
        'isAuthenticated' => false
    ]);
    exit();
}

// Include database connection
require_once '../db/config.php';

try {
    // Get user data from database along with their groups
    $sql = "SELECT u.id, u.name, u.email, u.role, GROUP_CONCAT(g.id) as group_ids, GROUP_CONCAT(g.name) as group_names 
            FROM users u 
            LEFT JOIN user_groups ug ON u.id = ug.user_id 
            LEFT JOIN groups g ON ug.group_id = g.id 
            WHERE u.id = :user_id 
            GROUP BY u.id";
    
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':user_id', $_SESSION['user_id']);
    $stmt->execute();
    
    $user = $stmt->fetch();
    
    if (!$user) {
        // User not found in database, clear session
        session_unset();
        session_destroy();
        
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'User not found',
            'isAuthenticated' => false
        ]);
        exit();
    }
    
    // Create groups array
    $groups = [];
    if ($user['group_ids']) {
        $group_ids = explode(',', $user['group_ids']);
        $group_names = explode(',', $user['group_names']);
        
        for ($i = 0; $i < count($group_ids); $i++) {
            $groups[] = [
                'id' => (int)$group_ids[$i],
                'name' => $group_names[$i]
            ];
        }
    }
    
    // Return user data
    echo json_encode([
        'success' => true,
        'isAuthenticated' => true,
        'user' => [
            'id' => (int)$user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'role' => $user['role'],
            'groups' => $groups
        ]
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage(),
        'isAuthenticated' => false
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage(),
        'isAuthenticated' => false
    ]);
}
?> 