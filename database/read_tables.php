<?php
// Script to read and display database tables for tenderchessgenius

// Database configuration
$db_host = 'localhost';
$db_name = 'tenderchessgenius';
$db_user = 'root';
$db_pass = '';

try {
    // Connect to the database
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "Connected to MySQL database successfully.\n\n";
    
    // Get all tables
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    if (empty($tables)) {
        echo "No tables found in the database.\n";
    } else {
        echo "Tables in database '$db_name':\n";
        echo "===========================\n\n";
        
        foreach ($tables as $table) {
            echo "TABLE: $table\n";
            echo "----------------\n";
            
            // Get table structure
            $stmt = $pdo->query("DESCRIBE $table");
            $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            foreach ($columns as $column) {
                $fieldName = $column['Field'];
                $type = $column['Type'];
                $null = $column['Null'] === 'YES' ? 'NULL' : 'NOT NULL';
                $key = $column['Key'] ? " [{$column['Key']}]" : '';
                $default = $column['Default'] ? " DEFAULT '{$column['Default']}'" : '';
                $extra = $column['Extra'] ? " {$column['Extra']}" : '';
                
                echo "- $fieldName: $type $null$key$default$extra\n";
            }
            
            // Get number of rows
            $stmt = $pdo->query("SELECT COUNT(*) FROM $table");
            $count = $stmt->fetchColumn();
            echo "\nTotal rows: $count\n\n";
        }
    }
    
} catch (PDOException $e) {
    die("ERROR: Could not connect. " . $e->getMessage());
}
?> 