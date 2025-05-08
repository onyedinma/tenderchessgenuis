# Tender Chess Genius - Chess Quiz Platform

A web application for chess puzzles and quizzes, allowing users to test their chess skills, track their progress, and improve their game.

## Features

- **User Authentication**: Sign up, log in, and manage user profiles
- **Chess Quizzes**: Take timed quizzes with various puzzle types
- **Quiz Results**: View detailed performance metrics and solutions
- **User Dashboard**: Track progress and see performance statistics
- **Group Management**: Organize users into groups with specific quiz access
- **Responsive Design**: Works on desktop and mobile devices
- **Chess Position Editor**: Create and manage chess position questions

## Tech Stack

### Frontend
- React 18
- TypeScript
- Chakra UI for styling
- React Router for navigation
- Axios for API calls

### Backend
- PHP 8.0+ for API endpoints
- MySQL database
- PDO for database connections
- Session-based authentication

## Installation

### Prerequisites
- XAMPP, WAMP, LAMP, or MAMP server
- Node.js and npm
- Git

### Setup Instructions

1. **Clone the repository**
   ```
   git clone https://github.com/yourusername/tenderchessgenius.git
   cd tenderchessgenius
   ```

2. **Database Setup**
   - Create a MySQL database named `chess_genius`
   - Import the database schema from `database/schema.sql`
   - Update the database connection settings in `api/db/config.php` if needed

3. **Backend Setup**
   - Place the project in your web server's root directory (e.g., `htdocs` for XAMPP)
   - Ensure the PHP version is 8.0 or higher
   - Install PHP dependencies if any (using Composer if available)

4. **Frontend Setup**
   ```
   cd react-frontend
   npm install
   npm run dev
   ```

5. **Application Configuration**
   - Update the API URL in `react-frontend/src/services/api.ts` if needed
   - Configure CORS settings in PHP files if needed for development

## Project Structure

```
tenderchessgenius/
├── api/                  # PHP backend
│   ├── auth/             # Authentication endpoints
│   ├── db/               # Database configuration
│   ├── quizzes/          # Quiz-related endpoints
│   └── users/            # User management endpoints
├── database/             # Database schema and migrations
├── react-frontend/       # React frontend
│   ├── public/           # Static assets
│   └── src/              # Source code
│       ├── components/   # Reusable UI components
│       ├── contexts/     # React contexts (Auth, etc.)
│       ├── pages/        # Page components
│       └── services/     # API services
└── README.md             # This file
```

## Usage

1. Start your web server (Apache) and MySQL
2. Launch the React development server with `npm run dev` in the `react-frontend` directory
3. Access the application at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register.php` - Register a new user
- `POST /api/auth/login.php` - Log in a user
- `POST /api/auth/logout.php` - Log out a user
- `GET /api/auth/check-session.php` - Check if a user is logged in

### Quizzes
- `GET /api/quizzes/get-quizzes.php` - Get all quizzes
- `GET /api/quizzes/get-quiz.php?id={id}` - Get a specific quiz
- `POST /api/quizzes/submit-answers.php` - Submit quiz answers
- `GET /api/quizzes/get-results.php?id={id}` - Get quiz results

### Users
- `GET /api/users/profile.php` - Get user profile
- `POST /api/users/update-profile.php` - Update user profile

## Administrative Features

### Quiz Management

The application includes robust quiz management features for administrators:

- **Quiz Creator:** Create, schedule, and manage quizzes with a user-friendly interface
- **Puzzle Selection:** Easily select puzzles by difficulty, category, or search terms
- **User Group Assignment:** Assign quizzes to specific user groups
- **Quiz Status Tracking:** Monitor quiz status (Draft, Scheduled, Completed)
- **Submission Tracking:** Track user participation and completion

### Puzzle Management

Administrators can manage puzzles and integrate them into quizzes:

- **Puzzle Browser:** Browse, search, and filter puzzles by difficulty, category, and keywords
- **Puzzle Selection:** Add puzzles to quizzes with a convenient interface
- **Puzzle Organization:** View and manage puzzles in an organized manner

### API Endpoints

The application provides several administrative API endpoints:

- `/api/puzzles/get-puzzles.php`: Fetch puzzles with filtering and pagination
- `/api/quizzes/create-quiz.php`: Create new quizzes with assigned puzzles and user groups
- `/api/quizzes/get-admin-quizzes.php`: Get list of quizzes with detailed information

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Your Name - your.email@example.com

Project Link: [https://github.com/yourusername/tenderchessgenius](https://github.com/yourusername/tenderchessgenius)

# The Genius Chess TV Quiz Show Application

## Admin Features

### Student Management
#### Add Students
- Fields required:
  - Name (Full name of participant)
  - Username (Unique login identifier)
  - Password
  - Photo/Passport upload
- Username Requirements:
  - Must be unique
  - Used only for login purposes
  - Real name displays after login
- Login Restrictions:
  - Concurrent logins prevented
  - "Already logged in" popup for multiple device attempts
- Photo Display:
  - Appears alongside answers on screen
  - Shows on participant's tablet beside their name

#### Delete Students
- Scroll through list of participants
- Select and delete individual entries

### Question Management
#### Section 1 Question Banks
- 20 different question banks
- Minimum 20 questions per bank
- Admin can name/rename banks
- Features:
  - One question displayed at a time
  - Admin selects specific questions to display
  - Chessboard preview when selecting questions
  - Submit button (no "next question" option)

#### Section 2 Question Banks
- 20 different question banks
- Minimum 10 questions per bank
- Admin can name/rename banks
- Features:
  - All questions displayed sequentially
  - "Next question" button until final question
  - Submit button appears after last question

#### Remove Questions
- Delete entire question banks
- Delete individual questions within banks
- Chessboard preview available
- Scrollable question list

### Scoring System
#### Check Marks (Section 1 & 2)
- 10 marks per question
- Display in descending order
- Shows submission timestamp (minutes:seconds:milliseconds)

#### Category System (Section 1 only)
After 10 questions:
- Golden Category: 80-100 points
- Silver Category: 60-70 points
- Bronze Category: 0-50 points
- Separate display from check marks page

### Admin Controls
- Enable/Disable Section 2 access
- Change admin password
- Set timer duration for each section
- Delete student records (Section 1 & 2)
- Delete marks (Section 1 & 2)
- Control question visibility
- Send questions to participants simultaneously

## Participant Interface

### Login System
- Login using username and password
- Only real name displayed after login
- Single device login enforcement

### Default View
- Only "The Genius Chess TV Quiz Show" logo visible
- No access to questions until admin sends them

### Section 1 Features
- One question at a time
- Single submission per question
- Individual answer display for suspense
- Admin controls answer visibility

### Section 2 Features
- Sequential question display
- Next question appears after submission
- Submit button on final question
- Admin can view participant actions

### Session Management
- Participants remain logged in after answering
- Manual logout required
- No direct question access
- Questions appear when sent by admin

## Technical Notes
- Prevents multiple submissions per question
- Real-time admin monitoring
- Secure login system
- Centralized admin control

## Chess Position Editor

The system includes a visual chess board editor that makes it easy to create chess position questions. The editor:

1. Allows drag-and-drop placement of chess pieces
2. Supports direct FEN notation input
3. Provides a visual preview of both the initial position and solution position
4. Includes validation to ensure proper chess positions

### Using the Chess Position Editor

To create chess questions:

1. Navigate to the Question Bank Manager
2. Select a question bank or create a new one
3. Click "Add Question" to open the editor
4. Fill in the question text and correct answer
5. Use the chess board editor to set up the initial position
6. Set up the solution position
7. Preview and save your question

### Integration Requirements

For the chess board display to work properly, your application needs:

- Chessboard.js library loaded in your HTML
- jQuery for Chessboard.js dependency
- Chess piece images in the appropriate directory

The system includes a fallback display method that will still show chess positions even if Chessboard.js isn't loaded correctly.

## Setup and Configuration

[Installation instructions here] 