<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Start session
session_start();

// Set headers
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Check if request method is GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

// Check if user is admin
if (!isset($_SESSION['roles']) || !in_array('admin', $_SESSION['roles'])) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Forbidden: Admin access required']);
    exit();
}

// Connect to database
require_once '../db/config.php';

try {
    // Query to get all user groups with member counts
    $query = "
        SELECT g.*, COUNT(ug.user_id) as members_count
        FROM user_groups g
        LEFT JOIN user_group_memberships ug ON g.id = ug.group_id
        GROUP BY g.id
        ORDER BY g.name ASC
    ";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute();
    
    $groups = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Return results
    echo json_encode([
        'success' => true,
        'groups' => $groups
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to fetch user groups: ' . $e->getMessage()
    ]);
}
?> 