import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider, Box, Heading } from '@chakra-ui/react';
import { AuthProvider } from './contexts/AuthContext';

// Import components
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AdminLayout from './components/AdminLayout';

// Import pages
import HomePage from './pages/HomePage';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import QuizList from './pages/QuizList';
import QuizDetails from './pages/QuizDetails';
import TakeQuiz from './pages/TakeQuiz';
import QuizResults from './pages/QuizResults';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import ApiTest from './pages/ApiTest';
import TestPage from './pages/TestPage';

// Import student pages
import StudentLogin from './pages/student/Login';
import StudentDashboard from './pages/student/Dashboard';
import QuizPage from './pages/student/QuizPage';
import SectionQuiz from './pages/student/SectionQuiz';
import SubmissionComparison from './pages/student/SubmissionComparison';
import StudentSubmissionWrapper from './pages/student/StudentSubmissionWrapper';

// Import admin pages
import Dashboard from './pages/admin/Dashboard';
import StudentManagement from './pages/admin/StudentManagement';
import CategorySystem from './pages/admin/CategorySystem';
import ScoringSystem from './pages/admin/ScoringSystem';
import Analytics from './pages/admin/Analytics';
import ShowControls from './pages/admin/ShowControls';
import QuestionBankManager from './pages/admin/QuestionBankManager';
import HighlightedQuestions from './pages/admin/HighlightedQuestions';
import DbSchemaCheck from './pages/admin/DbSchemaCheck';
import DatabaseInfo from './pages/admin/DatabaseInfo';

const App: React.FC = () => {
  return (
    <ChakraProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <Box minH="100vh" bg="gray.50">
            <Header />
            <Routes>
              {/* Admin routes with AdminLayout */}
              <Route path="/admin" element={<AdminRoute element={<AdminLayout />} />}>
                <Route index element={<Dashboard />} />
                <Route path="students" element={<StudentManagement />} />
                <Route path="categories" element={<CategorySystem />} />
                <Route path="scoring" element={<ScoringSystem />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="controls" element={<ShowControls />} />
                <Route path="show-controls" element={<ShowControls />} />
                <Route path="highlighted-questions" element={<HighlightedQuestions />} />
                <Route path="question-banks" element={<QuestionBankManager />} />
                <Route path="db-schema-check" element={<DbSchemaCheck />} />
                <Route path="database-info" element={<DatabaseInfo />} />
              </Route>
              
              {/* Student routes */}
              <Route path="/student/login" element={<StudentLogin />} />
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/quiz/:bankId" element={<QuizPage />} />
              <Route path="/student/section/:sectionId" element={<SectionQuiz />} />
              <Route path="/student/submissions/:bankId" element={<StudentSubmissionWrapper />} />
              <Route path="/student/test" element={<Box p={5}><Heading>Test Route</Heading></Box>} />
              
              {/* Public routes */}
              <Route path="/login" element={
                <Box p={5}>
                  <Login />
                </Box>
              } />
              
              <Route path="/register" element={
                <Box p={5}>
                  <Register />
                </Box>
              } />
              
              <Route path="/api-test" element={
                <Box p={5}>
                  <ApiTest />
                </Box>
              } />
              
              <Route path="/test-page" element={
                <Box p={5}>
                  <TestPage />
                </Box>
              } />
              
              <Route path="/quiz/:id" element={
                <Box p={5}>
                  <QuizDetails />
                </Box>
              } />
              
              <Route path="/take-quiz/:id" element={
                <Box p={5}>
                  <TakeQuiz />
                </Box>
              } />
              
              <Route path="/quiz-results/:id" element={
                <Box p={5}>
                  <QuizResults />
                </Box>
              } />
              
              <Route path="/profile" element={
                <Box p={5}>
                  <Profile />
                </Box>
              } />
              
              <Route path="/quizzes" element={
                <Box p={5}>
                  <QuizList />
                </Box>
              } />
              
              <Route path="/" element={<HomePage />} />
              <Route path="/home" element={<Home />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Box>
        </AuthProvider>
      </Router>
    </ChakraProvider>
  );
};

export default App; 