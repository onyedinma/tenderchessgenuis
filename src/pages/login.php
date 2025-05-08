<?php
session_start();

// Redirect if already logged in
if (isset($_SESSION['user_id'])) {
    header("Location: ../../index.php");
    exit();
}

// Process form submission
$error = "";
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Include database connection
    $conn = require_once '../../config/database.php';
    
    // Get form data and sanitize
    $email = mysqli_real_escape_string($conn, $_POST['email']);
    $password = $_POST['password'];
    
    // Validate input
    if (empty($email) || empty($password)) {
        $error = "Please fill in all fields";
    } else {
        // Check if email exists
        $sql = "SELECT u.id, u.name, u.email, u.password, r.name as role_name 
                FROM users u 
                JOIN user_roles ur ON u.id = ur.user_id 
                JOIN roles r ON ur.role_id = r.id 
                WHERE u.email = ?";
        
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "s", $email);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        
        if (mysqli_num_rows($result) == 1) {
            $user = mysqli_fetch_assoc($result);
            
            // Verify password
            if (password_verify($password, $user['password'])) {
                // Password is correct, set session
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['user_name'] = $user['name'];
                $_SESSION['user_email'] = $user['email'];
                $_SESSION['is_admin'] = ($user['role_name'] == 'admin');
                
                // Redirect to home page
                header("Location: ../../index.php");
                exit();
            } else {
                $error = "Invalid email or password";
            }
        } else {
            $error = "Invalid email or password";
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Chess Quiz Application</title>
    <link rel="stylesheet" href="../../public/css/style.css">
</head>
<body>
    <header>
        <h1>Chess Quiz Application</h1>
        <nav>
            <ul>
                <li><a href="../../index.php">Home</a></li>
                <li><a href="login.php">Login</a></li>
                <li><a href="register.php">Register</a></li>
            </ul>
        </nav>
    </header>

    <main>
        <div class="form-container">
            <h2>Login</h2>
            
            <?php if (!empty($error)): ?>
                <div class="error-message" style="color: red; margin-bottom: 15px;">
                    <?php echo $error; ?>
                </div>
            <?php endif; ?>
            
            <form action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>" method="post" onsubmit="return validateForm(this)">
                <div class="form-group">
                    <label for="email">Email:</label>
                    <input type="email" id="email" name="email" required>
                </div>
                
                <div class="form-group">
                    <label for="password">Password:</label>
                    <input type="password" id="password" name="password" required>
                </div>
                
                <div class="form-submit">
                    <button type="submit" class="btn primary">Login</button>
                </div>
            </form>
            
            <p style="margin-top: 20px; text-align: center;">
                Don't have an account? <a href="register.php">Register here</a>
            </p>
        </div>
    </main>

    <footer>
        <p>&copy; <?php echo date("Y"); ?> Chess Quiz Application</p>
    </footer>

    <script src="../../public/js/main.js"></script>
</body>
</html> 