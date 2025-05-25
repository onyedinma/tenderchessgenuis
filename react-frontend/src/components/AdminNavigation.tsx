import React from 'react';
import { 
  Box, 
  Flex, 
  HStack, 
  Button, 
  Text, 
  useColorModeValue, 
  Icon, 
  Tooltip,
  Divider
} from '@chakra-ui/react';
import { 
  FaChessBoard, 
  FaPlus, 
  FaHighlighter, 
  FaEye, 
  FaChessPawn,
  FaArrowRight
} from 'react-icons/fa';
import { useLocation, Link as RouterLink } from 'react-router-dom';

const AdminNavigation: React.FC = () => {
  const location = useLocation();
  const activeBg = useColorModeValue('blue.50', 'blue.900');
  const activeBorder = useColorModeValue('blue.500', 'blue.200');
  
  const steps = [
    {
      name: 'Create & Manage Banks',
      path: '/admin/question-banks',
      icon: FaChessBoard,
      tooltip: 'Create question banks and add questions to them',
    },
    {
      name: 'Highlight Questions',
      path: '/admin/highlighted-questions',
      icon: FaHighlighter,
      tooltip: 'Highlight questions from any bank to make them available for students',
    },
    {
      name: 'Show Controls',
      path: '/admin/show-controls',
      icon: FaEye,
      tooltip: 'Control what students see during quizzes',
    }
  ];
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <Box 
      p={4} 
      bg={useColorModeValue('white', 'gray.800')} 
      shadow="md" 
      borderRadius="md"
      mb={6}
    >
      <Text fontSize="sm" fontWeight="medium" mb={3} color="gray.500">
        QUIZ WORKFLOW
      </Text>
      
      <Flex 
        direction={{ base: 'column', md: 'row' }} 
        justify="space-between" 
        align="center"
        wrap="wrap"
      >
        {steps.map((step, index) => (
          <React.Fragment key={step.path}>
            <Tooltip label={step.tooltip} placement="top" hasArrow>
              <Button
                as={RouterLink}
                to={step.path}
                size="md"
                leftIcon={<Icon as={step.icon} />}
                colorScheme={isActive(step.path) ? 'blue' : 'gray'}
                variant={isActive(step.path) ? 'solid' : 'outline'}
                mb={{ base: 2, md: 0 }}
                p={6}
                flexGrow={1}
                maxW={{ base: 'full', md: '200px' }}
              >
                {step.name}
              </Button>
            </Tooltip>
            
            {index < steps.length - 1 && (
              <Icon 
                as={FaArrowRight} 
                mx={4} 
                color="gray.400" 
                display={{ base: 'none', md: 'block' }}
              />
            )}
          </React.Fragment>
        ))}
      </Flex>
      
      <Divider my={4} />
      
      <Text fontSize="xs" color="gray.500" textAlign="center">
        Create question banks → Add questions → Highlight questions → Activate for students
      </Text>
    </Box>
  );
};

export default AdminNavigation; 