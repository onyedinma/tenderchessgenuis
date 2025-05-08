<?php
// Connect to database
$host = 'localhost';
$dbname = 'tenderchessgenius';
$username = 'root';
$password = '';

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "Connected successfully\n";
    
    // Get table structure
    $stmt = $conn->query('DESCRIBE questions');
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Columns in the questions table:\n";
    foreach ($columns as $column) {
        echo $column['Field'] . " - " . $column['Type'] . "\n";
    }
    
    // Try to query for a row to see actual data
    echo "\nSample row from questions table:\n";
    $stmt = $conn->query('SELECT * FROM questions LIMIT 1');
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($row) {
        foreach ($row as $field => $value) {
            echo "$field: " . substr($value, 0, 100) . (strlen($value) > 100 ? "...\n" : "\n");
        }
    } else {
        echo "No rows found in the questions table\n";
    }
    
} catch(PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}
?> 