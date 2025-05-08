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

// Get user's submissions for this quiz
$sql = "SELECT s.*, p.fen, p.solutionFen, p.correct_move, p.difficulty, p.pgn, p.section_type 
        FROM submissions s
        JOIN puzzles p ON s.puzzle_id = p.id
        WHERE s.user_id = ? AND s.quiz_id = ?
        ORDER BY s.created_at ASC";
$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, "ii", $user_id, $quiz_id);
mysqli_stmt_execute($stmt);
$submissions_result = mysqli_stmt_get_result($stmt);

$submissions = [];
while ($row = mysqli_fetch_assoc($submissions_result)) {
    $submissions[] = $row;
}

// Calculate performance metrics
$total_puzzles = count($submissions);
$correct_answers = 0;
$total_time = 0;

// Section-specific metrics
$section_stats = [
    '1' => ['total' => 0, 'correct' => 0, 'time' => 0],
    '2' => ['total' => 0, 'correct' => 0, 'time' => 0],
    'both' => ['total' => 0, 'correct' => 0, 'time' => 0]
];

// Difficulty-specific metrics
$difficulty_stats = [
    'easy' => ['total' => 0, 'correct' => 0, 'time' => 0],
    'medium' => ['total' => 0, 'correct' => 0, 'time' => 0],
    'hard' => ['total' => 0, 'correct' => 0, 'time' => 0]
];

foreach ($submissions as $submission) {
    if ($submission['correct']) {
        $correct_answers++;
    }
    $total_time += $submission['time_taken'];
    
    // Track section-specific stats
    $section_type = $submission['section_type'] ?: 'both';
    $section_stats[$section_type]['total']++;
    if ($submission['correct']) {
        $section_stats[$section_type]['correct']++;
    }
    $section_stats[$section_type]['time'] += $submission['time_taken'];
    
    // Track difficulty-specific stats
    $difficulty = $submission['difficulty'] ?: 'medium';
    $difficulty_stats[$difficulty]['total']++;
    if ($submission['correct']) {
        $difficulty_stats[$difficulty]['correct']++;
    }
    $difficulty_stats[$difficulty]['time'] += $submission['time_taken'];
}

// Calculate overall metrics
$accuracy = $total_puzzles > 0 ? round(($correct_answers / $total_puzzles) * 100, 2) : 0;
$avg_time = $total_puzzles > 0 ? round($total_time / $total_puzzles, 2) : 0;

// Calculate section-specific metrics
foreach ($section_stats as $section => $stats) {
    if ($stats['total'] > 0) {
        $section_stats[$section]['accuracy'] = round(($stats['correct'] / $stats['total']) * 100, 2);
        $section_stats[$section]['avg_time'] = round($stats['time'] / $stats['total'], 2);
    } else {
        $section_stats[$section]['accuracy'] = 0;
        $section_stats[$section]['avg_time'] = 0;
    }
}

// Calculate difficulty-specific metrics
foreach ($difficulty_stats as $difficulty => $stats) {
    if ($stats['total'] > 0) {
        $difficulty_stats[$difficulty]['accuracy'] = round(($stats['correct'] / $stats['total']) * 100, 2);
        $difficulty_stats[$difficulty]['avg_time'] = round($stats['time'] / $stats['total'], 2);
    } else {
        $difficulty_stats[$difficulty]['accuracy'] = 0;
        $difficulty_stats[$difficulty]['avg_time'] = 0;
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quiz Results - Chess Quiz Application</title>
    <link rel="stylesheet" href="../../public/css/style.css">
    <link rel="stylesheet" href="../../chessboardjs-1.0.0/css/chessboard-1.0.0.min.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        .results-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
        }
        
        .results-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
        }
        
        .performance-summary {
            display: flex;
            justify-content: space-between;
            margin-bottom: 2rem;
            flex-wrap: wrap;
        }
        
        .stat-card {
            background-color: white;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            padding: 1.5rem;
            flex: 0 0 23%;
            text-align: center;
            margin-bottom: 1rem;
        }
        
        .stat-card h3 {
            font-size: 2rem;
            margin-bottom: 0.5rem;
        }
        
        .stat-card p {
            color: #666;
        }
        
        .puzzle-review {
            background-color: white;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            padding: 2rem;
            margin-bottom: 2rem;
        }
        
        .puzzle-item {
            display: flex;
            flex-wrap: wrap;
            gap: 2rem;
            margin-bottom: 3rem;
            padding-bottom: 2rem;
            border-bottom: 1px solid #eee;
        }
        
        .puzzle-board {
            flex: 0 0 300px;
        }
        
        .puzzle-details {
            flex: 1;
            min-width: 300px;
        }
        
        .correct {
            color: green;
        }
        
        .incorrect {
            color: red;
        }
        
        .section-performance {
            margin-bottom: 2rem;
        }
        
        .section-stats {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        
        .section-card {
            background-color: white;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            padding: 1.5rem;
        }
        
        .section-card h4 {
            margin-top: 0;
            margin-bottom: 1rem;
            color: #2980b9;
            font-size: 1.2rem;
        }
        
        .stat-row {
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
        }
        
        .stat-item {
            text-align: center;
            flex: 1;
            min-width: 80px;
            padding: 0.5rem;
        }
        
        .stat-value {
            display: block;
            font-size: 1.5rem;
            font-weight: bold;
            margin-bottom: 0.25rem;
        }
        
        .stat-label {
            font-size: 0.85rem;
            color: #666;
        }
        
        .difficulty-stats {
            display: flex;
            justify-content: space-between;
            gap: 1rem;
            flex-wrap: wrap;
        }
        
        .difficulty-card {
            background-color: white;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            padding: 1.5rem;
            flex: 1;
            min-width: 250px;
            margin-bottom: 1rem;
            border-top: 4px solid #ddd;
        }
        
        .difficulty-easy {
            border-top-color: #2ecc71;
        }
        
        .difficulty-medium {
            border-top-color: #f39c12;
        }
        
        .difficulty-hard {
            border-top-color: #e74c3c;
        }
        
        .difficulty-card h4 {
            margin-top: 0;
            margin-bottom: 1rem;
            font-size: 1.2rem;
        }
        
        .performance-visualization {
            background-color: white;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            padding: 2rem;
            margin-bottom: 2rem;
        }
        
        .chart-container {
            height: 300px;
            max-width: 100%;
            margin: 0 auto;
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

    <div class="results-container">
        <div class="results-header">
            <h2>Quiz Results</h2>
            <p>Quiz: <?php echo htmlspecialchars($quiz['title']); ?></p>
        </div>

        <div class="performance-summary">
            <div class="stat-card">
                <h3><?php echo $total_puzzles; ?></h3>
                <p>Total Puzzles</p>
            </div>
            <div class="stat-card">
                <h3><?php echo $correct_answers; ?></h3>
                <p>Correct Answers</p>
            </div>
            <div class="stat-card">
                <h3><?php echo $accuracy; ?>%</h3>
                <p>Accuracy</p>
            </div>
            <div class="stat-card">
                <h3><?php echo $avg_time; ?>s</h3>
                <p>Average Time</p>
            </div>
        </div>

        <div class="performance-visualization">
            <h3>Performance Visualization</h3>
            <div class="chart-container">
                <canvas id="performanceChart"></canvas>
            </div>
        </div>

        <div class="section-performance">
            <h3>Section Performance</h3>
            <div class="section-stats">
                <?php foreach ($section_stats as $section => $stats): ?>
                    <?php if ($stats['total'] > 0): ?>
                    <div class="section-card">
                        <h4><?php echo $section === '1' ? 'Section 1' : ($section === '2' ? 'Section 2' : 'Both Sections'); ?></h4>
                        <div class="stat-row">
                            <div class="stat-item">
                                <span class="stat-value"><?php echo $stats['total']; ?></span>
                                <span class="stat-label">Puzzles</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value"><?php echo $stats['correct']; ?></span>
                                <span class="stat-label">Correct</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value"><?php echo $stats['accuracy']; ?>%</span>
                                <span class="stat-label">Accuracy</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value"><?php echo $stats['avg_time']; ?>s</span>
                                <span class="stat-label">Avg. Time</span>
                            </div>
                        </div>
                    </div>
                    <?php endif; ?>
                <?php endforeach; ?>
            </div>
        </div>

        <div class="section-performance">
            <h3>Performance by Difficulty</h3>
            <div class="difficulty-stats">
                <?php foreach ($difficulty_stats as $difficulty => $stats): ?>
                    <?php if ($stats['total'] > 0): ?>
                    <div class="difficulty-card difficulty-<?php echo $difficulty; ?>">
                        <h4><?php echo ucfirst($difficulty); ?></h4>
                        <div class="stat-row">
                            <div class="stat-item">
                                <span class="stat-value"><?php echo $stats['total']; ?></span>
                                <span class="stat-label">Puzzles</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value"><?php echo $stats['correct']; ?></span>
                                <span class="stat-label">Correct</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value"><?php echo $stats['accuracy']; ?>%</span>
                                <span class="stat-label">Accuracy</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value"><?php echo $stats['avg_time']; ?>s</span>
                                <span class="stat-label">Avg. Time</span>
                            </div>
                        </div>
                    </div>
                    <?php endif; ?>
                <?php endforeach; ?>
            </div>
        </div>

        <div class="puzzle-review">
            <h3>Puzzle Review</h3>
            
            <?php if (count($submissions) > 0): ?>
                <?php foreach ($submissions as $index => $submission): ?>
                <div class="puzzle-item">
                    <div class="puzzle-board">
                        <div id="board-<?php echo $index; ?>" style="width: 300px;"></div>
                    </div>
                    <div class="puzzle-details">
                        <h4>Puzzle #<?php echo $index + 1; ?></h4>
                        <p class="<?php echo $submission['correct'] ? 'correct' : 'incorrect'; ?>">
                            <strong>Result:</strong> <?php echo $submission['correct'] ? 'Correct' : 'Incorrect'; ?>
                        </p>
                        <p><strong>Your move:</strong> <?php echo htmlspecialchars($submission['submitted_move']); ?></p>
                        
                        <?php if (!empty($submission['solutionFen'])): ?>
                        <p><strong>Solution method:</strong> Position-based validation</p>
                        <p><strong>Correct move:</strong> <?php echo htmlspecialchars($submission['correct_move']); ?></p>
                        <button class="btn btn-small" onclick="toggleSolution(<?php echo $index; ?>)">Show Solution Position</button>
                        <div id="solution-board-<?php echo $index; ?>" style="width: 300px; margin-top: 10px; display: none;"></div>
                        <?php else: ?>
                        <p><strong>Solution method:</strong> Move-based validation</p>
                        <p><strong>Correct move:</strong> <?php echo htmlspecialchars($submission['correct_move']); ?></p>
                        <?php endif; ?>
                        
                        <p><strong>Time taken:</strong> <?php echo $submission['time_taken']; ?> seconds</p>
                        <p><strong>Difficulty:</strong> <?php echo ucfirst(htmlspecialchars($submission['difficulty'])); ?></p>
                        <?php if (!empty($submission['section_type'])): ?>
                        <p><strong>Section:</strong> <?php echo htmlspecialchars($submission['section_type'] === '1' ? 'Section 1' : ($submission['section_type'] === '2' ? 'Section 2' : 'Both')); ?></p>
                        <?php endif; ?>
                    </div>
                </div>
                <?php endforeach; ?>
            <?php else: ?>
                <p>No puzzle submissions found for this quiz.</p>
            <?php endif; ?>
        </div>

        <div class="actions">
            <a href="quizzes.php" class="btn">Back to Quizzes</a>
            <?php if ($quiz['retake_allowed']): ?>
            <a href="take-quiz.php?id=<?php echo $quiz_id; ?>" class="btn btn-primary">Take Quiz Again</a>
            <?php endif; ?>
        </div>
    </div>

    <script src="../../chessboardjs-1.0.0/js/chessboard-1.0.0.min.js"></script>
    <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
    <script>
        document.addEventListener("DOMContentLoaded", function() {
            // Initialize chessboards for each puzzle
            <?php foreach ($submissions as $index => $submission): ?>
            var board<?php echo $index; ?> = Chessboard('board-<?php echo $index; ?>', {
                position: '<?php echo $submission['fen']; ?>',
                showNotation: true
            });
            <?php endforeach; ?>
            
            // Initialize performance chart
            const ctx = document.getElementById('performanceChart').getContext('2d');
            
            // Prepare chart data
            const difficultyLabels = [];
            const accuracyData = [];
            const timeData = [];
            
            <?php foreach ($difficulty_stats as $difficulty => $stats): ?>
                <?php if ($stats['total'] > 0): ?>
                difficultyLabels.push('<?php echo ucfirst($difficulty); ?>');
                accuracyData.push(<?php echo $stats['accuracy']; ?>);
                timeData.push(<?php echo $stats['avg_time']; ?>);
                <?php endif; ?>
            <?php endforeach; ?>
            
            const chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: difficultyLabels,
                    datasets: [
                        {
                            label: 'Accuracy (%)',
                            data: accuracyData,
                            backgroundColor: 'rgba(54, 162, 235, 0.5)',
                            borderColor: 'rgba(54, 162, 235, 1)',
                            borderWidth: 1,
                            yAxisID: 'y'
                        },
                        {
                            label: 'Avg. Time (seconds)',
                            data: timeData,
                            backgroundColor: 'rgba(255, 99, 132, 0.5)',
                            borderColor: 'rgba(255, 99, 132, 1)',
                            borderWidth: 1,
                            yAxisID: 'y1'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            position: 'left',
                            title: {
                                display: true,
                                text: 'Accuracy (%)'
                            },
                            max: 100
                        },
                        y1: {
                            beginAtZero: true,
                            position: 'right',
                            title: {
                                display: true,
                                text: 'Time (seconds)'
                            },
                            grid: {
                                drawOnChartArea: false
                            }
                        }
                    }
                }
            });
        });

        // Function to toggle solution board visibility
        function toggleSolution(index) {
            const solutionBoard = document.getElementById(`solution-board-${index}`);
            
            if (solutionBoard.style.display === 'none') {
                solutionBoard.style.display = 'block';
                
                // Initialize the solution board only when displayed
                <?php foreach ($submissions as $index => $submission): ?>
                <?php if (!empty($submission['solutionFen'])): ?>
                if (index === <?php echo $index; ?>) {
                    const solBoard<?php echo $index; ?> = Chessboard(`solution-board-${index}`, {
                        position: '<?php echo $submission['solutionFen']; ?>',
                        showNotation: true
                    });
                }
                <?php endif; ?>
                <?php endforeach; ?>
            } else {
                solutionBoard.style.display = 'none';
            }
        }
    </script>
</body>
</html> 