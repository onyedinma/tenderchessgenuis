<?php
// Script to update tenderchessgenius database schema with missing tables and columns

// Database configuration
$db_host = 'localhost';
$db_name = 'tenderchessgenius';
$db_user = 'root';
$db_pass = '';

try {
    // Connect to the database
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "Connected successfully. Updating schema...\n\n";
    
    // Read schema file
    $schema = file_get_contents(__DIR__ . '/schema.sql');
    if (!$schema) {
        throw new Exception("Could not read schema.sql");
    }
    
    // Split into individual queries and execute
    $queries = array_filter(array_map('trim', explode(';', $schema)));
    foreach ($queries as $query) {
        if (!empty($query)) {
            try {
                $pdo->exec($query);
                echo "Executed successfully:\n" . substr($query, 0, 50) . "...\n\n";
            } catch (PDOException $e) {
                echo "Warning on query:\n$query\n";
                echo "Error: " . $e->getMessage() . "\n\n";
                // Continue execution despite errors
            }
        }
    }
    
    echo "Schema update completed.\n";
    
} catch (PDOException $e) {
    die("ERROR: Could not connect. " . $e->getMessage() . "\n");
}
?> 