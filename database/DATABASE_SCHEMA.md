# Tender Chess Genius - Database Schema

This document provides a comprehensive overview of the database schema for the Chess Quiz Show application.

## Core Tables

### `users`
Stores all users of the system, including admins and participants.

| Column          | Type          | Constraints      | Description                          |
|-----------------|---------------|------------------|--------------------------------------|
| id              | int(11)       | PK, AUTO_INCREMENT | Unique identifier                   |
| username        | varchar(50)   | NOT NULL, UNIQUE | User login name                      |
| name            | varchar(255)  | NOT NULL         | User's full name                     |
| email           | varchar(255)  | NOT NULL, UNIQUE | User's email address                 |
| password        | varchar(255)  | NOT NULL         | Hashed password                      |
| role            | enum          | NOT NULL         | 'participant' or 'admin'             |
| created_at      | datetime      | DEFAULT CURRENT_TIMESTAMP | Creation timestamp          |
| updated_at      | datetime      | AUTO_UPDATE      | Last update timestamp                |
| profile_picture | text          | NULL             | Profile picture path                 |
| last_login      | datetime      | NULL             | Last login timestamp                 |
| session_id      | varchar(255)  | NULL             | Current session ID                   |

### `roles`
Defines the available roles in the system.

| Column          | Type          | Constraints      | Description                          |
|-----------------|---------------|------------------|--------------------------------------|
| id              | int(11)       | PK, AUTO_INCREMENT | Unique identifier                   |
| name            | varchar(50)   | UNIQUE           | Role name (e.g., 'admin', 'student') |

### `user_roles`
Maps users to their roles (many-to-many).

| Column          | Type          | Constraints      | Description                          |
|-----------------|---------------|------------------|--------------------------------------|
| user_id         | int(11)       | PK, FK           | Reference to users.id                |
| role_id         | int(11)       | PK, FK           | Reference to roles.id                |

### `active_sessions`
Tracks active user sessions to prevent concurrent logins.

| Column          | Type          | Constraints      | Description                          |
|-----------------|---------------|------------------|--------------------------------------|
| id              | int(11)       | PK, AUTO_INCREMENT | Unique identifier                   |
| user_id         | int(11)       | NOT NULL, UNIQUE | Reference to users.id                |
| session_id      | varchar(255)  | NOT NULL         | Session identifier                   |
| login_time      | datetime      | DEFAULT CURRENT_TIMESTAMP | Session start time          |
| last_activity   | datetime      | DEFAULT CURRENT_TIMESTAMP | Last activity time          |

## Student Management

### `students`
Stores student information for the Chess Quiz Show.

| Column             | Type         | Constraints      | Description                         |
|--------------------|--------------|------------------|-------------------------------------|
| id                 | int(11)      | PK, AUTO_INCREMENT | Unique identifier                  |
| name               | varchar(100) | NOT NULL         | Student's full name                 |
| username           | varchar(50)  | NOT NULL, UNIQUE | Unique login username               |
| password           | varchar(255) | NOT NULL         | Hashed password                     |
| photo_path         | varchar(255) | NULL             | Path to student's photo/passport    |
| last_active        | timestamp    | AUTO_UPDATE      | Last activity timestamp             |
| section1_completed | tinyint(1)   | NULL             | Flag for Section 1 completion       |
| section2_completed | tinyint(1)   | NULL             | Flag for Section 2 completion       |
| section1_score     | int(11)      | NULL             | Total score for Section 1           |
| section2_score     | int(11)      | NULL             | Total score for Section 2           |
| created_at         | timestamp    | DEFAULT CURRENT_TIMESTAMP | Creation timestamp         |

## Question Management

### `question_banks`
Stores collections of questions organized by section type.

| Column          | Type          | Constraints      | Description                          |
|-----------------|---------------|------------------|--------------------------------------|
| id              | int(11)       | PK, AUTO_INCREMENT | Unique identifier                   |
| name            | varchar(255)  | NOT NULL         | Bank name                            |
| section_type    | enum          | NOT NULL         | '1' or '2' (section identifier)      |
| created_at      | datetime      | DEFAULT CURRENT_TIMESTAMP | Creation timestamp          |
| updated_at      | datetime      | AUTO_UPDATE      | Last update timestamp                |

### `questions`
Stores individual questions within question banks.

| Column          | Type          | Constraints      | Description                          |
|-----------------|---------------|------------------|--------------------------------------|
| id              | int(11)       | PK, AUTO_INCREMENT | Unique identifier                   |
| bank_id         | int(11)       | NOT NULL, FK     | Reference to question_banks.id       |
| question_text   | text          | NOT NULL         | The question prompt                  |
| correct_answer  | text          | NOT NULL         | The correct answer                   |
| position        | varchar(255)  | NOT NULL         | Chess position (likely FEN notation) |
| question_order  | int(11)       | DEFAULT 0        | Order of questions within a bank     |
| created_at      | timestamp     | DEFAULT CURRENT_TIMESTAMP | Creation timestamp          |

### `puzzles`
Stores chess puzzles that can be used in questions.

| Column          | Type          | Constraints      | Description                          |
|-----------------|---------------|------------------|--------------------------------------|
| id              | int(11)       | PK, AUTO_INCREMENT | Unique identifier                   |
| bank_id         | int(11)       | FK, NULL         | Reference to question_banks.id       |
| fen             | text          | NULL             | FEN notation of chess position       |
| solutionFen     | text          | NULL             | FEN notation of solution position    |
| pgn             | text          | NULL             | PGN notation of the puzzle           |
| section_type    | enum          | NULL             | '1', '2', or 'both'                 |
| correct_move    | varchar(10)   | NULL             | The correct move in algebraic notation |
| difficulty      | enum          | NULL             | 'easy', 'medium', or 'hard'         |
| tags            | text          | NULL             | Tags for categorizing puzzles        |

## Quiz Management

### `quizzes`
Defines quiz sessions.

| Column          | Type          | Constraints      | Description                          |
|-----------------|---------------|------------------|--------------------------------------|
| id              | int(11)       | PK, AUTO_INCREMENT | Unique identifier                   |
| title           | varchar(255)  | NULL             | Quiz title                           |
| type            | enum          | NULL             | '1' or '2' (section type)            |
| scheduled_date  | datetime      | NULL             | When the quiz is scheduled           |
| timer_duration  | int(11)       | NULL             | Timer duration in seconds            |
| created_by      | int(11)       | FK, NULL         | Reference to users.id (admin)        |

### `quiz_puzzle`
Maps puzzles to quizzes (many-to-many).

| Column          | Type          | Constraints      | Description                          |
|-----------------|---------------|------------------|--------------------------------------|
| id              | int(11)       | PK, AUTO_INCREMENT | Unique identifier                   |
| quiz_id         | int(11)       | FK, NULL         | Reference to quizzes.id              |
| puzzle_id       | int(11)       | FK, NULL         | Reference to puzzles.id              |
| timer_duration  | int(11)       | NULL             | Individual timer for this puzzle     |
| puzzle_order    | int(11)       | NULL             | Order in the quiz sequence           |
| instructions    | text          | NULL             | Special instructions for this puzzle |

## Performance and Scoring

### `submissions`
Records student submissions for puzzles.

| Column          | Type          | Constraints      | Description                          |
|-----------------|---------------|------------------|--------------------------------------|
| id              | int(11)       | PK, AUTO_INCREMENT | Unique identifier                   |
| user_id         | int(11)       | FK, NULL         | Reference to users.id                |
| puzzle_id       | int(11)       | FK, NULL         | Reference to puzzles.id              |
| quiz_id         | int(11)       | FK, NULL         | Reference to quizzes.id              |
| submitted_move  | varchar(10)   | NULL             | The move submitted by the student    |
| time_taken      | int(11)       | NULL             | Time taken in seconds                |
| correct         | tinyint(1)    | NULL             | Whether submission was correct       |
| created_at      | timestamp     | DEFAULT CURRENT_TIMESTAMP | Submission timestamp         |

### `user_submissions`
More detailed tracking of user submissions.

| Column          | Type          | Constraints      | Description                          |
|-----------------|---------------|------------------|--------------------------------------|
| id              | int(11)       | PK, AUTO_INCREMENT | Unique identifier                   |
| user_id         | int(11)       | NOT NULL, FK     | Reference to users.id                |
| quiz_id         | int(11)       | NOT NULL, FK     | Reference to quizzes.id              |
| puzzle_id       | int(11)       | NOT NULL, FK     | Reference to puzzles.id              |
| answer          | varchar(10)   | NULL             | Student's answer                     |
| is_correct      | tinyint(1)    | NULL             | Whether answer was correct           |
| points_earned   | int(11)       | NULL             | Points earned for this submission    |
| time_taken      | int(11)       | NULL             | Time taken in seconds                |
| submitted_at    | datetime      | DEFAULT CURRENT_TIMESTAMP | Submission timestamp         |

### `user_categories`
Tracks the category assignments for students based on their scores.

| Column          | Type          | Constraints      | Description                          |
|-----------------|---------------|------------------|--------------------------------------|
| id              | int(11)       | PK, AUTO_INCREMENT | Unique identifier                   |
| user_id         | int(11)       | NOT NULL, FK     | Reference to users.id                |
| quiz_id         | int(11)       | NOT NULL, FK     | Reference to quizzes.id              |
| total_points    | int(11)       | NOT NULL         | Total points earned                  |
| category        | enum          | NOT NULL         | 'golden', 'silver', or 'bronze'      |
| created_at      | datetime      | DEFAULT CURRENT_TIMESTAMP | Creation timestamp          |

### `performance`
General performance metrics for users.

| Column          | Type          | Constraints      | Description                          |
|-----------------|---------------|------------------|--------------------------------------|
| id              | int(11)       | PK, AUTO_INCREMENT | Unique identifier                   |
| user_id         | int(11)       | FK, NULL         | Reference to users.id                |
| quiz_id         | int(11)       | FK, NULL         | Reference to quizzes.id              |
| score           | int(11)       | NULL             | Score achieved                       |
| accuracy        | float         | NULL             | Accuracy percentage                  |
| section_type    | enum          | NULL             | '1' or '2'                          |

## System Configuration

### `settings`
System-wide settings for the Chess Quiz Show.

| Column          | Type          | Constraints      | Description                          |
|-----------------|---------------|------------------|--------------------------------------|
| id              | int(11)       | PK, DEFAULT 1    | Unique identifier                    |
| section2_enabled| tinyint(1)    | NULL             | Whether Section 2 is enabled         |
| section1_timer  | int(11)       | DEFAULT 30       | Default timer for Section 1          |
| section2_timer  | int(11)       | DEFAULT 45       | Default timer for Section 2          |
| updated_at      | timestamp     | AUTO_UPDATE      | Last update timestamp                |

## Section 1 Management

For Section 1 Management, the following tables are particularly relevant:

1. `question_banks` - Stores the 20 different banks for Section 1 (filtered by section_type = '1')
2. `questions` - Stores the individual questions (minimum 20 per bank)
3. `puzzles` - Stores the chess positions related to questions
4. `submissions` and `user_submissions` - Track student responses
5. `user_categories` - Manages the categorization of students (Golden, Silver, Bronze)
6. `settings` - Controls Section 1 timer duration

### Section 1 Requirements:
- Each bank must have a minimum of 20 questions
- Questions display one at a time
- Admin selects specific questions to display
- Chessboard preview when selecting questions
- Submit button (no "next question" option)
- Scoring: 10 marks per question
- Display results in descending order
- Track submission timestamps

### Areas for Potential Improvement:

1. The `puzzles` and `questions` tables seem to have some overlap in functionality. We might want to clarify the exact relationship between these tables.

2. We may need to add a field to mark which question bank is currently active for Section 1.

3. ✅ Consider adding a field to track the order of questions within a bank for Section 1. This has been implemented as the `question_order` field in the `questions` table. 