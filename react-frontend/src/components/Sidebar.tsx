import React from 'react';
import {
  Box,
  VStack,
  Text,
  Link,
  Icon,
  Heading,
  Divider,
  useColorModeValue,
  Badge,
  HStack,
} from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  FaHome,
  FaChessBoard,
  FaUsers,
  FaChartBar,
  FaArrowLeft,
  FaClock,
  FaTrophy,
  FaClipboardList,
  FaDatabase,
  FaTable,
  FaChessRook,
  FaHighlighter,
  FaEye,
  FaGraduationCap,
  FaChessPawn,
} from 'react-icons/fa';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const activeBg = useColorModeValue('blue.50', 'blue.900');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const activeTextColor = useColorModeValue('blue.600', 'blue.200');
  const sectionColor = useColorModeValue('gray.500', 'gray.400');

  const isActive = (path: string) => location.pathname === path;

  const NavLink = ({ to, icon, children, isNew = false }: { to: string; icon: any; children: React.ReactNode; isNew?: boolean }) => (
    <Link
      as={RouterLink}
      to={to}
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      px={4}
      py={3}
      rounded="md"
      bg={isActive(to) ? activeBg : 'transparent'}
      color={isActive(to) ? activeTextColor : textColor}
      _hover={{
        bg: isActive(to) ? activeBg : hoverBg,
        color: isActive(to) ? activeTextColor : textColor,
        textDecoration: 'none',
      }}
      transition="all 0.2s"
      fontSize="sm"
      fontWeight={isActive(to) ? "medium" : "normal"}
    >
      <HStack>
        <Icon as={icon} fontSize="18px" mr={3} />
        <Text>{children}</Text>
      </HStack>
      {isNew && (
        <Badge colorScheme="green" variant="solid" fontSize="xs">
          New
        </Badge>
      )}
    </Link>
  );
  
  const NavSection = ({ title }: { title: string }) => (
    <Text 
      fontSize="xs" 
      fontWeight="bold" 
      color={sectionColor} 
      textTransform="uppercase" 
      letterSpacing="wider"
      mt={4}
      mb={2}
      px={4}
    >
      {title}
    </Text>
  );

  return (
    <Box
      as="nav"
      pos="fixed"
      h="100vh"
      w="250px"
      borderRightWidth="1px"
      bg={useColorModeValue('white', 'gray.800')}
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      overflowY="auto"
    >
      <VStack spacing={0} align="stretch" p={4}>
        <Heading size="md" px={4} py={4} mb={2}>
          Admin Dashboard
        </Heading>

        {/* Main Navigation */}
        <NavLink to="/admin" icon={FaHome}>
          Dashboard
        </NavLink>
        
        <Divider my={3} />
        
        {/* Quiz Management Section */}
        <NavSection title="Quiz Management" />
        
        <NavLink to="/admin/question-banks" icon={FaDatabase}>
          Question Banks
        </NavLink>
        
        <NavLink to="/admin/highlighted-questions" icon={FaHighlighter} isNew>
          Highlight Questions
        </NavLink>
        
        <NavLink to="/admin/show-controls" icon={FaEye}>
          Show Controls
        </NavLink>
        
        <Divider my={3} />
        
        {/* Student Management Section */}
        <NavSection title="Student Management" />
        
        <NavLink to="/admin/students" icon={FaUsers}>
          Students
        </NavLink>
        
        <NavLink to="/admin/categories" icon={FaTrophy}>
          Category System
        </NavLink>

        <NavLink to="/admin/scoring" icon={FaClipboardList}>
          Scoring System
        </NavLink>
        
        <Divider my={3} />
        
        {/* Analysis & Settings */}
        <NavSection title="Analysis & Settings" />
        
        <NavLink to="/admin/analytics" icon={FaChartBar}>
          Analytics
        </NavLink>
        
        <NavLink to="/admin/database-info" icon={FaTable}>
          Database Info
        </NavLink>

        <Box flex={1} />
        <Divider my={4} />

        {/* Return to Site Link */}
        <NavLink to="/" icon={FaArrowLeft}>
          Return to Site
        </NavLink>
      </VStack>
    </Box>
  );
};

export default Sidebar; 