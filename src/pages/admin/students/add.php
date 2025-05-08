<?php
session_start();

// Check if user is logged in and is admin
if (!isset($_SESSION['user_id']) || !isset($_SESSION['is_admin']) || !$_SESSION['is_admin']) {
    header("Location: ../../../index.php");
    exit();
}

// Include database connection
$conn = require_once '../../../config/database.php';

$message = '';
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = $_POST['name'] ?? '';
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';
    
    // Validate inputs
    if (empty($name) || empty($username) || empty($password)) {
        $error = "All fields are required";
    } else {
        // Check if username already exists
        $stmt = $conn->prepare("SELECT id FROM students WHERE username = ?");
        $stmt->bind_param("s", $username);
        $stmt->execute();
        if ($stmt->get_result()->num_rows > 0) {
            $error = "Username already exists";
        } else {
            // Handle photo upload
            $photo_path = null;
            if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
                $allowed = ['jpg', 'jpeg', 'png'];
                $file_ext = strtolower(pathinfo($_FILES['photo']['name'], PATHINFO_EXTENSION));
                
                if (!in_array($file_ext, $allowed)) {
                    $error = "Only JPG, JPEG & PNG files are allowed";
                } else {
                    $upload_dir = '../../../uploads/students/';
                    if (!file_exists($upload_dir)) {
                        mkdir($upload_dir, 0777, true);
                    }
                    
                    $photo_path = $upload_dir . uniqid() . '.' . $file_ext;
                    if (!move_uploaded_file($_FILES['photo']['tmp_name'], $photo_path)) {
                        $error = "Failed to upload photo";
                    }
                }
            }
            
            if (empty($error)) {
                // Hash password
                $hashed_password = password_hash($password, PASSWORD_DEFAULT);
                
                // Insert new student
                $stmt = $conn->prepare("
                    INSERT INTO students (name, username, password, photo_path) 
                    VALUES (?, ?, ?, ?)
                ");
                $stmt->bind_param("ssss", $name, $username, $hashed_password, $photo_path);
                
                if ($stmt->execute()) {
                    $message = "Student added successfully";
                } else {
                    $error = "Error adding student: " . $conn->error;
                }
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Add Student - Chess Quiz Show</title>
    <link rel="stylesheet" href="../../../public/css/style.css">
</head>
<body>
    <div class="container">
        <h1>Add New Student</h1>
        
        <?php if ($message): ?>
            <div class="alert success"><?php echo $message; ?></div>
        <?php endif; ?>
        
        <?php if ($error): ?>
            <div class="alert error"><?php echo $error; ?></div>
        <?php endif; ?>
        
        <form method="POST" enctype="multipart/form-data">
            <div class="form-group">
                <label for="name">Full Name:</label>
                <input type="text" id="name" name="name" required>
            </div>
            
            <div class="form-group">
                <label for="username">Username:</label>
                <input type="text" id="username" name="username" required>
                <small>This will be used for login</small>
            </div>
            
            <div class="form-group">
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" required>
            </div>
            
            <div class="form-group">
                <label for="photo">Photo:</label>
                <input type="file" id="photo" name="photo" accept=".jpg,.jpeg,.png" required>
                <small>Upload student photo/passport (JPG, JPEG, PNG only)</small>
            </div>
            
            <div class="form-actions">
                <button type="submit" class="btn primary">Add Student</button>
                <a href="manage.php" class="btn">Back to Student List</a>
            </div>
        </form>
    </div>
</body>
</html> 