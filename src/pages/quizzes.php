<?php
session_start();

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit();
}

// Include database connection
$conn = require_once '../../config/database.php';

// Get user's groups
$user_id = $_SESSION['user_id'];
$sql = "SELECT g.id FROM groups g 
        JOIN group_user gu ON g.id = gu.group_id 
        WHERE gu.user_id = ?";
$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, "i", $user_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

$user_groups = [];
while ($row = mysqli_fetch_assoc($result)) {
    $user_groups[] = $row['id'];
}

// Get available quizzes
$current_date = date('Y-m-d H:i:s');
$sql = "SELECT q.*, 
        (SELECT COUNT(*) FROM quiz_puzzle WHERE quiz_id = q.id) as puzzle_count,
        (SELECT COUNT(*) FROM submissions WHERE quiz_id = q.id AND user_id = ?) as attempt_count
        FROM quizzes q 
        WHERE q.scheduled_date <= ? 
        AND (q.id IN (
            SELECT quiz_id FROM quiz_group 
            WHERE group_id IN (" . (!empty($user_groups) ? implode(',', $user_groups) : 0) . ")
        ) OR NOT EXISTS (
            SELECT 1 FROM quiz_group WHERE quiz_id = q.id
        ))
        ORDER BY q.scheduled_date DESC";
$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, "is", $user_id, $current_date);
mysqli_stmt_execute($stmt);
$available_quizzes = mysqli_stmt_get_result($stmt);

// Get upcoming quizzes
$sql = "SELECT q.*, 
        (SELECT COUNT(*) FROM quiz_puzzle WHERE quiz_id = q.id) as puzzle_count
        FROM quizzes q 
        WHERE q.scheduled_date > ? 
        AND (q.id IN (
            SELECT quiz_id FROM quiz_group 
            WHERE group_id IN (" . (!empty($user_groups) ? implode(',', $user_groups) : 0) . ")
        ) OR NOT EXISTS (
            SELECT 1 FROM quiz_group WHERE quiz_id = q.id
        ))
        ORDER BY q.scheduled_date ASC";
$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, "s", $current_date);
mysqli_stmt_execute($stmt);
$upcoming_quizzes = mysqli_stmt_get_result($stmt);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quizzes - Chess Quiz Application</title>
    <link rel="stylesheet" href="../../public/css/style.css">
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
        <div class="quiz-container" style="max-width: 1000px; margin: 0 auto; padding: 2rem;">
            <h2>Available Quizzes</h2>
            
            <div class="quiz-list" style="margin-top: 2rem;">
                <?php if (mysqli_num_rows($available_quizzes) > 0): ?>
                    <?php while($quiz = mysqli_fetch_assoc($available_quizzes)): ?>
                        <div class="quiz-card" style="background: white; border-radius: 5px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); padding: 1.5rem; margin-bottom: 1.5rem;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <h3><?php echo htmlspecialchars($quiz['title']); ?></h3>
                                <span class="quiz-type" style="background: #2980b9; color: white; padding: 0.3rem 0.8rem; border-radius: 3px; font-size: 0.9rem;">
                                    <?php echo $quiz['type'] == '1' ? 'Multiple Puzzles' : 'Single Puzzle'; ?>
                                </span>
                            </div>
                            
                            <div class="quiz-details" style="margin: 1rem 0; display: flex; flex-wrap: wrap;">
                                <div style="margin-right: 2rem;">
                                    <strong>Puzzles:</strong> <?php echo $quiz['puzzle_count']; ?>
                                </div>
                                <div style="margin-right: 2rem;">
                                    <strong>Time Limit:</strong> <?php echo $quiz['timer_duration'] ? floor($quiz['timer_duration'] / 60) . ' minutes' : 'No limit'; ?>
                                </div>
                                <div style="margin-right: 2rem;">
                                    <strong>Available Since:</strong> <?php echo date('M j, Y', strtotime($quiz['scheduled_date'])); ?>
                                </div>
                                <div>
                                    <strong>Attempts:</strong> <?php echo $quiz['attempt_count']; ?>
                                </div>
                            </div>
                            
                            <div class="quiz-actions" style="display: flex; justify-content: flex-end; margin-top: 1rem;">
                                <a href="take-quiz.php?id=<?php echo $quiz['id']; ?>" class="btn primary">Start Quiz</a>
                                <?php if($quiz['attempt_count'] > 0): ?>
                                    <a href="quiz-results.php?id=<?php echo $quiz['id']; ?>" class="btn secondary" style="margin-left: 0.5rem;">View Results</a>
                                <?php endif; ?>
                            </div>
                        </div>
                    <?php endwhile; ?>
                <?php else: ?>
                    <p style="text-align: center; font-style: italic; margin-top: 2rem;">No quizzes available at the moment.</p>
                <?php endif; ?>
            </div>
            
            <h2 style="margin-top: 3rem;">Upcoming Quizzes</h2>
            
            <div class="quiz-list" style="margin-top: 2rem;">
                <?php if (mysqli_num_rows($upcoming_quizzes) > 0): ?>
                    <?php while($quiz = mysqli_fetch_assoc($upcoming_quizzes)): ?>
                        <div class="quiz-card" style="background: white; border-radius: 5px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); padding: 1.5rem; margin-bottom: 1.5rem; opacity: 0.7;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <h3><?php echo htmlspecialchars($quiz['title']); ?></h3>
                                <span class="quiz-type" style="background: #7f8c8d; color: white; padding: 0.3rem 0.8rem; border-radius: 3px; font-size: 0.9rem;">
                                    <?php echo $quiz['type'] == '1' ? 'Multiple Puzzles' : 'Single Puzzle'; ?>
                                </span>
                            </div>
                            
                            <div class="quiz-details" style="margin: 1rem 0; display: flex; flex-wrap: wrap;">
                                <div style="margin-right: 2rem;">
                                    <strong>Puzzles:</strong> <?php echo $quiz['puzzle_count']; ?>
                                </div>
                                <div style="margin-right: 2rem;">
                                    <strong>Time Limit:</strong> <?php echo $quiz['timer_duration'] ? floor($quiz['timer_duration'] / 60) . ' minutes' : 'No limit'; ?>
                                </div>
                                <div>
                                    <strong>Available From:</strong> <?php echo date('M j, Y', strtotime($quiz['scheduled_date'])); ?>
                                </div>
                            </div>
                            
                            <div class="countdown" style="text-align: center; margin-top: 1rem; padding: 0.5rem; background: #f8f9fa; border-radius: 3px;">
                                <p>Available in <strong id="countdown-<?php echo $quiz['id']; ?>"></strong></p>
                                <script>
                                    // Set the date we're counting down to
                                    var countDownDate<?php echo $quiz['id']; ?> = new Date("<?php echo $quiz['scheduled_date']; ?>").getTime();
                                    
                                    // Update the countdown every 1 second
                                    var x<?php echo $quiz['id']; ?> = setInterval(function() {
                                        // Get today's date and time
                                        var now = new Date().getTime();
                                        
                                        // Find the distance between now and the count down date
                                        var distance = countDownDate<?php echo $quiz['id']; ?> - now;
                                        
                                        // Time calculations for days, hours, minutes and seconds
                                        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
                                        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                                        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                                        var seconds = Math.floor((distance % (1000 * 60)) / 1000);
                                        
                                        // Display the result
                                        document.getElementById("countdown-<?php echo $quiz['id']; ?>").innerHTML = days + "d " + hours + "h " + minutes + "m " + seconds + "s";
                                        
                                        // If the count down is finished, reload page
                                        if (distance < 0) {
                                            clearInterval(x<?php echo $quiz['id']; ?>);
                                            location.reload();
                                        }
                                    }, 1000);
                                </script>
                            </div>
                        </div>
                    <?php endwhile; ?>
                <?php else: ?>
                    <p style="text-align: center; font-style: italic; margin-top: 2rem;">No upcoming quizzes.</p>
                <?php endif; ?>
            </div>
        </div>
    </main>

    <footer>
        <p>&copy; <?php echo date("Y"); ?> Chess Quiz Application</p>
    </footer>

    <script src="../../public/js/main.js"></script>
</body>
</html> 