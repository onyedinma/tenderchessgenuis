<?php
session_start();

// Check if user is logged in and is admin
if (!isset($_SESSION['user_id']) || !isset($_SESSION['is_admin']) || !$_SESSION['is_admin']) {
    header("Location: ../../../../index.php");
    exit();
}

// Include database connection
$conn = require_once '../../../../config/database.php';

// Handle delete action
if (isset($_GET['action']) && $_GET['action'] == 'delete' && isset($_GET['id'])) {
    $puzzle_id = $_GET['id'];
    $sql = "DELETE FROM puzzles WHERE id = ?";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "i", $puzzle_id);
    mysqli_stmt_execute($stmt);
    
    header("Location: manage.php?deleted=1");
    exit();
}

// Get puzzles with pagination
$puzzles_per_page = 10;
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$offset = ($page - 1) * $puzzles_per_page;

// Search functionality
$search = isset($_GET['search']) ? $_GET['search'] : '';
$search_condition = '';
$params = [];
$types = '';

if (!empty($search)) {
    $search_condition = "WHERE fen LIKE ? OR pgn LIKE ? OR correct_move LIKE ? OR tags LIKE ?";
    $search_param = "%$search%";
    $params = [$search_param, $search_param, $search_param, $search_param];
    $types = "ssss";
}

// Filter functionality
$filter = isset($_GET['filter']) ? $_GET['filter'] : '';
if (!empty($filter)) {
    if (!empty($search_condition)) {
        $search_condition .= " AND ";
    } else {
        $search_condition = "WHERE ";
    }
    
    $search_condition .= "section_type = ?";
    $params[] = $filter;
    $types .= "s";
}

// Count total puzzles for pagination
$count_sql = "SELECT COUNT(*) as total FROM puzzles $search_condition";
$stmt = mysqli_prepare($conn, $count_sql);

if (!empty($params)) {
    mysqli_stmt_bind_param($stmt, $types, ...$params);
}

mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$row = mysqli_fetch_assoc($result);
$total_puzzles = $row['total'];
$total_pages = ceil($total_puzzles / $puzzles_per_page);

// Get puzzles
$sql = "SELECT * FROM puzzles $search_condition ORDER BY id DESC LIMIT ?, ?";
$stmt = mysqli_prepare($conn, $sql);

if (!empty($params)) {
    $params[] = $offset;
    $params[] = $puzzles_per_page;
    $types .= "ii";
    mysqli_stmt_bind_param($stmt, $types, ...$params);
} else {
    mysqli_stmt_bind_param($stmt, "ii", $offset, $puzzles_per_page);
}

mysqli_stmt_execute($stmt);
$puzzles = mysqli_stmt_get_result($stmt);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manage Puzzles - Chess Quiz Application</title>
    <link rel="stylesheet" href="../../../../public/css/style.css">
    <link rel="stylesheet" href="../../../../chessboardjs-1.0.0/css/chessboard-1.0.0.min.css">
    <style>
        .puzzle-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 1rem;
        }
        
        .puzzle-table th, .puzzle-table td {
            padding: 0.5rem;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        
        .puzzle-table th {
            background-color: #f2f2f2;
        }
        
        .puzzle-preview {
            width: 150px;
            height: 150px;
        }
        
        .pagination {
            display: flex;
            justify-content: center;
            margin-top: 2rem;
        }
        
        .pagination a, .pagination span {
            padding: 0.5rem 1rem;
            margin: 0 0.25rem;
            border: 1px solid #ddd;
            text-decoration: none;
        }
        
        .pagination a:hover {
            background-color: #f2f2f2;
        }
        
        .pagination .active {
            background-color: #2980b9;
            color: white;
            border-color: #2980b9;
        }
        
        .search-filter {
            display: flex;
            margin-bottom: 1rem;
        }
        
        .search-filter input, .search-filter select {
            padding: 0.5rem;
            margin-right: 0.5rem;
        }
        
        .success-message {
            background-color: #d4edda;
            color: #155724;
            padding: 1rem;
            margin-bottom: 1rem;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <header>
        <h1>Chess Quiz Application</h1>
        <nav>
            <ul>
                <li><a href="../../../../index.php">Home</a></li>
                <li><a href="../../quizzes.php">Quizzes</a></li>
                <li><a href="../../profile.php">Profile</a></li>
                <li><a href="../dashboard.php">Admin Dashboard</a></li>
                <li><a href="../../../../api/auth/logout.php">Logout</a></li>
            </ul>
        </nav>
    </header>

    <main>
        <div class="manage-container" style="max-width: 1200px; margin: 0 auto; padding: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <h2>Manage Puzzles</h2>
                <a href="add.php" class="btn primary">Add New Puzzle</a>
            </div>
            
            <?php if (isset($_GET['deleted']) && $_GET['deleted'] == 1): ?>
                <div class="success-message">
                    Puzzle deleted successfully.
                </div>
            <?php endif; ?>
            
            <div class="search-filter">
                <form action="" method="GET" style="display: flex; width: 100%;">
                    <input type="text" name="search" placeholder="Search puzzles..." value="<?php echo htmlspecialchars($search); ?>" style="flex: 1;">
                    <select name="filter" style="width: 200px;">
                        <option value="">All Sections</option>
                        <option value="1" <?php echo $filter == '1' ? 'selected' : ''; ?>>Section 1</option>
                        <option value="2" <?php echo $filter == '2' ? 'selected' : ''; ?>>Section 2</option>
                        <option value="both" <?php echo $filter == 'both' ? 'selected' : ''; ?>>Both Sections</option>
                    </select>
                    <button type="submit" class="btn primary" style="margin-left: 0.5rem;">Search</button>
                    <?php if (!empty($search) || !empty($filter)): ?>
                        <a href="manage.php" class="btn secondary" style="margin-left: 0.5rem;">Clear</a>
                    <?php endif; ?>
                </form>
            </div>
            
            <div class="puzzles-list">
                <table class="puzzle-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Preview</th>
                            <th>FEN</th>
                            <th>Solution</th>
                            <th>Difficulty</th>
                            <th>Section</th>
                            <th>Tags</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if (mysqli_num_rows($puzzles) > 0): ?>
                            <?php while ($puzzle = mysqli_fetch_assoc($puzzles)): ?>
                                <tr>
                                    <td><?php echo $puzzle['id']; ?></td>
                                    <td>
                                        <div id="board-<?php echo $puzzle['id']; ?>" class="puzzle-preview"></div>
                                        <script>
                                            document.addEventListener('DOMContentLoaded', function() {
                                                const board<?php echo $puzzle['id']; ?> = Chessboard('board-<?php echo $puzzle['id']; ?>', {
                                                    position: '<?php echo $puzzle['fen']; ?>',
                                                    showNotation: false
                                                });
                                            });
                                        </script>
                                    </td>
                                    <td><?php echo substr($puzzle['fen'], 0, 30) . '...'; ?></td>
                                    <td><?php echo $puzzle['correct_move']; ?></td>
                                    <td><?php echo ucfirst($puzzle['difficulty']); ?></td>
                                    <td><?php echo $puzzle['section_type']; ?></td>
                                    <td><?php echo $puzzle['tags']; ?></td>
                                    <td>
                                        <a href="edit.php?id=<?php echo $puzzle['id']; ?>" class="btn secondary" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;">Edit</a>
                                        <a href="manage.php?action=delete&id=<?php echo $puzzle['id']; ?>" 
                                           class="btn secondary" style="padding: 0.3rem 0.6rem; font-size: 0.8rem; background-color: #e74c3c; color: white;"
                                           onclick="return confirm('Are you sure you want to delete this puzzle?');">Delete</a>
                                    </td>
                                </tr>
                            <?php endwhile; ?>
                        <?php else: ?>
                            <tr>
                                <td colspan="8" style="text-align: center; padding: 2rem;">No puzzles found.</td>
                            </tr>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
            
            <?php if ($total_pages > 1): ?>
                <div class="pagination">
                    <?php if ($page > 1): ?>
                        <a href="?page=<?php echo $page - 1; ?>&search=<?php echo urlencode($search); ?>&filter=<?php echo urlencode($filter); ?>">Previous</a>
                    <?php endif; ?>
                    
                    <?php for ($i = 1; $i <= $total_pages; $i++): ?>
                        <?php if ($i == $page): ?>
                            <span class="active"><?php echo $i; ?></span>
                        <?php else: ?>
                            <a href="?page=<?php echo $i; ?>&search=<?php echo urlencode($search); ?>&filter=<?php echo urlencode($filter); ?>"><?php echo $i; ?></a>
                        <?php endif; ?>
                    <?php endfor; ?>
                    
                    <?php if ($page < $total_pages): ?>
                        <a href="?page=<?php echo $page + 1; ?>&search=<?php echo urlencode($search); ?>&filter=<?php echo urlencode($filter); ?>">Next</a>
                    <?php endif; ?>
                </div>
            <?php endif; ?>
        </div>
    </main>

    <footer>
        <p>&copy; <?php echo date("Y"); ?> Chess Quiz Application</p>
    </footer>

    <script src="../../../../chessboardjs-1.0.0/js/chessboard-1.0.0.min.js"></script>
    <script src="../../../../public/js/main.js"></script>
</body>
</html> 