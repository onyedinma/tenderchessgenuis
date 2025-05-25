import React, { useState, useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { getQuizzes } from '../../services/api';

const StudentSubmissionWrapper = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSubmissions = async () => {
    try {
      const response = await getQuizzes();
      if (response.data && response.data.success) {
        setSubmissions(response.data.submissions);
      } else {
        toast({
          title: 'Error',
          description: response.data.message || 'Failed to fetch submissions',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch submissions',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <div>
      {/* Render your component content here */}
    </div>
  );
};

export default StudentSubmissionWrapper; 