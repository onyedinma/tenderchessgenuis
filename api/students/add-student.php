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
    if (!isset($data['name']) || !isset($data['username']) || !isset($data['password'])) {
        throw new Exception("Missing required fields");
    }
    
    $name = $data['name'];
    $username = $data['username'];
    $password = password_hash($data['password'], PASSWORD_DEFAULT);
    $isActive = isset($data['isActive']) ? (bool)$data['isActive'] : true;
    $photoPath = null;
    
    // Handle photo if provided as base64
    if (isset($data['photo']) && !empty($data['photo'])) {
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
            
            // Save relative path to the database - use a consistent path relative to API root
            $photoPath = 'uploads/students/' . $filename;
        } else {
            throw new Exception("Invalid image format");
        }
    }
    
    // Check if username already exists
    $conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);
    
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }
    
    $stmt = $conn->prepare("SELECT id FROM students WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        throw new Exception("Username already exists");
    }
    
    // Determine last_active based on isActive flag
    $lastActive = $isActive ? 'NOW()' : 'NULL';
    
    // Insert the new student - using the correct field names from the database
    $sql = "INSERT INTO students (name, username, password, photo_path, last_active) 
            VALUES (?, ?, ?, ?, " . $lastActive . ")";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssss", $name, $username, $password, $photoPath);
    
    if ($stmt->execute()) {
        $newId = $conn->insert_id;
        
        // Return the newly created student - mapping last_active to isActive property for the frontend
        $lastActiveValue = $isActive ? date('Y-m-d H:i:s') : null;
        
        echo json_encode([
            'success' => true,
            'message' => 'Student added successfully',
            'student' => [
                'id' => $newId,
                'name' => $name,
                'username' => $username,
                'photo' => $photoPath,
                'isActive' => $isActive,
                'lastLogin' => $lastActiveValue
            ]
        ]);
    } else {
        throw new Exception("Error adding student: " . $stmt->error);
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