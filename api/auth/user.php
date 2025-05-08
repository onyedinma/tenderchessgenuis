<?php
session_start();
header('Content-Type: application/json');

// Enable CORS for development
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'User not authenticated']);
    exit();
}

// Include database connection
$conn = require_once '../../config/database.php';

$user_id = $_SESSION['user_id'];

// Get user details
$sql = "SELECT u.id, u.name, u.email, u.profile_picture, 
        (SELECT COUNT(*) FROM user_roles ur JOIN roles r ON ur.role_id = r.id 
         WHERE ur.user_id = u.id AND r.name = 'admin') AS is_admin 
        FROM users u WHERE u.id = ?";
$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, "i", $user_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

if (mysqli_num_rows($result) == 0) {
    http_response_code(404);
    echo json_encode(['error' => 'User not found']);
    exit();
}

$user = mysqli_fetch_assoc($result);

// Format user data for response
$response = [
    'user' => [
        'id' => (int)$user['id'],
        'name' => $user['name'],
        'email' => $user['email'],
        'profilePicture' => $user['profile_picture'],
        'isAdmin' => (bool)$user['is_admin']
    ]
];

// Return JSON response
echo json_encode($response); 