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
    
    // Get test question details
    $stmt = $conn->prepare("SELECT * FROM questions WHERE id = 5");
    $stmt->execute();
    $question = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($question) {
        echo "\nQuestion Details:\n";
        
        // Print all fields
        foreach ($question as $field => $value) {
            echo "$field: " . substr($value, 0, 100) . (strlen($value) > 100 ? "...\n" : "\n");
        }
        
        // Parse the move sequence
        if (!empty($question['move_sequence'])) {
            echo "\nParsed Move Sequence:\n";
            $moveSequence = json_decode($question['move_sequence'], true);
            print_r($moveSequence);
        } else {
            echo "\nNo move sequence data found.\n";
        }
    } else {
        echo "Question not found.";
    }
    
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?> 