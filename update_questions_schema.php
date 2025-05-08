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
    
    // Check if algebraic_notation column exists
    $stmt = $conn->query("SHOW COLUMNS FROM questions LIKE 'algebraic_notation'");
    $algebraic_notation_exists = $stmt->rowCount() > 0;
    
    // Check if move_sequence column exists
    $stmt = $conn->query("SHOW COLUMNS FROM questions LIKE 'move_sequence'");
    $move_sequence_exists = $stmt->rowCount() > 0;
    
    // Add the missing columns if they don't exist
    if (!$algebraic_notation_exists) {
        $conn->exec("ALTER TABLE questions ADD COLUMN algebraic_notation VARCHAR(20) AFTER correct_answer");
        echo "Added algebraic_notation column\n";
    } else {
        echo "algebraic_notation column already exists\n";
    }
    
    if (!$move_sequence_exists) {
        $conn->exec("ALTER TABLE questions ADD COLUMN move_sequence TEXT AFTER algebraic_notation");
        echo "Added move_sequence column\n";
    } else {
        echo "move_sequence column already exists\n";
    }
    
    // Show the updated table structure
    echo "\nUpdated columns in the questions table:\n";
    $stmt = $conn->query('DESCRIBE questions');
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($columns as $column) {
        echo $column['Field'] . " - " . $column['Type'] . "\n";
    }
    
    echo "\nSchema update completed successfully.\n";
    
} catch(PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}
?> 