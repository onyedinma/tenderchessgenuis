📌 Project Prompt: Chess Quiz Application
💻 Tech Stack
•	Frontend: React.js (with chessboard.js integration)
•	Backend: PHP 
•	Database: MySQL 
•	Chess Engine/Logic: chess.js and chessboard.js
________________________________________
🧠 Application Overview
Develop a web-based Chess Quiz Application that allows:
•	Users (students/participants) to register, log in, and solve chess puzzles in two distinct sections.
•	Admins to manage quizzes, view responses, track performance, and maintain puzzle banks.
________________________________________
🧉 Core Features
🔹 User Features
1.	Authentication & Profiles
o	Register/Login/Logout
o	View profile, puzzle history, scores, and progress
2.	Section 1: Multiple Puzzle Challenge
o	Answer a set of multiple puzzles
o	Each puzzle is rendered using chessboard.js
o	After submission, users can review:
	The puzzle
	Their move(s)
	The correct solution
3.	Section 2: Single Puzzle Competitive Mode
o	Solve only one puzzle
o	Timed submission (optional)
o	Post-submission screen displays:
	The puzzle
	All user responses
	The correct answer
4.	Performance Dashboard
o	Track past attempts
o	See performance by date, puzzle type, and section
5.	Timer Visibility
o	See countdown timers for each quiz or puzzle as applicable
o	Auto-submit on timeout
________________________________________
🔹 Admin Features
1.	Puzzle Bank Management
o	Create, edit, delete, and organize puzzles
o	Label puzzles as for Section 1, Section 2, or Both
o	Import/export puzzles (JSON or CSV format)
o	Add difficulty level, tags (e.g., tactics, openings, endgames)
2.	Quiz Creation & Scheduling
o	Select puzzles from bank to assign to a quiz
o	Define quiz type: Section 1 or Section 2
o	Set quiz start/end time, participant group, time limits
o	Set timer:
	Section 1: Total quiz duration
	Section 2: Single puzzle duration
	Option to set per-puzzle timer (for Section 1)
3.	Response Viewer
o	For Section 1:
	View all individual puzzle attempts per user
	See comparison between user move and correct solution
o	For Section 2:
	View all participants’ responses to the same puzzle at once
	See how each participant answered
4.	Performance Analytics
o	Track performance by puzzle, user, date, section
o	Export reports
o	Visual charts showing accuracy, participation rate, etc.
o	Analyze time taken per puzzle and per quiz
________________________________________
⚙️ Chess Functionality
•	Use chess.js to validate legal moves and compare responses
•	Use chessboard.js to render puzzles and user move interactions
o	Load puzzles via FEN or PGN
o	Highlight legal moves, user-selected move, and correct move
________________________________________
✨ Bonus Features
For Users:
•	Hint System (limited per quiz)
•	Leaderboard for Section 2 (Competitive)
•	Comments/Notes per puzzle
•	Bookmarks for revisiting puzzles
For Admin:
•	Group/Batch Assignment
•	AI Evaluation of off-track answers
•	Feedback Collection per puzzle
________________________________________
📂 Database Suggestions
Users Table
•	id, name, email, password, profile, stats, created_at
Puzzles Table
•	id, FEN, PGN, section_type (1, 2, both), correct_move, difficulty, tags
Quizzes Table
•	id, title, type, scheduled_date, timer_duration, created_by
Quiz_Puzzle Table
•	quiz_id, puzzle_id
Submissions Table
•	id, user_id, puzzle_id, quiz_id, user_move(s), time_taken, correct
Performance Table
•	user_id, quiz_id, score, accuracy, section_type
________________________________________
✅ Expected Deliverables
•	Fully functional Chess Quiz App with two puzzle sections
•	User registration and tracking
•	Admin dashboard with puzzle management and analytics
•	Timer configuration and tracking
•	Responsive and interactive UI with chessboard integration
DATABASE SCHEMA

-- Users
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  profile_picture TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Roles
CREATE TABLE roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) UNIQUE
);

CREATE TABLE user_roles (
  user_id INT,
  role_id INT,
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- Groups / Batches
CREATE TABLE groups (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100),
  description TEXT
);

CREATE TABLE group_user (
  group_id INT,
  user_id INT,
  PRIMARY KEY (group_id, user_id),
  FOREIGN KEY (group_id) REFERENCES groups(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Puzzles
CREATE TABLE puzzles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  fen TEXT,
  pgn TEXT,
  section_type ENUM('1','2','both'),
  correct_move VARCHAR(10),
  difficulty ENUM('easy','medium','hard'),
  tags TEXT
);

-- Quizzes
CREATE TABLE quizzes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255),
  type ENUM('1','2'),
  scheduled_date DATETIME,
  timer_duration INT, -- in seconds
  created_by INT,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE quiz_group (
  quiz_id INT,
  group_id INT,
  PRIMARY KEY (quiz_id, group_id),
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id),
  FOREIGN KEY (group_id) REFERENCES groups(id)
);

-- Quiz-Puzzle Relation
CREATE TABLE quiz_puzzle (
  id INT PRIMARY KEY AUTO_INCREMENT,
  quiz_id INT,
  puzzle_id INT,
  timer_duration INT, -- Optional per puzzle
  puzzle_order INT,
  instructions TEXT,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id),
  FOREIGN KEY (puzzle_id) REFERENCES puzzles(id)
);

-- Submissions
CREATE TABLE submissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  puzzle_id INT,
  quiz_id INT,
  submitted_move VARCHAR(10),
  time_taken INT, -- in seconds
  correct BOOLEAN,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (puzzle_id) REFERENCES puzzles(id),
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
);

-- Move-by-move Tracking
CREATE TABLE user_moves (
  id INT PRIMARY KEY AUTO_INCREMENT,
  submission_id INT,
  move_number INT,
  move_notation VARCHAR(10),
  timestamp TIMESTAMP,
  FOREIGN KEY (submission_id) REFERENCES submissions(id)
);

-- Performance Summary
CREATE TABLE performance (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  quiz_id INT,
  score INT,
  accuracy FLOAT,
  section_type ENUM('1','2'),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
);

-- Feedback & Comments
CREATE TABLE feedback (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  puzzle_id INT,
  quiz_id INT,
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (puzzle_id) REFERENCES puzzles(id),
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
);
