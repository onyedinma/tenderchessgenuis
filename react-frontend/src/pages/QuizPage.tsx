import React, { useEffect, useState } from 'react';
import { useToast } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { getQuizById, submitQuiz } from '../services/api';

const QuizPage = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [quizId, setQuizId] = useState('');
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});

  const fetchQuiz = async () => {
    try {
      const response = await getQuizById(quizId);
      if (response.data && response.data.success) {
        setQuiz(response.data.quiz);
      } else {
        toast({
          title: 'Error',
          description: response.data.message || 'Failed to fetch quiz',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error fetching quiz:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch quiz',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const fetchQuestions = async () => {
    try {
      const response = await getQuizById(quizId);
      if (response.data && response.data.success) {
        setQuestions(response.data.questions);
      } else {
        toast({
          title: 'Error',
          description: response.data.message || 'Failed to fetch questions',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch questions',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleSubmit = async () => {
    try {
      const answersArray = Object.entries(answers).map(([questionId, answer]) => ({
        questionId: Number(questionId),
        answer
      }));
      const response = await submitQuiz(Number(quizId), answersArray);
      if (response.data && response.data.success) {
        toast({
          title: 'Success',
          description: 'Answers submitted successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        navigate('/dashboard');
      } else {
        toast({
          title: 'Error',
          description: response.data.message || 'Failed to submit answers',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error submitting answers:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit answers',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    // Implementation of useEffect
  }, []);

  return (
    <div>
      {/* Render your component content here */}
    </div>
  );
};

export default QuizPage; 