<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Start session
session_start();

// Set headers
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Check if request method is GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

// Connect to database
require_once '../db/config.php';

try {
    // First check if puzzles table exists
    $tableCheck = $pdo->query("SHOW TABLES LIKE 'puzzles'");
    $tableExists = $tableCheck->rowCount() > 0;
    
    if (!$tableExists) {
        // Return empty result with a message
        echo json_encode([
            'success' => true,
            'puzzles' => [],
            'total' => 0,
            'limit' => isset($_GET['limit']) ? intval($_GET['limit']) : 100,
            'offset' => isset($_GET['offset']) ? intval($_GET['offset']) : 0,
            'message' => 'Puzzles table does not exist yet'
        ]);
        exit();
    }
    
    // Check if required columns exist
    try {
        $columnCheck = $pdo->query("DESCRIBE puzzles");
        $columns = $columnCheck->fetchAll(PDO::FETCH_COLUMN);
        $requiredColumns = ['id', 'fen', 'difficulty', 'created_at'];
        $missingColumns = [];
        
        foreach ($requiredColumns as $col) {
            if (!in_array($col, $columns)) {
                $missingColumns[] = $col;
            }
        }
        
        if (!empty($missingColumns)) {
            echo json_encode([
                'success' => true,
                'puzzles' => [],
                'total' => 0,
                'limit' => isset($_GET['limit']) ? intval($_GET['limit']) : 100,
                'offset' => isset($_GET['offset']) ? intval($_GET['offset']) : 0,
                'message' => 'Puzzles table is missing required columns: ' . implode(', ', $missingColumns)
            ]);
            exit();
        }
    } catch (PDOException $e) {
        // Table exists but DESCRIBE failed for some reason
        // Continue and let the query handle it
    }
    
    // Get search parameters
    $difficulty = isset($_GET['difficulty']) ? $_GET['difficulty'] : null;
    $category = isset($_GET['category']) ? $_GET['category'] : null;
    $search = isset($_GET['search']) ? $_GET['search'] : null;
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 100;
    $offset = isset($_GET['offset']) ? intval($_GET['offset']) : 0;
    
    // Build query with column existence checks
    $query = "SELECT p.id";
    
    // Only select columns that are known to exist
    if (in_array('title', $columns)) {
        $query .= ", p.title";
    } else {
        $query .= ", '' as title";
    }
    
    if (in_array('fen', $columns)) {
        $query .= ", p.fen";
    } else {
        $query .= ", '' as fen";
    }
    
    if (in_array('difficulty', $columns)) {
        $query .= ", p.difficulty";
    } else {
        $query .= ", 'medium' as difficulty";
    }
    
    if (in_array('category', $columns)) {
        $query .= ", p.category";
    } else {
        $query .= ", 'general' as category";
    }
    
    if (in_array('solution', $columns)) {
        $query .= ", p.solution";
    } else if (in_array('correct_move', $columns)) {
        $query .= ", p.correct_move as solution";
    } else {
        $query .= ", '' as solution";
    }
    
    if (in_array('created_at', $columns)) {
        $query .= ", p.created_at";
    } else {
        $query .= ", NOW() as created_at";
    }
    
    $query .= " FROM puzzles p WHERE 1=1";
    
    $params = [];
    
    // Add filters only for columns that exist
    if ($difficulty && in_array('difficulty', $columns)) {
        $query .= " AND p.difficulty = :difficulty";
        $params[':difficulty'] = $difficulty;
    }
    
    if ($category && in_array('category', $columns)) {
        $query .= " AND p.category = :category";
        $params[':category'] = $category;
    }
    
    if ($search) {
        $searchConditions = [];
        if (in_array('title', $columns)) {
            $searchConditions[] = "p.title LIKE :search";
        }
        if (in_array('fen', $columns)) {
            $searchConditions[] = "p.fen LIKE :search";
        }
        
        if (!empty($searchConditions)) {
            $query .= " AND (" . implode(" OR ", $searchConditions) . ")";
            $params[':search'] = "%$search%";
        }
    }
    
    // Add order by and limit
    if (in_array('created_at', $columns)) {
        $query .= " ORDER BY p.created_at DESC";
    } else {
        $query .= " ORDER BY p.id DESC";
    }
    
    $query .= " LIMIT :limit OFFSET :offset";
    $params[':limit'] = $limit;
    $params[':offset'] = $offset;
    
    // Execute query
    $stmt = $pdo->prepare($query);
    
    // Bind parameters
    foreach ($params as $key => $value) {
        if ($key == ':limit' || $key == ':offset') {
            $stmt->bindValue($key, $value, PDO::PARAM_INT);
        } else {
            $stmt->bindValue($key, $value, PDO::PARAM_STR);
        }
    }
    
    $stmt->execute();
    $puzzles = $stmt->fetchAll();
    
    // Get total count for pagination - simplified query
    $countQuery = "SELECT COUNT(*) as total FROM puzzles";
    $countStmt = $pdo->prepare($countQuery);
    $countStmt->execute();
    $totalCount = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Return puzzles
    echo json_encode([
        'success' => true,
        'puzzles' => $puzzles,
        'total' => $totalCount,
        'limit' => $limit,
        'offset' => $offset
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Failed to fetch puzzles: ' . $e->getMessage(),
        'debug_info' => [
            'error_code' => $e->getCode(),
            'trace' => $e->getTraceAsString()
        ]
    ]);
}
?> 