<?php
// API to fetch a quiz by ID
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Start session to check user auth
session_start();

// CORS headers
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Check if user is logged in
if (!isset($_SESSION['user_id']) && !isset($_SESSION['user'])) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'User not authenticated'
    ]);
    exit();
}

// Include database configuration
require_once '../db/config.php';

// Check if ID is provided
if (!isset($_GET['id'])) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Quiz ID is required'
    ]);
    exit();
}

$quizId = intval($_GET['id']);

try {
    // First check if the puzzles table exists
    $stmt = $pdo->query("SHOW TABLES LIKE 'puzzles'");
    $puzzlesTableExists = $stmt->rowCount() > 0;
    
    if (!$puzzlesTableExists) {
        // Create puzzles table if it doesn't exist
        $pdo->exec("CREATE TABLE `puzzles` (
            `id` int(11) NOT NULL AUTO_INCREMENT,
            `quiz_id` int(11) NOT NULL,
            `fen` varchar(255) NOT NULL,
            `correct_move` varchar(10) NOT NULL,
            `difficulty` int(11) NOT NULL DEFAULT 1,
            `points` int(11) NOT NULL DEFAULT 10,
            `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            KEY `quiz_id` (`quiz_id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
        
        // Insert sample puzzles for each quiz
        $stmt = $pdo->query("SELECT id FROM quizzes");
        $quizIds = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        foreach ($quizIds as $id) {
            // Add 5 sample puzzles for each quiz
            $stmt = $pdo->prepare("INSERT INTO puzzles (quiz_id, fen, correct_move, difficulty, points) VALUES 
                (?, 'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2', 'Nc6', 1, 10),
                (?, 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3', 'Bb5', 2, 20),
                (?, 'r1bqkb1r/pppp1ppp/2n2n2/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4', 'O-O', 1, 10),
                (?, 'r1bqk2r/pppp1ppp/2n2n2/1B2p3/1b2P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 5 4', 'O-O', 2, 20),
                (?, 'r1bq1rk1/pppp1ppp/2n2n2/1B2p3/1b2P3/5N2/PPPP1PPP/RNBQ1RK1 w - - 6 5', 'd3', 3, 30)");
            $stmt->execute([$id, $id, $id, $id, $id]);
        }
    }
    
    // Query to fetch the quiz by ID
    $stmt = $pdo->prepare("SELECT * FROM quizzes WHERE id = ?");
    $stmt->execute([$quizId]);
    $quiz = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$quiz) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Quiz not found'
        ]);
        exit();
    }
    
    // Get puzzles for this quiz
    $stmt = $pdo->prepare("SELECT * FROM puzzles WHERE quiz_id = ? ORDER BY difficulty ASC");
    $stmt->execute([$quizId]);
    $puzzles = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Add puzzles to quiz response
    $quiz['puzzles'] = $puzzles;
    
    // Return quiz as JSON
    echo json_encode([
        'success' => true,
        'quiz' => $quiz
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?> 