<?php
// Test script for move analysis

// Include the chess helper functions
require_once 'chess-helper.php';

// Set content type for browser viewing
header('Content-Type: text/html');

echo "<h1>Test Move Analysis</h1>";

// Get positions from form or use defaults
$startingFen = isset($_POST['starting_fen']) 
    ? $_POST['starting_fen'] 
    : "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
$solutionFen = isset($_POST['solution_fen']) 
    ? $_POST['solution_fen'] 
    : "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1";

// Display form for testing
echo "<div style='margin-bottom: 20px; padding: 15px; border: 1px solid #ccc; border-radius: 5px;'>";
echo "<h2>Test Different Positions</h2>";
echo "<form method='post' action=''>";
echo "<div style='margin-bottom: 10px;'>";
echo "<label for='starting_fen'>Starting Position (FEN):</label><br>";
echo "<input type='text' id='starting_fen' name='starting_fen' value='" . htmlspecialchars($startingFen) . "' style='width: 100%; padding: 5px;'>";
echo "</div>";
echo "<div style='margin-bottom: 10px;'>";
echo "<label for='solution_fen'>Solution Position (FEN):</label><br>";
echo "<input type='text' id='solution_fen' name='solution_fen' value='" . htmlspecialchars($solutionFen) . "' style='width: 100%; padding: 5px;'>";
echo "</div>";
echo "<div>";
echo "<input type='submit' value='Analyze Move' style='padding: 8px 15px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;'>";
echo "</div>";
echo "</form>";
echo "</div>";

echo "<h2>Starting Position:</h2>";
echo "<pre>$startingFen</pre>";

echo "<h2>Solution Position:</h2>";
echo "<pre>$solutionFen</pre>";

// Analyze the positions
echo "<h2>Move Analysis:</h2>";

// Parse positions into board arrays
$startBoard = fenToBoard(explode(' ', $startingFen)[0]);
$endBoard = fenToBoard(explode(' ', $solutionFen)[0]);

echo "<h3>Starting Board:</h3>";
echo "<div style='font-family: monospace; font-size: 14px; background-color: #f5f5f5; padding: 10px; border-radius: 5px;'>";
printBoard($startBoard);
echo "</div>";

echo "<h3>Solution Board:</h3>";
echo "<div style='font-family: monospace; font-size: 14px; background-color: #f5f5f5; padding: 10px; border-radius: 5px;'>";
printBoard($endBoard);
echo "</div>";

// Detect the move
$moveDetails = detectMove($startingFen, $solutionFen);

echo "<h3>Move Details:</h3>";
echo "<div style='background-color: #f0f8ff; padding: 10px; border-radius: 5px;'>";
echo "<table style='width: 100%; border-collapse: collapse;'>";
echo "<tr><th style='text-align: left; padding: 5px; border-bottom: 1px solid #ddd;'>Property</th><th style='text-align: left; padding: 5px; border-bottom: 1px solid #ddd;'>Value</th></tr>";
foreach ($moveDetails as $key => $value) {
    echo "<tr><td style='padding: 5px; border-bottom: 1px solid #ddd;'>$key</td><td style='padding: 5px; border-bottom: 1px solid #ddd;'>$value</td></tr>";
}
echo "</table>";
echo "</div>";

echo "<h3>Generated Answer:</h3>";
echo "<div style='background-color: #e6ffe6; padding: 15px; border-radius: 5px; font-size: 16px; font-weight: bold;'>";
echo generateMoveAnswer($startingFen, $solutionFen);
echo "</div>";

echo "<h2>Common Test Cases</h2>";
echo "<div style='display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px;'>";

// Function to create a test case button
function createTestCaseButton($label, $startFen, $endFen) {
    echo "<form method='post' action='' style='margin-right: 10px;'>";
    echo "<input type='hidden' name='starting_fen' value='$startFen'>";
    echo "<input type='hidden' name='solution_fen' value='$endFen'>";
    echo "<input type='submit' value='$label' style='padding: 8px 15px; background-color: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer;'>";
    echo "</form>";
}

// Add some common test cases
createTestCaseButton("Pawn e2-e4", 
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1");

createTestCaseButton("Knight b1-c3", 
    "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
    "rnbqkbnr/pppp1ppp/8/4p3/4P3/2N5/PPPP1PPP/R1BQKBNR b KQkq - 1 2");

createTestCaseButton("Bishop f1-c4", 
    "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
    "rnbqkbnr/pppp1ppp/8/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR b KQkq - 1 2");

createTestCaseButton("Queen d1-h5", 
    "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
    "rnbqkbnr/pppp1ppp/8/4p2Q/4P3/8/PPPP1PPP/RNB1KBNR b KQkq - 1 2");

createTestCaseButton("King e1-e2", 
    "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
    "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPPKPPP/RNBQ1BNR b kq - 1 2");

createTestCaseButton("Rook a1-d1", 
    "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
    "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 2");

echo "</div>";

/**
 * Helper function to print a chess board
 */
function printBoard($board) {
    echo "<pre style='margin: 0;'>";
    for ($rank = 0; $rank < 8; $rank++) {
        $row = 8 - $rank . " ";
        for ($file = 0; $file < 8; $file++) {
            $piece = $board[$rank][$file];
            if ($piece === '') {
                $row .= ". ";
            } else {
                $row .= $piece . " ";
            }
        }
        echo $row . "\n";
    }
    echo "  a b c d e f g h\n";
    echo "</pre>";
}
?> 