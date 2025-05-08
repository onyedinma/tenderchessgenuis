<?php
header('Content-Type: text/html');

echo "<h1>Question Banks API Test</h1>";
echo "<p>This page tests if the question-banks API endpoints are accessible and working correctly.</p>";

echo "<h2>1. Testing Database Connection</h2>";
require_once __DIR__ . '/../db/config.php';

try {
    $conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);
    
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }
    
    echo "<p style='color:green'>✓ Database connection successful!</p>";
    
    // Check if tables exist
    echo "<h2>2. Checking Tables</h2>";
    
    $result = $conn->query("SHOW TABLES LIKE 'question_banks'");
    if ($result->num_rows > 0) {
        echo "<p style='color:green'>✓ question_banks table exists</p>";
    } else {
        echo "<p style='color:red'>✗ question_banks table does not exist</p>";
        echo "<p>Please run the setup_question_tables.php script first.</p>";
    }
    
    $result = $conn->query("SHOW TABLES LIKE 'questions'");
    if ($result->num_rows > 0) {
        echo "<p style='color:green'>✓ questions table exists</p>";
    } else {
        echo "<p style='color:red'>✗ questions table does not exist</p>";
        echo "<p>Please run the setup_question_tables.php script first.</p>";
    }
    
    // Test creating tables if they don't exist
    if (!$conn->query("SHOW TABLES LIKE 'question_banks'")->num_rows) {
        echo "<h2>3. Creating Tables</h2>";
        echo "<p>Attempting to create tables automatically...</p>";
        
        $sqlFile = file_get_contents(__DIR__ . '/../db/setup_question_tables.sql');
        
        if (!$sqlFile) {
            throw new Exception("Could not read SQL file.");
        }
        
        // Split SQL file into individual statements
        $statements = array_filter(
            array_map(
                'trim', 
                explode(';', $sqlFile)
            ), 
            function($statement) {
                return !empty($statement);
            }
        );
        
        // Execute each statement
        foreach ($statements as $statement) {
            if ($conn->query($statement) === TRUE) {
                echo "<p>Executed SQL statement</p>";
            } else {
                throw new Exception("Error executing statement: " . $conn->error);
            }
        }
        
        echo "<p style='color:green'>✓ Tables created successfully!</p>";
    }
    
    // Test CORS and API endpoints
    echo "<h2>4. API Endpoints Check</h2>";
    echo "<p>The following endpoints should be functioning:</p>";
    echo "<ul>";
    echo "<li><a href='get-banks.php' target='_blank'>get-banks.php</a> - Should return JSON with empty banks array</li>";
    echo "<li>create-bank.php (POST) - Creates a new question bank</li>";
    echo "<li>delete-bank.php (POST) - Deletes a question bank</li>";
    echo "<li>get-questions.php (GET with bank_id parameter) - Gets questions for a bank</li>";
    echo "<li>add-question.php (POST) - Adds a question to a bank</li>";
    echo "<li>update-question.php (POST) - Updates an existing question</li>";
    echo "<li>remove-question.php (POST) - Removes a question from a bank</li>";
    echo "<li>toggle-question.php (POST) - Toggles a question's active status</li>";
    echo "</ul>";
    
    $conn->close();
    
} catch (Exception $e) {
    echo "<p style='color:red'>ERROR: " . $e->getMessage() . "</p>";
}

echo "<p><a href='./'>Back to API Directory</a></p>";
?> 