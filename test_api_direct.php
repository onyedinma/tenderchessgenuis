<?php
// Connect to database and directly execute the same query as the API
$host = 'localhost';
$dbname = 'tenderchessgenius';
$username = 'root';
$password = '';

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "Connected successfully\n";
    
    $bankId = 5; // Use the same bank ID we've been testing with
    
    // First check if the bank exists
    $bankStmt = $conn->prepare("SELECT id, name, section_type FROM question_banks WHERE id = :bank_id");
    $bankStmt->execute([':bank_id' => $bankId]);
    $bank = $bankStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$bank) {
        echo "Bank with ID $bankId not found!\n";
        exit;
    }
    
    echo "Found bank: {$bank['name']} (ID: {$bank['id']})\n\n";
    
    // Execute the same query as get-questions.php
    $sql = "SELECT id, question_text, correct_answer, position, question_order, is_active, 
            algebraic_notation, move_sequence
            FROM questions 
            WHERE bank_id = :bank_id 
            ORDER BY question_order ASC";
    
    $stmt = $conn->prepare($sql);
    $stmt->execute([':bank_id' => $bankId]);
    
    $questions = [];
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        // Show raw data first
        echo "Raw database row for question ID {$row['id']}:\n";
        echo "algebraic_notation: " . ($row['algebraic_notation'] ?? 'NULL') . "\n";
        echo "move_sequence: " . ($row['move_sequence'] ?? 'NULL') . "\n\n";
        
        // Parse the position JSON to get FEN strings (same as API)
        $positionData = json_decode($row['position'], true);
        $fen = isset($positionData['starting_fen']) ? $positionData['starting_fen'] : '';
        $solutionFen = isset($positionData['solution_fen']) ? $positionData['solution_fen'] : '';
        
        // Process move sequence (same as API)
        $moveSequence = [];
        if (isset($row['move_sequence']) && !empty($row['move_sequence'])) {
            try {
                $moveSequence = json_decode($row['move_sequence'], true);
                echo "Successfully parsed move_sequence JSON\n";
            } catch (Exception $e) {
                echo "Error parsing move_sequence JSON: " . $e->getMessage() . "\n";
            }
        }
        
        // Get algebraic notation (same as API)
        $algebraicNotation = $row['algebraic_notation'] ?? '';
        
        // Build the question object (same as API)
        $questions[] = [
            'id' => $row['id'],
            'fen' => $fen,
            'solutionFen' => $solutionFen,
            'order' => $row['question_order'],
            'is_active' => $row['is_active'] ? true : false,
            'question_text' => $row['question_text'],
            'correct_answer' => $row['correct_answer'],
            'algebraic_notation' => $algebraicNotation,
            'move_sequence' => $moveSequence
        ];
    }
    
    // Print the constructed questions array (what would be returned by the API)
    echo "Processed questions array:\n";
    foreach ($questions as $index => $question) {
        echo "\nQuestion #" . ($index + 1) . ":\n";
        echo "ID: " . $question['id'] . "\n";
        echo "Algebraic Notation: " . ($question['algebraic_notation'] ?? 'NOT SET') . "\n";
        echo "Move Sequence: " . (is_array($question['move_sequence']) ? 'Array with ' . count($question['move_sequence']) . ' items' : 'NOT AN ARRAY') . "\n";
        
        if (is_array($question['move_sequence'])) {
            print_r($question['move_sequence']);
        }
    }
    
    // Create the final response object (same as API)
    $responseData = [
        'success' => true,
        'bank' => [
            'id' => $bank['id'],
            'name' => $bank['name'],
            'section_type' => $bank['section_type']
        ],
        'questions' => $questions
    ];
    
    // Print the JSON that would be returned
    echo "\nFinal JSON response (formatted for readability):\n";
    echo json_encode($responseData, JSON_PRETTY_PRINT);
    
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?> 