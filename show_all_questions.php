<?php
$host = 'localhost';
$dbname = 'tenderchessgenius';
$username = 'root';
$password = '';

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Get all questions
    $stmt = $conn->query("SELECT id, question_text, correct_answer, algebraic_notation FROM questions ORDER BY id");
    
    // Print header
    echo "+-----+---------------------------------------+---------------+--------------------+\n";
    echo "| ID  | Question                              | Answer        | Algebraic Notation |\n";
    echo "+-----+---------------------------------------+---------------+--------------------+\n";
    
    // Print each question
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        printf("| %-3s | %-37s | %-13s | %-18s |\n", 
            $row['id'], 
            substr($row['question_text'], 0, 37), 
            substr($row['correct_answer'], 0, 13), 
            substr($row['algebraic_notation'], 0, 18)
        );
    }
    
    echo "+-----+---------------------------------------+---------------+--------------------+\n";
    
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?> 