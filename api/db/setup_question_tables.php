<?php
// Set content type for browser viewing
header('Content-Type: text/html');

require_once 'config.php';

echo "<h1>Chess Question Banks Database Setup</h1>";
echo "<p>Starting database table setup...</p>";

try {
    // Create database connection
    $conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);
    
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }
    
    echo "<p style='color:green'>✓ Connected to database successfully.</p>";
    
    // Read SQL file
    $sqlFilePath = __DIR__ . '/setup_question_tables.sql';
    echo "<p>Reading SQL file from: $sqlFilePath</p>";
    
    $sqlFile = file_get_contents($sqlFilePath);
    
    if (!$sqlFile) {
        throw new Exception("Could not read SQL file.");
    }
    
    echo "<p>SQL file loaded successfully. Size: " . strlen($sqlFile) . " bytes</p>";
    
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
    
    echo "<p>Found " . count($statements) . " SQL statements to execute</p>";
    
    // Execute each statement
    foreach ($statements as $statement) {
        echo "<p>Executing: " . substr($statement, 0, 50) . "...</p>";
        if ($conn->query($statement) === TRUE) {
            echo "<p style='color:green'>✓ Successfully executed statement</p>";
        } else {
            throw new Exception("Error executing statement: " . $conn->error . "<br>Statement: " . $statement);
        }
    }
    
    echo "<p style='color:green'>✓ All SQL statements executed successfully!</p>";
    
    // Check if tables were created
    echo "<h2>Verification</h2>";
    $result = $conn->query("SHOW TABLES LIKE 'question_banks'");
    if ($result->num_rows > 0) {
        echo "<p style='color:green'>✓ Confirmed question_banks table exists.</p>";
        
        // Show table structure
        $structure = $conn->query("DESCRIBE question_banks");
        echo "<h3>question_banks structure:</h3>";
        echo "<pre>";
        while ($row = $structure->fetch_assoc()) {
            echo "{$row['Field']} - {$row['Type']} - {$row['Null']} - {$row['Key']} - {$row['Default']}\n";
        }
        echo "</pre>";
    } else {
        echo "<p style='color:red'>✗ WARNING: question_banks table was not created!</p>";
    }
    
    $result = $conn->query("SHOW TABLES LIKE 'questions'");
    if ($result->num_rows > 0) {
        echo "<p style='color:green'>✓ Confirmed questions table exists.</p>";
        
        // Show table structure
        $structure = $conn->query("DESCRIBE questions");
        echo "<h3>questions structure:</h3>";
        echo "<pre>";
        while ($row = $structure->fetch_assoc()) {
            echo "{$row['Field']} - {$row['Type']} - {$row['Null']} - {$row['Key']} - {$row['Default']}\n";
        }
        echo "</pre>";
    } else {
        echo "<p style='color:red'>✗ WARNING: questions table was not created!</p>";
    }
    
    $conn->close();
    echo "<p style='color:green'>✓ Database setup complete.</p>";
    echo "<p><a href='../question-banks/test.php'>Go to Question Banks API test page</a></p>";
    
} catch (Exception $e) {
    echo "<p style='color:red'>ERROR: " . $e->getMessage() . "</p>";
    exit(1);
}
?> 