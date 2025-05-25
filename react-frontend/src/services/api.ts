/// <reference types="vite/client" />

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Determine if we're in development mode (PHP built-in server)
const isDevelopment = import.meta.env.DEV;
// Use a default value if VITE_API_BASE_URL is not set
const baseURL = isDevelopment ? 'http://localhost:8000' : import.meta.env.VITE_API_BASE_URL || 'http://localhost';

// Create axios instance with default config
export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for logging and URL handling
api.interceptors.request.use(
  (config) => {
    // Add /api prefix to all requests
    if (config.url && !config.url.startsWith('/api')) {
      config.url = `/api${config.url}`;
    }
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    console.log('Request Headers:', config.headers);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.config?.method?.toUpperCase(), error.config?.url, error.response?.status, error.message);
    return Promise.reject(error);
  }
);

// Test API path configurations
const testPaths = async () => {
  const results: any = {};
  
  // Try direct paths without /api prefix
  const apiPaths = [
    '/test-plain.php',
    '/phpinfo.php',
    '/auth/simple-check.php',
    '/auth/direct-check.php'
  ];
  
  for (const path of apiPaths) {
    try {
      const response = await fetch(path);
      const text = await response.text();
      results[path] = {
        status: response.status,
        ok: response.ok,
        contentType: response.headers.get('content-type'),
        text: text.substring(0, 200) + '...' // First 200 chars
      };
      
      // Try to parse as JSON if it looks like JSON
      if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
        try {
          results[path].json = JSON.parse(text);
        } catch (e) {
          // Not valid JSON, which is fine
        }
      }
    } catch (error: any) {
      results[path] = { error: error.message };
    }
  }
  
  return results;
};

// Auth API endpoints
const login = (email: string, password: string): Promise<AxiosResponse> => {
  return api.post('/auth/login.php', { email, password });
};

const register = (name: string, email: string, password: string): Promise<AxiosResponse> => {
  return api.post('/auth/register.php', { name, email, password });
};

const logout = (): Promise<AxiosResponse> => {
  return api.post('/auth/logout.php');
};

// Check session with multiple fallback attempts
const checkSession = async (): Promise<AxiosResponse> => {
  const endpoints = [
    '/auth/direct-check.php',
    '/auth/simple-check.php',
    '/auth/check-session.php'
  ];
  
  let lastError;
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Trying to check session with endpoint: ${endpoint}`);
      const response = await api.get(endpoint);
      
      // Log the raw response for debugging
      console.log(`Raw response from ${endpoint}:`, response);
      
      // Check if response exists and has data
      if (!response) {
        console.error(`No response received from ${endpoint}`);
        continue;
      }
      
      // If response doesn't have data property, wrap it
      if (!response.data) {
        response.data = { data: { loggedIn: false } };
      }
      
      // If response.data.data doesn't have data property, wrap it
      if (!response.data.data) {
        response.data = { data: response.data };
      }
      
      console.log(`Processed response from ${endpoint}:`, response);
      return response;
    } catch (error) {
      console.error(`Session check failed with endpoint ${endpoint}:`, error);
      lastError = error;
    }
  }
  
  // If all endpoints failed, return a default response
  console.error('All session check endpoints failed:', lastError);
  return {
    data: {
      data: {
        loggedIn: false,
        message: 'Session check failed',
        error: lastError?.message
      }
    }
  } as AxiosResponse;
};

// Check API status
const checkApiStatus = async () => {
  return api.get('/check-path.php');
};

// Test CORS compatibility
const testCors = async () => {
  try {
    return await api.get('/test-cors.php');
  } catch (error) {
    console.error('CORS test failed:', error);
    throw error;
  }
};

// Quiz API endpoints
const getQuizzes = () => {
  return api.get('/quizzes/get-quizzes.php');
};

const getQuizById = (id: string) => {
  return api.get(`/quizzes/get-quiz.php?id=${id}`);
};

const submitQuiz = (quizId: number, answers: any[]) => {
  return api.post('/quizzes/submit-quiz.php', { quizId, answers });
};

const getQuizResults = (quizId: string) => {
  return api.get(`/quizzes/get-results.php?id=${quizId}`);
};

interface UpdateSectionSettingsData {
  section1_enabled: boolean;
  section2_enabled: boolean;
  section1_timer: number;
  section2_timer: number;
}

const updateSectionSettings = (data: UpdateSectionSettingsData): Promise<AxiosResponse> => {
  return api.post('/quizzes/update-section-settings.php', data);
};

// Question bank and student submissions endpoints
const submitQuizAnswers = (bankId: number, answers: any[], timeTaken: number) => {
  return api.post('/question-banks/submit-answers.php', { bankId, answers, timeTaken });
};

const getStudentSubmissions = (bankId: number, options?: { 
  studentId?: number, 
  compare?: boolean, 
  includeAnswers?: boolean 
}) => {
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
  
  return api.get(url);
};

const getQuestionsByBankId = (bankId: string) => {
  return api.get(`/quizzes/get-questions-by-bank.php?bank_id=${bankId}`);
};

// New function to get questions by section type
const getQuestionsBySectionType = (sectionType: string) => {
  return api.get(`/quizzes/get-questions-by-section.php?section_type=${sectionType}`);
};

const getSubmissionById = (submissionId: number, includeAnswers: boolean = false) => {
  let url = `/question-banks/get-submission.php?id=${submissionId}`;
  
  if (includeAnswers) {
    url += '&include_answers=true';
  }
  
  return api.get(url);
};

// Debug login
const debugLogin = (email: string, password: string) => {
  return api.post('/auth/debug-login.php', { email, password });
};

// New method for creating quizzes (admin only)
const createQuiz = (quizData: any) => {
  return api.post('/quizzes/create-quiz.php', quizData);
};

// Test API path
const testApi = () => {
  return api.get('/test.php');
};

// A helper function to set auth token in headers
// Note: This might be used if using token-based auth instead of cookies
// export const setAuthToken = (token: string | null) => {
//   if (token) {
//     api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//   } else {
//     delete api.defaults.headers.common['Authorization'];
//   }
// };

// This helper function is not being used with the current cookie-based auth
// Keeping it here in case we switch auth methods
const request = (config: AxiosRequestConfig): Promise<AxiosResponse> => {
  return api(config);
};

// Export all functions individually
export {
  testPaths,
  login,
  register,
  logout,
  checkSession,
  checkApiStatus,
  testCors,
  getQuizzes,
  getQuizById,
  submitQuiz,
  getQuizResults,
  updateSectionSettings,
  submitQuizAnswers,
  getStudentSubmissions,
  getQuestionsByBankId,
  getQuestionsBySectionType,
  getSubmissionById,
  debugLogin,
  createQuiz,
  testApi
}; 

