<?php
/**
 * Migration script to add question_order field to questions table
 * This script will add a new field to track the order of questions within a bank for Section 1
 */

// Database connection parameters
require_once '../config/db_config.php';

// Function to execute a query and handle errors
function executeQuery($conn, $query, $message) {
    try {
        if ($conn->query($query) === TRUE) {
            echo "$message: Success\n";
            return true;
        } else {
            echo "$message: Failed - " . $conn->error . "\n";
            return false;
        }
    } catch (Exception $e) {
        echo "$message: Exception - " . $e->getMessage() . "\n";
        return false;
    }
}

// Check if connection exists
if (!isset($conn)) {
    try {
        $conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);
    } catch (Exception $e) {
        die("Connection failed: " . $e->getMessage());
    }
}

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

echo "Starting migration to add question_order field to questions table...\n";

// Check if the column already exists
$checkColumn = $conn->query("SHOW COLUMNS FROM questions LIKE 'question_order'");
if ($checkColumn->num_rows > 0) {
    echo "Column 'question_order' already exists in the questions table. Skipping column creation.\n";
} else {
    // Add the new column
    $addColumn = "ALTER TABLE questions ADD COLUMN question_order INT DEFAULT 0 AFTER position";
    executeQuery($conn, $addColumn, "Adding question_order column");
}

// Update existing records to set sequential order within each bank
$resetVariables = "SET @rank = 0; SET @current_bank = 0;";
executeQuery($conn, $resetVariables, "Initializing variables");

// Order questions by their ID within each bank
$updateOrderQuery = "
UPDATE questions q1
JOIN (
    SELECT id, bank_id,
    @rank := IF(@current_bank = bank_id, @rank + 1, 1) AS new_order,
    @current_bank := bank_id
    FROM questions
    ORDER BY bank_id, id
) q2 ON q1.id = q2.id
SET q1.question_order = q2.new_order";

executeQuery($conn, $updateOrderQuery, "Updating question_order values");

// Check if index exists
$checkIndex = $conn->query("SHOW INDEX FROM questions WHERE Key_name = 'idx_bank_order'");
if ($checkIndex->num_rows > 0) {
    echo "Index 'idx_bank_order' already exists. Skipping index creation.\n";
} else {
    // Add an index for better performance
    $addIndex = "ALTER TABLE questions ADD INDEX idx_bank_order (bank_id, question_order)";
    executeQuery($conn, $addIndex, "Adding index on bank_id and question_order");
}

echo "Migration completed successfully!\n";
$conn->close();
?> 