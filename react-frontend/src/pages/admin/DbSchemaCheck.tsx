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
import { getQuizzes } from '../../services/api';

const DbSchemaCheck: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [schemaInfo, setSchemaInfo] = useState<any>(null);
  const [updateResult, setUpdateResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const fetchSchemaInfo = async () => {
    try {
      const response = await getQuizzes();
      if (response.data && response.data.success) {
        setSchemaInfo(response.data.schemaInfo);
      } else {
        toast({
          title: 'Error',
          description: response.data.message || 'Failed to fetch schema info',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error fetching schema info:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch schema info',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const updateSchema = async () => {
    setUpdateLoading(true);
    setError(null);
    setUpdateResult(null);
    
    try {
      const response = await getQuizzes('/api/question-banks/update-db-schema.php');
      console.log('Schema update response:', response.data);
      setUpdateResult(response.data);
      
      // If update was successful, refresh schema info
      if (response.data.success) {
        await fetchSchemaInfo();
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
    fetchSchemaInfo();
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
            onClick={fetchSchemaInfo} 
            isLoading={loading}
            leftIcon={<RepeatIcon />}
          >
            Check Database Schema
          </Button>
          
          <Button 
            colorScheme="green" 
            onClick={updateSchema} 
            isLoading={updateLoading}
            isDisabled={!schemaInfo || schemaInfo.schema_complete}
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
        ) : schemaInfo ? (
          <Card variant="outline" borderRadius="md" shadow="md">
            <CardHeader bg={schemaInfo.schema_complete ? "green.50" : "yellow.50"} p={4}>
              <Heading size="md" color={schemaInfo.schema_complete ? "green.700" : "yellow.700"}>
                {schemaInfo.schema_complete ? (
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
                <Text fontSize="lg">{schemaInfo.message}</Text>
                
                {!schemaInfo.schema_complete && (
                  <>
                    <Alert status="warning" borderRadius="md">
                      <AlertIcon />
                      <Box>
                        <AlertTitle>Missing Fields</AlertTitle>
                        <AlertDescription>
                          The following fields are missing from your questions table:
                        </AlertDescription>
                        <List mt={2} ml={6}>
                          {schemaInfo.missing_fields.map((field: string) => (
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
                          {schemaInfo.current_columns.map((column: any) => (
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
                
                {schemaInfo.schema_complete && schemaInfo.sample_data && (
                  <Box>
                    <Heading size="sm" mb={2}>Sample Data Check</Heading>
                    <List spacing={2}>
                      <ListItem>
                        <HStack>
                          <Text fontWeight="medium">Algebraic Notation:</Text>
                          {schemaInfo.sample_data.has_algebraic_notation ? (
                            <Badge colorScheme="green">Present</Badge>
                          ) : (
                            <Badge colorScheme="yellow">Missing</Badge>
                          )}
                          {schemaInfo.sample_data.algebraic_notation_sample && (
                            <Text>Example: {schemaInfo.sample_data.algebraic_notation_sample}</Text>
                          )}
                        </HStack>
                      </ListItem>
                      
                      <ListItem>
                        <HStack>
                          <Text fontWeight="medium">Move Sequence:</Text>
                          {schemaInfo.sample_data.has_move_sequence ? (
                            <Badge colorScheme="green">Present</Badge>
                          ) : (
                            <Badge colorScheme="yellow">Missing</Badge>
                          )}
                        </HStack>
                        {schemaInfo.sample_data.move_sequence_sample && (
                          <Code p={2} mt={1} fontSize="xs" borderRadius="md" maxW="100%" overflowX="auto" display="block">
                            {schemaInfo.sample_data.move_sequence_sample}
                          </Code>
                        )}
                      </ListItem>
                    </List>
                  </Box>
                )}
              </VStack>
            </CardBody>
            
            <CardFooter bg="gray.50" p={4} borderTopWidth="1px">
              {schemaInfo.schema_complete ? (
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
