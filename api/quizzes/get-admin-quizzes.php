<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Start or resume the session
session_start();

// Include database configuration
require_once '../db/config.php';

// Set CORS headers
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Check if user is logged in and is an admin
if (!isset($_SESSION['user_id']) || !isset($_SESSION['is_admin']) || $_SESSION['is_admin'] !== true) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Unauthorized. Admin access required.']);
    exit();
}

// Handle GET request
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // Get query parameters for filtering
        $status = isset($_GET['status']) ? $_GET['status'] : null;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
        $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
        
        // Base query
        $query = "
            SELECT 
                q.id, 
                q.title, 
                q.description, 
                q.scheduled_date, 
                q.duration_minutes, 
                q.created_by,
                q.status,
                u.name as creator_name,
                COUNT(DISTINCT qp.puzzle_id) as puzzle_count,
                COUNT(DISTINCT qug.group_id) as group_count
            FROM 
                quizzes q
            LEFT JOIN 
                users u ON q.created_by = u.id
            LEFT JOIN 
                quiz_puzzles qp ON q.id = qp.quiz_id
            LEFT JOIN 
                quiz_user_groups qug ON q.id = qug.quiz_id
        ";
        
        // Add filtering
        $params = [];
        $where_clauses = [];
        
        if ($status) {
            $where_clauses[] = "q.status = ?";
            $params[] = $status;
        }
        
        if (!empty($where_clauses)) {
            $query .= " WHERE " . implode(" AND ", $where_clauses);
        }
        
        // Add grouping
        $query .= " GROUP BY q.id";
        
        // Add ordering
        $query .= " ORDER BY q.scheduled_date DESC, q.id DESC";
        
        // Add pagination
        $query .= " LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;
        
        // Execute the query
        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        $quizzes = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Count total quizzes
        $count_query = "SELECT COUNT(DISTINCT q.id) as total FROM quizzes q";
        if (!empty($where_clauses)) {
            $count_query .= " WHERE " . implode(" AND ", $where_clauses);
        }
        
        $count_stmt = $pdo->prepare($count_query);
        $count_stmt->execute(array_slice($params, 0, count($params) - 2)); // Remove limit and offset
        $total = $count_stmt->fetchColumn();
        
        // Get additional data for each quiz
        foreach ($quizzes as &$quiz) {
            // Get puzzles for this quiz
            $puzzle_stmt = $pdo->prepare("
                SELECT 
                    p.id, 
                    p.title, 
                    p.difficulty, 
                    p.category
                FROM 
                    quiz_puzzles qp
                JOIN 
                    puzzles p ON qp.puzzle_id = p.id
                WHERE 
                    qp.quiz_id = ?
                ORDER BY 
                    qp.position
                LIMIT 5
            ");
            $puzzle_stmt->execute([$quiz['id']]);
            $quiz['puzzles'] = $puzzle_stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Get groups for this quiz
            $group_stmt = $pdo->prepare("
                SELECT 
                    g.id, 
                    g.name
                FROM 
                    quiz_user_groups qug
                JOIN 
                    user_groups g ON qug.group_id = g.id
                WHERE 
                    qug.quiz_id = ?
            ");
            $group_stmt->execute([$quiz['id']]);
            $quiz['user_groups'] = $group_stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Get submission count
            $submission_stmt = $pdo->prepare("
                SELECT 
                    COUNT(DISTINCT user_id) as submission_count
                FROM 
                    quiz_submissions
                WHERE 
                    quiz_id = ?
            ");
            $submission_stmt->execute([$quiz['id']]);
            $quiz['submission_count'] = (int)$submission_stmt->fetchColumn();
        }
        
        // Return the results
        echo json_encode([
            'success' => true,
            'quizzes' => $quizzes,
            'total' => $total,
            'limit' => $limit,
            'offset' => $offset
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Database error: ' . $e->getMessage()
        ]);
    }
} else {
    // Method not allowed
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?> 