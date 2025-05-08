<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../../config/database.php';

try {
    // Get settings from database
    $query = "SELECT * FROM settings WHERE id = 1";
    $result = mysqli_query($conn, $query);
    
    if ($result) {
        $settings = mysqli_fetch_assoc($result);
        echo json_encode([
            'success' => true,
            'section2_enabled' => (bool)$settings['section2_enabled'],
            'timer_section1' => (int)$settings['timer_section1'],
            'timer_section2' => (int)$settings['timer_section2']
        ]);
    } else {
        throw new Exception("Failed to fetch settings");
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

mysqli_close($conn);
?> 