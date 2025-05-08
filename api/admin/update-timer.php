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
$section1 = isset($data['section1']) ? (int)$data['section1'] : 30;
$section2 = isset($data['section2']) ? (int)$data['section2'] : 45;

// Validate input
if ($section1 < 1 || $section2 < 1) {
    http_response_code(400);
    echo json_encode(['error' => 'Timer values must be greater than 0']);
    exit();
}

// Include database connection
$conn = require_once '../../config/database.php';

// Update settings
$sql = "UPDATE settings SET section1_timer = ?, section2_timer = ? WHERE id = 1";
$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, "ii", $section1, $section2);

if (mysqli_stmt_execute($stmt)) {
    echo json_encode([
        'success' => true,
        'message' => 'Timers updated successfully',
        'section1_timer' => $section1,
        'section2_timer' => $section2
    ]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to update timers']);
}

mysqli_close($conn);
?> 