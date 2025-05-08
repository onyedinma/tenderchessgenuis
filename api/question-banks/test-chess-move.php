<?php
// Set content type to display in browser
header('Content-Type: text/html');

// Include the chess helper functions
require_once 'chess-helper.php';

echo "<h1>Chess Move Detection Test</h1>";

// Test with a simple pawn move (e2-e4)
$startFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"; // Starting position
$endFen = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1"; // After e2-e4

echo "<h2>Test Case 1: Simple Pawn Move</h2>";
echo "<p><strong>Starting Position (FEN):</strong> $startFen</p>";
echo "<p><strong>Ending Position (FEN):</strong> $endFen</p>";

$move = detectMove($startFen, $endFen);
echo "<h3>Move Details:</h3>";
echo "<ul>";
echo "<li>Piece: " . $move['piece'] . " (" . $move['movedPiece'] . ")</li>";
echo "<li>From: " . $move['from'] . "</li>";
echo "<li>To: " . $move['to'] . "</li>";
echo "</ul>";

echo "<p><strong>Generated Answer:</strong> " . generateMoveAnswer($startFen, $endFen) . "</p>";

// Test with a knight move (Nb1-c3)
$startFen = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1";
$endFen = "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2";

echo "<h2>Test Case 2: Knight Move</h2>";
echo "<p><strong>Starting Position (FEN):</strong> $startFen</p>";
echo "<p><strong>Ending Position (FEN):</strong> $endFen</p>";

$move = detectMove($startFen, $endFen);
echo "<h3>Move Details:</h3>";
echo "<ul>";
echo "<li>Piece: " . $move['piece'] . " (" . $move['movedPiece'] . ")</li>";
echo "<li>From: " . $move['from'] . "</li>";
echo "<li>To: " . $move['to'] . "</li>";
echo "</ul>";

echo "<p><strong>Generated Answer:</strong> " . generateMoveAnswer($startFen, $endFen) . "</p>";

// Form to test custom FEN strings
echo "<h2>Test Your Own Positions</h2>";
echo "<form method='post' action=''>";
echo "<div><label for='startFen'>Starting Position (FEN):</label><br>";
echo "<input type='text' id='startFen' name='startFen' size='80' value='" . 
    (isset($_POST['startFen']) ? htmlspecialchars($_POST['startFen']) : $startFen) . "'></div>";
echo "<div><label for='endFen'>Ending Position (FEN):</label><br>";
echo "<input type='text' id='endFen' name='endFen' size='80' value='" . 
    (isset($_POST['endFen']) ? htmlspecialchars($_POST['endFen']) : $endFen) . "'></div>";
echo "<div><input type='submit' value='Detect Move'></div>";
echo "</form>";

// Process the form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['startFen']) && isset($_POST['endFen'])) {
    $customStartFen = $_POST['startFen'];
    $customEndFen = $_POST['endFen'];
    
    echo "<h3>Your Custom Move Results:</h3>";
    echo "<p><strong>Starting Position (FEN):</strong> $customStartFen</p>";
    echo "<p><strong>Ending Position (FEN):</strong> $customEndFen</p>";
    
    try {
        $customMove = detectMove($customStartFen, $customEndFen);
        echo "<h4>Move Details:</h4>";
        echo "<ul>";
        echo "<li>Piece: " . $customMove['piece'] . " (" . $customMove['movedPiece'] . ")</li>";
        echo "<li>From: " . $customMove['from'] . "</li>";
        echo "<li>To: " . $customMove['to'] . "</li>";
        echo "</ul>";
        
        echo "<p><strong>Generated Answer:</strong> " . generateMoveAnswer($customStartFen, $customEndFen) . "</p>";
    } catch (Exception $e) {
        echo "<p style='color: red;'>Error: " . $e->getMessage() . "</p>";
    }
}

// Add integration guide for question bank
echo "<h2>How to Integrate with Question Bank</h2>";
echo "<p>To automatically generate correct answers for your chess questions, follow these steps:</p>";
echo "<ol>";
echo "<li>Store both the starting position FEN and the solution position FEN in your question.</li>";
echo "<li>When displaying the question, you can use the starting position FEN.</li>";
echo "<li>When checking answers or displaying the correct answer, use the <code>generateMoveAnswer()</code> function.</li>";
echo "</ol>";

echo "<h3>Example code for adding to add-question.php:</h3>";
echo "<pre>
// Include the chess helper functions
require_once 'chess-helper.php';

// In your form processing:
\$startingFen = \$_POST['starting_fen'];
\$solutionFen = \$_POST['solution_fen'];

// Store both in your database in the 'position' field as JSON
\$position = json_encode([
    'starting_fen' => \$startingFen,
    'solution_fen' => \$solutionFen
]);

// When generating the correct answer:
\$positionData = json_decode(\$question['position'], true);
\$correctAnswer = generateMoveAnswer(
    \$positionData['starting_fen'], 
    \$positionData['solution_fen']
);
</pre>";
?> 