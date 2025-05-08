import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  Text,
  Button,
  Stack,
  Link,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure,
  IconButton,
  HStack,
  Avatar,
  useColorModeValue,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { useAuth } from '../contexts/AuthContext';

// Navigation links
const Links = [
  { name: 'Home', path: '/' },
  { name: 'Quizzes', path: '/quizzes' },
];

const NavLink = ({ children, path }: { children: React.ReactNode; path: string }) => (
  <Link
    as={RouterLink}
    px={2}
    py={1}
    rounded="md"
    _hover={{
      textDecoration: 'none',
      bg: useColorModeValue('gray.200', 'gray.700'),
    }}
    to={path}
  >
    {children}
  </Link>
);

const Header: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <Box bg={useColorModeValue('white', 'gray.900')} px={4} boxShadow="sm">
      <Flex h={16} alignItems="center" justifyContent="space-between">
        <IconButton
          size="md"
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          aria-label="Open Menu"
          display={{ md: 'none' }}
          onClick={isOpen ? onClose : onOpen}
        />
        
        <HStack spacing={8} alignItems="center">
          <Box fontWeight="bold" fontSize="xl">
            <Text
              as={RouterLink}
              to="/"
              _hover={{ textDecoration: 'none' }}
              display="flex"
              alignItems="center"
            >
              ♟️ Chess Genius
            </Text>
          </Box>
          <HStack as="nav" spacing={4} display={{ base: 'none', md: 'flex' }}>
            {Links.map((link) => (
              <NavLink key={link.name} path={link.path}>
                {link.name}
              </NavLink>
            ))}
          </HStack>
        </HStack>
        
        <Flex alignItems="center">
          {user ? (
            <Menu>
              <MenuButton
                as={Button}
                rounded="full"
                variant="link"
                cursor="pointer"
                minW={0}
              >
                <HStack>
                  <Avatar
                    size="sm"
                    name={user?.name}
                  />
                  <Text display={{ base: 'none', md: 'flex' }}>{user?.name}</Text>
                  <ChevronDownIcon />
                </HStack>
              </MenuButton>
              <MenuList>
                <MenuItem as={RouterLink} to="/profile">Profile</MenuItem>
                {user.isAdmin && (
                  <MenuItem as={RouterLink} to="/admin">Admin Dashboard</MenuItem>
                )}
                <MenuDivider />
                <MenuItem onClick={handleLogout}>Sign Out</MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <Stack
              flex={{ base: 1, md: 0 }}
              justify="flex-end"
              direction="row"
              spacing={6}
            >
              <Button
                as={RouterLink}
                fontSize="sm"
                fontWeight={400}
                variant="link"
                to="/login"
              >
                Sign In
              </Button>
              <Button
                as={RouterLink}
                display={{ base: 'none', md: 'inline-flex' }}
                fontSize="sm"
                fontWeight={600}
                color="white"
                bg="blue.400"
                to="/register"
                _hover={{
                  bg: 'blue.500',
                }}
              >
                Sign Up
              </Button>
            </Stack>
          )}
        </Flex>
      </Flex>

      {/* Mobile nav */}
      {isOpen ? (
        <Box pb={4} display={{ md: 'none' }}>
          <Stack as="nav" spacing={4}>
            {Links.map((link) => (
              <NavLink key={link.name} path={link.path}>
                {link.name}
              </NavLink>
            ))}
          </Stack>
        </Box>
      ) : null}
    </Box>
  );
};

export default Header; 