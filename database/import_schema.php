<?php
// Import script for tenderchessgenius database schema

// Database configuration - match the config.php settings
$db_host = 'localhost';
$db_name = 'tenderchessgenius';
$db_user = 'root';
$db_pass = '';

try {
    // Connect to the MySQL server without selecting a database
    $pdo = new PDO("mysql:host=$db_host", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "Connected to MySQL server successfully.\n";
    
    // Check if database exists, if not create it
    $stmt = $pdo->query("SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '$db_name'");
    if (!$stmt->fetch()) {
        $pdo->exec("CREATE DATABASE `$db_name` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci");
        echo "Database '$db_name' created successfully.\n";
    } else {
        echo "Database '$db_name' already exists.\n";
    }
    
    // Select the database
    $pdo->exec("USE `$db_name`");
    
    // Read the SQL file
    $sql = file_get_contents(__DIR__ . '/chess_genius_schema.sql');
    
    // Execute multi query
    $statements = explode(';', $sql);
    foreach ($statements as $statement) {
        $statement = trim($statement);
        if ($statement) {
            try {
                $pdo->exec($statement);
                echo ".";
            } catch (PDOException $e) {
                echo "\nError executing statement: " . $e->getMessage() . "\n";
                echo "Statement: " . $statement . "\n";
            }
        }
    }
    
    echo "\nDatabase schema imported successfully.\n";
    
} catch (PDOException $e) {
    die("ERROR: Could not connect. " . $e->getMessage());
}
?> 