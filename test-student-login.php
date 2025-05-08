<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

echo "<h1>Testing Student Login</h1>";

// Include database configuration
require_once 'api/db/config.php';

// Test credentials
$testUsername = 'student';
$testPassword = 'password';

echo "<h2>Step 1: Check if the student table exists</h2>";

try {
    if (isset($pdo)) {
        $stmt = $pdo->query("SHOW TABLES LIKE 'students'");
        $tableExists = $stmt->rowCount() > 0;
    } else {
        $conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);
        if ($conn->connect_error) {
            throw new Exception("Connection failed: " . $conn->connect_error);
        }
        $result = $conn->query("SHOW TABLES LIKE 'students'");
        $tableExists = $result->num_rows > 0;
    }
    
    if ($tableExists) {
        echo "<p style='color:green'>✓ Student table exists</p>";
    } else {
        echo "<p style='color:red'>✗ Student table doesn't exist. Please run setup_student_database.php first</p>";
        echo "<p><a href='setup_student_database.php'>Run setup script</a></p>";
        exit();
    }
} catch (Exception $e) {
    echo "<p style='color:red'>Error checking table: " . $e->getMessage() . "</p>";
    exit();
}

echo "<h2>Step 2: Verify test student account</h2>";

try {
    if (isset($pdo)) {
        $stmt = $pdo->prepare("SELECT id, name, username, password FROM students WHERE username = ?");
        $stmt->execute([$testUsername]);
        $student = $stmt->fetch();
    } else {
        $stmt = $conn->prepare("SELECT id, name, username, password FROM students WHERE username = ?");
        $stmt->bind_param("s", $testUsername);
        $stmt->execute();
        $result = $stmt->get_result();
        $student = $result->fetch_assoc();
    }
    
    if ($student) {
        echo "<p style='color:green'>✓ Found student with username: {$student['username']}</p>";
        
        // Verify the password hash
        $passwordVerified = password_verify($testPassword, $student['password']);
        
        if ($passwordVerified) {
            echo "<p style='color:green'>✓ Password verification successful</p>";
        } else {
            echo "<p style='color:red'>✗ Password verification failed. Stored hash might be invalid.</p>";
            echo "<p>Stored password hash: {$student['password']}</p>";
            
            // Create a new hash for comparison
            $newHash = password_hash($testPassword, PASSWORD_DEFAULT);
            echo "<p>New hash for comparison: {$newHash}</p>";
            
            // Update the student's password with a new hash
            echo "<p>Updating password with new hash...</p>";
            
            if (isset($pdo)) {
                $updateStmt = $pdo->prepare("UPDATE students SET password = ? WHERE username = ?");
                $updateStmt->execute([$newHash, $testUsername]);
            } else {
                $updateStmt = $conn->prepare("UPDATE students SET password = ? WHERE username = ?");
                $updateStmt->bind_param("ss", $newHash, $testUsername);
                $updateStmt->execute();
            }
            
            echo "<p style='color:green'>Password updated. Please try logging in again.</p>";
        }
    } else {
        echo "<p style='color:red'>✗ Test student not found. Please run setup_student_database.php first</p>";
        echo "<p><a href='setup_student_database.php'>Run setup script</a></p>";
    }
} catch (Exception $e) {
    echo "<p style='color:red'>Error verifying student: " . $e->getMessage() . "</p>";
}

echo "<h2>Step 3: Manual login test</h2>";
echo "<p>You can test the login API directly with these credentials:</p>";
echo "<pre>
POST /api/auth/student-login.php
Content-Type: application/json

{
    \"username\": \"$testUsername\",
    \"password\": \"$testPassword\"
}
</pre>";

echo "<p>Or try the UI login:</p>";
echo "<p><a href='/student/login' class='button'>Go to Student Login</a></p>";

echo "<p><a href='index.php'>Back to homepage</a></p>";
?> 