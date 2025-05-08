<?php
// API endpoint to save a puzzle from the React frontend

// Set headers for API response
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Just exit with 200 OK status
    exit(0);
}

// Only allow POST method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get the JSON data from the request body
$data = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (!isset($data['fen']) || !isset($data['solutionFen'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

// Include database connection
require_once '../../config/database.php';

try {
    // Extract data from request
    $id = isset($data['id']) ? intval($data['id']) : 0;
    $fen = $data['fen'];
    $solutionFen = $data['solutionFen'];
    $title = isset($data['title']) ? $data['title'] : '';
    $pgn = isset($data['pgn']) ? $data['pgn'] : '';
    $correct_move = isset($data['solution']) ? $data['solution'] : '';
    $section_type = isset($data['section_type']) ? $data['section_type'] : 'both';
    $difficulty = isset($data['difficulty']) ? strtolower($data['difficulty']) : 'medium';
    $tags = isset($data['tags']) ? $data['tags'] : '';
    
    // Convert category to tags if provided
    if (isset($data['category']) && !empty($data['category'])) {
        $tags = empty($tags) ? $data['category'] : $tags . ', ' . $data['category'];
    }
    
    // Create PDO connection
    $pdo = new PDO("mysql:host=localhost;dbname=tenderchessgenius", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    if ($id > 0) {
        // Update existing puzzle
        $sql = "UPDATE puzzles SET 
                fen = :fen, 
                solutionFen = :solutionFen, 
                pgn = :pgn, 
                correct_move = :correct_move, 
                section_type = :section_type, 
                difficulty = :difficulty, 
                tags = :tags 
                WHERE id = :id";
        
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':id', $id);
    } else {
        // Insert new puzzle
        $sql = "INSERT INTO puzzles (fen, solutionFen, pgn, correct_move, section_type, difficulty, tags) 
                VALUES (:fen, :solutionFen, :pgn, :correct_move, :section_type, :difficulty, :tags)";
        
        $stmt = $pdo->prepare($sql);
    }
    
    // Bind parameters
    $stmt->bindParam(':fen', $fen);
    $stmt->bindParam(':solutionFen', $solutionFen);
    $stmt->bindParam(':pgn', $pgn);
    $stmt->bindParam(':correct_move', $correct_move);
    $stmt->bindParam(':section_type', $section_type);
    $stmt->bindParam(':difficulty', $difficulty);
    $stmt->bindParam(':tags', $tags);
    
    // Execute the query
    $stmt->execute();
    
    // Get the inserted ID for new puzzles
    if ($id == 0) {
        $id = $pdo->lastInsertId();
    }
    
    // Return success response
    echo json_encode([
        'success' => true, 
        'message' => $id > 0 ? 'Puzzle updated successfully' : 'Puzzle added successfully',
        'id' => $id
    ]);
    
} catch (PDOException $e) {
    // Return error response
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?> 