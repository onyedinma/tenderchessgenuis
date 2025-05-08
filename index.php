<?php
session_start();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chess Quiz Application</title>
    <link rel="stylesheet" href="public/css/style.css">
    <link rel="stylesheet" href="chessboardjs-1.0.0/css/chessboard-1.0.0.min.css">
    <!-- jQuery is required for chessboard.js -->
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <!-- Chessboard.js -->
    <script src="chessboardjs-1.0.0/js/chessboard-1.0.0.min.js"></script>
</head>
<body>
    <header>
        <h1>Chess Quiz Application</h1>
        <nav>
            <ul>
                <li><a href="index.php">Home</a></li>
                <?php if(isset($_SESSION['user_id'])): ?>
                    <li><a href="src/pages/quizzes.php">Quizzes</a></li>
                    <li><a href="src/pages/profile.php">Profile</a></li>
                    <?php if(isset($_SESSION['is_admin']) && $_SESSION['is_admin']): ?>
                        <li><a href="src/pages/admin/dashboard.php">Admin Dashboard</a></li>
                    <?php endif; ?>
                    <li><a href="api/auth/logout.php">Logout</a></li>
                <?php else: ?>
                    <li><a href="src/pages/login.php">Login</a></li>
                    <li><a href="src/pages/register.php">Register</a></li>
                <?php endif; ?>
            </ul>
        </nav>
    </header>

    <main>
        <section class="hero">
            <h2>Welcome to the Chess Quiz Application</h2>
            <p>Test your chess skills with our interactive puzzles and challenges</p>
            <?php if(!isset($_SESSION['user_id'])): ?>
                <div class="cta-buttons">
                    <a href="src/pages/login.php" class="btn primary">Login</a>
                    <a href="src/pages/register.php" class="btn secondary">Register</a>
                </div>
            <?php else: ?>
                <div class="cta-buttons">
                    <a href="src/pages/quizzes.php" class="btn primary">Start Solving</a>
                </div>
            <?php endif; ?>
        </section>

        <section class="features">
            <div class="feature">
                <h3>Multiple Puzzle Challenge</h3>
                <p>Solve a series of puzzles with varied difficulty levels</p>
            </div>
            <div class="feature">
                <h3>Competitive Mode</h3>
                <p>Race against time with single puzzle competitive challenges</p>
            </div>
            <div class="feature">
                <h3>Track Your Progress</h3>
                <p>Monitor your performance and improvement over time</p>
            </div>
        </section>
    </main>

    <footer>
        <p>&copy; <?php echo date("Y"); ?> Chess Quiz Application</p>
    </footer>

    <!-- JS files moved to footer to ensure DOM is loaded -->
    <script src="public/js/main.js"></script>
</body>
</html> 