<?php
// Admin Login Debug Page
// This page provides diagnostic information about the admin login process

// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Start session to check session status
session_start();

// Include database configuration if available
if (file_exists('api/db/config.php')) {
    include_once 'api/db/config.php';
}

// Function to test database connection
function testDatabaseConnection() {
    global $pdo;
    
    if (!isset($pdo)) {
        return [
            'success' => false,
            'message' => 'PDO not initialized. Check api/db/config.php'
        ];
    }
    
    try {
        // Test connection
        $pdo->query('SELECT 1');
        
        return [
            'success' => true,
            'message' => 'Database connection successful',
            'driver' => $pdo->getAttribute(PDO::ATTR_DRIVER_NAME),
            'version' => $pdo->getAttribute(PDO::ATTR_SERVER_VERSION)
        ];
    } catch (PDOException $e) {
        return [
            'success' => false,
            'message' => 'Database connection error: ' . $e->getMessage()
        ];
    }
}

// Function to check user tables
function checkUserTables() {
    global $pdo;
    
    if (!isset($pdo)) {
        return [
            'success' => false,
            'message' => 'PDO not initialized'
        ];
    }
    
    try {
        // Check users table
        $userTableExists = false;
        $userCount = 0;
        $adminCount = 0;
        
        try {
            $stmt = $pdo->query("SELECT COUNT(*) FROM users");
            $userCount = $stmt->fetchColumn();
            $userTableExists = true;
        } catch (PDOException $e) {
            return [
                'success' => false,
                'message' => 'Error accessing users table: ' . $e->getMessage()
            ];
        }
        
        // Check roles and user_roles tables
        if ($userTableExists) {
            // Check admin users by direct role column
            try {
                $stmt = $pdo->query("SELECT COUNT(*) FROM users WHERE role = 'admin'");
                $directAdminCount = $stmt->fetchColumn();
            } catch (PDOException $e) {
                $directAdminCount = 'Error: ' . $e->getMessage();
            }
            
            // Check roles table
            try {
                $stmt = $pdo->query("SELECT COUNT(*) FROM roles");
                $rolesCount = $stmt->fetchColumn();
                
                // Check admin roles
                $stmt = $pdo->query("SELECT COUNT(*) FROM roles WHERE name = 'admin'");
                $adminRoleCount = $stmt->fetchColumn();
                
                // Check user_roles join table
                $stmt = $pdo->query("
                    SELECT COUNT(*) FROM user_roles ur 
                    JOIN roles r ON ur.role_id = r.id 
                    WHERE r.name = 'admin'
                ");
                $adminCount = $stmt->fetchColumn();
                
            } catch (PDOException $e) {
                return [
                    'success' => false,
                    'message' => 'Error checking roles tables: ' . $e->getMessage(),
                    'userTableExists' => true,
                    'userCount' => $userCount
                ];
            }
            
            return [
                'success' => true,
                'message' => 'User tables accessible',
                'userCount' => $userCount,
                'directAdminCount' => $directAdminCount,
                'rolesCount' => $rolesCount,
                'adminRoleCount' => $adminRoleCount,
                'usersWithAdminRole' => $adminCount
            ];
        }
        
        return [
            'success' => true,
            'message' => 'User tables check complete',
            'userCount' => $userCount,
            'adminCount' => $adminCount
        ];
    } catch (Exception $e) {
        return [
            'success' => false,
            'message' => 'Error checking user tables: ' . $e->getMessage()
        ];
    }
}

// Run diagnostics
$dbConnectionTest = testDatabaseConnection();
$userTablesCheck = isset($pdo) ? checkUserTables() : ['success' => false, 'message' => 'PDO not available'];

// Page HTML
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Login Debug</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
        }
        h1, h2, h3 {
            color: #333;
        }
        pre {
            background-color: #f5f5f5;
            padding: 10px;
            border-radius: 5px;
            overflow-x: auto;
        }
        .success {
            color: green;
        }
        .error {
            color: red;
        }
        .card {
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 15px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            text-align: left;
            padding: 8px;
            border-bottom: 1px solid #ddd;
        }
        th {
            background-color: #f2f2f2;
        }
        .highlight {
            background-color: #ffffcc;
            font-weight: bold;
            padding: 2px 5px;
        }
    </style>
</head>
<body>
    <h1>Admin Login Debug Page</h1>
    <p>This page provides diagnostic information to help troubleshoot admin login issues.</p>
    
    <div class="card">
        <h2>Session Information</h2>
        <p>Session ID: <code><?php echo session_id(); ?></code></p>
        <p>Session Status: <?php echo session_status() === PHP_SESSION_ACTIVE ? '<span class="success">Active</span>' : '<span class="error">Not Active</span>'; ?></p>
        
        <h3>Session Data:</h3>
        <pre><?php echo !empty($_SESSION) ? print_r($_SESSION, true) : 'Session empty'; ?></pre>
        
        <h3>Session Variables Relevant to Login:</h3>
        <table>
            <tr>
                <th>Variable</th>
                <th>Value</th>
                <th>Status</th>
            </tr>
            <tr>
                <td>user_id</td>
                <td><?php echo isset($_SESSION['user_id']) ? $_SESSION['user_id'] : 'Not set'; ?></td>
                <td><?php echo isset($_SESSION['user_id']) ? '<span class="success">OK</span>' : '<span class="error">Missing</span>'; ?></td>
            </tr>
            <tr>
                <td>is_admin</td>
                <td><?php echo isset($_SESSION['is_admin']) ? ($_SESSION['is_admin'] ? 'true' : 'false') : 'Not set'; ?></td>
                <td>
                    <?php 
                        if (!isset($_SESSION['is_admin'])) {
                            echo '<span class="error">Missing</span>';
                        } elseif ($_SESSION['is_admin']) {
                            echo '<span class="success">Admin Access</span>';
                        } else {
                            echo '<span class="error">Not Admin</span>';
                        }
                    ?>
                </td>
            </tr>
            <tr>
                <td>user_roles</td>
                <td><?php echo isset($_SESSION['user_roles']) ? implode(', ', $_SESSION['user_roles']) : 'Not set'; ?></td>
                <td>
                    <?php 
                        if (!isset($_SESSION['user_roles'])) {
                            echo '<span class="error">Missing</span>';
                        } elseif (in_array('admin', $_SESSION['user_roles'])) {
                            echo '<span class="success">Admin Role Present</span>';
                        } else {
                            echo '<span class="error">Admin Role Missing</span>';
                        }
                    ?>
                </td>
            </tr>
        </table>
    </div>
    
    <div class="card">
        <h2>Database Connection</h2>
        <p>Status: 
            <?php if ($dbConnectionTest['success']): ?>
                <span class="success">Connected</span>
            <?php else: ?>
                <span class="error">Failed</span>
            <?php endif; ?>
        </p>
        <p>Message: <?php echo $dbConnectionTest['message']; ?></p>
        
        <?php if ($dbConnectionTest['success']): ?>
            <p>Driver: <?php echo $dbConnectionTest['driver']; ?></p>
            <p>Version: <?php echo $dbConnectionTest['version']; ?></p>
        <?php endif; ?>
    </div>
    
    <div class="card">
        <h2>User Tables Check</h2>
        <p>Status: 
            <?php if ($userTablesCheck['success']): ?>
                <span class="success">OK</span>
            <?php else: ?>
                <span class="error">Failed</span>
            <?php endif; ?>
        </p>
        <p>Message: <?php echo $userTablesCheck['message']; ?></p>
        
        <?php if (isset($userTablesCheck['userCount'])): ?>
            <p>Total users in database: <span class="highlight"><?php echo $userTablesCheck['userCount']; ?></span></p>
        <?php endif; ?>
        
        <?php if (isset($userTablesCheck['directAdminCount'])): ?>
            <p>Users with direct admin role: <span class="highlight"><?php echo $userTablesCheck['directAdminCount']; ?></span></p>
        <?php endif; ?>
        
        <?php if (isset($userTablesCheck['adminRoleCount'])): ?>
            <p>Admin roles defined: <span class="highlight"><?php echo $userTablesCheck['adminRoleCount']; ?></span></p>
        <?php endif; ?>
        
        <?php if (isset($userTablesCheck['usersWithAdminRole'])): ?>
            <p>Users with admin role assignment: <span class="highlight"><?php echo $userTablesCheck['usersWithAdminRole']; ?></span></p>
        <?php endif; ?>
    </div>
    
    <div class="card">
        <h2>Login Process Debug</h2>
        <p>The login process works as follows:</p>
        <ol>
            <li>User submits credentials to <code>/api/auth/login.php</code></li>
            <li>The API validates the email/password against the database</li>
            <li>If valid, it sets session variables including <code>is_admin</code> and <code>user_roles</code></li>
            <li>The React app checks these session variables and redirects accordingly</li>
        </ol>
        
        <p>Common issues:</p>
        <ul>
            <li>Missing or incorrect role assignments in the database</li>
            <li>Session not being properly maintained across requests</li>
            <li>Redirect logic in React not working correctly</li>
        </ul>
        
        <h3>Try This:</h3>
        <ol>
            <li>Check PHP error logs for any login.php errors</li>
            <li>Verify that the user has an admin role in the database</li>
            <li>Test direct API access with a tool like Postman</li>
            <li>Check browser console for any JavaScript errors</li>
        </ol>
    </div>
</body>
</html> 