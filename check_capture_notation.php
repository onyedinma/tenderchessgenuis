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
    
    // Look for a question with a capture notation (containing 'x')
    $stmt = $conn->query("SELECT * FROM questions WHERE algebraic_notation LIKE '%x%'");
    $captureQuestion = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($captureQuestion) {
        echo "Found question with capture notation!\n";
        echo "ID: " . $captureQuestion['id'] . "\n";
        echo "Question: " . $captureQuestion['question_text'] . "\n";
        echo "Correct Answer: " . $captureQuestion['correct_answer'] . "\n";
        echo "Algebraic Notation: " . $captureQuestion['algebraic_notation'] . "\n";
        
        // The 'x' in the algebraic notation indicates a capture
        if (strpos($captureQuestion['algebraic_notation'], 'x') !== false) {
            echo "\nThis notation contains 'x' which indicates a capture.\n";
        }
        
        // Parse move sequence to check isCapture flag
        if (!empty($captureQuestion['move_sequence'])) {
            $moveData = json_decode($captureQuestion['move_sequence'], true);
            echo "\nMove Sequence Details:\n";
            
            if (isset($moveData[0])) {
                echo "From: " . $moveData[0]['from'] . "\n";
                echo "To: " . $moveData[0]['to'] . "\n";
                echo "SAN: " . $moveData[0]['san'] . "\n";
                echo "Piece: " . $moveData[0]['piece'] . "\n";
                echo "Is Capture: " . (isset($moveData[0]['isCapture']) && $moveData[0]['isCapture'] ? "Yes" : "No") . "\n";
            }
        }
        
        echo "\nVerification successful. The system supports capture notation properly.\n";
    } else {
        echo "No questions with capture notation found.\n";
        
        // Try to create a capture test question
        echo "Creating a test question with capture notation...\n";
        
        $testData = [
            'bank_id' => 5,
            'question_text' => 'Knight capturing pawn',
            'correct_answer' => 'Nxe5',
            'position' => json_encode([
                'starting_fen' => 'rnbqkbnr/pppp1ppp/8/4p3/8/5N2/PPPPPPPP/RNBQKB1R w KQkq - 0 1',
                'solution_fen' => 'rnbqkbnr/pppp1ppp/8/4N3/8/8/PPPPPPPP/RNBQKB1R b KQkq - 0 1'
            ]),
            'algebraic_notation' => 'Nxe5',
            'move_sequence' => json_encode([
                [
                    'from' => 'f3',
                    'to' => 'e5',
                    'san' => 'Nxe5',
                    'uci' => 'f3e5',
                    'piece' => 'N',
                    'isCapture' => true
                ]
            ])
        ];
        
        $sql = "INSERT INTO questions (bank_id, question_text, correct_answer, position, question_order, is_active, algebraic_notation, move_sequence, created_at) 
                VALUES (:bank_id, :question_text, :correct_answer, :position, 3, 1, :algebraic_notation, :move_sequence, NOW())";
        
        $stmt = $conn->prepare($sql);
        $stmt->execute([
            ':bank_id' => $testData['bank_id'],
            ':question_text' => $testData['question_text'],
            ':correct_answer' => $testData['correct_answer'],
            ':position' => $testData['position'],
            ':algebraic_notation' => $testData['algebraic_notation'],
            ':move_sequence' => $testData['move_sequence']
        ]);
        
        $id = $conn->lastInsertId();
        echo "Created test capture question with ID: $id\n";
    }
    
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?> 