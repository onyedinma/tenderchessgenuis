<?php
// Database connection configuration
$host = 'localhost';
$username = 'root'; // Default XAMPP username
$password = ''; // Default XAMPP password (empty)
$database = 'tenderchessgenius'; // Updated to match api/db/config.php

// Create connection
$conn = mysqli_connect($host, $username, $password, $database);

// Check connection
if (!$conn) {
    die(json_encode([
        'error' => 'Database connection failed',
        'message' => mysqli_connect_error()
    ]));
}

// Set character set
mysqli_set_charset($conn, 'utf8');

// Return the connection
return $conn;
?> 