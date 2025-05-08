import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Box, 
  Heading,
  Text,
  Flex,
  Stack,
  Avatar,
  useColorModeValue,
  Spinner,
  Divider,
  SimpleGrid,
  Badge,
  Icon,
  Button,
  Link,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  StatGroup,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  useToast,
  Card,
  CardHeader,
  CardBody
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  FaTrophy, 
  FaCalendarAlt, 
  FaClock, 
  FaPuzzlePiece, 
  FaChartLine, 
  FaChessKing, 
  FaCheckCircle,
  FaStar,
  FaChartBar
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  profileImage: string;
  joinDate: string;
  role: string;
  groups: { id: number; name: string }[];
}

interface QuizAttempt {
  id: number;
  quizId: number;
  title: string;
  score: number;
  completedAt: string;
  difficulty: string;
}

interface UserStats {
  totalQuizzes: number;
  averageScore: number;
  highestScore: number;
  totalPuzzlesSolved: number;
  accuracyRate: number;
  byDifficulty: {
    beginner: { count: number; avgScore: number };
    intermediate: { count: number; avgScore: number };
    advanced: { count: number; avgScore: number };
  };
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [quizHistory, setQuizHistory] = useState<QuizAttempt[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  useEffect(() => {
    // Simulating API call to fetch user data
    const fetchUserProfile = async () => {
      try {
        // In a real app, you would fetch this from your API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setUserStats({
          totalQuizzes: 12,
          averageScore: 76.5,
          highestScore: 95,
          totalPuzzlesSolved: 87,
          accuracyRate: 78.4,
          byDifficulty: {
            beginner: { count: 5, avgScore: 85.2 },
            intermediate: { count: 4, avgScore: 74.8 },
            advanced: { count: 3, avgScore: 67.3 }
          }
        });
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, []);
  
  if (loading) {
    return (
      <Flex justify="center" align="center" minH="50vh">
        <Spinner 
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="blue.500"
          size="xl"
        />
      </Flex>
    );
  }
  
  if (!user) {
    return (
      <Container maxW="container.xl" py={8}>
        <Text>Failed to load user profile. Please try again later.</Text>
      </Container>
    );
  }

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'green';
    if (score >= 75) return 'teal';
    if (score >= 60) return 'blue';
    if (score >= 40) return 'orange';
    return 'red';
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'Beginner': return 'green';
      case 'Intermediate': return 'blue';
      case 'Advanced': return 'red';
      default: return 'gray';
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setName(user?.name || '');
    setEmail(user?.email || '');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (!name) {
      newErrors.name = 'Name is required';
      isValid = false;
    }

    if (!email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }

    if (newPassword) {
      if (!currentPassword) {
        newErrors.currentPassword = 'Current password is required to set a new password';
        isValid = false;
      }

      if (newPassword.length < 6) {
        newErrors.newPassword = 'New password must be at least 6 characters';
        isValid = false;
      }

      if (newPassword !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // This would typically call an API endpoint to update the user profile
    setIsLoading(true);
    
    // Simulating API call with timeout
    setTimeout(() => {
      setIsLoading(false);
      setIsEditing(false);
      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    }, 1000);
  };

  // Mock data for now - would come from API in real app
  const recentActivity = [
    { id: 1, action: 'Completed Quiz', content: 'Chess Openings Fundamentals', date: '2023-10-15', score: '85%' },
    { id: 2, action: 'Started Quiz', content: 'Tactical Patterns', date: '2023-10-10', score: 'In progress' },
    { id: 3, action: 'Completed Quiz', content: 'Endgame Techniques', date: '2023-10-05', score: '72%' },
  ];

  // Mock user data for development/preview
  const userProfile: UserProfile = {
    id: user?.id || 1,
    name: user?.name || 'Guest User',
    email: user?.email || 'guest@example.com',
    profileImage: '',
    joinDate: '2023-04-15',
    role: user?.isAdmin ? 'admin' : 'user',
    groups: [
      { id: 1, name: 'Beginners' },
      { id: 2, name: 'Advanced Players' }
    ]
  };

  // Use mock data for development, or user data in production
  const groups = userProfile.groups;

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Profile header */}
        <Flex direction={{ base: 'column', md: 'row' }} gap={8} align="center">
          <Avatar
            size="2xl"
            name={user?.name}
            src="https://bit.ly/broken-link" // Would be user.avatar in real app
          />
          
          <Box flex="1">
            <Heading size="xl" mb={2}>
              {user?.name}
            </Heading>
            <Text color="gray.600" fontSize="lg">
              {user?.email}
            </Text>
            <HStack mt={4} spacing={4}>
              <Badge colorScheme={user?.isAdmin ? 'purple' : 'blue'} fontSize="md" px={2} py={1}>
                {user?.isAdmin ? 'Admin' : 'Player'}
              </Badge>
              {groups.map((group) => (
                <Badge key={group.id} colorScheme="green" fontSize="md" px={2} py={1}>
                  {group.name}
                </Badge>
              ))}
            </HStack>
          </Box>
          
          {!isEditing && (
            <Button colorScheme="blue" onClick={handleEdit}>
              Edit Profile
            </Button>
          )}
        </Flex>

        <Divider />

        {/* Edit profile form */}
        {isEditing ? (
          <Box as="form" onSubmit={handleSubmit}>
            <VStack spacing={5} align="stretch">
              <Heading size="md">Edit Profile</Heading>
              
              <FormControl isInvalid={!!errors.name}>
                <FormLabel>Name</FormLabel>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
                <FormErrorMessage>{errors.name}</FormErrorMessage>
              </FormControl>
              
              <FormControl isInvalid={!!errors.email}>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                />
                <FormErrorMessage>{errors.email}</FormErrorMessage>
              </FormControl>
              
              <Divider />
              
              <Heading size="sm">Change Password (optional)</Heading>
              
              <FormControl isInvalid={!!errors.currentPassword}>
                <FormLabel>Current Password</FormLabel>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                />
                <FormErrorMessage>{errors.currentPassword}</FormErrorMessage>
              </FormControl>
              
              <FormControl isInvalid={!!errors.newPassword}>
                <FormLabel>New Password</FormLabel>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
                <FormErrorMessage>{errors.newPassword}</FormErrorMessage>
              </FormControl>
              
              <FormControl isInvalid={!!errors.confirmPassword}>
                <FormLabel>Confirm New Password</FormLabel>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
                <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
              </FormControl>
              
              <HStack spacing={4} justify="flex-end">
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  colorScheme="blue"
                  isLoading={isLoading}
                  loadingText="Saving..."
                >
                  Save Changes
                </Button>
              </HStack>
            </VStack>
          </Box>
        ) : (
          <>
            {/* Profile stats and activity */}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
              <Box>
                <Heading size="md" mb={4}>
                  Recent Activity
                </Heading>
                <VStack spacing={4} align="stretch">
                  {recentActivity.map((activity) => (
                    <Card key={activity.id} variant="outline">
                      <CardHeader py={3}>
                        <Flex justify="space-between" align="center">
                          <Heading size="sm">{activity.action}</Heading>
                          <Text fontSize="sm" color="gray.500">
                            {activity.date}
                          </Text>
                        </Flex>
                      </CardHeader>
                      <CardBody pt={0}>
                        <Flex justify="space-between" align="center">
                          <Text>{activity.content}</Text>
                          <Badge
                            colorScheme={
                              activity.score === 'In progress'
                                ? 'yellow'
                                : parseInt(activity.score) > 80
                                ? 'green'
                                : parseInt(activity.score) > 60
                                ? 'blue'
                                : 'red'
                            }
                          >
                            {activity.score}
                          </Badge>
                        </Flex>
                      </CardBody>
                    </Card>
                  ))}
                </VStack>
              </Box>

              <Box>
                <Heading size="md" mb={4}>
                  Your Groups
                </Heading>
                {groups.length > 0 ? (
                  <VStack spacing={4} align="stretch">
                    {groups.map((group) => (
                      <Box
                        key={group.id}
                        p={4}
                        borderWidth="1px"
                        borderRadius="md"
                        boxShadow="sm"
                      >
                        <Heading size="sm" mb={2}>
                          {group.name}
                        </Heading>
                        <Text color="gray.600" fontSize="sm">
                          You have access to all quizzes in this group.
                        </Text>
                      </Box>
                    ))}
                  </VStack>
                ) : (
                  <Box p={4} borderWidth="1px" borderRadius="md">
                    <Text>You are not a member of any groups yet.</Text>
                  </Box>
                )}
              </Box>
            </SimpleGrid>
          </>
        )}
      </VStack>
    </Container>
  );
};

export default Profile; 