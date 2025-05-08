import React, { useState } from 'react';
import {
  Box,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Text,
  Flex,
  Icon,
  Select,
  Card,
  CardBody,
  CardHeader,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Grid,
  GridItem,
  useColorModeValue,
} from '@chakra-ui/react';
import { 
  FaChessKnight, 
  FaChessBoard, 
  FaUsers, 
  FaChartLine, 
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaTrophy
} from 'react-icons/fa';

// Mock data
const overallStats = {
  totalQuizzes: 15,
  totalPuzzles: 124,
  totalUsers: 532,
  totalSubmissions: 1267,
  averageScore: 78,
  completionRate: 92,
};

const topPerformers = [
  { id: 1, name: 'Michael Brown', email: 'michael@example.com', quizzesTaken: 12, averageScore: 95 },
  { id: 2, name: 'David Chen', email: 'david@example.com', quizzesTaken: 10, averageScore: 92 },
  { id: 3, name: 'Sarah Miller', email: 'sarah@example.com', quizzesTaken: 8, averageScore: 85 },
  { id: 4, name: 'Alex Johnson', email: 'alex@example.com', quizzesTaken: 9, averageScore: 82 },
  { id: 5, name: 'Emily Wilson', email: 'emily@example.com', quizzesTaken: 7, averageScore: 76 },
];

const quizPerformance = [
  { id: 1, title: 'Weekly Tactics Challenge', submissions: 128, averageScore: 82, completionRate: 95 },
  { id: 2, title: 'Endgame Training', submissions: 98, averageScore: 76, completionRate: 90 },
  { id: 3, title: 'Opening Principles', submissions: 105, averageScore: 68, completionRate: 88 },
  { id: 4, title: 'Middlegame Tactics', submissions: 87, averageScore: 71, completionRate: 92 },
  { id: 5, title: 'Advanced Checkmates', submissions: 64, averageScore: 62, completionRate: 85 },
];

const puzzleDifficulty = [
  { difficulty: 'Easy', count: 42, averageSuccess: 88, averageTime: 45 },
  { difficulty: 'Medium', count: 56, averageSuccess: 72, averageTime: 78 },
  { difficulty: 'Hard', count: 26, averageSuccess: 54, averageTime: 112 },
];

const userGroups = [
  { name: 'Beginner', count: 215, averageScore: 68, quizzesTaken: 532 },
  { name: 'Intermediate', count: 184, averageScore: 76, quizzesTaken: 498 },
  { name: 'Advanced', count: 133, averageScore: 85, quizzesTaken: 237 },
];

// Monthly activity data
const monthlyActivity = [
  { month: 'Jan', submissions: 87, newUsers: 23 },
  { month: 'Feb', submissions: 105, newUsers: 18 },
  { month: 'Mar', submissions: 126, newUsers: 27 },
  { month: 'Apr', submissions: 142, newUsers: 31 },
  { month: 'May', submissions: 118, newUsers: 24 },
  { month: 'Jun', submissions: 132, newUsers: 29 },
];

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('all');
  const bgCard = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleTimeRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeRange(e.target.value);
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    helpText?: string;
    icon: any;
    colorScheme: string;
  }> = ({ title, value, helpText, icon, colorScheme }) => {
    return (
      <Box
        p={5}
        shadow="md"
        borderWidth="1px"
        borderRadius="lg"
        bg={bgCard}
        borderColor={borderColor}
      >
        <Flex justify="space-between" align="center">
          <Box>
            <StatLabel fontSize="sm" fontWeight="medium" isTruncated>
              {title}
            </StatLabel>
            <StatNumber fontSize="3xl" fontWeight="bold">
              {value}
            </StatNumber>
            {helpText && (
              <StatHelpText mb={0}>
                {helpText}
              </StatHelpText>
            )}
          </Box>
          <Flex
            w="12"
            h="12"
            align="center"
            justify="center"
            rounded="full"
            bg={`${colorScheme}.100`}
          >
            <Icon as={icon} color={`${colorScheme}.500`} boxSize="6" />
          </Flex>
        </Flex>
      </Box>
    );
  };

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading as="h1" size="xl">
          Analytics Dashboard
        </Heading>
        <Select
          onChange={handleTimeRangeChange}
          value={timeRange}
          width="200px"
        >
          <option value="all">All Time</option>
          <option value="month">Last Month</option>
          <option value="quarter">Last Quarter</option>
          <option value="year">Last Year</option>
        </Select>
      </Flex>

      {/* Stats Overview */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 6 }} spacing={6} mb={8}>
        <StatCard
          title="Total Quizzes"
          value={overallStats.totalQuizzes}
          icon={FaChessBoard}
          colorScheme="blue"
        />
        <StatCard
          title="Total Puzzles"
          value={overallStats.totalPuzzles}
          icon={FaChessKnight}
          colorScheme="purple"
        />
        <StatCard
          title="Users"
          value={overallStats.totalUsers}
          icon={FaUsers}
          colorScheme="green"
        />
        <StatCard
          title="Submissions"
          value={overallStats.totalSubmissions}
          icon={FaChartLine}
          colorScheme="orange"
        />
        <StatCard
          title="Avg. Score"
          value={`${overallStats.averageScore}%`}
          icon={FaCheckCircle}
          colorScheme="teal"
        />
        <StatCard
          title="Completion Rate"
          value={`${overallStats.completionRate}%`}
          icon={FaCheckCircle}
          colorScheme="red"
        />
      </SimpleGrid>

      <Tabs colorScheme="blue" mb={8}>
        <TabList>
          <Tab>Quiz Performance</Tab>
          <Tab>User Performance</Tab>
          <Tab>Puzzle Analytics</Tab>
        </TabList>

        <TabPanels>
          {/* Quiz Performance */}
          <TabPanel>
            <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
              <GridItem>
                <Card>
                  <CardHeader>
                    <Heading size="md">Quiz Performance</Heading>
                  </CardHeader>
                  <CardBody>
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Quiz Name</Th>
                          <Th isNumeric>Submissions</Th>
                          <Th isNumeric>Avg. Score</Th>
                          <Th isNumeric>Completion Rate</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {quizPerformance.map(quiz => (
                          <Tr key={quiz.id}>
                            <Td>{quiz.title}</Td>
                            <Td isNumeric>{quiz.submissions}</Td>
                            <Td isNumeric>
                              <Badge
                                colorScheme={
                                  quiz.averageScore >= 80 ? 'green' :
                                  quiz.averageScore >= 70 ? 'blue' :
                                  quiz.averageScore >= 60 ? 'yellow' : 'red'
                                }
                              >
                                {quiz.averageScore}%
                              </Badge>
                            </Td>
                            <Td isNumeric>{quiz.completionRate}%</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </CardBody>
                </Card>
              </GridItem>
              <GridItem>
                <Card>
                  <CardHeader>
                    <Heading size="md">Quiz Insights</Heading>
                  </CardHeader>
                  <CardBody>
                    <Flex direction="column" gap={4}>
                      <Box>
                        <Flex align="center" mb={2}>
                          <Icon as={FaTrophy} color="green.500" mr={2} />
                          <Text fontWeight="bold">Highest Performing Quiz</Text>
                        </Flex>
                        <Text>Weekly Tactics Challenge (82% avg. score)</Text>
                      </Box>
                      <Box>
                        <Flex align="center" mb={2}>
                          <Icon as={FaTimesCircle} color="red.500" mr={2} />
                          <Text fontWeight="bold">Lowest Performing Quiz</Text>
                        </Flex>
                        <Text>Advanced Checkmates (62% avg. score)</Text>
                      </Box>
                      <Box>
                        <Flex align="center" mb={2}>
                          <Icon as={FaUsers} color="blue.500" mr={2} />
                          <Text fontWeight="bold">Most Popular Quiz</Text>
                        </Flex>
                        <Text>Weekly Tactics Challenge (128 submissions)</Text>
                      </Box>
                      <Box>
                        <Flex align="center" mb={2}>
                          <Icon as={FaClock} color="orange.500" mr={2} />
                          <Text fontWeight="bold">Quiz with Longest Avg. Completion Time</Text>
                        </Flex>
                        <Text>Middlegame Tactics (18.3 minutes)</Text>
                      </Box>
                    </Flex>
                  </CardBody>
                </Card>
              </GridItem>
            </Grid>
          </TabPanel>

          {/* User Performance */}
          <TabPanel>
            <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
              <GridItem>
                <Card>
                  <CardHeader>
                    <Heading size="md">Top Performers</Heading>
                  </CardHeader>
                  <CardBody>
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>User</Th>
                          <Th isNumeric>Quizzes Taken</Th>
                          <Th isNumeric>Avg. Score</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {topPerformers.map(user => (
                          <Tr key={user.id}>
                            <Td>
                              <Text fontWeight="bold">{user.name}</Text>
                              <Text fontSize="sm" color="gray.500">{user.email}</Text>
                            </Td>
                            <Td isNumeric>{user.quizzesTaken}</Td>
                            <Td isNumeric>
                              <Badge
                                colorScheme={
                                  user.averageScore >= 90 ? 'green' :
                                  user.averageScore >= 80 ? 'blue' :
                                  user.averageScore >= 70 ? 'yellow' : 'red'
                                }
                              >
                                {user.averageScore}%
                              </Badge>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </CardBody>
                </Card>
              </GridItem>
              <GridItem>
                <Card mb={6}>
                  <CardHeader>
                    <Heading size="md">User Group Analytics</Heading>
                  </CardHeader>
                  <CardBody>
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          <Th>Group</Th>
                          <Th isNumeric>Users</Th>
                          <Th isNumeric>Avg. Score</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {userGroups.map((group, index) => (
                          <Tr key={index}>
                            <Td>{group.name}</Td>
                            <Td isNumeric>{group.count}</Td>
                            <Td isNumeric>{group.averageScore}%</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader>
                    <Heading size="md">Monthly User Activity</Heading>
                  </CardHeader>
                  <CardBody>
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          <Th>Month</Th>
                          <Th isNumeric>Submissions</Th>
                          <Th isNumeric>New Users</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {monthlyActivity.map((month, index) => (
                          <Tr key={index}>
                            <Td>{month.month}</Td>
                            <Td isNumeric>{month.submissions}</Td>
                            <Td isNumeric>{month.newUsers}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </CardBody>
                </Card>
              </GridItem>
            </Grid>
          </TabPanel>

          {/* Puzzle Analytics */}
          <TabPanel>
            <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6}>
              <GridItem>
                <Card>
                  <CardHeader>
                    <Heading size="md">Puzzle Difficulty Analytics</Heading>
                  </CardHeader>
                  <CardBody>
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Difficulty</Th>
                          <Th isNumeric>Count</Th>
                          <Th isNumeric>Success Rate</Th>
                          <Th isNumeric>Avg. Time (sec)</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {puzzleDifficulty.map((difficulty, index) => (
                          <Tr key={index}>
                            <Td>
                              <Badge
                                colorScheme={
                                  difficulty.difficulty === 'Easy' ? 'green' :
                                  difficulty.difficulty === 'Medium' ? 'orange' : 'red'
                                }
                              >
                                {difficulty.difficulty}
                              </Badge>
                            </Td>
                            <Td isNumeric>{difficulty.count}</Td>
                            <Td isNumeric>{difficulty.averageSuccess}%</Td>
                            <Td isNumeric>{difficulty.averageTime}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </CardBody>
                </Card>
              </GridItem>
              <GridItem>
                <Card>
                  <CardHeader>
                    <Heading size="md">Puzzle Insights</Heading>
                  </CardHeader>
                  <CardBody>
                    <SimpleGrid columns={1} spacing={6}>
                      <Box>
                        <Heading size="sm" mb={3}>Most Challenging Puzzles</Heading>
                        <Table variant="simple" size="sm">
                          <Thead>
                            <Tr>
                              <Th>Puzzle</Th>
                              <Th isNumeric>Success Rate</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            <Tr>
                              <Td>Bishop Sacrifice</Td>
                              <Td isNumeric>42%</Td>
                            </Tr>
                            <Tr>
                              <Td>Queen Trap</Td>
                              <Td isNumeric>48%</Td>
                            </Tr>
                            <Tr>
                              <Td>Knight Endgame</Td>
                              <Td isNumeric>53%</Td>
                            </Tr>
                          </Tbody>
                        </Table>
                      </Box>
                      
                      <Box>
                        <Heading size="sm" mb={3}>Easiest Puzzles</Heading>
                        <Table variant="simple" size="sm">
                          <Thead>
                            <Tr>
                              <Th>Puzzle</Th>
                              <Th isNumeric>Success Rate</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            <Tr>
                              <Td>Back Rank Checkmate</Td>
                              <Td isNumeric>95%</Td>
                            </Tr>
                            <Tr>
                              <Td>Simple Fork</Td>
                              <Td isNumeric>92%</Td>
                            </Tr>
                            <Tr>
                              <Td>Queen's Gambit Trap</Td>
                              <Td isNumeric>89%</Td>
                            </Tr>
                          </Tbody>
                        </Table>
                      </Box>
                    </SimpleGrid>
                  </CardBody>
                </Card>
              </GridItem>
            </Grid>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Recommendations Section */}
      <Card>
        <CardHeader>
          <Heading size="md">System Recommendations</Heading>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <Box>
              <Flex align="center" mb={2}>
                <Icon as={FaChessBoard} color="blue.500" mr={2} />
                <Text fontWeight="bold">Quiz Recommendations</Text>
              </Flex>
              <Text mb={2}>Consider creating more intermediate-level quizzes, as this group has the highest engagement rate.</Text>
              <Text>Increase the number of opening puzzles, which have the highest success rate across all groups.</Text>
            </Box>
            <Box>
              <Flex align="center" mb={2}>
                <Icon as={FaUsers} color="green.500" mr={2} />
                <Text fontWeight="bold">User Engagement Recommendations</Text>
              </Flex>
              <Text mb={2}>Send email reminders to users who haven't completed a quiz in the last 2 weeks.</Text>
              <Text>Create more beginner-friendly content, as the completion rate for new users is below average.</Text>
            </Box>
          </SimpleGrid>
        </CardBody>
      </Card>
    </Box>
  );
};

export default Analytics; 