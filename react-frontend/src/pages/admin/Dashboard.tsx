import React from 'react';
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
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import {
  FaUsers,
  FaChessBoard,
  FaTrophy,
  FaClock,
  FaChartLine,
  FaUserGraduate,
} from 'react-icons/fa';

const Dashboard: React.FC = () => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Mock data - replace with actual API calls
  const stats = {
    totalStudents: 24,
    activeStudents: 18,
    section1Questions: 40,
    section2Questions: 25,
    goldenCategory: 5,
    silverCategory: 8,
    bronzeCategory: 11,
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
              <Progress value={(stats.goldenCategory / stats.totalStudents) * 100} colorScheme="yellow" />
              
              <HStack justify="space-between">
                <Text>Silver Category (60-70)</Text>
                <Badge colorScheme="gray">{stats.silverCategory} students</Badge>
              </HStack>
              <Progress value={(stats.silverCategory / stats.totalStudents) * 100} colorScheme="gray" />
              
              <HStack justify="space-between">
                <Text>Bronze Category (0-50)</Text>
                <Badge colorScheme="orange">{stats.bronzeCategory} students</Badge>
              </HStack>
              <Progress value={(stats.bronzeCategory / stats.totalStudents) * 100} colorScheme="orange" />
            </VStack>
          </CardBody>
        </Card>

        {/* Quick Actions */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          <QuickActionCard
            title="Student Management"
            description="Add, remove, or modify student information and track their progress."
            to="/admin/students"
            icon={FaUserGraduate}
          />
          <QuickActionCard
            title="Show Controls"
            description="Control quiz sections, timers, and manage question delivery."
            to="/admin/controls"
            icon={FaClock}
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