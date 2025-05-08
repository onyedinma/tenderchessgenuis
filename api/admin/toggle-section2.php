<?php
session_start();

// Check if user is logged in and is admin
if (!isset($_SESSION['user_id']) || !isset($_SESSION['is_admin']) || !$_SESSION['is_admin']) {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized']);
    exit();
}

// Get JSON data
$data = json_decode(file_get_contents('php://input'), true);
$enabled = isset($data['enabled']) ? (bool)$data['enabled'] : false;

// Include database connection
$conn = require_once '../../config/database.php';

// Update settings
$sql = "UPDATE settings SET section2_enabled = ? WHERE id = 1";
$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, "i", $enabled);

if (mysqli_stmt_execute($stmt)) {
    echo json_encode(['success' => true, 'message' => 'Section 2 ' . ($enabled ? 'enabled' : 'disabled')]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to update settings']);
}

mysqli_close($conn);
?> 