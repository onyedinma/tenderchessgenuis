<?php
// Test the generate-answer.php endpoint with a sample position and solution

// Set up test data - standard starting position and e4 move
$testData = [
    'starting_fen' => 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    'solution_fen' => 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1'
];

echo "Testing generate-answer.php with:\n";
echo "Starting position: " . $testData['starting_fen'] . "\n";
echo "Solution position: " . $testData['solution_fen'] . "\n\n";

// Convert to JSON for the API request
$jsonData = json_encode($testData);

// Set up cURL request
$ch = curl_init('http://localhost/tenderchessgenius/api/question-banks/generate-answer.php');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonData);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Content-Length: ' . strlen($jsonData)
]);

// Execute the request
echo "Sending request...\n";
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Response HTTP code: $httpCode\n\n";

// Parse and display the response
if ($response) {
    echo "Raw response:\n";
    echo $response . "\n\n";
    
    $responseData = json_decode($response, true);
    
    if (json_last_error() === JSON_ERROR_NONE) {
        echo "Parsed response:\n";
        
        if (isset($responseData['success']) && $responseData['success']) {
            echo "Success: true\n";
            echo "Answer: " . $responseData['answer'] . "\n";
            
            if (isset($responseData['move_details'])) {
                echo "\nMove details:\n";
                echo "SAN: " . $responseData['move_details']['san'] . "\n";
                echo "UCI: " . $responseData['move_details']['uci'] . "\n";
                echo "From: " . $responseData['move_details']['from'] . "\n";
                echo "To: " . $responseData['move_details']['to'] . "\n";
                echo "Piece: " . $responseData['move_details']['piece'] . "\n";
                echo "Is Capture: " . ($responseData['move_details']['isCapture'] ? 'Yes' : 'No') . "\n";
            }
        } else {
            echo "Success: false\n";
            if (isset($responseData['message'])) {
                echo "Error message: " . $responseData['message'] . "\n";
            }
        }
    } else {
        echo "Error parsing JSON response: " . json_last_error_msg() . "\n";
    }
} else {
    echo "No response received\n";
}

// Now test with a capture move
echo "\n\n------------------------\n";
echo "Testing with a capture move\n";
echo "------------------------\n\n";

$captureTestData = [
    // Knight captures pawn
    'starting_fen' => 'rnbqkbnr/pppp1ppp/8/4p3/8/5N2/PPPPPPPP/RNBQKB1R w KQkq - 0 1',
    'solution_fen' => 'rnbqkbnr/pppp1ppp/8/4N3/8/8/PPPPPPPP/RNBQKB1R b KQkq - 0 1'
];

echo "Testing capture move:\n";
echo "Starting position: " . $captureTestData['starting_fen'] . "\n";
echo "Solution position: " . $captureTestData['solution_fen'] . "\n\n";

// Convert to JSON for the API request
$jsonData = json_encode($captureTestData);

// Set up cURL request
$ch = curl_init('http://localhost/tenderchessgenius/api/question-banks/generate-answer.php');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonData);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Content-Length: ' . strlen($jsonData)
]);

// Execute the request
echo "Sending request...\n";
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Response HTTP code: $httpCode\n\n";

// Parse and display the response
if ($response) {
    echo "Raw response:\n";
    echo $response . "\n\n";
    
    $responseData = json_decode($response, true);
    
    if (json_last_error() === JSON_ERROR_NONE) {
        echo "Parsed response:\n";
        
        if (isset($responseData['success']) && $responseData['success']) {
            echo "Success: true\n";
            echo "Answer: " . $responseData['answer'] . "\n";
            
            if (isset($responseData['move_details'])) {
                echo "\nMove details:\n";
                echo "SAN: " . $responseData['move_details']['san'] . "\n";
                echo "UCI: " . $responseData['move_details']['uci'] . "\n";
                echo "From: " . $responseData['move_details']['from'] . "\n";
                echo "To: " . $responseData['move_details']['to'] . "\n";
                echo "Piece: " . $responseData['move_details']['piece'] . "\n";
                echo "Is Capture: " . ($responseData['move_details']['isCapture'] ? 'Yes' : 'No') . "\n";
            }
        } else {
            echo "Success: false\n";
            if (isset($responseData['message'])) {
                echo "Error message: " . $responseData['message'] . "\n";
            }
        }
    } else {
        echo "Error parsing JSON response: " . json_last_error_msg() . "\n";
    }
} else {
    echo "No response received\n";
}
?> 