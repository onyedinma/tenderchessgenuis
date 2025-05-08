<?php
// Get the API response
$response = file_get_contents('http://localhost/tenderchessgenius/api/question-banks/get-questions.php?bank_id=5');

// Decode the JSON
$data = json_decode($response, true);

// Pretty print the response
echo "API Response:\n";
echo "Success: " . ($data['success'] ? 'true' : 'false') . "\n";

if (isset($data['bank'])) {
    echo "\nBank Info:\n";
    echo "ID: " . $data['bank']['id'] . "\n";
    echo "Name: " . $data['bank']['name'] . "\n";
    echo "Section Type: " . $data['bank']['section_type'] . "\n";
}

if (isset($data['questions']) && is_array($data['questions'])) {
    echo "\nQuestions (" . count($data['questions']) . "):\n";
    
    foreach ($data['questions'] as $index => $question) {
        echo "\nQuestion #" . ($index + 1) . ":\n";
        echo "ID: " . $question['id'] . "\n";
        echo "Question Text: " . $question['question_text'] . "\n";
        echo "Correct Answer: " . $question['correct_answer'] . "\n";
        
        // Check if algebraic notation and move sequence are in the response
        echo "Algebraic Notation: " . (isset($question['algebraic_notation']) ? $question['algebraic_notation'] : 'NOT PRESENT') . "\n";
        
        if (isset($question['move_sequence'])) {
            if (is_array($question['move_sequence'])) {
                echo "Move Sequence: Present (Array)\n";
                print_r($question['move_sequence']);
            } else {
                echo "Move Sequence: " . substr($question['move_sequence'], 0, 100) . "\n";
            }
        } else {
            echo "Move Sequence: NOT PRESENT\n";
        }
        
        echo "Initial Position (FEN): " . $question['fen'] . "\n";
        echo "Solution Position (FEN): " . $question['solutionFen'] . "\n";
    }
} else {
    echo "\nNo questions found in the response.\n";
}
?> 