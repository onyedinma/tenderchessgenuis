<?php
// Start session
session_start();

// Set CORS headers properly for credentials
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Check if it's a GET request
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
    exit;
}

// Include database configuration
require_once '../db/config.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

// Get quiz ID from URL parameter
if (!isset($_GET['id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Quiz ID is required']);
    exit;
}

$quizId = (int)$_GET['id'];
$userId = $_SESSION['user_id'];

try {
    // Check if the user has a submission for this quiz
    $stmt = $pdo->prepare("
        SELECT 
            qs.id AS submission_id,
            qs.score,
            qs.time_taken,
            qs.correct_answers,
            qs.submission_date,
            q.title AS quiz_title,
            q.description AS quiz_description,
            (SELECT COUNT(*) FROM puzzles WHERE quiz_id = q.id) AS total_puzzles
        FROM quiz_submissions qs
        JOIN quizzes q ON qs.quiz_id = q.id
        WHERE qs.user_id = ? AND qs.quiz_id = ?
        ORDER BY qs.submission_date DESC
        LIMIT 1
    ");
    
    $stmt->execute([$userId, $quizId]);
    $submission = $stmt->fetch();
    
    if (!$submission) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'No quiz submission found']);
        exit;
    }
    
    // Get the puzzle answers for this submission
    $stmt = $pdo->prepare("
        SELECT 
            pa.id,
            pa.puzzle_id,
            pa.user_answer,
            pa.is_correct,
            pa.points_earned,
            pa.time_taken,
            p.question,
            p.correct_answer,
            p.points,
            p.difficulty,
            p.puzzle_order
        FROM puzzle_answers pa
        JOIN puzzles p ON pa.puzzle_id = p.id
        WHERE pa.submission_id = ?
        ORDER BY p.puzzle_order
    ");
    
    $stmt->execute([$submission['submission_id']]);
    $puzzleAnswers = $stmt->fetchAll();
    
    // Format the results
    $formattedPuzzleResults = [];
    foreach ($puzzleAnswers as $answer) {
        $formattedPuzzleResults[] = [
            'id' => $answer['puzzle_id'],
            'title' => $answer['question'],
            'userAnswer' => $answer['user_answer'],
            'correctAnswer' => $answer['correct_answer'],
            'isCorrect' => (bool)$answer['is_correct'],
            'timeTaken' => (int)$answer['time_taken'],
            'points' => (int)$answer['points_earned'],
            'possiblePoints' => (int)$answer['points'],
            'difficulty' => $answer['difficulty'],
            'order' => (int)$answer['puzzle_order']
        ];
    }
    
    // Calculate performance metrics
    $totalTimeTaken = (int)$submission['time_taken'];
    $averageTimePerPuzzle = count($puzzleAnswers) > 0 ? 
        round($totalTimeTaken / count($puzzleAnswers)) : 0;
    
    $totalPossiblePoints = array_sum(array_column($puzzleAnswers, 'points'));
    $totalEarnedPoints = array_sum(array_column($puzzleAnswers, 'points_earned'));
    
    $results = [
        'quizId' => $quizId,
        'quizTitle' => $submission['quiz_title'],
        'quizDescription' => $submission['quiz_description'],
        'totalPuzzles' => (int)$submission['total_puzzles'],
        'correctAnswers' => (int)$submission['correct_answers'],
        'score' => (int)$submission['score'],
        'timeTaken' => $totalTimeTaken,
        'averageTimePerPuzzle' => $averageTimePerPuzzle,
        'submissionDate' => $submission['submission_date'],
        'totalPoints' => $totalEarnedPoints,
        'possiblePoints' => $totalPossiblePoints,
        'puzzleResults' => $formattedPuzzleResults
    ];
    
    // Return the results
    echo json_encode([
        'success' => true,
        'results' => $results
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?> 