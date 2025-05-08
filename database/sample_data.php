<?php
// Script to add sample data to tenderchessgenius database

// Database configuration 
$db_host = 'localhost';
$db_name = 'tenderchessgenius';
$db_user = 'root';
$db_pass = '';

try {
    // Connect to the database
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Begin transaction for bulk inserts
    $pdo->beginTransaction();
    
    // 1. Create admin user if not exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = 'admin@chessgenius.com'");
    $stmt->execute();
    $adminId = $stmt->fetchColumn();
    
    if (!$adminId) {
        // Create admin user
        $stmt = $pdo->prepare("INSERT INTO users (name, email, password, role, created_at) 
                              VALUES (?, ?, ?, ?, NOW())");
        $stmt->execute([
            'Admin User', 
            'admin@chessgenius.com', 
            password_hash('admin123', PASSWORD_DEFAULT),
            'admin'
        ]);
        $adminId = $pdo->lastInsertId();
        echo "Created admin user (ID: $adminId)\n";
        
        // Assign admin role
        $stmt = $pdo->prepare("INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)");
        $stmt->execute([$adminId, 1]); // 1 = admin role
        echo "Assigned admin role to admin user\n";
    } else {
        echo "Admin user already exists (ID: $adminId)\n";
    }
    
    // 2. Create regular user if not exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = 'user@chessgenius.com'");
    $stmt->execute();
    $userId = $stmt->fetchColumn();
    
    if (!$userId) {
        // Create regular user
        $stmt = $pdo->prepare("INSERT INTO users (name, email, password, role, created_at) 
                              VALUES (?, ?, ?, ?, NOW())");
        $stmt->execute([
            'Regular User', 
            'user@chessgenius.com', 
            password_hash('user123', PASSWORD_DEFAULT),
            'user'
        ]);
        $userId = $pdo->lastInsertId();
        echo "Created regular user (ID: $userId)\n";
        
        // Assign user role
        $stmt = $pdo->prepare("INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)");
        $stmt->execute([$userId, 2]); // 2 = user role
        echo "Assigned user role to regular user\n";
    } else {
        echo "Regular user already exists (ID: $userId)\n";
    }
    
    // 3. Create groups
    $groups = [
        ['Beginners', 'For chess beginners with rating < 1200'],
        ['Intermediate', 'For intermediate players with rating 1200-1800'],
        ['Advanced', 'For advanced players with rating > 1800']
    ];
    
    $groupIds = [];
    foreach ($groups as $group) {
        $stmt = $pdo->prepare("SELECT id FROM groups WHERE name = ?");
        $stmt->execute([$group[0]]);
        $groupId = $stmt->fetchColumn();
        
        if (!$groupId) {
            $stmt = $pdo->prepare("INSERT INTO groups (name, description) VALUES (?, ?)");
            $stmt->execute($group);
            $groupId = $pdo->lastInsertId();
            echo "Created group: {$group[0]} (ID: $groupId)\n";
        } else {
            echo "Group {$group[0]} already exists (ID: $groupId)\n";
        }
        
        $groupIds[$group[0]] = $groupId;
    }
    
    // 4. Add users to groups
    if ($userId) {
        // Add regular user to Beginners group
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM group_user WHERE user_id = ? AND group_id = ?");
        $stmt->execute([$userId, $groupIds['Beginners']]);
        
        if ($stmt->fetchColumn() == 0) {
            $stmt = $pdo->prepare("INSERT INTO group_user (user_id, group_id) VALUES (?, ?)");
            $stmt->execute([$userId, $groupIds['Beginners']]);
            echo "Added regular user to Beginners group\n";
        }
    }
    
    // 5. Create sample puzzles
    $puzzles = [
        [
            'fen' => 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
            'pgn' => '1. e4 e5 2. Nf3 Nc6',
            'section_type' => 'both',
            'correct_move' => 'Bb5',
            'difficulty' => 'easy',
            'tags' => 'opening,pin'
        ],
        [
            'fen' => 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
            'pgn' => '1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6',
            'section_type' => 'both',
            'correct_move' => 'Ng5',
            'difficulty' => 'medium',
            'tags' => 'opening,attack'
        ],
        [
            'fen' => '1r3rk1/5ppp/p1p5/3pPb2/1qP5/1P1B1N2/P5PP/R2Q1RK1 w - - 0 22',
            'pgn' => '[Event "?"]\n[Site "?"]\n[Date "????.??.??"]\n[Round "?"]\n[White "?"]\n[Black "?"]\n[Result "*"]\n\n1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d3 d6 6. O-O O-O 7. h3 a6 8. Re1 Ba7 9. Bb3 Be6 10. Bc2 d5 11. exd5 Bxd5 12. Nbd2 Re8 13. Nf1 Bf5 14. Be3 Bxe3 15. Rxe3 Qd6 16. Qd2 Rad8 17. b3 e4 18. dxe4 Nxe4 19. Bxe4 Bxe4 20. Rd3 Qb4 21. Bd3 Bxd3 *',
            'section_type' => '1',
            'correct_move' => 'Bxf5',
            'difficulty' => 'hard',
            'tags' => 'middlegame,tactics,exchange'
        ]
    ];
    
    $puzzleIds = [];
    foreach ($puzzles as $index => $puzzle) {
        $stmt = $pdo->prepare("SELECT id FROM puzzles WHERE fen = ?");
        $stmt->execute([$puzzle['fen']]);
        $puzzleId = $stmt->fetchColumn();
        
        if (!$puzzleId) {
            $stmt = $pdo->prepare("INSERT INTO puzzles (fen, pgn, section_type, correct_move, difficulty, tags) 
                                  VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $puzzle['fen'],
                $puzzle['pgn'],
                $puzzle['section_type'],
                $puzzle['correct_move'],
                $puzzle['difficulty'],
                $puzzle['tags']
            ]);
            $puzzleId = $pdo->lastInsertId();
            echo "Created puzzle " . ($index + 1) . " (ID: $puzzleId)\n";
        } else {
            echo "Puzzle " . ($index + 1) . " already exists (ID: $puzzleId)\n";
        }
        
        $puzzleIds[] = $puzzleId;
    }
    
    // 6. Create a sample quiz
    if (!empty($puzzleIds) && $adminId && isset($groupIds['Beginners'])) {
        $stmt = $pdo->prepare("SELECT id FROM quizzes WHERE title = 'Sample Basic Chess Quiz'");
        $stmt->execute();
        $quizId = $stmt->fetchColumn();
        
        if (!$quizId) {
            // Create the quiz
            $stmt = $pdo->prepare("INSERT INTO quizzes (title, type, scheduled_date, timer_duration, created_by) 
                                  VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([
                'Sample Basic Chess Quiz',
                '1',
                date('Y-m-d H:i:s', strtotime('+1 day')),
                900, // 15 minutes
                $adminId
            ]);
            $quizId = $pdo->lastInsertId();
            echo "Created sample quiz (ID: $quizId)\n";
            
            // Associate quiz with a group
            $stmt = $pdo->prepare("INSERT INTO quiz_group (quiz_id, group_id) VALUES (?, ?)");
            $stmt->execute([$quizId, $groupIds['Beginners']]);
            echo "Associated quiz with Beginners group\n";
            
            // Add puzzles to the quiz
            foreach ($puzzleIds as $order => $puzzleId) {
                $stmt = $pdo->prepare("INSERT INTO quiz_puzzle (quiz_id, puzzle_id, timer_duration, puzzle_order, instructions) 
                                      VALUES (?, ?, ?, ?, ?)");
                $stmt->execute([
                    $quizId,
                    $puzzleId,
                    60, // 1 minute per puzzle
                    $order + 1,
                    'Find the best move for ' . ($order == 0 ? 'White' : ($order == 1 ? 'White' : 'White'))
                ]);
                echo "Added puzzle $puzzleId to quiz (order: " . ($order + 1) . ")\n";
            }
        } else {
            echo "Sample quiz already exists (ID: $quizId)\n";
        }
    }
    
    // Commit all changes
    $pdo->commit();
    echo "\nSample data added successfully.\n";
    
} catch (PDOException $e) {
    // Rollback if anything goes wrong
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    die("ERROR: " . $e->getMessage());
}
?> 