<?php
// Script to show all tables in tenderchessgenius database

// Database configuration
$db_host = 'localhost';
$db_name = 'tenderchessgenius';
$db_user = 'root';
$db_pass = '';

try {
    // Connect to the database
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Get all tables
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    echo "Database: $db_name\n";
    echo "Tables: " . count($tables) . " total\n\n";
    
    if (count($tables) > 0) {
        foreach ($tables as $index => $table) {
            // Get column count
            $stmt = $pdo->query("SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = '$db_name' AND TABLE_NAME = '$table'");
            $columnCount = $stmt->fetchColumn();
            
            // Get row count
            $stmt = $pdo->query("SELECT COUNT(*) FROM `$table`");
            $rowCount = $stmt->fetchColumn();
            
            echo ($index + 1) . ". $table - $columnCount columns, $rowCount rows\n";
        }
    } else {
        echo "No tables found.\n";
    }
    
    // Check for foreign key count
    $stmt = $pdo->query("
        SELECT COUNT(*) 
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE REFERENCED_TABLE_SCHEMA = '$db_name'
              AND REFERENCED_TABLE_NAME IS NOT NULL
              AND TABLE_SCHEMA = '$db_name'
    ");
    $fkCount = $stmt->fetchColumn();
    
    echo "\nForeign keys: $fkCount total\n";
    
} catch (PDOException $e) {
    die("ERROR: Could not connect. " . $e->getMessage());
}
?> 