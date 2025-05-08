<?php
session_start();

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit();
}

// Check if quiz ID is provided
if (!isset($_GET['id'])) {
    header("Location: quizzes.php");
    exit();
}

// Include database connection
$conn = require_once '../../config/database.php';

$quiz_id = $_GET['id'];
$user_id = $_SESSION['user_id'];

// Get quiz details
$sql = "SELECT * FROM quizzes WHERE id = ?";
$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, "i", $quiz_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

if (mysqli_num_rows($result) == 0) {
    header("Location: quizzes.php");
    exit();
}

$quiz = mysqli_fetch_assoc($result);

// Check if quiz is available
$current_date = date('Y-m-d H:i:s');
if ($current_date < $quiz['scheduled_date']) {
    header("Location: quizzes.php");
    exit();
}

// Get puzzles for this quiz
$sql = "SELECT qp.*, p.fen, p.solutionFen, p.section_type, p.correct_move, p.difficulty, qp.timer_duration as puzzle_timer
        FROM quiz_puzzle qp
        JOIN puzzles p ON qp.puzzle_id = p.id
        WHERE qp.quiz_id = ?
        ORDER BY qp.puzzle_order ASC";
$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, "i", $quiz_id);
mysqli_stmt_execute($stmt);
$puzzles_result = mysqli_stmt_get_result($stmt);

$puzzles = [];
while ($row = mysqli_fetch_assoc($puzzles_result)) {
    $puzzles[] = $row;
}

if (count($puzzles) == 0) {
    // No puzzles in this quiz
    header("Location: quizzes.php");
    exit();
}

// Process form submission
$error = "";
$success = "";
$current_puzzle_index = 0;

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (isset($_POST['submit_move'])) {
        // Get the submitted move and puzzle ID
        $puzzle_id = $_POST['puzzle_id'];
        $submitted_move = $_POST['move'];
        $final_position = $_POST['final_position'];
        $time_taken = $_POST['time_taken'];
        
        // Find the puzzle data
        $puzzle_data = null;
        foreach ($puzzles as $p) {
            if ($p['puzzle_id'] == $puzzle_id) {
                $puzzle_data = $p;
                break;
            }
        }
        
        if ($puzzle_data) {
            // Check if the final position matches the solution
            // Primary validation using solutionFen if available
            if (!empty($puzzle_data['solutionFen'])) {
                // Clean the FEN strings before comparison (remove move count parts)
                $cleanFinalPosition = preg_replace('/\s+\d+\s+\d+$/', '', $final_position);
                $cleanSolutionFen = preg_replace('/\s+\d+\s+\d+$/', '', $puzzle_data['solutionFen']);
                
                $correct = ($cleanFinalPosition === $cleanSolutionFen);
            } else {
                // Fall back to move-based validation if solutionFen is not available
            $correct = ($submitted_move === $puzzle_data['correct_move']);
            }
            
            // Save the submission
            $sql = "INSERT INTO submissions (user_id, puzzle_id, quiz_id, submitted_move, time_taken, correct)
                    VALUES (?, ?, ?, ?, ?, ?)";
            $stmt = mysqli_prepare($conn, $sql);
            mysqli_stmt_bind_param($stmt, "iiisii", $user_id, $puzzle_id, $quiz_id, $submitted_move, $time_taken, $correct);
            mysqli_stmt_execute($stmt);
            
            // Move to the next puzzle or show results
            $current_puzzle_index = array_search($puzzle_data, $puzzles) + 1;
            
            if ($current_puzzle_index >= count($puzzles)) {
                // All puzzles completed, redirect to results
                header("Location: quiz-results.php?id=" . $quiz_id);
                exit();
            }
        }
    }
}

// Get the current puzzle
$current_puzzle = $puzzles[$current_puzzle_index];

// Timer settings
$timer_duration = $current_puzzle['puzzle_timer'] ?? $quiz['timer_duration'];
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Take Quiz - Chess Quiz Application</title>
    <link rel="stylesheet" href="../../public/css/style.css">
    <link rel="stylesheet" href="../../chessboardjs-1.0.0/css/chessboard-1.0.0.min.css">
    <style>
        .quiz-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
        }
        
        .quiz-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
        }
        
        .quiz-info {
            background-color: white;
            padding: 1rem;
            border-radius: 5px;
            margin-bottom: 2rem;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        .puzzle-container {
            display: flex;
            flex-wrap: wrap;
            gap: 2rem;
            margin-bottom: 2rem;
        }
        
        .board-container {
            flex: 0 0 400px;
        }
        
        .puzzle-info {
            flex: 1;
            min-width: 300px;
        }
        
        .timer {
            font-size: 1.5rem;
            font-weight: bold;
            text-align: center;
            padding: 1rem;
            margin-bottom: 1rem;
            background-color: #f8f9fa;
            border-radius: 3px;
        }
        
        .move-input {
            display: flex;
            margin-bottom: 1rem;
        }
        
        .move-input input {
            flex: 1;
            padding: 0.8rem;
            margin-right: 0.5rem;
        }
        
        .progress-bar {
            width: 100%;
            height: 10px;
            background-color: #e0e0e0;
            border-radius: 5px;
            margin-bottom: 1rem;
            overflow: hidden;
        }
        
        .progress {
            height: 100%;
            background-color: #2980b9;
            width: <?php echo ($current_puzzle_index / count($puzzles)) * 100; ?>%;
        }
    </style>
</head>
<body>
    <header>
        <h1>Chess Quiz Application</h1>
        <nav>
            <ul>
                <li><a href="../../index.php">Home</a></li>
                <li><a href="quizzes.php">Quizzes</a></li>
                <li><a href="profile.php">Profile</a></li>
                <?php if(isset($_SESSION['is_admin']) && $_SESSION['is_admin']): ?>
                    <li><a href="admin/dashboard.php">Admin Dashboard</a></li>
                <?php endif; ?>
                <li><a href="../../api/auth/logout.php">Logout</a></li>
            </ul>
        </nav>
    </header>

    <main>
        <div class="quiz-container">
            <div class="quiz-header">
                <h2><?php echo htmlspecialchars($quiz['title']); ?></h2>
                <div>
                    <span class="quiz-type" style="background: #2980b9; color: white; padding: 0.3rem 0.8rem; border-radius: 3px; font-size: 0.9rem;">
                        <?php echo $quiz['type'] == '1' ? 'Multiple Puzzles' : 'Single Puzzle'; ?>
                    </span>
                </div>
            </div>
            
            <div class="quiz-info">
                <div class="progress-bar">
                    <div class="progress"></div>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <div>Puzzle <?php echo $current_puzzle_index + 1; ?> of <?php echo count($puzzles); ?></div>
                    <div>Difficulty: <?php echo ucfirst($current_puzzle['difficulty']); ?></div>
                </div>
            </div>
            
            <div class="puzzle-container">
                <div class="board-container">
                    <div id="chessboard" style="width: 400px;"></div>
                </div>
                
                <div class="puzzle-info">
                    <div class="timer" id="timer">
                        <?php echo floor($timer_duration / 60); ?>:00
                    </div>
                    
                    <form action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"] . "?id=" . $quiz_id); ?>" method="post" id="puzzleForm" class="quiz-form">
                        <input type="hidden" name="puzzle_id" value="<?php echo $current_puzzle['puzzle_id']; ?>">
                        <input type="hidden" name="time_taken" id="timeTaken" value="0">
                        <input type="hidden" name="move" id="move" value="">
                        <input type="hidden" name="final_position" id="finalPosition" value="">
                        
                        <p>Enter your move (e.g., e2e4):</p>
                        <div class="move-input">
                            <input type="text" id="moveInput" placeholder="Your move..." required>
                            <button type="button" id="submitMoveBtn" class="btn primary">Submit</button>
                        </div>
                        
                        <div id="moveMessage" style="margin-bottom: 1rem; display: none;"></div>
                        
                        <p><strong>Instructions:</strong></p>
                        <p>Find the best move for the position. You can either drag the piece on the board or type your move in the input field.</p>
                        
                        <button type="submit" name="submit_move" id="submitForm" style="display: none;">Submit Move</button>
                    </form>
                </div>
            </div>
        </div>
    </main>

    <footer>
        <p>&copy; <?php echo date("Y"); ?> Chess Quiz Application</p>
    </footer>

    <script src="../../chessboardjs-1.0.0/js/chessboard-1.0.0.min.js"></script>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script>
        // Initialize variables
        let timeTaken = 0;
        let timerInterval;
        const timerDuration = <?php echo $timer_duration; ?>;
        let userMove = '';
        
        // Initialize the chessboard
        const board = Chessboard('chessboard', {
            position: '<?php echo $current_puzzle['fen']; ?>',
            draggable: true,
            onDragStart: onDragStart,
            onDrop: onDrop,
            onSnapEnd: onSnapEnd
        });
        
        // Start the timer
        startTimer(timerDuration);
        
        // Board interaction functions
        function onDragStart(source, piece) {
            // Get the turn from FEN (w for white, b for black)
            const fen = board.fen();
            const turn = fen.split(' ')[1];
            
            // Only allow pieces of the current turn to be moved
            if ((turn === 'w' && piece.search(/^b/) !== -1) ||
                (turn === 'b' && piece.search(/^w/) !== -1)) {
                return false;
            }
            
            return true;
        }
        
        function onDrop(source, target, piece, newPos, oldPos, orientation) {
            // Convert the drag to a move notation (e.g., e2e4)
            userMove = source + target;
            
            // Update the hidden input
            document.getElementById('move').value = userMove;
            
            // Show the move in the input field
            document.getElementById('moveInput').value = userMove;
            
            // Update the final position after the move
            updateFinalPosition(newPos);
            
            return true;
        }
        
        function onSnapEnd() {
            // Update the board position after the piece snap
            board.position(board.position());
        }
        
        // Function to update the final position
        function updateFinalPosition(position) {
            // Convert position object to FEN
            const fen = Chessboard.objToFen(position);
            
            // Get the full FEN from the original puzzle, preserving castling rights, etc.
            const originalFen = '<?php echo $current_puzzle['fen']; ?>';
            const fenParts = originalFen.split(' ');
            
            // Keep original castling rights, en passant if applicable
            let finalFen = fen;
            
            // If original FEN has more parts, use them
            if (fenParts.length > 1) {
                // Toggle the active color
                const activeColor = fenParts[1] === 'w' ? 'b' : 'w';
                
                // Combine position with other FEN components
                finalFen = fen + ' ' + activeColor + ' ' + 
                           (fenParts[2] || '-') + ' ' + 
                           (fenParts[3] || '-') + ' 0 1';
            }
            
            // Update the hidden input with the final position
            document.getElementById('finalPosition').value = finalFen;
        }
        
        // Timer function
        function startTimer(duration) {
            let timer = duration;
            const display = document.getElementById('timer');
            
            timerInterval = setInterval(function() {
                const minutes = parseInt(timer / 60, 10);
                const seconds = parseInt(timer % 60, 10);
                
                display.textContent = minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
                
                // Update time taken
                timeTaken = duration - timer;
                document.getElementById('timeTaken').value = timeTaken;
                
                if (--timer < 0) {
                    clearInterval(timerInterval);
                    display.textContent = "Time's up!";
                    
                    // Auto-submit the form
                    document.getElementById('submitForm').click();
                }
            }, 1000);
        }
        
        // Handle manual move input
        document.getElementById('moveInput').addEventListener('change', function() {
            userMove = this.value;
            document.getElementById('move').value = userMove;
            
            // Update board if it's a valid move format (e.g., e2e4)
            if (userMove.match(/^[a-h][1-8][a-h][1-8]$/)) {
                const source = userMove.substring(0, 2);
                const target = userMove.substring(2, 4);
                
                // Get the piece at the source
                const position = board.position();
                const piece = position[source];
                
                if (piece) {
                    // Create a new position with the piece moved
                    delete position[source];
                    position[target] = piece;
                    board.position(position);
                    
                    // Update the final position
                    updateFinalPosition(position);
                }
            }
        });
        
        // Handle submit move button
        document.getElementById('submitMoveBtn').addEventListener('click', function() {
            const moveInput = document.getElementById('moveInput');
            userMove = moveInput.value;
            
            if (!userMove.match(/^[a-h][1-8][a-h][1-8]$/)) {
                // Invalid move format
                const moveMessage = document.getElementById('moveMessage');
                moveMessage.textContent = 'Please enter a valid move in the format e2e4';
                moveMessage.style.display = 'block';
                moveMessage.style.color = 'red';
                return;
            }
            
            // Update hidden input and submit the form
            document.getElementById('move').value = userMove;
            document.getElementById('submitForm').click();
        });
    </script>
</body>
</html> 