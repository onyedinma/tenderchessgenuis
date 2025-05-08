<?php
// Script to create a test user for login testing
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

// Include database configuration
require_once 'db/config.php';

// Test user data
$testUser = [
    'name' => 'Test User',
    'email' => 'test@example.com',
    'password' => password_hash('password123', PASSWORD_DEFAULT),
    'role' => 'user'
];

$results = [];

try {
    // Check if the users table exists
    $stmt = $pdo->query("SHOW TABLES LIKE 'users'");
    $usersTableExists = $stmt->rowCount() > 0;
    $results['users_table_exists'] = $usersTableExists;
    
    if (!$usersTableExists) {
        // Create users table
        $sql = "CREATE TABLE `users` (
            `id` int(11) NOT NULL AUTO_INCREMENT,
            `name` varchar(255) NOT NULL,
            `email` varchar(255) NOT NULL,
            `password` varchar(255) NOT NULL,
            `role` varchar(50) DEFAULT 'user',
            `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            UNIQUE KEY `email` (`email`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
        
        $pdo->exec($sql);
        $results['users_table_created'] = true;
    }
    
    // Check if the roles table exists
    $stmt = $pdo->query("SHOW TABLES LIKE 'roles'");
    $rolesTableExists = $stmt->rowCount() > 0;
    $results['roles_table_exists'] = $rolesTableExists;
    
    if (!$rolesTableExists) {
        // Create roles table
        $sql = "CREATE TABLE `roles` (
            `id` int(11) NOT NULL AUTO_INCREMENT,
            `name` varchar(50) NOT NULL,
            `description` text,
            PRIMARY KEY (`id`),
            UNIQUE KEY `name` (`name`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
        
        $pdo->exec($sql);
        $results['roles_table_created'] = true;
        
        // Insert default roles
        $sql = "INSERT INTO `roles` (`name`, `description`) VALUES
            ('admin', 'Administrator with full access'),
            ('user', 'Standard user');";
        
        $pdo->exec($sql);
        $results['default_roles_added'] = true;
    }
    
    // Check if the user_roles table exists
    $stmt = $pdo->query("SHOW TABLES LIKE 'user_roles'");
    $userRolesTableExists = $stmt->rowCount() > 0;
    $results['user_roles_table_exists'] = $userRolesTableExists;
    
    if (!$userRolesTableExists) {
        // Create user_roles table
        $sql = "CREATE TABLE `user_roles` (
            `user_id` int(11) NOT NULL,
            `role_id` int(11) NOT NULL,
            PRIMARY KEY (`user_id`,`role_id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
        
        $pdo->exec($sql);
        $results['user_roles_table_created'] = true;
    }
    
    // Check if test user already exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$testUser['email']]);
    $userExists = $stmt->fetch();
    
    if ($userExists) {
        $results['user_exists'] = true;
        $results['user_id'] = $userExists['id'];
    } else {
        // Create test user
        $stmt = $pdo->prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)");
        $stmt->execute([
            $testUser['name'],
            $testUser['email'],
            $testUser['password'],
            $testUser['role']
        ]);
        
        $userId = $pdo->lastInsertId();
        $results['user_created'] = true;
        $results['user_id'] = $userId;
        
        // Assign user role
        $stmt = $pdo->prepare("SELECT id FROM roles WHERE name = 'user'");
        $stmt->execute();
        $userRole = $stmt->fetch();
        
        if ($userRole) {
            $stmt = $pdo->prepare("INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)");
            $stmt->execute([$userId, $userRole['id']]);
            $results['role_assigned'] = true;
        }
    }
    
    // Return success message with details
    echo json_encode([
        'success' => true,
        'message' => 'Test user setup complete',
        'results' => $results,
        'test_credentials' => [
            'email' => $testUser['email'],
            'password' => 'password123'
        ]
    ], JSON_PRETTY_PRINT);
    
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage(),
        'results' => $results
    ], JSON_PRETTY_PRINT);
}
?> 