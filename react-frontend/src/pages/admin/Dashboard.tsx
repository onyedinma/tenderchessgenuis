import React, { useState, useEffect } from 'react';
import {
  Box,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Text,
  VStack,
  HStack,
  Icon,
  Button,
  Divider,
  Progress,
  Badge,
  useColorModeValue,
  Spinner,
  Center,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Alert,
  AlertIcon,
  Flex,
  useToast,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  FaUsers,
  FaChessBoard,
  FaTrophy,
  FaClock,
  FaChartLine,
  FaUserGraduate,
  FaCheckCircle,
  FaExclamationTriangle,
} from 'react-icons/fa';
import { api, getQuizzes, getQuizById, submitQuiz } from '../../services/api';

interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  section1Questions: number;
  section2Questions: number;
  goldenCategory: number;
  silverCategory: number;
  bronzeCategory: number;
  recentAttempts: Array<{
    id: number;
    username: string;
    bank_name: string;
    percentage_score: number;
    created_at: string;
  }>;
  bankStats: Array<{
    name: string;
    section_type: string;
    question_count: number;
    attempt_count: number;
  }>;
}

const Dashboard: React.FC = () => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await api.get('/dashboard/simple-stats.php');
        
        console.log('Dashboard API response:', response.data);
        
        if (response.data.success) {
          setStats(response.data.stats);
        } else {
          setError(response.data.message || 'Failed to fetch dashboard statistics');
          console.error('API error:', response.data);
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        let errorMessage = 'Error connecting to the server';
        if (err instanceof Error) {
          errorMessage += `: ${err.message}`;
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await getQuizzes();
      if (response.data && response.data.success) {
        setQuizzes(response.data.quizzes);
      } else {
        toast({
          title: 'Error',
          description: response.data.message || 'Failed to fetch quizzes',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch quizzes',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleQuizSelect = async (quizId: number) => {
    try {
      const response = await getQuizById(quizId.toString());
      if (response.data && response.data.success) {
        setSelectedQuiz(response.data.quiz);
      } else {
        toast({
          title: 'Error',
          description: response.data.message || 'Failed to fetch quiz details',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error fetching quiz details:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch quiz details',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleQuizUpdate = async (quizId: number, quizData: any) => {
    try {
      const response = await submitQuiz(quizId, quizData);
      if (response.data && response.data.success) {
        toast({
          title: 'Success',
          description: 'Quiz updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        fetchQuizzes();
      } else {
        toast({
          title: 'Error',
          description: response.data.message || 'Failed to update quiz',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error updating quiz:', error);
      toast({
        title: 'Error',
        description: 'Failed to update quiz',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const StatCard = ({ label, value, icon, helpText }: any) => (
    <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
      <CardBody>
        <HStack spacing={4}>
          <Box color="blue.500">
            <Icon as={icon} boxSize={8} />
          </Box>
          <Stat>
            <StatLabel fontSize="lg">{label}</StatLabel>
            <StatNumber>{value}</StatNumber>
            {helpText && <StatHelpText>{helpText}</StatHelpText>}
          </Stat>
        </HStack>
      </CardBody>
    </Card>
  );

  const QuickActionCard = ({ title, description, to, icon }: any) => (
    <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
      <CardHeader>
        <HStack spacing={4}>
          <Icon as={icon} boxSize={6} color="blue.500" />
          <Heading size="md">{title}</Heading>
        </HStack>
      </CardHeader>
      <CardBody>
        <VStack align="start" spacing={4}>
          <Text color="gray.600">{description}</Text>
          <Button
            as={RouterLink}
            to={to}
            colorScheme="blue"
            size="sm"
            width="full"
          >
            Manage
          </Button>
        </VStack>
      </CardBody>
    </Card>
  );

  if (loading) {
    return (
      <Center h="60vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Loading dashboard data...</Text>
        </VStack>
      </Center>
    );
  }

  if (error) {
    return (
      <Box p={8}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          {error}
        </Alert>
        <Button mt={4} colorScheme="blue" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Box>
    );
  }

  if (!stats) {
    return (
      <Box p={8}>
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          No statistics available at this time.
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading mb={2}>Admin Dashboard</Heading>
          <Text color="gray.600">
            Manage your chess quiz show system and monitor performance
          </Text>
        </Box>

        {/* Statistics Overview */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          <StatCard
            label="Total Students"
            value={stats.totalStudents}
            icon={FaUsers}
            helpText={`${stats.activeStudents} currently active`}
          />
          <StatCard
            label="Section 1 Questions"
            value={stats.section1Questions}
            icon={FaChessBoard}
            helpText="Across all banks"
          />
          <StatCard
            label="Section 2 Questions"
            value={stats.section2Questions}
            icon={FaChessBoard}
            helpText="Across all banks"
          />
        </SimpleGrid>

        {/* Category Distribution */}
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <HStack spacing={4}>
              <Icon as={FaTrophy} boxSize={6} color="blue.500" />
              <Heading size="md">Category Distribution</Heading>
            </HStack>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <Text>Golden Category (80-100)</Text>
                <Badge colorScheme="yellow">{stats.goldenCategory} students</Badge>
              </HStack>
              <Progress 
                value={stats.totalStudents ? (stats.goldenCategory / stats.totalStudents) * 100 : 0} 
                colorScheme="yellow" 
              />
              
              <HStack justify="space-between">
                <Text>Silver Category (60-79)</Text>
                <Badge colorScheme="gray">{stats.silverCategory} students</Badge>
              </HStack>
              <Progress 
                value={stats.totalStudents ? (stats.silverCategory / stats.totalStudents) * 100 : 0} 
                colorScheme="gray" 
              />
              
              <HStack justify="space-between">
                <Text>Bronze Category (0-59)</Text>
                <Badge colorScheme="orange">{stats.bronzeCategory} students</Badge>
              </HStack>
              <Progress 
                value={stats.totalStudents ? (stats.bronzeCategory / stats.totalStudents) * 100 : 0} 
                colorScheme="orange" 
              />
            </VStack>
          </CardBody>
        </Card>

        {/* Recent Attempts */}
        {stats.recentAttempts && stats.recentAttempts.length > 0 && (
          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardHeader>
              <HStack spacing={4}>
                <Icon as={FaCheckCircle} boxSize={6} color="blue.500" />
                <Heading size="md">Recent Quiz Attempts</Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Student</Th>
                    <Th>Quiz Bank</Th>
                    <Th>Score</Th>
                    <Th>Date</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {stats.recentAttempts.map((attempt) => (
                    <Tr key={attempt.id}>
                      <Td>{attempt.username}</Td>
                      <Td>{attempt.bank_name}</Td>
                      <Td>
                        <Badge
                          colorScheme={
                            attempt.percentage_score >= 80 ? 'green' :
                            attempt.percentage_score >= 60 ? 'blue' : 'orange'
                          }
                        >
                          {attempt.percentage_score}%
                        </Badge>
                      </Td>
                      <Td>{new Date(attempt.created_at).toLocaleString()}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </CardBody>
          </Card>
        )}

        {/* Top Question Banks */}
        {stats.bankStats && stats.bankStats.length > 0 && (
          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardHeader>
              <HStack spacing={4}>
                <Icon as={FaChessBoard} boxSize={6} color="blue.500" />
                <Heading size="md">Top Question Banks</Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Bank Name</Th>
                    <Th>Section</Th>
                    <Th>Questions</Th>
                    <Th>Attempts</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {stats.bankStats.map((bank, index) => (
                    <Tr key={index}>
                      <Td>{bank.name}</Td>
                      <Td>
                        <Badge colorScheme={bank.section_type === '1' ? 'blue' : 'purple'}>
                          Section {bank.section_type}
                        </Badge>
                      </Td>
                      <Td>{bank.question_count}</Td>
                      <Td>{bank.attempt_count}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </CardBody>
          </Card>
        )}

        {/* Quick Actions */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          <QuickActionCard
            title="Student Management"
            description="Add, remove, or modify student information and track their progress."
            to="/admin/students"
            icon={FaUserGraduate}
          />
          <QuickActionCard
            title="Question Banks"
            description="Manage question banks, add or edit quiz questions."
            to="/admin/question-banks"
            icon={FaChessBoard}
          />
          <QuickActionCard
            title="Analytics"
            description="View detailed performance metrics and student progress."
            to="/admin/analytics"
            icon={FaChartLine}
          />
        </SimpleGrid>
      </VStack>
    </Box>
  );
};

export default Dashboard; 