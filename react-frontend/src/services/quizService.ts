import { api } from './api';
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
  submissionId: number;
  totalPoints: number;
  accuracy: number;
  correctAnswers: number;
  totalQuestions: number;
}

interface QuizAnswer {
  questionId: number;
  answer: string;
  timeTaken: number;
}

interface QuizSubmission {
  quizId: number;
  answers: QuizAnswer[];
}

interface SubmissionResponse {
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

// Validate FEN notation
const validateFen = (fen: string): boolean => {
  // Basic FEN validation regex
  const fenRegex = /^([rnbqkpRNBQKP1-8]+\/){7}[rnbqkpRNBQKP1-8]+ [wb] [KQkq-]{1,4} [a-h][1-8] [0-9]+ [0-9]+$/;
  return fenRegex.test(fen);
};

// Get all quizzes the user has access to
export const getQuizzes = async (): Promise<Quiz[]> => {
  const response = await api.getQuizzes();
  return response.data.quizzes || [];
};

// Get a specific quiz by ID
export const getQuiz = async (quizId: number): Promise<Quiz> => {
  try {
    const response = await api.get(`/quizzes/get-quiz.php?id=${quizId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching quiz:', error);
    throw new Error(error.response?.data?.error || 'Failed to fetch quiz');
  }
};

// Get quiz results for a specific quiz
export const getQuizResults = async (quizId: number): Promise<QuizResult> => {
  try {
    const response = await api.get(`/quizzes/get-results.php?id=${quizId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching quiz results:', error);
    throw new Error(error.response?.data?.error || 'Failed to fetch quiz results');
  }
};

// Submit quiz answers
export const submitQuiz = async (submission: QuizSubmission): Promise<QuizResult> => {
  try {
    // Validate answers before submission
    submission.answers.forEach(answer => {
      if (!validateFen(answer.answer)) {
        throw new Error(`Invalid FEN notation in answer for question ${answer.questionId}`);
      }
    });

    const response = await api.post('/quizzes/submit-quiz.php', submission);
    return response.data;
  } catch (error: any) {
    console.error('Error submitting quiz:', error);
    throw new Error(error.response?.data?.error || 'Failed to submit quiz');
  }
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

// Get question bank details
export const getQuestionBank = async (bankId: number) => {
  try {
    const response = await api.get(`/quizzes/get-questions-by-bank.php?bank_id=${bankId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching question bank:', error);
    throw new Error(error.response?.data?.error || 'Failed to fetch question bank');
  }
};

// Get questions by section type
export const getQuestionsBySection = async (sectionType: string) => {
  try {
    const response = await api.get(`/quizzes/get-questions-by-section.php?section_type=${sectionType}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching section questions:', error);
    throw new Error(error.response?.data?.error || 'Failed to fetch section questions');
  }
};

// Update section settings
export const updateSectionSettings = async (settings: {
  section1_enabled: boolean;
  section2_enabled: boolean;
  section1_timer: number;
  section2_timer: number;
}) => {
  try {
    const response = await api.post('/quizzes/update-section-settings.php', settings);
    return response.data;
  } catch (error: any) {
    console.error('Error updating section settings:', error);
    throw new Error(error.response?.data?.error || 'Failed to update section settings');
  }
};

// Get student submissions
export const getStudentSubmissions = async (bankId: number, options?: {
  studentId?: number;
  compare?: boolean;
  includeAnswers?: boolean;
}) => {
  try {
    let url = `/question-banks/get-student-submissions.php?bank_id=${bankId}`;
    
    if (options?.studentId) {
      url += `&student_id=${options.studentId}`;
    }
    
    if (options?.compare) {
      url += '&compare=true';
    }
    
    if (options?.includeAnswers) {
      url += '&include_answers=true';
    }
    
    const response = await api.get(url);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching student submissions:', error);
    throw new Error(error.response?.data?.error || 'Failed to fetch student submissions');
  }
};

export default {
  getQuizzes,
  getQuiz,
  getQuizResults,
  submitQuiz,
  createQuiz,
  getAdminQuizzes,
  getQuestionBank,
  getQuestionsBySection,
  updateSectionSettings,
  getStudentSubmissions,
}; 