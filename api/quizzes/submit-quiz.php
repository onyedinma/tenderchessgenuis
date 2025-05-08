<?php
// API to submit quiz answers and calculate score
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Start session for authentication
session_start();

// CORS headers
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
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

// Get user ID from session
$userId = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : $_SESSION['user']['id'];

// Check if request is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed'
    ]);
    exit();
}

// Get JSON data from request body
$data = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (!isset($data['quizId']) || !isset($data['answers']) || !isset($data['timeTaken'])) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Missing required fields: quizId, answers, timeTaken'
    ]);
    exit();
}

$quizId = intval($data['quizId']);
$answers = $data['answers'];
$timeTaken = intval($data['timeTaken']);

try {
    // Check if the quiz exists and user has access to it
    $stmt = $pdo->prepare("
        SELECT COUNT(*) 
        FROM quizzes q
        JOIN quiz_groups qg ON q.id = qg.quiz_id
        JOIN user_groups ug ON qg.group_id = ug.group_id
        WHERE q.id = ? AND ug.user_id = ?
    ");
    $stmt->execute([$quizId, $userId]);
    $hasAccess = (int)$stmt->fetchColumn() > 0;
    
    if (!$hasAccess) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'You do not have access to this quiz'
        ]);
        exit();
    }
    
    // Check if user has already submitted this quiz
    $stmt = $pdo->prepare("
        SELECT COUNT(*) 
        FROM submissions 
        WHERE quiz_id = ? AND user_id = ?
    ");
    $stmt->execute([$quizId, $userId]);
    $hasSubmission = (int)$stmt->fetchColumn() > 0;
    
    if ($hasSubmission) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'You have already submitted this quiz'
        ]);
        exit();
    }
    
    // Begin transaction
    $pdo->beginTransaction();
    
    // Create main submission record
    $stmt = $pdo->prepare("
        INSERT INTO submissions (quiz_id, user_id, time_taken, completed_at)
        VALUES (?, ?, ?, NOW())
    ");
    $stmt->execute([$quizId, $userId, $timeTaken]);
    $submissionId = $pdo->lastInsertId();
    
    // Calculate total score
    $totalScore = 0;
    $correctAnswers = 0;
    
    // Process each puzzle answer
    foreach ($answers as $puzzleId => $answer) {
        // Get the puzzle details and correct solution
        $stmt = $pdo->prepare("
            SELECT id, solution, points 
            FROM puzzles 
            WHERE id = ? AND quiz_id = ?
        ");
        $stmt->execute([intval($puzzleId), $quizId]);
        $puzzle = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$puzzle) {
            continue; // Skip if puzzle not found or not part of this quiz
        }
        
        // Compare user's answer with correct solution
        $isCorrect = 0;
        $pointsEarned = 0;
        
        if (strtolower(trim($answer)) === strtolower(trim($puzzle['solution']))) {
            $isCorrect = 1;
            $pointsEarned = $puzzle['points'];
            $totalScore += $pointsEarned;
            $correctAnswers++;
        }
        
        // Record the individual puzzle submission
        $stmt = $pdo->prepare("
            INSERT INTO puzzle_submissions (
                submission_id, puzzle_id, user_answer, 
                is_correct, points_earned, time_taken
            ) VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $submissionId, 
            $puzzle['id'], 
            $answer, 
            $isCorrect, 
            $pointsEarned, 
            $timeTaken / count($answers) // Distribute time equally for now
        ]);
    }
    
    // Update the total score in the main submission
    $stmt = $pdo->prepare("
        UPDATE submissions
        SET score = ?
        WHERE id = ?
    ");
    $stmt->execute([$totalScore, $submissionId]);
    
    // Commit transaction
    $pdo->commit();
    
    // Return success response with score details
    echo json_encode([
        'success' => true,
        'message' => 'Quiz submitted successfully',
        'submission' => [
            'id' => $submissionId,
            'score' => $totalScore,
            'correctAnswers' => $correctAnswers,
            'totalQuestions' => count($answers),
            'timeTaken' => $timeTaken,
            'completedAt' => date('Y-m-d H:i:s')
        ]
    ]);
    
} catch (PDOException $e) {
    // Roll back transaction on error
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?> 