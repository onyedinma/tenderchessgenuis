import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider, Box } from '@chakra-ui/react';
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

// Import admin pages
import Dashboard from './pages/admin/Dashboard';
import StudentManagement from './pages/admin/StudentManagement';
import Section1Management from './pages/admin/Section1Management';
import Section2Management from './pages/admin/Section2Management';
import CategorySystem from './pages/admin/CategorySystem';
import ScoringSystem from './pages/admin/ScoringSystem';
import Analytics from './pages/admin/Analytics';
import ShowControls from './pages/admin/ShowControls';
import QuestionBankManager from './pages/admin/QuestionBankManager';
import DbSchemaCheck from './pages/admin/DbSchemaCheck';
import DatabaseInfo from './pages/admin/DatabaseInfo';

const App: React.FC = () => {
  return (
    <ChakraProvider>
      <Router>
        <AuthProvider>
          <Box minH="100vh" bg="gray.50">
            <Routes>
              {/* Admin routes with AdminLayout */}
              <Route path="/admin" element={<AdminRoute element={<AdminLayout />} />}>
                <Route index element={<Dashboard />} />
                <Route path="students" element={<StudentManagement />} />
                <Route path="section1" element={<Section1Management />} />
                <Route path="section2" element={<Section2Management />} />
                <Route path="categories" element={<CategorySystem />} />
                <Route path="scoring" element={<ScoringSystem />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="controls" element={<ShowControls />} />
                <Route path="question-banks" element={<QuestionBankManager />} />
                <Route path="db-schema-check" element={<DbSchemaCheck />} />
                <Route path="database-info" element={<DatabaseInfo />} />
              </Route>
              
              {/* Student routes */}
              <Route path="/student/login" element={<StudentLogin />} />
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              
              {/* Public routes */}
              <Route path="/login" element={
                <>
                  <Header />
                  <Box p={5}>
                    <Login />
                  </Box>
                </>
              } />
              
              <Route path="/register" element={
                <>
                  <Header />
                  <Box p={5}>
                    <Register />
                  </Box>
                </>
              } />
              
              {/* Simple test page that doesn't depend on API calls */}
              <Route path="/test" element={
                <>
                  <Header />
                  <Box p={5}>
                    <TestPage />
                  </Box>
                </>
              } />
              
              {/* Test route for API testing - accessible without auth */}
              <Route path="/api-test" element={
                <>
                  <Header />
                  <Box p={5}>
                    <ApiTest />
                  </Box>
                </>
              } />
              
              {/* Protected routes */}
              <Route path="/" element={<HomePage />} />
              
              <Route path="/home" element={
                <>
                  <Header />
                  <Box p={5}>
                    <ProtectedRoute element={<Home />} />
                  </Box>
                </>
              } />
              
              <Route path="/quizzes" element={
                <>
                  <Header />
                  <Box p={5}>
                    <ProtectedRoute element={<QuizList />} />
                  </Box>
                </>
              } />
              
              <Route path="/quizzes/:id" element={
                <>
                  <Header />
                  <Box p={5}>
                    <ProtectedRoute element={<QuizDetails />} />
                  </Box>
                </>
              } />
              
              <Route path="/take-quiz/:id" element={
                <>
                  <Header />
                  <Box p={5}>
                    <ProtectedRoute element={<TakeQuiz />} />
                  </Box>
                </>
              } />
              
              <Route path="/quiz-results/:id" element={
                <>
                  <Header />
                  <Box p={5}>
                    <ProtectedRoute element={<QuizResults />} />
                  </Box>
                </>
              } />
              
              <Route path="/profile" element={
                <>
                  <Header />
                  <Box p={5}>
                    <ProtectedRoute element={<Profile />} />
                  </Box>
                </>
              } />
              
              {/* 404 route */}
              <Route path="*" element={
                <>
                  <Header />
                  <Box p={5}>
                    <NotFound />
                  </Box>
                </>
              } />
            </Routes>
          </Box>
        </AuthProvider>
      </Router>
    </ChakraProvider>
  );
};

export default App; 