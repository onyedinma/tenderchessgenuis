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
import { useAuth } from '../contexts/AuthContext';

const AdminLayout: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, logout } = useAuth();
  const location = useLocation();
  
  // Responsive sidebar
  const isMobile = useBreakpointValue({ base: true, lg: false });
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Get current page title for breadcrumbs
  const getCurrentPageTitle = () => {
    const path = location.pathname;
    if (path === '/admin') return 'Dashboard';
    if (path === '/admin/students') return 'Student Management';
    if (path === '/admin/section1') return 'Section 1 Management';
    if (path === '/admin/section2') return 'Section 2 Management';
    if (path === '/admin/categories') return 'Category System';
    if (path === '/admin/scoring') return 'Scoring System';
    if (path === '/admin/controls') return 'Show Controls';
    if (path === '/admin/analytics') return 'Analytics';
    if (path === '/admin/question-banks') return 'Question Banks';
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
        {/* Header */}
        <Flex
          as="header"
          align="center"
          justify="space-between"
          py={4}
          px={6}
          bg={bgColor}
          borderBottomWidth="1px"
          borderColor={borderColor}
          position="sticky"
          top={0}
          zIndex={10}
        >
          <HStack spacing={4}>
            {isMobile && (
              <IconButton
                aria-label="Open sidebar"
                icon={<HamburgerIcon />}
                onClick={onOpen}
                variant="ghost"
              />
            )}
            <VStack align="start" spacing={0}>
              <Heading size="md" color="blue.600">Chess Quiz Show</Heading>
              <Breadcrumb separator={<ChevronRightIcon color="gray.500" />} fontSize="sm">
                <BreadcrumbItem>
                  <BreadcrumbLink as={RouterLink} to="/admin">
                    Admin
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {location.pathname !== '/admin' && (
                  <BreadcrumbItem isCurrentPage>
                    <BreadcrumbLink>{getCurrentPageTitle()}</BreadcrumbLink>
                  </BreadcrumbItem>
                )}
              </Breadcrumb>
            </VStack>
          </HStack>

          {/* Admin Profile Menu */}
          <Menu>
            <MenuButton>
              <HStack spacing={3} cursor="pointer">
                <Avatar
                  size="sm"
                  name={user?.name || 'Admin'}
                  src={user?.photoURL}
                  bg="blue.500"
                />
                <Text display={{ base: 'none', md: 'block' }} fontWeight="medium">
                  {user?.name || 'Admin'}
                </Text>
              </HStack>
            </MenuButton>
            <MenuList>
              <MenuItem icon={<FaUser />}>Profile</MenuItem>
              <MenuItem icon={<FaCog />}>Settings</MenuItem>
              <MenuDivider />
              <MenuItem icon={<FaSignOutAlt />} onClick={logout}>
                Logout
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>

        {/* Page Content */}
        <Box 
          as="main" 
          h="calc(100vh - 73px)" 
          overflowY="auto" 
          bg={useColorModeValue('gray.50', 'gray.900')}
        >
          <Outlet />
        </Box>
      </Box>
    </Flex>
  );
};

export default AdminLayout; 