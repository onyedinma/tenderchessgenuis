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
    
    // Simulate a question submission from the QuestionEditor component
    
    // 1. The input data (same format as what would come from the React frontend)
    $testData = [
        'bank_id' => 5, // Use the same test bank
        'question_text' => 'What is the best response to e4?',
        'correct_answer' => 'e5',
        'position' => json_encode([
            'starting_fen' => 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
            'solution_fen' => 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2'
        ]),
        'question_order' => 2,
        'algebraic_notation' => 'e5',
        'move_sequence' => json_encode([
            [
                'from' => 'e7',
                'to' => 'e5',
                'san' => 'e5',
                'uci' => 'e7e5',
                'piece' => 'p',
                'isCapture' => false
            ]
        ])
    ];
    
    echo "Simulating question submission from QuestionEditor...\n";
    
    // 2. Extract the data (similar to add-question.php)
    $bankId = intval($testData['bank_id']);
    $position = $testData['position'];
    $questionText = $testData['question_text'];
    $correctAnswer = $testData['correct_answer'];
    $questionOrder = intval($testData['question_order']);
    $algebraicNotation = $testData['algebraic_notation'];
    $moveSequence = $testData['move_sequence'];
    
    // 3. Insert the test question
    $sql = "INSERT INTO questions 
            (bank_id, question_text, correct_answer, position, question_order, is_active, algebraic_notation, move_sequence, created_at) 
            VALUES 
            (:bank_id, :question_text, :correct_answer, :position, :question_order, 1, :algebraic_notation, :move_sequence, NOW())";
    
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':bank_id', $bankId, PDO::PARAM_INT);
    $stmt->bindParam(':question_text', $questionText, PDO::PARAM_STR);
    $stmt->bindParam(':correct_answer', $correctAnswer, PDO::PARAM_STR);
    $stmt->bindParam(':position', $position, PDO::PARAM_STR);
    $stmt->bindParam(':question_order', $questionOrder, PDO::PARAM_INT);
    $stmt->bindParam(':algebraic_notation', $algebraicNotation, PDO::PARAM_STR);
    $stmt->bindParam(':move_sequence', $moveSequence, PDO::PARAM_STR);
    
    $stmt->execute();
    $questionId = $conn->lastInsertId();
    
    echo "Created test question with ID: $questionId\n";
    
    // 4. Verify the question was inserted correctly
    $verifyStmt = $conn->prepare("SELECT * FROM questions WHERE id = :id");
    $verifyStmt->bindParam(':id', $questionId, PDO::PARAM_INT);
    $verifyStmt->execute();
    $question = $verifyStmt->fetch(PDO::FETCH_ASSOC);
    
    if ($question) {
        echo "\nVerification of inserted question data:\n";
        
        foreach ($question as $field => $value) {
            if ($field === 'position' || $field === 'move_sequence') {
                echo "$field: " . substr($value, 0, 30) . "...\n";
            } else {
                echo "$field: $value\n";
            }
        }
        
        // 5. Verify the database columns for algebraic_notation and move_sequence
        if (isset($question['algebraic_notation']) && $question['algebraic_notation'] === $algebraicNotation) {
            echo "\n✓ Algebraic notation successfully saved.\n";
        } else {
            echo "\n✗ Algebraic notation was not saved correctly.\n";
            echo "  Expected: $algebraicNotation\n";
            echo "  Actual: " . ($question['algebraic_notation'] ?? 'NULL') . "\n";
        }
        
        if (isset($question['move_sequence']) && !empty($question['move_sequence'])) {
            $savedMoveSequence = json_decode($question['move_sequence'], true);
            $originalMoveSequence = json_decode($moveSequence, true);
            
            if (
                isset($savedMoveSequence[0]['from']) && 
                $savedMoveSequence[0]['from'] === $originalMoveSequence[0]['from'] &&
                $savedMoveSequence[0]['to'] === $originalMoveSequence[0]['to']
            ) {
                echo "✓ Move sequence successfully saved.\n";
            } else {
                echo "✗ Move sequence was not saved correctly.\n";
                echo "  Expected: " . substr($moveSequence, 0, 50) . "\n";
                echo "  Actual: " . substr($question['move_sequence'] ?? 'NULL', 0, 50) . "\n";
            }
        } else {
            echo "✗ Move sequence was not saved.\n";
        }
        
        echo "\nTest completed. The question data with algebraic notation and move sequence has been successfully saved.\n";
    } else {
        echo "\nError: Failed to retrieve the inserted question.\n";
    }
    
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?> 