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
    
    // First check if we have any question banks to add the question to
    $stmt = $conn->query("SELECT id, name, section_type FROM question_banks LIMIT 1");
    $bank = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$bank) {
        // Create a test question bank if none exists
        echo "No question bank found. Creating a test bank...\n";
        
        $stmt = $conn->prepare("INSERT INTO question_banks (name, section_type, is_active, created_at) 
                               VALUES (:name, :section_type, 1, NOW())");
        $stmt->execute([
            ':name' => 'Test Question Bank',
            ':section_type' => '1'
        ]);
        
        $bankId = $conn->lastInsertId();
        echo "Created test bank with ID: $bankId\n";
    } else {
        $bankId = $bank['id'];
        echo "Using existing bank: {$bank['name']} (ID: $bankId)\n";
    }
    
    // Test data
    $startingFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'; // Starting position
    $solutionFen = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1'; // After e4 move
    
    // The position JSON that includes both FENs
    $position = json_encode([
        'starting_fen' => $startingFen,
        'solution_fen' => $solutionFen
    ]);
    
    // Algebraic notation for the move
    $algebraicNotation = 'e4';
    
    // Move sequence with detailed info
    $moveSequence = json_encode([
        [
            'from' => 'e2',
            'to' => 'e4',
            'san' => 'e4',
            'uci' => 'e2e4',
            'piece' => 'P',
            'isCapture' => false
        ]
    ]);
    
    // Insert the test question
    $stmt = $conn->prepare("INSERT INTO questions 
                          (bank_id, question_text, correct_answer, algebraic_notation, move_sequence, position, question_order, is_active, created_at) 
                          VALUES 
                          (:bank_id, :question_text, :correct_answer, :algebraic_notation, :move_sequence, :position, :question_order, 1, NOW())");
                          
    $stmt->execute([
        ':bank_id' => $bankId,
        ':question_text' => 'What is the best opening move for white?',
        ':correct_answer' => 'e4',
        ':algebraic_notation' => $algebraicNotation,
        ':move_sequence' => $moveSequence,
        ':position' => $position,
        ':question_order' => 1
    ]);
    
    $questionId = $conn->lastInsertId();
    echo "Created test question with ID: $questionId\n";
    
    // Verify the question was inserted correctly
    $stmt = $conn->prepare("SELECT id, question_text, correct_answer, algebraic_notation, move_sequence, position 
                          FROM questions WHERE id = :id");
    $stmt->execute([':id' => $questionId]);
    $question = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($question) {
        echo "\nVerification of inserted data:\n";
        echo "ID: {$question['id']}\n";
        echo "Question: {$question['question_text']}\n";
        echo "Correct Answer: {$question['correct_answer']}\n";
        echo "Algebraic Notation: {$question['algebraic_notation']}\n";
        echo "Position: " . substr($question['position'], 0, 50) . "...\n";
        echo "Move Sequence: " . substr($question['move_sequence'], 0, 50) . "...\n";
        
        echo "\nTest completed successfully. The system can now properly store and retrieve chess move notation.\n";
    } else {
        echo "\nError: Failed to retrieve the inserted question.\n";
    }
    
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?> 