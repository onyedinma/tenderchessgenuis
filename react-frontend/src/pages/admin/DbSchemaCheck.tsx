import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  Heading,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Code,
  Badge,
  Divider,
  List,
  ListItem,
  ListIcon,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@chakra-ui/react';
import { CheckCircleIcon, WarningIcon, InfoIcon, RepeatIcon } from '@chakra-ui/icons';
import axios from 'axios';

const DbSchemaCheck: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [schemaData, setSchemaData] = useState<any>(null);
  const [updateResult, setUpdateResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const checkSchema = async () => {
    setLoading(true);
    setError(null);
    setUpdateResult(null);
    
    try {
      const response = await axios.get('/api/question-banks/check-db-schema.php');
      console.log('Schema check response:', response.data);
      setSchemaData(response.data);
    } catch (error) {
      console.error('Error checking schema:', error);
      setError('Failed to check database schema. Please ensure the API is accessible.');
    } finally {
      setLoading(false);
    }
  };

  const updateSchema = async () => {
    setUpdateLoading(true);
    setError(null);
    setUpdateResult(null);
    
    try {
      const response = await axios.post('/api/question-banks/update-db-schema.php');
      console.log('Schema update response:', response.data);
      setUpdateResult(response.data);
      
      // If update was successful, refresh schema info
      if (response.data.success) {
        await checkSchema();
        toast({
          title: 'Schema updated successfully',
          description: 'The database schema has been updated to include all required fields.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error updating schema:', error);
      setError('Failed to update database schema. Please check server logs for details.');
      toast({
        title: 'Update failed',
        description: 'Failed to update the database schema. Please check server logs.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setUpdateLoading(false);
    }
  };

  useEffect(() => {
    checkSchema();
  }, []);

  return (
    <Box p={6} maxW="1000px" mx="auto">
      <VStack spacing={6} align="stretch">
        <Box 
          borderRadius="lg" 
          bg="blue.50" 
          p={5} 
          borderWidth="1px" 
          borderColor="blue.200"
        >
          <Heading size="lg" mb={2} color="blue.700">Database Schema Check</Heading>
          <Text color="blue.600">
            This tool checks if your database has the required fields for chess move tracking and adds them if needed.
          </Text>
        </Box>

        <HStack>
          <Button 
            colorScheme="blue" 
            onClick={checkSchema} 
            isLoading={loading}
            leftIcon={<RepeatIcon />}
          >
            Check Database Schema
          </Button>
          
          <Button 
            colorScheme="green" 
            onClick={updateSchema} 
            isLoading={updateLoading}
            isDisabled={!schemaData || schemaData.schema_complete}
          >
            Update Schema
          </Button>
        </HStack>

        {error && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <AlertTitle>Error!</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <Box textAlign="center" py={10}>
            <Spinner size="xl" color="blue.500" />
            <Text mt={4} color="gray.600">Checking database schema...</Text>
          </Box>
        ) : schemaData ? (
          <Card variant="outline" borderRadius="md" shadow="md">
            <CardHeader bg={schemaData.schema_complete ? "green.50" : "yellow.50"} p={4}>
              <Heading size="md" color={schemaData.schema_complete ? "green.700" : "yellow.700"}>
                {schemaData.schema_complete ? (
                  <HStack>
                    <CheckCircleIcon />
                    <Text>Schema is Complete</Text>
                  </HStack>
                ) : (
                  <HStack>
                    <WarningIcon />
                    <Text>Schema Update Required</Text>
                  </HStack>
                )}
              </Heading>
            </CardHeader>
            
            <CardBody p={5}>
              <VStack align="stretch" spacing={4}>
                <Text fontSize="lg">{schemaData.message}</Text>
                
                {!schemaData.schema_complete && (
                  <>
                    <Alert status="warning" borderRadius="md">
                      <AlertIcon />
                      <Box>
                        <AlertTitle>Missing Fields</AlertTitle>
                        <AlertDescription>
                          The following fields are missing from your questions table:
                        </AlertDescription>
                        <List mt={2} ml={6}>
                          {schemaData.missing_fields.map((field: string) => (
                            <ListItem key={field}>
                              <ListIcon as={InfoIcon} color="yellow.500" />
                              <Code fontWeight="bold">{field}</Code>
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    </Alert>
                    
                    <Box>
                      <Heading size="sm" mb={2}>Current Table Columns</Heading>
                      <Table size="sm" variant="simple" borderRadius="md" overflow="hidden" borderWidth="1px">
                        <Thead bg="gray.50">
                          <Tr>
                            <Th>Column Name</Th>
                            <Th>Type</Th>
                            <Th>Nullable</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {schemaData.current_columns.map((column: any) => (
                            <Tr key={column.name}>
                              <Td fontWeight="medium">{column.name}</Td>
                              <Td>{column.type}</Td>
                              <Td>{column.nullable ? 'Yes' : 'No'}</Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </Box>
                  </>
                )}
                
                {schemaData.schema_complete && schemaData.sample_data && (
                  <Box>
                    <Heading size="sm" mb={2}>Sample Data Check</Heading>
                    <List spacing={2}>
                      <ListItem>
                        <HStack>
                          <Text fontWeight="medium">Algebraic Notation:</Text>
                          {schemaData.sample_data.has_algebraic_notation ? (
                            <Badge colorScheme="green">Present</Badge>
                          ) : (
                            <Badge colorScheme="yellow">Missing</Badge>
                          )}
                          {schemaData.sample_data.algebraic_notation_sample && (
                            <Text>Example: {schemaData.sample_data.algebraic_notation_sample}</Text>
                          )}
                        </HStack>
                      </ListItem>
                      
                      <ListItem>
                        <HStack>
                          <Text fontWeight="medium">Move Sequence:</Text>
                          {schemaData.sample_data.has_move_sequence ? (
                            <Badge colorScheme="green">Present</Badge>
                          ) : (
                            <Badge colorScheme="yellow">Missing</Badge>
                          )}
                        </HStack>
                        {schemaData.sample_data.move_sequence_sample && (
                          <Code p={2} mt={1} fontSize="xs" borderRadius="md" maxW="100%" overflowX="auto" display="block">
                            {schemaData.sample_data.move_sequence_sample}
                          </Code>
                        )}
                      </ListItem>
                    </List>
                  </Box>
                )}
              </VStack>
            </CardBody>
            
            <CardFooter bg="gray.50" p={4} borderTopWidth="1px">
              {schemaData.schema_complete ? (
                <Alert status="success" borderRadius="md">
                  <AlertIcon />
                  Your database schema is ready for chess move tracking! You can now create questions with algebraic notation and move sequences.
                </Alert>
              ) : (
                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  Click "Update Schema" to add the missing fields to your database and enable chess move tracking.
                </Alert>
              )}
            </CardFooter>
          </Card>
        ) : null}
        
        {updateResult && (
          <Alert 
            status={updateResult.success ? "success" : "error"} 
            borderRadius="md"
            variant="left-accent"
          >
            <AlertIcon />
            <Box>
              <AlertTitle>{updateResult.success ? "Update Successful" : "Update Failed"}</AlertTitle>
              <AlertDescription>{updateResult.message}</AlertDescription>
              
              {updateResult.success && updateResult.details && (
                <VStack align="start" mt={2} spacing={1}>
                  <Text fontWeight="bold">Update Details:</Text>
                  <Text>Columns Added: {updateResult.details.columns_added.join(', ')}</Text>
                  <Text>Records Updated: {updateResult.details.records_updated}</Text>
                </VStack>
              )}
            </Box>
          </Alert>
        )}
      </VStack>
    </Box>
  );
};

export default DbSchemaCheck;
