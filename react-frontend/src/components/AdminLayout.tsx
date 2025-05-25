import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import {
  Box,
  Flex,
  IconButton,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerBody,
  useBreakpointValue,
  Text,
  HStack,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Heading,
  VStack,
  useColorModeValue,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from '@chakra-ui/react';
import { HamburgerIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { FaCog, FaSignOutAlt, FaUser } from 'react-icons/fa';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import Sidebar from './Sidebar';
import AdminNavigation from './AdminNavigation';
import { useAuth } from '../contexts/AuthContext';

const AdminLayout: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, logout } = useAuth();
  const location = useLocation();
  
  // Responsive sidebar
  const isMobile = useBreakpointValue({ base: true, lg: false });
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Check if current page should show the quiz workflow navigation
  const showQuizNavigation = () => {
    const quizRelatedPaths = [
      '/admin/question-banks',
      '/admin/highlighted-questions',
      '/admin/show-controls',
      '/admin/controls'
    ];
    return quizRelatedPaths.some(path => location.pathname.startsWith(path));
  };
  
  // Get current page title for breadcrumbs
  const getCurrentPageTitle = () => {
    const path = location.pathname;
    if (path === '/admin') return 'Dashboard';
    if (path === '/admin/students') return 'Student Management';
    if (path === '/admin/categories') return 'Category System';
    if (path === '/admin/scoring') return 'Scoring System';
    if (path === '/admin/controls') return 'Show Controls';
    if (path === '/admin/analytics') return 'Analytics';
    if (path === '/admin/question-banks') return 'Question Banks';
    if (path === '/admin/highlighted-questions') return 'Highlighted Questions';
    if (path === '/admin/show-controls') return 'Show Controls';
    if (path === '/admin/db-schema-check') return 'Database Schema Check';
    if (path === '/admin/database-info') return 'Database Info';
    return 'Admin';
  };

  return (
    <Flex h="100vh" overflow="hidden">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Box w="250px" display={{ base: 'none', lg: 'block' }}>
          <Sidebar />
        </Box>
      )}

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerBody p={0}>
            <Sidebar />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Main Content */}
      <Box flex="1" overflow="auto">
        {/* Page Content */}
        <Box 
          as="main" 
          h="calc(100vh - 73px)" 
          overflowY="auto" 
          bg={useColorModeValue('gray.50', 'gray.900')}
          p={4}
        >
          {/* Quiz Workflow Navigation for relevant pages */}
          {showQuizNavigation() && <AdminNavigation />}
          
          <Box pt={showQuizNavigation() ? 0 : 4}>
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Flex>
  );
};

export default AdminLayout; 