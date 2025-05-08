<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Include the chess helper functions
require_once __DIR__ . '/chess-helper.php';

try {
    // Get request data
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Validate required fields
    if (!isset($data['starting_fen']) || !isset($data['solution_fen'])) {
        throw new Exception("Missing required FEN positions");
    }
    
    $startingFen = $data['starting_fen'];
    $solutionFen = $data['solution_fen'];
    
    // Check if positions are valid FEN
    if (!isValidFen($startingFen) || !isValidFen($solutionFen)) {
        throw new Exception("Invalid FEN notation");
    }
    
    // If positions are the same, we can't determine a move
    if ($startingFen === $solutionFen) {
        throw new Exception("Starting and solution positions are the same");
    }
    
    // Generate the answer using our chess helper
    $answer = generateMoveAnswer($startingFen, $solutionFen);
    
    // Get additional move details for debugging and enrichment
    $moveDetails = detectMove($startingFen, $solutionFen);
    
    // Return the answer and details
    echo json_encode([
        'success' => true,
        'answer' => $answer,
        'move_details' => $moveDetails
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

/**
 * Basic validation of FEN notation
 * 
 * @param string $fen The FEN string to validate
 * @return bool Whether the FEN is valid
 */
function isValidFen($fen) {
    // Basic validation - this could be more comprehensive
    if (empty($fen)) {
        return false;
    }
    
    // Split FEN into parts
    $parts = explode(' ', $fen);
    
    // Should have at least the board part
    if (count($parts) < 1) {
        return false;
    }
    
    // Check if board part has 8 ranks
    $ranks = explode('/', $parts[0]);
    if (count($ranks) !== 8) {
        return false;
    }
    
    // Additional checks could be added here
    
    return true;
}
?> 