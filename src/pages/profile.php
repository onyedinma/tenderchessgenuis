<?php
session_start();

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit();
}

// Include database connection
$conn = require_once '../../config/database.php';

// Get user data
$user_id = $_SESSION['user_id'];
$sql = "SELECT * FROM users WHERE id = ?";
$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, "i", $user_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$user = mysqli_fetch_assoc($result);

// Get user performance statistics
$sql = "SELECT 
    COUNT(*) as total_quizzes,
    SUM(CASE WHEN correct = 1 THEN 1 ELSE 0 END) as correct_answers,
    SUM(CASE WHEN correct = 0 THEN 1 ELSE 0 END) as wrong_answers
FROM submissions
WHERE user_id = ?";
$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, "i", $user_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$stats = mysqli_fetch_assoc($result);

// Calculate accuracy
$accuracy = 0;
if ($stats['total_quizzes'] > 0) {
    $accuracy = round(($stats['correct_answers'] / $stats['total_quizzes']) * 100, 2);
}

// Get recent submissions
$sql = "SELECT s.*, p.fen, p.difficulty, q.title as quiz_title
FROM submissions s
JOIN puzzles p ON s.puzzle_id = p.id
JOIN quizzes q ON s.quiz_id = q.id
WHERE s.user_id = ?
ORDER BY s.created_at DESC
LIMIT 5";
$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, "i", $user_id);
mysqli_stmt_execute($stmt);
$recent_submissions = mysqli_stmt_get_result($stmt);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Profile - Chess Quiz Application</title>
    <link rel="stylesheet" href="../../public/css/style.css">
    <link rel="stylesheet" href="../../chessboardjs-1.0.0/css/chessboard-1.0.0.min.css">
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
        <div class="profile-container" style="max-width: 800px; margin: 0 auto; padding: 2rem;">
            <h2>My Profile</h2>
            
            <div class="profile-info" style="display: flex; margin-bottom: 2rem; background: white; padding: 1rem; border-radius: 5px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
                <div class="profile-avatar" style="margin-right: 2rem;">
                    <img src="<?php echo $user['profile_picture'] ? $user['profile_picture'] : '../../public/images/default-avatar.png'; ?>" 
                         alt="Profile Picture" style="width: 150px; height: 150px; border-radius: 50%; object-fit: cover;">
                </div>
                <div class="profile-details">
                    <h3><?php echo htmlspecialchars($user['name']); ?></h3>
                    <p>Email: <?php echo htmlspecialchars($user['email']); ?></p>
                    <p>Member since: <?php echo date('F j, Y', strtotime($user['created_at'])); ?></p>
                    <a href="edit-profile.php" class="btn secondary" style="margin-top: 1rem;">Edit Profile</a>
                </div>
            </div>
            
            <div class="profile-stats" style="margin-bottom: 2rem; background: white; padding: 1rem; border-radius: 5px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
                <h3>Performance Statistics</h3>
                <div style="display: flex; justify-content: space-between; margin-top: 1rem;">
                    <div style="text-align: center; flex: 1;">
                        <p style="font-size: 2rem; font-weight: bold;"><?php echo $stats['total_quizzes']; ?></p>
                        <p>Total Puzzles</p>
                    </div>
                    <div style="text-align: center; flex: 1;">
                        <p style="font-size: 2rem; font-weight: bold;"><?php echo $stats['correct_answers']; ?></p>
                        <p>Correct Answers</p>
                    </div>
                    <div style="text-align: center; flex: 1;">
                        <p style="font-size: 2rem; font-weight: bold;"><?php echo $accuracy; ?>%</p>
                        <p>Accuracy</p>
                    </div>
                </div>
            </div>
            
            <div class="recent-activity" style="background: white; padding: 1rem; border-radius: 5px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
                <h3>Recent Activity</h3>
                
                <?php if (mysqli_num_rows($recent_submissions) > 0): ?>
                    <div class="recent-submissions" style="margin-top: 1rem;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr>
                                    <th style="padding: 0.5rem; text-align: left; border-bottom: 1px solid #ddd;">Quiz</th>
                                    <th style="padding: 0.5rem; text-align: left; border-bottom: 1px solid #ddd;">Difficulty</th>
                                    <th style="padding: 0.5rem; text-align: left; border-bottom: 1px solid #ddd;">Result</th>
                                    <th style="padding: 0.5rem; text-align: left; border-bottom: 1px solid #ddd;">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php while ($submission = mysqli_fetch_assoc($recent_submissions)): ?>
                                    <tr>
                                        <td style="padding: 0.5rem; border-bottom: 1px solid #eee;"><?php echo htmlspecialchars($submission['quiz_title']); ?></td>
                                        <td style="padding: 0.5rem; border-bottom: 1px solid #eee;"><?php echo ucfirst($submission['difficulty']); ?></td>
                                        <td style="padding: 0.5rem; border-bottom: 1px solid #eee;">
                                            <?php if ($submission['correct']): ?>
                                                <span style="color: green;">Correct</span>
                                            <?php else: ?>
                                                <span style="color: red;">Incorrect</span>
                                            <?php endif; ?>
                                        </td>
                                        <td style="padding: 0.5rem; border-bottom: 1px solid #eee;"><?php echo date('M j, Y g:i A', strtotime($submission['created_at'])); ?></td>
                                    </tr>
                                <?php endwhile; ?>
                            </tbody>
                        </table>
                    </div>
                <?php else: ?>
                    <p style="margin-top: 1rem; font-style: italic;">You haven't completed any puzzles yet.</p>
                <?php endif; ?>
                
                <div style="margin-top: 1.5rem;">
                    <a href="history.php" class="btn secondary">View Full History</a>
                </div>
            </div>
        </div>
    </main>

    <footer>
        <p>&copy; <?php echo date("Y"); ?> Chess Quiz Application</p>
    </footer>

    <script src="../../chessboardjs-1.0.0/js/chessboard-1.0.0.min.js"></script>
    <script src="../../public/js/main.js"></script>
</body>
</html> 