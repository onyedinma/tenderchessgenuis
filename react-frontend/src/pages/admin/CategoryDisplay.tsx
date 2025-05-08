import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Image,
  VStack,
  Text,
  Heading,
} from '@chakra-ui/react';
import axios from 'axios';

interface CategoryStudent {
  id: number;
  name: string;
  profile_picture: string | null;
  total_points: number;
  category: 'golden' | 'silver' | 'bronze';
}

export default function CategoryDisplay() {
  const [students, setStudents] = useState<CategoryStudent[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories/get-categories.php');
      setStudents(response.data.students);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'golden':
        return 'yellow.400';
      case 'silver':
        return 'gray.400';
      case 'bronze':
        return 'orange.400';
      default:
        return 'gray.200';
    }
  };

  const groupedStudents = students.reduce((acc, student) => {
    if (!acc[student.category]) {
      acc[student.category] = [];
    }
    acc[student.category].push(student);
    return acc;
  }, {} as Record<string, CategoryStudent[]>);

  return (
    <Box p={4}>
      <Heading mb={6}>Section 1 Categories</Heading>

      {['golden', 'silver', 'bronze'].map((category) => (
        <Box key={category} mb={8}>
          <Heading size="md" mb={4} color={getCategoryColor(category)}>
            {category.charAt(0).toUpperCase() + category.slice(1)} Category
            {category === 'golden' && ' (80-100 points)'}
            {category === 'silver' && ' (60-70 points)'}
            {category === 'bronze' && ' (0-50 points)'}
          </Heading>

          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Photo</Th>
                <Th>Name</Th>
                <Th>Points</Th>
                <Th>Category</Th>
              </Tr>
            </Thead>
            <Tbody>
              {(groupedStudents[category] || []).map((student) => (
                <Tr key={student.id}>
                  <Td>
                    {student.profile_picture ? (
                      <Image
                        src={student.profile_picture}
                        alt={student.name}
                        boxSize="50px"
                        objectFit="cover"
                        borderRadius="full"
                      />
                    ) : (
                      <Box
                        w="50px"
                        h="50px"
                        bg="gray.200"
                        borderRadius="full"
                      />
                    )}
                  </Td>
                  <Td>{student.name}</Td>
                  <Td>{student.total_points}</Td>
                  <Td>
                    <Badge
                      colorScheme={
                        category === 'golden'
                          ? 'yellow'
                          : category === 'silver'
                          ? 'gray'
                          : 'orange'
                      }
                    >
                      {category}
                    </Badge>
                  </Td>
                </Tr>
              ))}
              {(!groupedStudents[category] ||
                groupedStudents[category].length === 0) && (
                <Tr>
                  <Td colSpan={4}>
                    <Text textAlign="center" color="gray.500">
                      No students in this category
                    </Text>
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Box>
      ))}
    </Box>
  );
} 