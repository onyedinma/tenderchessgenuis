import React, { useState, useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
import { getQuizzes } from '../services/api';

const CategoryDisplay = () => {
  const toast = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      const response = await getQuizzes();
      if (response.data && response.data.success) {
        setCategories(response.data.categories);
      } else {
        toast({
          title: 'Error',
          description: response.data.message || 'Failed to fetch categories',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch categories',
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

export default CategoryDisplay; 