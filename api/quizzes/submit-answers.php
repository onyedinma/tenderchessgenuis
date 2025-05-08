<?php
// Start session
session_start();

// Set CORS headers properly for credentials
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Check if it's a POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
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

// Get JSON data from request body
$data = json_decode(file_get_contents("php://input"), true);

// Validate inputs
if (!isset($data['quizId']) || !isset($data['answers']) || !is_array($data['answers'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid input data']);
    exit;
}

$quizId = (int)$data['quizId'];
$answers = $data['answers'];
$timeTaken = isset($data['timeTaken']) ? (int)$data['timeTaken'] : 0;
$userId = $_SESSION['user_id'];

try {
    // Start transaction
    $pdo->beginTransaction();
    
    // Check if quiz exists and user has access to it
    $stmt = $pdo->prepare("
        SELECT q.id, q.group_id, q.time_limit 
        FROM quizzes q
        WHERE q.id = ?
    ");
    $stmt->execute([$quizId]);
    $quiz = $stmt->fetch();
    
    if (!$quiz) {
        throw new Exception('Quiz not found');
    }
    
    // If quiz is associated with a group, check if user belongs to it
    if ($quiz['group_id']) {
        $stmt = $pdo->prepare("
            SELECT 1 
            FROM user_groups 
            WHERE user_id = ? AND group_id = ?
        ");
        $stmt->execute([$userId, $quiz['group_id']]);
        
        if ($stmt->rowCount() == 0) {
            throw new Exception('You do not have access to this quiz');
        }
    }
    
    // Get puzzles for this quiz
    $stmt = $pdo->prepare("
        SELECT id, correct_answer, points 
        FROM puzzles 
        WHERE quiz_id = ? 
        ORDER BY puzzle_order
    ");
    $stmt->execute([$quizId]);
    $puzzles = $stmt->fetchAll();
    
    if (count($puzzles) == 0) {
        throw new Exception('No puzzles found for this quiz');
    }
    
    // Create a submission record
    $stmt = $pdo->prepare("
        INSERT INTO quiz_submissions (
            user_id, quiz_id, time_taken, submission_date
        ) VALUES (?, ?, ?, NOW())
    ");
    $stmt->execute([$userId, $quizId, $timeTaken]);
    $submissionId = $pdo->lastInsertId();
    
    // Process answers and calculate score
    $totalPoints = 0;
    $earnedPoints = 0;
    $correctAnswers = 0;
    
    // For each answer in the submission
    foreach ($answers as $index => $answer) {
        if (!isset($puzzles[$index])) {
            continue; // Skip if there's no matching puzzle
        }
        
        $puzzle = $puzzles[$index];
        $puzzleId = $puzzle['id'];
        $correctAnswer = $puzzle['correct_answer'];
        $possiblePoints = $puzzle['points'];
        
        // Determine if answer is correct
        $isCorrect = 0;
        $pointsEarned = 0;
        
        if (isset($answer['answer']) && trim(strtolower($answer['answer'])) === trim(strtolower($correctAnswer))) {
            $isCorrect = 1;
            $pointsEarned = $possiblePoints;
            $correctAnswers++;
        }
        
        $totalPoints += $possiblePoints;
        $earnedPoints += $pointsEarned;
        
        // Calculate time taken for this puzzle if available
        $puzzleTimeTaken = isset($answer['timeTaken']) ? (int)$answer['timeTaken'] : 0;
        
        // Save the answer
        $stmt = $pdo->prepare("
            INSERT INTO puzzle_answers (
                submission_id, puzzle_id, user_answer, is_correct, 
                points_earned, time_taken
            ) VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $submissionId, $puzzleId, $answer['answer'] ?? '', 
            $isCorrect, $pointsEarned, $puzzleTimeTaken
        ]);
    }
    
    // Calculate final score as a percentage
    $score = $totalPoints > 0 ? round(($earnedPoints / $totalPoints) * 100) : 0;
    
    // Update the submission with the score
    $stmt = $pdo->prepare("
        UPDATE quiz_submissions 
        SET score = ?, correct_answers = ? 
        WHERE id = ?
    ");
    $stmt->execute([$score, $correctAnswers, $submissionId]);
    
    // Commit the transaction
    $pdo->commit();
    
    // Return success with the submission ID and score
    echo json_encode([
        'success' => true,
        'message' => 'Quiz submitted successfully',
        'data' => [
            'submissionId' => $submissionId,
            'score' => $score,
            'correctAnswers' => $correctAnswers,
            'totalPuzzles' => count($puzzles),
            'timeTaken' => $timeTaken
        ]
    ]);
    
} catch (Exception $e) {
    // Rollback the transaction in case of error
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?> 