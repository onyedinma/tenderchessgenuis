import React, { useState, useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { getQuizzes } from '../../services/api';

const SubmissionComparison = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [comparisons, setComparisons] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchComparisons = async () => {
    try {
      const response = await getQuizzes();
      if (response.data && response.data.success) {
        setComparisons(response.data.comparisons);
      } else {
        toast({
          title: 'Error',
          description: response.data.message || 'Failed to fetch comparisons',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error fetching comparisons:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch comparisons',
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

export default SubmissionComparison; 