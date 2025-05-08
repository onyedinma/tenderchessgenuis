import api from './api';
import { request } from './api';

// Types
export interface Quiz {
  id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  time_limit: number;
  group_name: string;
  puzzles?: Puzzle[];
  has_submission?: boolean;
}

export interface Puzzle {
  id: number;
  title: string;
  description: string;
  quiz_id: number;
  fen_position: string;
  solution: string;
  points: number;
  difficulty: string;
  category: string;
}

export interface QuizResult {
  id: number;
  quiz_id: number;
  user_id: number;
  score: number;
  time_taken: number;
  completed_at: string;
  quiz_title: string;
  total_points: number;
  puzzles: {
    id: number;
    title: string;
    user_answer: string;
    solution: string;
    is_correct: boolean;
    points_earned: number;
    max_points: number;
  }[];
}

export interface QuizSubmission {
  quizId: number;
  answers: Record<number, string>; // Map of puzzle ID to user's answer
  timeTaken: number; // in seconds
}

export interface SubmissionResponse {
  success: boolean;
  message: string;
  submission?: {
    id: number;
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    timeTaken: number;
    completedAt: string;
  };
}

// Update interface for quiz creation
export interface QuizCreateData {
  title: string;
  description: string;
  duration_minutes: number;
  scheduled_date: string;
  status: string;
  puzzles: number[]; // Array of puzzle IDs
  user_groups: number[]; // Array of group IDs
}

export interface QuizCreateResponse {
  success: boolean;
  message: string;
  quiz_id?: number;
}

// Interface for admin quiz filters
export interface AdminQuizParams {
  status?: string;
  limit?: number;
  offset?: number;
}

// Interface for admin quiz response
export interface AdminQuizzesResponse {
  success: boolean;
  quizzes: AdminQuiz[];
  total: number;
  limit: number;
  offset: number;
}

// Interface for admin quiz
export interface AdminQuiz {
  id: number;
  title: string;
  description: string;
  scheduled_date: string;
  duration_minutes: number;
  created_by: number;
  status: string;
  creator_name: string;
  puzzle_count: number;
  group_count: number;
  puzzles: Array<{
    id: number;
    title: string;
    difficulty: string;
    category: string;
  }>;
  user_groups: Array<{
    id: number;
    name: string;
  }>;
  submission_count: number;
}

// Get all quizzes the user has access to
export const getQuizzes = async (): Promise<Quiz[]> => {
  const response = await api.getQuizzes();
  return response.data.quizzes || [];
};

// Get a specific quiz by ID
export const getQuiz = async (quizId: number): Promise<Quiz> => {
  const response = await api.getQuizById(quizId.toString());
  return response.data.quiz;
};

// Get quiz results for a specific quiz
export const getQuizResults = async (quizId: number): Promise<QuizResult> => {
  const response = await api.getQuizResults(quizId.toString());
  return response.data.result;
};

// Submit quiz answers
export const submitQuiz = async (submission: QuizSubmission): Promise<SubmissionResponse> => {
  const { quizId, answers, timeTaken } = submission;
  const answersArray = Object.entries(answers).map(([puzzleId, answer]) => ({
    puzzle_id: parseInt(puzzleId),
    answer
  }));
  
  const response = await api.submitQuiz(quizId, answersArray);
  return response.data;
};

// Create a new quiz (admin only)
export const createQuiz = async (quizData: QuizCreateData): Promise<QuizCreateResponse> => {
  const response = await api.createQuiz(quizData);
  return response.data;
};

// Get quizzes for admin dashboard
export const getAdminQuizzes = async (params: AdminQuizParams = {}): Promise<AdminQuizzesResponse> => {
  const response = await request({
    method: 'GET',
    url: '/quizzes/get-admin-quizzes.php',
    params
  });
  return response.data;
};

export default {
  getQuizzes,
  getQuiz,
  getQuizResults,
  submitQuiz,
  createQuiz,
  getAdminQuizzes,
}; 