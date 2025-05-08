import React from 'react';
import { Box, Heading, Text, Button, Flex, Image } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      minH="70vh"
      textAlign="center"
      p={8}
    >
      <Heading as="h1" size="4xl" mb={4} color="blue.500">
        404
      </Heading>
      
      <Image
        src="https://media.giphy.com/media/ZYKNCcCyiU2mxmegmH/giphy.gif"
        alt="Chess piece falling"
        height="200px"
        mb={8}
        borderRadius="md"
      />
      
      <Heading as="h2" size="xl" mb={4}>
        Page Not Found
      </Heading>
      
      <Text fontSize="lg" mb={8} maxW="md">
        Oops! The page you're looking for seems to have made an illegal move and disappeared from the board.
      </Text>
      
      <Flex gap={4} flexWrap="wrap" justify="center">
        <Button
          colorScheme="blue"
          size="lg"
          onClick={() => navigate('/')}
        >
          Go to Home
        </Button>
        
        <Button
          variant="outline"
          size="lg"
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
      </Flex>
    </Flex>
  );
};

export default NotFound; 