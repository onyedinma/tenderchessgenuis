# Question Bank System Setup

This system provides endpoints for managing chess question banks and their questions.

## Setup Instructions

Before using the question bank system, you need to set up the database tables:

1. Make sure your database credentials are correctly set in `api/db/config.php`
2. Run the setup script by navigating to `http://localhost/tenderchessgenius/api/db/setup_question_tables.php` in your browser or by running it via the command line

## Available Endpoints

The following API endpoints are available:

### Question Banks
- `GET /api/question-banks/get-banks.php` - Retrieves all question banks with their question counts
- `POST /api/question-banks/create-bank.php` - Creates a new question bank
- `POST /api/question-banks/delete-bank.php` - Deletes a question bank and all its questions

### Questions
- `GET /api/question-banks/get-questions.php?bank_id={id}` - Retrieves all questions for a specific bank
- `POST /api/question-banks/add-question.php` - Adds a new question to a bank
- `POST /api/question-banks/update-question.php` - Updates an existing question
- `POST /api/question-banks/remove-question.php` - Removes a question from a bank
- `POST /api/question-banks/toggle-question.php` - Toggles a question's active status

## Data Structure

### Question Banks
- `id` - Unique identifier
- `name` - Name of the question bank
- `section_type` - Section type ('1' or '2')
- `is_active` - Whether the bank is active (1) or inactive (0)

### Questions
- `id` - Unique identifier
- `bank_id` - ID of the parent question bank
- `question_text` - The question text
- `correct_answer` - The correct answer
- `position` - JSON string containing `starting_fen` and `solution_fen`
- `question_order` - Order of the question within the bank
- `is_active` - Whether the question is active (1) or inactive (0) 