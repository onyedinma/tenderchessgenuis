import React from 'react';
import { Flex, Spinner, Text } from '@chakra-ui/react';

const LoadingSpinner: React.FC = () => {
  return (
    <Flex
      justifyContent="center"
      alignItems="center"
      height="100vh"
      width="100%"
      flexDirection="column"
    >
      <Spinner
        thickness="4px"
        speed="0.65s"
        emptyColor="gray.200"
        color="blue.500"
        size="xl"
      />
      <Text mt={4} fontSize="lg" color="gray.600">
        Loading...
      </Text>
    </Flex>
  );
};

export default LoadingSpinner; 