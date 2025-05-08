<?php
$conn = require_once '../config/database.php';

// Users table
$sql = "CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  profile_picture TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";
if (!mysqli_query($conn, $sql)) {
    die("Error creating users table: " . mysqli_error($conn));
}

// Roles table
$sql = "CREATE TABLE IF NOT EXISTS roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) UNIQUE
)";
if (!mysqli_query($conn, $sql)) {
    die("Error creating roles table: " . mysqli_error($conn));
}

// User roles table
$sql = "CREATE TABLE IF NOT EXISTS user_roles (
  user_id INT,
  role_id INT,
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (role_id) REFERENCES roles(id)
)";
if (!mysqli_query($conn, $sql)) {
    die("Error creating user_roles table: " . mysqli_error($conn));
}

// Groups table
$sql = "CREATE TABLE IF NOT EXISTS groups (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100),
  description TEXT
)";
if (!mysqli_query($conn, $sql)) {
    die("Error creating groups table: " . mysqli_error($conn));
}

// Group users table
$sql = "CREATE TABLE IF NOT EXISTS group_user (
  group_id INT,
  user_id INT,
  PRIMARY KEY (group_id, user_id),
  FOREIGN KEY (group_id) REFERENCES groups(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
)";
if (!mysqli_query($conn, $sql)) {
    die("Error creating group_user table: " . mysqli_error($conn));
}

// Puzzles table
$sql = "CREATE TABLE IF NOT EXISTS puzzles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  fen TEXT,
  solutionFen TEXT,
  pgn TEXT,
  section_type ENUM('1','2','both'),
  correct_move VARCHAR(10),
  difficulty ENUM('easy','medium','hard'),
  tags TEXT
)";
if (!mysqli_query($conn, $sql)) {
    die("Error creating puzzles table: " . mysqli_error($conn));
}

// Quizzes table
$sql = "CREATE TABLE IF NOT EXISTS quizzes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255),
  type ENUM('1','2'),
  scheduled_date DATETIME,
  timer_duration INT,
  created_by INT,
  FOREIGN KEY (created_by) REFERENCES users(id)
)";
if (!mysqli_query($conn, $sql)) {
    die("Error creating quizzes table: " . mysqli_error($conn));
}

// Quiz group table
$sql = "CREATE TABLE IF NOT EXISTS quiz_group (
  quiz_id INT,
  group_id INT,
  PRIMARY KEY (quiz_id, group_id),
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id),
  FOREIGN KEY (group_id) REFERENCES groups(id)
)";
if (!mysqli_query($conn, $sql)) {
    die("Error creating quiz_group table: " . mysqli_error($conn));
}

// Quiz puzzle table
$sql = "CREATE TABLE IF NOT EXISTS quiz_puzzle (
  id INT PRIMARY KEY AUTO_INCREMENT,
  quiz_id INT,
  puzzle_id INT,
  timer_duration INT,
  puzzle_order INT,
  instructions TEXT,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id),
  FOREIGN KEY (puzzle_id) REFERENCES puzzles(id)
)";
if (!mysqli_query($conn, $sql)) {
    die("Error creating quiz_puzzle table: " . mysqli_error($conn));
}

// Submissions table
$sql = "CREATE TABLE IF NOT EXISTS submissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  puzzle_id INT,
  quiz_id INT,
  submitted_move VARCHAR(10),
  time_taken INT,
  correct BOOLEAN,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (puzzle_id) REFERENCES puzzles(id),
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
)";
if (!mysqli_query($conn, $sql)) {
    die("Error creating submissions table: " . mysqli_error($conn));
}

// User moves table
$sql = "CREATE TABLE IF NOT EXISTS user_moves (
  id INT PRIMARY KEY AUTO_INCREMENT,
  submission_id INT,
  move_number INT,
  move_notation VARCHAR(10),
  timestamp TIMESTAMP,
  FOREIGN KEY (submission_id) REFERENCES submissions(id)
)";
if (!mysqli_query($conn, $sql)) {
    die("Error creating user_moves table: " . mysqli_error($conn));
}

// Performance table
$sql = "CREATE TABLE IF NOT EXISTS performance (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  quiz_id INT,
  score INT,
  accuracy FLOAT,
  section_type ENUM('1','2'),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
)";
if (!mysqli_query($conn, $sql)) {
    die("Error creating performance table: " . mysqli_error($conn));
}

// Feedback table
$sql = "CREATE TABLE IF NOT EXISTS feedback (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  puzzle_id INT,
  quiz_id INT,
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (puzzle_id) REFERENCES puzzles(id),
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
)";
if (!mysqli_query($conn, $sql)) {
    die("Error creating feedback table: " . mysqli_error($conn));
}

// Insert default roles
$sql = "INSERT IGNORE INTO roles (name) VALUES ('admin'), ('user')";
if (!mysqli_query($conn, $sql)) {
    die("Error inserting default roles: " . mysqli_error($conn));
}

echo "Database initialized successfully!";
?> 