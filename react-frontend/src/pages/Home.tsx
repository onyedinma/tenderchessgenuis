import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Button,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Icon,
  Divider,
  VStack,
  HStack,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Badge,
  Spinner,
} from '@chakra-ui/react';
import { FaChessKnight, FaTrophy, FaClock, FaChessBoard } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { api, getQuizzes } from '../services/api';

interface Quiz {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  groupName: string;
}

interface Stats {
  quizzesCompleted: number;
  averageScore: number;
  totalPuzzlesSolved: number;
  bestPerformance: string;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeQuizzes, setActiveQuizzes] = useState<Quiz[]>([]);
  const [upcomingQuizzes, setUpcomingQuizzes] = useState<Quiz[]>([]);
  const [stats, setStats] = useState<Stats>({
    quizzesCompleted: 0,
    averageScore: 0,
    totalPuzzlesSolved: 0,
    bestPerformance: '-',
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch quizzes
        const quizzesResponse = await getQuizzes();
        if (quizzesResponse.data && quizzesResponse.data.success) {
          const now = new Date();
          
          // Active quizzes
          const active = quizzesResponse.data.quizzes.filter((quiz: Quiz) => {
            const startTime = new Date(quiz.startTime);
            const endTime = new Date(quiz.endTime);
            return now >= startTime && now <= endTime;
          }).slice(0, 3); // Get 3 most recent
          
          // Upcoming quizzes
          const upcoming = quizzesResponse.data.quizzes.filter((quiz: Quiz) => {
            const startTime = new Date(quiz.startTime);
            return now < startTime;
          }).sort((a: Quiz, b: Quiz) => {
            return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
          }).slice(0, 3); // Get 3 soonest
          
          setActiveQuizzes(active);
          setUpcomingQuizzes(upcoming);
        }
        
        // This would be replaced with actual API calls in a real app
        // For now, using mock data
        setStats({
          quizzesCompleted: 12,
          averageScore: 78.5,
          totalPuzzlesSolved: 86,
          bestPerformance: 'Tactical Patterns Quiz (92%)',
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleQuizClick = (quizId: number) => {
    navigate(`/quizzes/${quizId}`);
  };

  const handleViewAllQuizzes = () => {
    navigate('/quizzes');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="50vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Welcome section */}
        <Box>
          <Heading size="lg" mb={2}>
            Welcome back, {user?.name}!
          </Heading>
          <Text color="gray.600">
            Continue your chess journey with new puzzles and quizzes.
          </Text>
        </Box>

        <Divider />

        {/* Stats section */}
        <Box>
          <Heading size="md" mb={4}>
            Your Performance
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={5}>
            <Stat p={5} shadow="md" border="1px" borderColor="gray.200" borderRadius="md">
              <StatLabel display="flex" alignItems="center">
                <Icon as={FaChessBoard} mr={2} />
                Quizzes Completed
              </StatLabel>
              <StatNumber>{stats.quizzesCompleted}</StatNumber>
              <StatHelpText>Your journey so far</StatHelpText>
            </Stat>

            <Stat p={5} shadow="md" border="1px" borderColor="gray.200" borderRadius="md">
              <StatLabel display="flex" alignItems="center">
                <Icon as={FaTrophy} mr={2} />
                Average Score
              </StatLabel>
              <StatNumber>{stats.averageScore}%</StatNumber>
              <StatHelpText>Overall performance</StatHelpText>
            </Stat>

            <Stat p={5} shadow="md" border="1px" borderColor="gray.200" borderRadius="md">
              <StatLabel display="flex" alignItems="center">
                <Icon as={FaChessKnight} mr={2} />
                Puzzles Solved
              </StatLabel>
              <StatNumber>{stats.totalPuzzlesSolved}</StatNumber>
              <StatHelpText>Total challenges completed</StatHelpText>
            </Stat>

            <Stat p={5} shadow="md" border="1px" borderColor="gray.200" borderRadius="md">
              <StatLabel display="flex" alignItems="center">
                <Icon as={FaClock} mr={2} />
                Best Performance
              </StatLabel>
              <StatNumber fontSize="lg">{stats.bestPerformance}</StatNumber>
              <StatHelpText>Your highest achievement</StatHelpText>
            </Stat>
          </SimpleGrid>
        </Box>

        {/* Active quizzes section */}
        <Box>
          <Flex justify="space-between" align="center" mb={4}>
            <Heading size="md">Active Quizzes</Heading>
            <Button
              size="sm"
              variant="outline"
              colorScheme="blue"
              onClick={handleViewAllQuizzes}
            >
              View All
            </Button>
          </Flex>
          {activeQuizzes.length > 0 ? (
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5}>
              {activeQuizzes.map((quiz) => (
                <Card
                  key={quiz.id}
                  variant="outline"
                  cursor="pointer"
                  _hover={{ shadow: 'md' }}
                  onClick={() => handleQuizClick(quiz.id)}
                >
                  <CardHeader pb={0}>
                    <Flex justify="space-between" align="center">
                      <Heading size="sm">{quiz.title}</Heading>
                      <Badge colorScheme="green">Active</Badge>
                    </Flex>
                  </CardHeader>
                  <CardBody py={2}>
                    <Text fontSize="sm" color="gray.600">
                      Group: {quiz.groupName}
                    </Text>
                    <Text fontSize="sm">
                      Ends: {formatDate(quiz.endTime)}
                    </Text>
                  </CardBody>
                  <CardFooter pt={0}>
                    <Button size="sm" colorScheme="blue" width="full">
                      Start Now
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </SimpleGrid>
          ) : (
            <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
              <Text>No active quizzes at the moment. Check back later!</Text>
            </Box>
          )}
        </Box>

        {/* Upcoming quizzes section */}
        <Box>
          <Heading size="md" mb={4}>
            Upcoming Quizzes
          </Heading>
          {upcomingQuizzes.length > 0 ? (
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5}>
              {upcomingQuizzes.map((quiz) => (
                <Card
                  key={quiz.id}
                  variant="outline"
                  cursor="pointer"
                  _hover={{ shadow: 'md' }}
                  onClick={() => handleQuizClick(quiz.id)}
                >
                  <CardHeader pb={0}>
                    <Flex justify="space-between" align="center">
                      <Heading size="sm">{quiz.title}</Heading>
                      <Badge colorScheme="yellow">Upcoming</Badge>
                    </Flex>
                  </CardHeader>
                  <CardBody py={2}>
                    <Text fontSize="sm" color="gray.600">
                      Group: {quiz.groupName}
                    </Text>
                    <Text fontSize="sm">
                      Starts: {formatDate(quiz.startTime)}
                    </Text>
                  </CardBody>
                  <CardFooter pt={0}>
                    <Button size="sm" variant="outline" colorScheme="blue" width="full">
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </SimpleGrid>
          ) : (
            <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
              <Text>No upcoming quizzes scheduled. Check back later!</Text>
            </Box>
          )}
        </Box>
      </VStack>
    </Container>
  );
};

export default Home; 