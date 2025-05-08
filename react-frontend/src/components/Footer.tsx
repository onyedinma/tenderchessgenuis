import React from 'react';
import {
  Box,
  Container,
  Stack,
  Text,
  Link,
  useColorModeValue,
  Flex,
  Divider,
  Icon
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FaChess, FaGithub, FaTwitter } from 'react-icons/fa';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <Box
      bg={useColorModeValue('gray.50', 'gray.900')}
      color={useColorModeValue('gray.700', 'gray.200')}
      borderTop="1px"
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      as="footer"
      mt="auto"
    >
      <Container
        as={Stack}
        maxW="container.xl"
        py={6}
        spacing={4}
      >
        <Flex 
          direction={{ base: 'column', md: 'row' }} 
          justify="space-between" 
          align={{ base: 'center', md: 'flex-start' }}
          gap={8}
        >
          <Stack spacing={4} align={{ base: 'center', md: 'flex-start' }} mb={{ base: 4, md: 0 }}>
            <Flex align="center">
              <FaChess size="1.5em" />
              <Text fontWeight="bold" fontSize="xl" ml={2}>Chess Quiz</Text>
            </Flex>
            <Text>
              Improve your chess skills with interactive puzzles and quizzes
            </Text>
            <Flex gap={4}>
              <Link href="https://github.com" isExternal>
                <Icon as={FaGithub} boxSize={5} />
              </Link>
              <Link href="https://twitter.com" isExternal>
                <Icon as={FaTwitter} boxSize={5} />
              </Link>
            </Flex>
          </Stack>
          
          <Stack direction={{ base: 'column', md: 'row' }} spacing={6}>
            <Stack align="flex-start">
              <Text fontWeight="600" fontSize="md" mb={2}>App</Text>
              <Link as={RouterLink} to="/">Home</Link>
              <Link as={RouterLink} to="/quizzes">Quizzes</Link>
              <Link as={RouterLink} to="/profile">Profile</Link>
            </Stack>
            <Stack align="flex-start">
              <Text fontWeight="600" fontSize="md" mb={2}>Support</Text>
              <Link as={RouterLink} to="/about">About</Link>
              <Link as={RouterLink} to="/faq">FAQ</Link>
              <Link as={RouterLink} to="/contact">Contact</Link>
            </Stack>
            <Stack align="flex-start">
              <Text fontWeight="600" fontSize="md" mb={2}>Legal</Text>
              <Link as={RouterLink} to="/privacy">Privacy Policy</Link>
              <Link as={RouterLink} to="/terms">Terms of Service</Link>
            </Stack>
          </Stack>
        </Flex>
        
        <Divider />
        
        <Text pt={4} fontSize="sm" textAlign="center">
          © {currentYear} Chess Quiz Application. All rights reserved.
        </Text>
      </Container>
    </Box>
  );
};

export default Footer; 