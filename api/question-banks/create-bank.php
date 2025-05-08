<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Enable error logging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Create a log file for debugging
$logFile = __DIR__ . '/debug.log';
function logDebug($message) {
    global $logFile;
    file_put_contents($logFile, date('[Y-m-d H:i:s] ') . $message . "\n", FILE_APPEND);
}

logDebug("Request received");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/../db/config.php';

try {
    // Get request data
    $rawInput = file_get_contents("php://input");
    logDebug("Raw input: " . $rawInput);
    
    $data = json_decode($rawInput, true);
    logDebug("Decoded data: " . print_r($data, true));
    
    // Validate required fields
    if (!isset($data['name']) || !isset($data['section_type'])) {
        throw new Exception("Missing required fields: name and section_type are required");
    }
    
    $name = trim($data['name']);
    $sectionType = $data['section_type'];
    
    logDebug("Name: $name, Section Type: $sectionType");
    
    // Validate name
    if (empty($name)) {
        throw new Exception("Bank name cannot be empty");
    }
    
    // Validate section type
    if ($sectionType !== '1' && $sectionType !== '2') {
        throw new Exception("Invalid section type. Must be '1' or '2'");
    }
    
    // The database connection is already established in config.php and stored in $conn (which is an alias for $pdo)
    logDebug("Using PDO connection from config.php");
    
    // First, check if is_active column exists
    $columnsExist = false;
    try {
        $checkColumnSql = "SHOW COLUMNS FROM question_banks LIKE 'is_active'";
        $checkColumnStmt = $conn->query($checkColumnSql);
        $columnsExist = $checkColumnStmt->rowCount() > 0;
        logDebug("is_active column exists: " . ($columnsExist ? "Yes" : "No"));
        
        if (!$columnsExist) {
            // Try to add the column if it doesn't exist
            $alterSql = "ALTER TABLE question_banks ADD COLUMN is_active tinyint(1) NOT NULL DEFAULT 0";
            $alterResult = $conn->exec($alterSql);
            logDebug("Added is_active column: " . ($alterResult !== false ? "Yes" : "No"));
            $columnsExist = true;
        }
    } catch (Exception $e) {
        logDebug("Error checking/adding column: " . $e->getMessage());
        // Continue anyway, we'll try the insert with or without the column
    }
    
    // Check if we've reached the 20 bank limit for this section
    $countSql = "SELECT COUNT(*) AS bank_count FROM question_banks WHERE section_type = :section_type";
    $countStmt = $conn->prepare($countSql);
    $countStmt->bindParam(':section_type', $sectionType, PDO::PARAM_STR);
    $countStmt->execute();
    $countRow = $countStmt->fetch();
    
    logDebug("Current bank count for section $sectionType: " . $countRow['bank_count']);
    
    if ($countRow['bank_count'] >= 20) {
        throw new Exception("Maximum number of banks (20) reached for Section " . $sectionType);
    }
    
    // Check if bank with same name already exists
    $checkSql = "SELECT id FROM question_banks WHERE name = :name AND section_type = :section_type";
    $checkStmt = $conn->prepare($checkSql);
    $checkStmt->bindParam(':name', $name, PDO::PARAM_STR);
    $checkStmt->bindParam(':section_type', $sectionType, PDO::PARAM_STR);
    $checkStmt->execute();
    
    if ($checkStmt->rowCount() > 0) {
        throw new Exception("A question bank with this name already exists in Section " . $sectionType);
    }
    
    // Insert the new bank - adjust SQL based on whether the is_active column exists
    if ($columnsExist) {
        $sql = "INSERT INTO question_banks (name, section_type, is_active) VALUES (:name, :section_type, 0)";
    } else {
        $sql = "INSERT INTO question_banks (name, section_type) VALUES (:name, :section_type)";
    }
    
    logDebug("SQL: $sql");
    logDebug("Params: $name, $sectionType");
    
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':name', $name, PDO::PARAM_STR);
    $stmt->bindParam(':section_type', $sectionType, PDO::PARAM_STR);
    
    $result = $stmt->execute();
    logDebug("Execute result: " . ($result ? "true" : "false"));
    
    if ($result) {
        $bankId = $conn->lastInsertId();
        logDebug("New bank ID: $bankId");
        
        // Verify the bank was actually inserted
        $verifySql = "SELECT id, name, section_type FROM question_banks WHERE id = :id";
        $verifyStmt = $conn->prepare($verifySql);
        $verifyStmt->bindParam(':id', $bankId, PDO::PARAM_INT);
        $verifyStmt->execute();
        $verifyRow = $verifyStmt->fetch();
        
        if ($verifyRow) {
            logDebug("Verified bank exists: " . print_r($verifyRow, true));
        } else {
            logDebug("WARNING: Could not verify bank was inserted");
        }
        
        $response = [
            'success' => true,
            'message' => 'Question bank created successfully',
            'bank' => [
                'id' => (int)$bankId,
                'name' => $name,
                'section_type' => $sectionType,
                'question_count' => 0
            ]
        ];
        logDebug("Response: " . json_encode($response));
        
        echo json_encode($response);
    } else {
        throw new Exception("Error creating question bank: " . implode(', ', $stmt->errorInfo()));
    }
    
} catch (Exception $e) {
    logDebug("ERROR: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?> 