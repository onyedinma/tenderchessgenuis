import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { SectionInfo, getQuizzes } from '../api'; // Assuming SectionInfo is imported from api.ts
import { Link } from 'react-router-dom';

interface Quiz {
  id: number;
  name: string;
  description: string;
  bank_id: number;
  section_type: string;
  question_count: number;
  bank: { // Add the bank property to the Quiz interface
    id: number;
    name: string;
    description: string;
    section_type: string;
  };
}

const Dashboard: React.FC = () => {
  const { user, checkSession, isAuthenticated, loading } = useAuth();
  const [sections, setSections] = useState<SectionInfo[]>([]);
  const [section1Timer, setSection1Timer] = useState<number | null>(null);
  const [section2Timer, setSection2Timer] = useState<number | null>(null);

  useEffect(() => {
    const verifyAndFetchQuizzes = async () => {
      console.log('Dashboard useEffect: Checking session...');
      // No need to manually call checkSession here, AuthContext handles it
      // const sessionValid = await checkSession();
      // console.log('Dashboard useEffect: Session valid?', sessionValid);

      // if (sessionValid) {
        console.log('Dashboard useEffect: Fetching quizzes...');
        fetchQuizzes();
      // } else {
        // Handle case where session is invalid, e.g., redirect to login
        // console.log('Dashboard useEffect: Session invalid, handle redirect or logout');
        // You might want to add a state to indicate login status and handle it
      // }
    };

    // Only fetch quizzes if not loading initially
    if (!loading && isAuthenticated) {
       verifyAndFetchQuizzes();
    }
     // If loading or not authenticated, useEffect will run again when those change
  }, [isAuthenticated, loading]); // Depend on isAuthenticated and loading

  const fetchQuizzes = async () => {
    try {
      console.log('Attempting to fetch quizzes');
      const response = await getQuizzes();
      console.log('getQuizzes response:', response);

      if (response.data && response.data.success) {
        // Assuming the new getQuizzes endpoint returns sections directly
        setSections(response.data.sections);
        setSection1Timer(response.data.section1_timer);
        setSection2Timer(response.data.section2_timer);
        console.log('Fetched sections:', response.data.sections);
        console.log('Section 1 Timer:', response.data.section1_timer);
        console.log('Section 2 Timer:', response.data.section2_timer);
      } else {
        console.error('Failed to fetch quizzes:', response.data.message);
        setSections([]); // Clear sections on failure
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      setSections([]); // Clear sections on error
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || !user || user.roles !== 'student') {
     console.log('Dashboard: Not authenticated or not a student.', {isAuthenticated, user});
    // The AuthContext handles redirection based on authentication state
    return null; 
  }

  console.log('Dashboard: User is authenticated student.', user);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Student Dashboard</h1>
      <h2 className="text-xl mb-4">Welcome, {user.username}!</h2>

      {sections.length === 0 ? (
        <p>No sections available at this time.</p>
      ) : (
        sections.map((section) => (
          <div key={section.section_type} className="bg-white shadow-md rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-2">Section {section.section_type}: {section.title}</h3>
            <p className="text-gray-600 mb-4">Time Limit: {section.time_limit} minutes</p>
            <p className="text-gray-600 mb-4">Number of Questions: {section.question_count}</p>
            {/* Link to the quiz page, passing section_type instead of bankId */}
            <Link
              to={`/quiz/${section.section_type}`}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Start Quiz
            </Link>
          </div>
        ))
      )}
    </div>
  );
};

export default Dashboard;
