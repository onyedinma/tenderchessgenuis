<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../db/config.php';

try {
    // Get request data
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Validate required fields
    if (!isset($data['id']) || !isset($data['name']) || !isset($data['username'])) {
        throw new Exception("Missing required fields");
    }
    
    $studentId = intval($data['id']);
    $name = $data['name'];
    $username = $data['username'];
    $isActive = isset($data['isActive']) ? (bool)$data['isActive'] : true;
    
    // Create database connection
    $conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);
    
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }
    
    // Check if student exists
    $checkSql = "SELECT id, photo_path FROM students WHERE id = ?";
    $checkStmt = $conn->prepare($checkSql);
    $checkStmt->bind_param("i", $studentId);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();
    
    if ($checkResult->num_rows === 0) {
        throw new Exception("Student not found");
    }
    
    $studentRow = $checkResult->fetch_assoc();
    $currentPhotoPath = $studentRow['photo_path'];
    
    // Check if username already exists (but exclude the current student)
    $usernameSql = "SELECT id FROM students WHERE username = ? AND id != ?";
    $usernameStmt = $conn->prepare($usernameSql);
    $usernameStmt->bind_param("si", $username, $studentId);
    $usernameStmt->execute();
    $usernameResult = $usernameStmt->get_result();
    
    if ($usernameResult->num_rows > 0) {
        throw new Exception("Username already taken by another student");
    }
    
    // Handle photo update if provided
    $photoPath = $currentPhotoPath;
    if (isset($data['photo']) && !empty($data['photo'])) {
        // Only process if it's a new base64 image (not an existing path)
        if (strpos($data['photo'], 'data:image/') === 0) {
            $photoData = $data['photo'];
            if (preg_match('/^data:image\/(\w+);base64,/', $photoData, $matches)) {
                $imageType = $matches[1];
                $photoData = substr($photoData, strpos($photoData, ',') + 1);
                $photoData = base64_decode($photoData);
                
                if ($photoData === false) {
                    throw new Exception("Failed to decode image data");
                }
                
                // Ensure the upload directory exists and is writable
                $uploadDir = '../../uploads/students/';
                if (!file_exists($uploadDir)) {
                    if (!mkdir($uploadDir, 0777, true)) {
                        throw new Exception("Failed to create upload directory");
                    }
                }
                
                if (!is_writable($uploadDir)) {
                    chmod($uploadDir, 0777);
                    if (!is_writable($uploadDir)) {
                        throw new Exception("Upload directory is not writable");
                    }
                }
                
                $filename = uniqid() . '.' . $imageType;
                $fullPath = $uploadDir . $filename;
                
                // Write the file with error handling
                if (file_put_contents($fullPath, $photoData) === false) {
                    throw new Exception("Failed to save image. Check directory permissions.");
                }
                
                // Delete the old photo if it exists
                if ($currentPhotoPath && file_exists('../../' . $currentPhotoPath)) {
                    @unlink('../../' . $currentPhotoPath);
                }
                
                // Save relative path to the database - use a consistent path relative to API root
                $photoPath = 'uploads/students/' . $filename;
            } else {
                throw new Exception("Invalid image format");
            }
        }
    }
    
    // Handle password update if provided
    $passwordSql = '';
    $sqlParams = [];
    $types = '';
    
    if (isset($data['password']) && !empty($data['password'])) {
        $password = password_hash($data['password'], PASSWORD_DEFAULT);
        $passwordSql = ', password = ?';
        $sqlParams[] = $password;
        $types .= 's';
    }
    
    // Determine last_active based on isActive flag
    $lastActiveSql = '';
    if (isset($data['isActive'])) {
        if ($isActive) {
            $lastActiveSql = ', last_active = NOW()';
        } else {
            $lastActiveSql = ', last_active = NULL';
        }
    }
    
    // Update student
    $sql = "UPDATE students SET name = ?, username = ?, photo_path = ?" . $passwordSql . $lastActiveSql . " WHERE id = ?";
    $sqlParams = array_merge([$name, $username, $photoPath], $sqlParams, [$studentId]);
    $types = 'sss' . $types . 'i';
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$sqlParams);
    
    if ($stmt->execute()) {
        // Get the current last_active value for return
        $lastActiveQuery = "SELECT last_active FROM students WHERE id = ?";
        $lastActiveStmt = $conn->prepare($lastActiveQuery);
        $lastActiveStmt->bind_param("i", $studentId);
        $lastActiveStmt->execute();
        $lastActiveResult = $lastActiveStmt->get_result();
        $lastActiveRow = $lastActiveResult->fetch_assoc();
        $lastActive = $lastActiveRow['last_active'];
        
        echo json_encode([
            'success' => true,
            'message' => 'Student updated successfully',
            'student' => [
                'id' => $studentId,
                'name' => $name,
                'username' => $username,
                'photo' => $photoPath,
                'isActive' => $isActive,
                'lastLogin' => $lastActive
            ]
        ]);
        
        $lastActiveStmt->close();
    } else {
        throw new Exception("Error updating student: " . $stmt->error);
    }
    
    $stmt->close();
    $conn->close();
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?> 