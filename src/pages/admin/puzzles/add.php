<?php
session_start();

// Check if user is logged in and is admin
if (!isset($_SESSION['user_id']) || !isset($_SESSION['is_admin']) || !$_SESSION['is_admin']) {
    header("Location: ../../../../index.php");
    exit();
}

// Include database connection
$conn = require_once '../../../../config/database.php';

$error = "";
$success = "";

// Process form submission
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get form data
    $fen = trim($_POST['fen']);
    $solutionFen = trim($_POST['solutionFen']);
    $pgn = isset($_POST['pgn']) ? trim($_POST['pgn']) : '';
    $correct_move = trim($_POST['correct_move']);
    $section_type = $_POST['section_type'];
    $difficulty = $_POST['difficulty'];
    $tags = isset($_POST['tags']) ? trim($_POST['tags']) : '';
    
    // Validate input
    if (empty($fen)) {
        $error = "FEN position is required";
    } elseif (empty($solutionFen)) {
        $error = "Solution FEN position is required";
    } elseif (empty($correct_move)) {
        $error = "Correct move is required";
    } else {
        // Insert puzzle
        $sql = "INSERT INTO puzzles (fen, solutionFen, pgn, correct_move, section_type, difficulty, tags) VALUES (?, ?, ?, ?, ?, ?, ?)";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "sssssss", $fen, $solutionFen, $pgn, $correct_move, $section_type, $difficulty, $tags);
        
        if (mysqli_stmt_execute($stmt)) {
            $success = "Puzzle added successfully!";
            // Clear form data
            $fen = $solutionFen = $pgn = $correct_move = $tags = "";
            $section_type = "1";
            $difficulty = "medium";
        } else {
            $error = "Error adding puzzle: " . mysqli_error($conn);
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Add Puzzle - Chess Quiz Application</title>
    <link rel="stylesheet" href="../../../../public/css/style.css">
    <link rel="stylesheet" href="../../../../chessboardjs-1.0.0/css/chessboard-1.0.0.min.css">
    <style>
        .form-preview {
            display: flex;
            flex-wrap: wrap;
            gap: 2rem;
            margin-bottom: 2rem;
        }
        
        .board-container {
            flex: 0 0 400px;
        }
        
        .form-container {
            flex: 1;
            min-width: 300px;
        }
        
        .error-message {
            background-color: #f8d7da;
            color: #721c24;
            padding: 1rem;
            margin-bottom: 1rem;
            border-radius: 4px;
        }
        
        .success-message {
            background-color: #d4edda;
            color: #155724;
            padding: 1rem;
            margin-bottom: 1rem;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <header>
        <h1>Chess Quiz Application</h1>
        <nav>
            <ul>
                <li><a href="../../../../index.php">Home</a></li>
                <li><a href="../../quizzes.php">Quizzes</a></li>
                <li><a href="../../profile.php">Profile</a></li>
                <li><a href="../dashboard.php">Admin Dashboard</a></li>
                <li><a href="../../../../api/auth/logout.php">Logout</a></li>
            </ul>
        </nav>
    </header>

    <main>
        <div class="add-container" style="max-width: 1200px; margin: 0 auto; padding: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <h2>Add New Puzzle</h2>
                <a href="manage.php" class="btn secondary">Back to Puzzles</a>
            </div>
            
            <?php if (!empty($error)): ?>
                <div class="error-message">
                    <?php echo $error; ?>
                </div>
            <?php endif; ?>
            
            <?php if (!empty($success)): ?>
                <div class="success-message">
                    <?php echo $success; ?>
                </div>
            <?php endif; ?>
            
            <div class="form-preview">
                <div class="board-container">
                    <h3>Puzzle Position</h3>
                    <div id="board" style="width: 400px;"></div>
                    <div style="margin-top: 1rem;">
                        <button id="startPositionBtn" class="btn secondary">Start Position</button>
                        <button id="clearBoardBtn" class="btn secondary">Clear Board</button>
                    </div>
                </div>
                
                <div class="board-container">
                    <h3>Solution Position</h3>
                    <div id="solutionBoard" style="width: 400px;"></div>
                    <div style="margin-top: 1rem;">
                        <button id="copyFromPuzzleBtn" class="btn secondary">Copy from Puzzle</button>
                        <button id="clearSolutionBtn" class="btn secondary">Clear Solution</button>
                    </div>
                </div>
                
                <div class="form-container">
                    <form action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>" method="post" id="puzzleForm">
                        <div class="form-group">
                            <label for="fen">FEN Position:</label>
                            <input type="text" id="fen" name="fen" value="<?php echo isset($fen) ? $fen : 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'; ?>" required>
                            <small>The FEN notation will update as you manipulate the board.</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="solutionFen">Solution FEN Position:</label>
                            <input type="text" id="solutionFen" name="solutionFen" value="<?php echo isset($solutionFen) ? $solutionFen : ''; ?>" required>
                            <small>The FEN notation of the solution position.</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="pgn">PGN (optional):</label>
                            <textarea id="pgn" name="pgn" rows="3"><?php echo isset($pgn) ? $pgn : ''; ?></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label for="correct_move">Correct Move:</label>
                            <input type="text" id="correct_move" name="correct_move" value="<?php echo isset($correct_move) ? $correct_move : ''; ?>" required>
                            <small>Format: e2e4, g1f3, etc.</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="section_type">Section Type:</label>
                            <select id="section_type" name="section_type">
                                <option value="1" <?php echo (isset($section_type) && $section_type == '1') ? 'selected' : ''; ?>>Section 1</option>
                                <option value="2" <?php echo (isset($section_type) && $section_type == '2') ? 'selected' : ''; ?>>Section 2</option>
                                <option value="both" <?php echo (isset($section_type) && $section_type == 'both') ? 'selected' : ''; ?>>Both</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="difficulty">Difficulty:</label>
                            <select id="difficulty" name="difficulty">
                                <option value="easy" <?php echo (isset($difficulty) && $difficulty == 'easy') ? 'selected' : ''; ?>>Easy</option>
                                <option value="medium" <?php echo (!isset($difficulty) || $difficulty == 'medium') ? 'selected' : ''; ?>>Medium</option>
                                <option value="hard" <?php echo (isset($difficulty) && $difficulty == 'hard') ? 'selected' : ''; ?>>Hard</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="tags">Tags (comma separated):</label>
                            <input type="text" id="tags" name="tags" value="<?php echo isset($tags) ? $tags : ''; ?>">
                            <small>Example: tactics, endgame, mate in 2</small>
                        </div>
                        
                        <div class="form-submit">
                            <button type="submit" class="btn primary">Add Puzzle</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </main>

    <footer>
        <p>&copy; <?php echo date("Y"); ?> Chess Quiz Application</p>
    </footer>

    <script src="../../../../chessboardjs-1.0.0/js/chessboard-1.0.0.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
    <script>
        // Initialize the board
        const startPosition = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
        
        const config = {
            draggable: true,
            position: startPosition,
            onDragStart: onDragStart,
            onDrop: onDrop,
            onSnapEnd: onSnapEnd
        };
        
        const board = Chessboard('board', config);
        
        // Initialize the solution board with the same config
        const solutionConfig = {
            draggable: true,
            position: '8/8/8/8/8/8/8/8 w - - 0 1', // Empty board by default
            onDragStart: onSolutionDragStart,
            onDrop: onSolutionDrop,
            onSnapEnd: onSolutionSnapEnd
        };
        
        const solutionBoard = Chessboard('solutionBoard', solutionConfig);
        
        // Set initial solution FEN value
        document.getElementById('solutionFen').value = solutionConfig.position;
        
        // Board control buttons
        document.getElementById('startPositionBtn').addEventListener('click', function() {
            board.position(startPosition);
            document.getElementById('fen').value = startPosition;
        });
        
        document.getElementById('clearBoardBtn').addEventListener('click', function() {
            board.position('8/8/8/8/8/8/8/8 w - - 0 1');
            document.getElementById('fen').value = '8/8/8/8/8/8/8/8 w - - 0 1';
        });
        
        // Solution board control buttons
        document.getElementById('copyFromPuzzleBtn').addEventListener('click', function() {
            const currentFen = document.getElementById('fen').value;
            solutionBoard.position(currentFen);
            document.getElementById('solutionFen').value = currentFen;
        });
        
        document.getElementById('clearSolutionBtn').addEventListener('click', function() {
            solutionBoard.position('8/8/8/8/8/8/8/8 w - - 0 1');
            document.getElementById('solutionFen').value = '8/8/8/8/8/8/8/8 w - - 0 1';
        });
        
        // FEN input change handlers
        document.getElementById('fen').addEventListener('change', function() {
            board.position(this.value);
        });
        
        document.getElementById('solutionFen').addEventListener('change', function() {
            solutionBoard.position(this.value);
        });
        
        function onDragStart(source, piece, position, orientation) {
            // Do not pick up pieces if the game is over or if it's not that side's turn
            return true;
        }
        
        function onDrop(source, target, piece, newPos, oldPos, orientation) {
            // Update FEN after a piece is dropped
            updateFen(Chessboard.objToFen(newPos));
            return true;
        }
        
        function onSnapEnd() {
            // Update board position after the piece snap
            board.position(document.getElementById('fen').value);
        }
        
        function onSolutionDragStart(source, piece, position, orientation) {
            // Allow all drag operations for the solution board
            return true;
        }
        
        function onSolutionDrop(source, target, piece, newPos, oldPos, orientation) {
            // Update Solution FEN after a piece is dropped
            updateSolutionFen(Chessboard.objToFen(newPos));
            return true;
        }
        
        function onSolutionSnapEnd() {
            // Update solution board position after the piece snap
            solutionBoard.position(document.getElementById('solutionFen').value);
        }
        
        function updateFen(newFen) {
            // Update the FEN field with the new position
            document.getElementById('fen').value = newFen;
        }
        
        function updateSolutionFen(newFen) {
            // Update the Solution FEN field with the new position
            document.getElementById('solutionFen').value = newFen;
        }
    </script>
</body>
</html> 