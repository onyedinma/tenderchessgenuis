import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Enable logging for API requests
axios.interceptors.request.use(request => {
  console.log('API Request:', request.method?.toUpperCase(), request.url);
  return request;
});

// Enable logging for API responses
axios.interceptors.response.use(
  response => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  error => {
    console.error('API Error:', 
      error.config?.method?.toUpperCase(), 
      error.config?.url, 
      error.response?.status
    );
    return Promise.reject(error);
  }
);

// Create axios instance with base URL
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for maintaining session cookies
});

// Test API path configurations
export const testPaths = async () => {
  const results: any = {};
  
  // Try proxied paths instead of direct paths
  const apiPaths = [
    '/api/test-plain.php',
    '/api/phpinfo.php',
    '/api/auth/simple-check.php',
    '/api/auth/direct-check.php'
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
export const login = (email: string, password: string) => {
  return api.post('/auth/login.php', { email, password });
};

export const register = (name: string, email: string, password: string) => {
  return api.post('/auth/register.php', { name, email, password });
};

export const logout = () => {
  return api.post('/auth/logout.php');
};

// Check session with multiple fallback attempts
export const checkSession = async () => {
  const endpoints = [
    '/auth/direct-check.php',
    '/auth/simple-check.php',
    '/auth/check-session.php',
    '/auth/direct-check',
    '/auth/simple-check',
    '/auth/check-session'
  ];
  
  let lastError;
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Trying to check session with endpoint: ${endpoint}`);
      return await api.get(endpoint);
    } catch (error) {
      console.error(`Session check failed with endpoint ${endpoint}:`, error);
      lastError = error;
    }
  }
  
  // If all endpoints failed, throw the last error
  throw lastError;
};

// Check API status
export const checkApiStatus = async () => {
  return api.get('/check-path.php');
};

// Test CORS compatibility
export const testCors = async () => {
  try {
    return await api.get('/test-cors.php');
  } catch (error) {
    console.error('CORS test failed:', error);
    throw error;
  }
};

// Quiz API endpoints
export const getQuizzes = () => {
  return api.get('/quizzes/get-quizzes.php');
};

export const getQuizById = (id: string) => {
  return api.get(`/quizzes/get-quiz.php?id=${id}`);
};

export const submitQuiz = (quizId: number, answers: any[]) => {
  return api.post('/quizzes/submit-quiz.php', { quizId, answers });
};

export const getQuizResults = (quizId: string) => {
  return api.get(`/quizzes/get-results.php?id=${quizId}`);
};

// Debug login
export const debugLogin = (email: string, password: string) => {
  return api.post('/auth/debug-login.php', { email, password });
};

// New method for creating quizzes (admin only)
export const createQuiz = (quizData: any) => {
  return api.post('/quizzes/create-quiz.php', quizData);
};

// Test API path
export const testApi = () => {
  return api.get('/test.php');
};

// Expose API functions
export default {
  login,
  register,
  logout,
  checkSession,
  checkApiStatus,
  testCors,
  testPaths,
  debugLogin,
  getQuizzes,
  getQuizById,
  submitQuiz,
  getQuizResults,
  createQuiz,
  testApi
};

// A helper function to set auth token in headers
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Request with custom config
export const request = (config: AxiosRequestConfig): Promise<AxiosResponse> => {
  return api(config);
}; 