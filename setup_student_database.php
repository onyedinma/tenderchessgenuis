<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

echo "<h1>Setting up Student Database</h1>";

// Include database configuration
require_once 'api/db/config.php';

// Database connection
try {
    // Check if PDO connection exists from config
    if (isset($pdo)) {
        echo "<p>Using existing PDO connection...</p>";
        $db = $pdo;
    } else {
        // Create mysqli connection if PDO not available
        echo "<p>Creating new mysqli connection...</p>";
        $conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);
        
        if ($conn->connect_error) {
            throw new Exception("Connection failed: " . $conn->connect_error);
        }
        
        $db = $conn;
    }
    
    echo "<p>Connected to database successfully.</p>";
    
    // Get the SQL script
    $sql = file_get_contents('database/create_students_table.sql');
    
    // PDO execution
    if (isset($pdo)) {
        // Split the SQL script into individual statements
        $statements = array_filter(array_map('trim', explode(';', $sql)), 'strlen');
        
        foreach ($statements as $statement) {
            $result = $pdo->exec($statement);
            if ($result === false) {
                $error = $pdo->errorInfo();
                echo "<p>Error executing statement: " . $error[2] . "</p>";
                echo "<pre>" . htmlspecialchars($statement) . "</pre>";
            }
        }
    } else {
        // mysqli execution
        if ($conn->multi_query($sql)) {
            do {
                // Store the result
                if ($result = $conn->store_result()) {
                    $result->free();
                }
                // Move to the next result
            } while ($conn->more_results() && $conn->next_result());
        }
        
        if ($conn->error) {
            throw new Exception("Error executing SQL: " . $conn->error);
        }
    }
    
    echo "<p>Students table created successfully!</p>";
    
    // Create a test student account if not exists
    $testUsername = 'student';
    $rawPassword = 'password';
    $testPassword = password_hash($rawPassword, PASSWORD_DEFAULT);
    $testName = 'Test Student';
    
    echo "<p>Creating test student with:</p>";
    echo "<ul>";
    echo "<li>Username: $testUsername</li>";
    echo "<li>Password: $rawPassword</li>";
    echo "<li>Generated hash: $testPassword</li>";
    echo "</ul>";
    
    if (isset($pdo)) {
        // Check if test user exists
        $stmt = $pdo->prepare("SELECT id FROM students WHERE username = ?");
        $stmt->execute([$testUsername]);
        
        if (!$stmt->fetch()) {
            // Create test user
            $stmt = $pdo->prepare("
                INSERT INTO students (name, username, password, last_active) 
                VALUES (?, ?, ?, NOW())
            ");
            $stmt->execute([$testName, $testUsername, $testPassword]);
            echo "<p>Test student account created with username: <strong>$testUsername</strong> and password: <strong>password</strong></p>";
        } else {
            echo "<p>Test student account already exists.</p>";
        }
    } else {
        // Check if test user exists
        $stmt = $conn->prepare("SELECT id FROM students WHERE username = ?");
        $stmt->bind_param("s", $testUsername);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            // Create test user
            $stmt = $conn->prepare("
                INSERT INTO students (name, username, password, last_active) 
                VALUES (?, ?, ?, NOW())
            ");
            $stmt->bind_param("sss", $testName, $testUsername, $testPassword);
            $stmt->execute();
            echo "<p>Test student account created with username: <strong>$testUsername</strong> and password: <strong>password</strong></p>";
        } else {
            echo "<p>Test student account already exists.</p>";
        }
    }
    
    echo "<p><a href='index.php'>Go to homepage</a></p>";
    
} catch (Exception $e) {
    echo "<p>Error: " . $e->getMessage() . "</p>";
}
?> 