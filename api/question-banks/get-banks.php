<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/../db/config.php';

try {
    // The database connection is already established in config.php and stored in $conn (which is an alias for $pdo)
    
    // Query to get all question banks with question count
    $sql = "SELECT qb.id, qb.name, qb.section_type, 
            COUNT(q.id) as question_count 
            FROM question_banks qb 
            LEFT JOIN questions q ON qb.id = q.bank_id 
            GROUP BY qb.id 
            ORDER BY qb.section_type, qb.name";
    
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    
    $banks = [];
    
    // Fetch results
    while ($row = $stmt->fetch()) {
        $banks[] = [
            'id' => intval($row['id']),
            'name' => $row['name'],
            'section_type' => $row['section_type'],
            'question_count' => intval($row['question_count'])
        ];
    }
    
    echo json_encode([
        'success' => true,
        'banks' => $banks
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?> 