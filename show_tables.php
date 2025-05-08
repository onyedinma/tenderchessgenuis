<?php
require_once 'config/database.php';

// Set headers for readable output
header('Content-Type: text/plain');

echo "Database Structure for 'tenderchessgenius':\n\n";

// Get all tables
$tables_query = "SHOW TABLES";
$tables_result = mysqli_query($conn, $tables_query);

while ($table = mysqli_fetch_array($tables_result)[0]) {
    echo "\nTable: $table\n";
    echo str_repeat('-', strlen($table) + 7) . "\n";
    
    // Get table structure
    $columns_query = "SHOW COLUMNS FROM $table";
    $columns_result = mysqli_query($conn, $columns_query);
    
    while ($column = mysqli_fetch_assoc($columns_result)) {
        echo sprintf(
            "%-20s %-20s %s %s %s\n",
            $column['Field'],
            $column['Type'],
            $column['Null'] === 'YES' ? 'NULL' : 'NOT NULL',
            $column['Key'] === 'PRI' ? 'PRIMARY KEY' : '',
            $column['Extra']
        );
    }
    echo "\n";
}

// Close connection
mysqli_close($conn);
?> 