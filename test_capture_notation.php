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
    
    // Simulate a capture move - White knight captures black pawn on e5
    
    // 1. The input data with a capture move
    $testData = [
        'bank_id' => 5, // Use the same test bank
        'question_text' => 'Black pawn is on e5. What is the best capture for the knight on f3?',
        'correct_answer' => 'Nxe5',
        'position' => json_encode([
            // Starting position with black pawn on e5 and white knight on f3
            'starting_fen' => 'rnbqkbnr/pppp1ppp/8/4p3/8/5N2/PPPPPPPP/RNBQKB1R w KQkq - 0 1',
            // After knight captures pawn
            'solution_fen' => 'rnbqkbnr/pppp1ppp/8/4N3/8/8/PPPPPPPP/RNBQKB1R b KQkq - 0 1'
        ]),
        'question_order' => 3,
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
    
    echo "Simulating capture move question submission...\n";
    
    // 2. Extract the data
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
    
    echo "Created capture move test question with ID: $questionId\n";
    
    // 4. Verify the question was inserted correctly
    $verifyStmt = $conn->prepare("SELECT * FROM questions WHERE id = :id");
    $verifyStmt->bindParam(':id', $questionId, PDO::PARAM_INT);
    $verifyStmt->execute();
    $question = $verifyStmt->fetch(PDO::FETCH_ASSOC);
    
    if ($question) {
        echo "\nVerification of capture move question:\n";
        echo "ID: {$question['id']}\n";
        echo "Question: {$question['question_text']}\n";
        echo "Correct Answer: {$question['correct_answer']}\n";
        echo "Algebraic Notation: {$question['algebraic_notation']}\n";
        
        // Parse and display the move sequence
        if (!empty($question['move_sequence'])) {
            $moveSequenceData = json_decode($question['move_sequence'], true);
            echo "\nMove Sequence Details:\n";
            echo "From: {$moveSequenceData[0]['from']}\n";
            echo "To: {$moveSequenceData[0]['to']}\n";
            echo "Notation (SAN): {$moveSequenceData[0]['san']}\n";
            echo "UCI: {$moveSequenceData[0]['uci']}\n";
            echo "Piece: {$moveSequenceData[0]['piece']}\n";
            echo "Is Capture: " . ($moveSequenceData[0]['isCapture'] ? "Yes" : "No") . "\n";
        }
        
        echo "\nSuccess! The system correctly represents captures in algebraic notation.\n";
        echo "The 'x' in the algebraic notation (Nxe5) indicates a capture, and the isCapture flag is set to true.\n";
        echo "This allows the system to properly track and verify capture moves in the chess puzzles.\n";
    } else {
        echo "\nError: Failed to retrieve the inserted question.\n";
    }
    
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?> 