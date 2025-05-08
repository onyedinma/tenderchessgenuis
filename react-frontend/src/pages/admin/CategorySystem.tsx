import React, { useState } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Grid,
  Button,
  useToast,
  Badge,
  HStack,
  Icon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaTrophy, FaMedal, FaUserGraduate } from 'react-icons/fa';

interface Student {
  id: number;
  name: string;
  score: number;
  category: 'golden' | 'silver' | 'bronze' | null;
  submissionTime: string;
}

const CategorySystem: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.700');

  // Mock data for demonstration
  const categoryStats = {
    golden: {
      count: 0,
      range: '80-100',
      icon: FaTrophy,
      color: 'yellow.400'
    },
    silver: {
      count: 0,
      range: '60-70',
      icon: FaTrophy,
      color: 'gray.400'
    },
    bronze: {
      count: 0,
      range: '0-50',
      icon: FaMedal,
      color: 'orange.400'
    }
  };

  const getCategoryColor = (score: number): string => {
    if (score >= 80) return 'yellow.400';
    if (score >= 60) return 'gray.400';
    return 'orange.400';
  };

  const getCategoryName = (score: number): string => {
    if (score >= 80) return 'Golden';
    if (score >= 60) return 'Silver';
    return 'Bronze';
  };

  return (
    <Box p={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading mb={2}>Category System</Heading>
          <Text color="gray.600">
            Manage and view student categories based on Section 1 performance
          </Text>
        </Box>

        {/* Category Stats */}
        <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={6}>
          {Object.entries(categoryStats).map(([category, stats]) => (
            <Box
              key={category}
              p={6}
              bg={bgColor}
              borderRadius="lg"
              boxShadow="sm"
              borderWidth="1px"
            >
              <VStack spacing={4} align="start">
                <HStack spacing={4}>
                  <Icon 
                    as={stats.icon} 
                    boxSize={8} 
                    color={stats.color}
                  />
                  <Heading size="md" textTransform="capitalize">
                    {category} Category
                  </Heading>
                </HStack>
                <Stat>
                  <StatLabel>Score Range</StatLabel>
                  <StatNumber>{stats.range} points</StatNumber>
                  <StatHelpText>{stats.count} students</StatHelpText>
                </Stat>
              </VStack>
            </Box>
          ))}
        </Grid>

        {/* Student List */}
        <Box
          bg={bgColor}
          borderRadius="lg"
          boxShadow="sm"
          borderWidth="1px"
          overflow="hidden"
        >
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Student</Th>
                <Th isNumeric>Score</Th>
                <Th>Category</Th>
                <Th>Submission Time</Th>
              </Tr>
            </Thead>
            <Tbody>
              {students.length === 0 ? (
                <Tr>
                  <Td colSpan={4} textAlign="center" py={8}>
                    <VStack spacing={4}>
                      <Icon as={FaUserGraduate} boxSize={8} color="gray.400" />
                      <Text color="gray.600">
                        No students have completed Section 1 yet
                      </Text>
                    </VStack>
                  </Td>
                </Tr>
              ) : (
                students.map(student => (
                  <Tr key={student.id}>
                    <Td>{student.name}</Td>
                    <Td isNumeric>{student.score}</Td>
                    <Td>
                      <Badge
                        colorScheme={
                          student.score >= 80 ? 'yellow' :
                          student.score >= 60 ? 'gray' :
                          'orange'
                        }
                      >
                        {getCategoryName(student.score)}
                      </Badge>
                    </Td>
                    <Td>{student.submissionTime}</Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </Box>
      </VStack>
    </Box>
  );
};

export default CategorySystem; 