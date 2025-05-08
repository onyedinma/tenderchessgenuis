<?php
session_start();

// Check if user is logged in and is admin
if (!isset($_SESSION['user_id']) || !isset($_SESSION['is_admin']) || !$_SESSION['is_admin']) {
    header("Location: ../../../index.php");
    exit();
}

// Include database connection
$conn = require_once '../../../config/database.php';

// Get student statistics
$sql = "SELECT 
    COUNT(*) as total_students,
    SUM(CASE WHEN last_active > DATE_SUB(NOW(), INTERVAL 5 MINUTE) THEN 1 ELSE 0 END) as active_students,
    SUM(CASE WHEN section1_completed = 1 THEN 1 ELSE 0 END) as section1_completed,
    SUM(CASE WHEN section2_completed = 1 THEN 1 ELSE 0 END) as section2_completed
FROM students";
$result = mysqli_query($conn, $sql);
$stats = mysqli_fetch_assoc($result);

$student_count = $stats['total_students'] ?? 0;
$active_count = $stats['active_students'] ?? 0;
$section1_completed = $stats['section1_completed'] ?? 0;
$section2_completed = $stats['section2_completed'] ?? 0;

// Get category counts
$sql = "SELECT 
    SUM(CASE WHEN section1_score >= 80 THEN 1 ELSE 0 END) as golden_count,
    SUM(CASE WHEN section1_score >= 60 AND section1_score < 80 THEN 1 ELSE 0 END) as silver_count,
    SUM(CASE WHEN section1_score < 60 THEN 1 ELSE 0 END) as bronze_count
FROM students 
WHERE section1_completed = 1";
$result = mysqli_query($conn, $sql);
$categories = mysqli_fetch_assoc($result);

$golden_count = $categories['golden_count'] ?? 0;
$silver_count = $categories['silver_count'] ?? 0;
$bronze_count = $categories['bronze_count'] ?? 0;

// Get recent submissions
$sql = "SELECT 
    s.*, 
    st.name as student_name,
    TIMESTAMPDIFF(SECOND, s.submission_time, NOW()) as seconds_ago
FROM submissions s 
JOIN students st ON s.student_id = st.id 
ORDER BY s.submission_time DESC 
LIMIT 5";
$recent_submissions = mysqli_query($conn, $sql);

// Get current section settings
$sql = "SELECT section2_enabled, section1_timer, section2_timer FROM settings WHERE id = 1";
$result = mysqli_query($conn, $sql);
$settings = mysqli_fetch_assoc($result);

$section2_enabled = $settings['section2_enabled'] ?? 0;
$section1_timer = $settings['section1_timer'] ?? 30;
$section2_timer = $settings['section2_timer'] ?? 45;

// Get summary statistics
$sql = "SELECT COUNT(*) as count FROM users";
$result = mysqli_query($conn, $sql);
$user_count = mysqli_fetch_assoc($result)['count'];

$sql = "SELECT COUNT(*) as count FROM puzzles";
$result = mysqli_query($conn, $sql);
$puzzle_count = mysqli_fetch_assoc($result)['count'];

$sql = "SELECT COUNT(*) as count FROM quizzes";
$result = mysqli_query($conn, $sql);
$quiz_count = mysqli_fetch_assoc($result)['count'];

$sql = "SELECT COUNT(*) as count FROM submissions";
$result = mysqli_query($conn, $sql);
$submission_count = mysqli_fetch_assoc($result)['count'];

// Get most recent quizzes
$sql = "SELECT q.*, u.name as created_by_name 
FROM quizzes q
JOIN users u ON q.created_by = u.id
ORDER BY q.scheduled_date DESC 
LIMIT 5";
$recent_quizzes = mysqli_query($conn, $sql);

// Get most recent users
$sql = "SELECT * FROM users ORDER BY created_at DESC LIMIT 5";
$recent_users = mysqli_query($conn, $sql);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>The Genius Chess TV Quiz Show - Admin Panel</title>
    <link rel="stylesheet" href="../../../public/css/style.css">
    <style>
        .dashboard-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }
        
        .dashboard-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
        }
        
        .stats-container {
            display: flex;
            justify-content: space-between;
            margin-bottom: 2rem;
        }
        
        .stat-card {
            background-color: white;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            padding: 1.5rem;
            flex: 0 0 23%;
            text-align: center;
        }
        
        .stat-card h3 {
            font-size: 2rem;
            margin-bottom: 0.5rem;
        }
        
        .stat-card p {
            color: #666;
        }
        
        .recent-data {
            display: flex;
            gap: 2rem;
        }
        
        .data-card {
            background-color: white;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            padding: 1.5rem;
            flex: 1;
        }
        
        .data-card h3 {
            margin-bottom: 1rem;
            border-bottom: 1px solid #eee;
            padding-bottom: 0.5rem;
        }
        
        .data-list {
            list-style: none;
        }
        
        .data-list li {
            padding: 0.5rem 0;
            border-bottom: 1px solid #eee;
        }
        
        .admin-actions {
            display: flex;
            gap: 1rem;
            margin-bottom: 2rem;
        }
        
        /* Add new styles for section controls */
        .section-controls {
            background-color: #f5f5f5;
            padding: 1rem;
            border-radius: 5px;
            margin-bottom: 2rem;
        }
        
        .category-stats {
            display: flex;
            gap: 1rem;
            margin-top: 1rem;
        }
        
        .category-card {
            flex: 1;
            padding: 1rem;
            border-radius: 5px;
            text-align: center;
        }
        
        .golden {
            background-color: #ffd700;
            color: #000;
        }
        
        .silver {
            background-color: #c0c0c0;
            color: #000;
        }
        
        .bronze {
            background-color: #cd7f32;
            color: #fff;
        }
        
        .timer-control {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-top: 1rem;
        }
        
        .timer-display {
            font-size: 2rem;
            font-weight: bold;
            margin: 1rem 0;
            color: #333;
        }
        
        .section-status {
            display: inline-block;
            padding: 0.5rem 1rem;
            border-radius: 5px;
            margin-left: 1rem;
        }
        
        .status-enabled {
            background-color: #4CAF50;
            color: white;
        }
        
        .status-disabled {
            background-color: #f44336;
            color: white;
        }
        
        .submission-time {
            font-size: 0.8rem;
            color: #666;
        }
        
        .refresh-button {
            background-color: #2196F3;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 5px;
            cursor: pointer;
            margin-left: 1rem;
        }
        
        .refresh-button:hover {
            background-color: #1976D2;
        }
    </style>
</head>
<body>
    <header>
        <h1>The Genius Chess TV Quiz Show - Admin Panel</h1>
        <nav>
            <ul>
                <li><a href="../../../index.php">Home</a></li>
                <li><a href="students/manage.php">Students</a></li>
                <li><a href="question-banks/section1.php">Section 1</a></li>
                <li><a href="question-banks/section2.php">Section 2</a></li>
                <li><a href="scoring.php">Scoring</a></li>
                <li><a href="../../../api/auth/logout.php">Logout</a></li>
            </ul>
        </nav>
    </header>

    <main>
        <div class="dashboard-container">
            <div class="dashboard-header">
                <h2>Quiz Show Control Panel</h2>
                <div>
                    <span>Admin: <?php echo htmlspecialchars($_SESSION['user_name']); ?></span>
                    <button onclick="refreshDashboard()" class="refresh-button">
                        <i class="fas fa-sync"></i> Refresh
                    </button>
                </div>
            </div>
            
            <div class="section-controls">
                <h3>Section Controls</h3>
                <div class="control-panel">
                    <div>
                        <label>
                            <input type="checkbox" id="section2Toggle" onchange="toggleSection2()" 
                                <?php echo $section2_enabled ? 'checked' : ''; ?>>
                            Section 2
                        </label>
                        <span class="section-status <?php echo $section2_enabled ? 'status-enabled' : 'status-disabled'; ?>">
                            <?php echo $section2_enabled ? 'Enabled' : 'Disabled'; ?>
                        </span>
                    </div>
                    
                    <div class="timer-control">
                        <div>
                            <label>Section 1 Timer:
                                <input type="number" id="section1Timer" min="1" value="<?php echo $section1_timer; ?>">
                                minutes
                            </label>
                            <div class="timer-display" id="section1TimerDisplay">
                                <?php echo $section1_timer; ?>:00
                            </div>
                        </div>
                        <div>
                            <label>Section 2 Timer:
                                <input type="number" id="section2Timer" min="1" value="<?php echo $section2_timer; ?>">
                                minutes
                            </label>
                            <div class="timer-display" id="section2TimerDisplay">
                                <?php echo $section2_timer; ?>:00
                            </div>
                        </div>
                        <button onclick="updateTimers()" class="btn primary">Update Timers</button>
                    </div>
                </div>
            </div>
            
            <div class="stats-container">
                <div class="stat-card">
                    <h3><?php echo $student_count; ?></h3>
                    <p>Registered Students</p>
                </div>
                <div class="stat-card">
                    <h3><?php echo $active_count; ?></h3>
                    <p>Currently Active</p>
                </div>
                <div class="stat-card">
                    <h3><?php echo $section1_completed; ?></h3>
                    <p>Section 1 Completed</p>
                </div>
                <div class="stat-card">
                    <h3><?php echo $section2_completed; ?></h3>
                    <p>Section 2 Completed</p>
                </div>
            </div>
            
            <div class="category-stats">
                <div class="category-card golden">
                    <h3>Golden Category</h3>
                    <p><?php echo $golden_count; ?> students</p>
                    <small>80-100 points</small>
                </div>
                <div class="category-card silver">
                    <h3>Silver Category</h3>
                    <p><?php echo $silver_count; ?> students</p>
                    <small>60-70 points</small>
                </div>
                <div class="category-card bronze">
                    <h3>Bronze Category</h3>
                    <p><?php echo $bronze_count; ?> students</p>
                    <small>0-50 points</small>
                </div>
            </div>
            
            <div class="admin-actions">
                <a href="students/add.php" class="btn primary">Add Student</a>
                <a href="students/manage.php" class="btn secondary">Manage Students</a>
                <a href="question-banks/manage.php" class="btn primary">Question Banks</a>
                <a href="display-control.php" class="btn secondary">Display Control</a>
            </div>
            
            <div class="recent-data">
                <div class="data-card">
                    <h3>Recent Submissions</h3>
                    <?php if (isset($recent_submissions) && mysqli_num_rows($recent_submissions) > 0): ?>
                        <ul class="data-list">
                            <?php while ($submission = mysqli_fetch_assoc($recent_submissions)): ?>
                                <li>
                                    <strong><?php echo htmlspecialchars($submission['student_name']); ?></strong>
                                    <br>
                                    <small>
                                        Section: <?php echo $submission['section']; ?> | 
                                        Score: <?php echo $submission['score']; ?> points
                                        <span class="submission-time">
                                            <?php 
                                            $seconds = $submission['seconds_ago'];
                                            if ($seconds < 60) {
                                                echo $seconds . " seconds ago";
                                            } elseif ($seconds < 3600) {
                                                echo floor($seconds/60) . " minutes ago";
                                            } else {
                                                echo floor($seconds/3600) . " hours ago";
                                            }
                                            ?>
                                        </span>
                                    </small>
                                </li>
                            <?php endwhile; ?>
                        </ul>
                    <?php else: ?>
                        <p>No recent submissions.</p>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </main>

    <script>
        // Initialize timer displays
        let section1Remaining = <?php echo $section1_timer; ?> * 60;
        let section2Remaining = <?php echo $section2_timer; ?> * 60;
        let timerInterval;

        function updateTimerDisplays() {
            const section1Minutes = Math.floor(section1Remaining / 60);
            const section1Seconds = section1Remaining % 60;
            document.getElementById('section1TimerDisplay').textContent = 
                `${section1Minutes}:${section1Seconds.toString().padStart(2, '0')}`;

            const section2Minutes = Math.floor(section2Remaining / 60);
            const section2Seconds = section2Remaining % 60;
            document.getElementById('section2TimerDisplay').textContent = 
                `${section2Minutes}:${section2Seconds.toString().padStart(2, '0')}`;
        }

        function startTimers() {
            if (timerInterval) clearInterval(timerInterval);
            timerInterval = setInterval(() => {
                if (section1Remaining > 0) section1Remaining--;
                if (section2Remaining > 0) section2Remaining--;
                updateTimerDisplays();
            }, 1000);
        }

        function toggleSection2() {
            const enabled = document.getElementById('section2Toggle').checked;
            fetch('../../../api/admin/toggle-section2.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ enabled })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const statusElement = document.querySelector('.section-status');
                    statusElement.textContent = enabled ? 'Enabled' : 'Disabled';
                    statusElement.className = `section-status ${enabled ? 'status-enabled' : 'status-disabled'}`;
                }
            });
        }

        function updateTimers() {
            const section1 = parseInt(document.getElementById('section1Timer').value);
            const section2 = parseInt(document.getElementById('section2Timer').value);
            
            if (section1 < 1 || section2 < 1) {
                alert('Timer values must be greater than 0');
                return;
            }

            fetch('../../../api/admin/update-timer.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ section1, section2 })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    section1Remaining = section1 * 60;
                    section2Remaining = section2 * 60;
                    updateTimerDisplays();
                }
            });
        }

        function refreshDashboard() {
            location.reload();
        }

        // Start timers when page loads
        startTimers();

        // Refresh page every 30 seconds
        setInterval(refreshDashboard, 30000);
    </script>

    <footer>
        <p>&copy; <?php echo date("Y"); ?> The Genius Chess TV Quiz Show</p>
    </footer>
</body>
</html> 