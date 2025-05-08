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
    // Initialize the response array
    $response = [
        'success' => true,
        'database_name' => '',
        'tables' => [
            'question_banks' => [
                'structure' => [],
                'sample_data' => [],
                'row_count' => 0
            ],
            'questions' => [
                'structure' => [],
                'sample_data' => [],
                'row_count' => 0
            ]
        ]
    ];
    
    // Get database name
    $dbNameQuery = "SELECT DATABASE() as db_name";
    $stmt = $conn->prepare($dbNameQuery);
    $stmt->execute();
    $dbName = $stmt->fetch(PDO::FETCH_ASSOC);
    $response['database_name'] = $dbName['db_name'];
    
    // Get information about question_banks table
    $bankColumnsQuery = "SHOW FULL COLUMNS FROM question_banks";
    $stmt = $conn->prepare($bankColumnsQuery);
    $stmt->execute();
    $response['tables']['question_banks']['structure'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get row count for question_banks
    $bankCountQuery = "SELECT COUNT(*) as count FROM question_banks";
    $stmt = $conn->prepare($bankCountQuery);
    $stmt->execute();
    $bankCount = $stmt->fetch(PDO::FETCH_ASSOC);
    $response['tables']['question_banks']['row_count'] = (int)$bankCount['count'];
    
    // Get sample data from question_banks (limit to 5 rows)
    $bankSampleQuery = "SELECT * FROM question_banks LIMIT 5";
    $stmt = $conn->prepare($bankSampleQuery);
    $stmt->execute();
    $response['tables']['question_banks']['sample_data'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get information about questions table
    $questionColumnsQuery = "SHOW FULL COLUMNS FROM questions";
    $stmt = $conn->prepare($questionColumnsQuery);
    $stmt->execute();
    $response['tables']['questions']['structure'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get row count for questions
    $questionCountQuery = "SELECT COUNT(*) as count FROM questions";
    $stmt = $conn->prepare($questionCountQuery);
    $stmt->execute();
    $questionCount = $stmt->fetch(PDO::FETCH_ASSOC);
    $response['tables']['questions']['row_count'] = (int)$questionCount['count'];
    
    // Get sample data from questions (limit to 5 rows)
    $questionSampleQuery = "SELECT * FROM questions LIMIT 5";
    $stmt = $conn->prepare($questionSampleQuery);
    $stmt->execute();
    $questionSamples = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // For long text fields, truncate them to make the response more readable
    foreach ($questionSamples as &$sample) {
        if (isset($sample['position']) && strlen($sample['position']) > 100) {
            $sample['position'] = substr($sample['position'], 0, 100) . '...';
        }
        if (isset($sample['move_sequence']) && strlen($sample['move_sequence']) > 100) {
            $sample['move_sequence'] = substr($sample['move_sequence'], 0, 100) . '...';
        }
        if (isset($sample['question_text']) && strlen($sample['question_text']) > 100) {
            $sample['question_text'] = substr($sample['question_text'], 0, 100) . '...';
        }
    }
    
    $response['tables']['questions']['sample_data'] = $questionSamples;
    
    // Get table relationships
    $foreignKeysQuery = "
        SELECT 
            TABLE_NAME as table_name,
            COLUMN_NAME as column_name,
            REFERENCED_TABLE_NAME as referenced_table,
            REFERENCED_COLUMN_NAME as referenced_column
        FROM
            INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE
            REFERENCED_TABLE_SCHEMA = DATABASE()
            AND REFERENCED_TABLE_NAME IS NOT NULL
            AND (TABLE_NAME = 'questions' OR REFERENCED_TABLE_NAME = 'questions' 
                OR TABLE_NAME = 'question_banks' OR REFERENCED_TABLE_NAME = 'question_banks')
    ";
    
    $stmt = $conn->prepare($foreignKeysQuery);
    $stmt->execute();
    $relationships = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $response['relationships'] = $relationships;
    
    // Output the response as JSON
    echo json_encode($response, JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?> 