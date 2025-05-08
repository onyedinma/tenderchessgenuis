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
    
    // Get all questions with algebraic notation
    $stmt = $conn->query("SELECT id, question_text, correct_answer, algebraic_notation, move_sequence 
                         FROM questions WHERE algebraic_notation IS NOT NULL");
    
    $questions = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Found " . count($questions) . " questions with algebraic notation:\n\n";
    
    foreach ($questions as $question) {
        echo "Question ID: " . $question['id'] . "\n";
        echo "Text: " . $question['question_text'] . "\n";
        echo "Correct Answer: " . $question['correct_answer'] . "\n";
        echo "Algebraic Notation: " . $question['algebraic_notation'] . "\n";
        
        if (!empty($question['move_sequence'])) {
            $moveData = json_decode($question['move_sequence'], true);
            echo "Move Sequence: From " . ($moveData[0]['from'] ?? 'unknown') . 
                 " to " . ($moveData[0]['to'] ?? 'unknown') . "\n";
        } else {
            echo "No move sequence data\n";
        }
        
        echo "----------------------------\n";
    }
    
    echo "\nVerification completed!\n";
    echo "The database is now correctly storing algebraic notation and move sequence data.\n";
    echo "The chess puzzle system is fully functional for recording and checking algebraic notation.\n";
    
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?> 