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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
  useToast,
  Card,
  CardHeader,
  CardBody,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Tag,
  Tooltip,
} from '@chakra-ui/react';
import { RepeatIcon, InfoIcon } from '@chakra-ui/icons';
import { getQuizzes } from '../../services/api';

interface ColumnInfo {
  Field: string;
  Type: string;
  Null: string;
  Key: string;
  Default: string | null;
  Extra: string;
  Comment: string;
}

interface Relationship {
  table_name: string;
  column_name: string;
  referenced_table: string;
  referenced_column: string;
}

interface TableInfo {
  structure: ColumnInfo[];
  sample_data: any[];
  row_count: number;
}

interface DatabaseResponse {
  success: boolean;
  database_name: string;
  tables: {
    question_banks: TableInfo;
    questions: TableInfo;
  };
  relationships: Relationship[];
  message?: string;
}

const DatabaseInfo: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [dbInfo, setDbInfo] = useState<DatabaseResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  
  const bgLight = useColorModeValue('blue.50', 'blue.900');
  const bgDark = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const fetchDatabaseInfo = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getQuizzes();
      console.log('Database info response:', response.data);
      setDbInfo(response.data);
      
      if (response.data.success) {
        toast({
          title: 'Data retrieved successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error fetching database info:', error);
      setError('Failed to retrieve database information. Please ensure the API is accessible.');
      toast({
        title: 'Error',
        description: 'Failed to retrieve database information',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatabaseInfo();
  }, []);

  const renderTableStructure = (columns: ColumnInfo[]) => (
    <Table size="sm" variant="simple" borderWidth="1px" borderRadius="md">
      <Thead bg={bgLight}>
        <Tr>
          <Th>Field</Th>
          <Th>Type</Th>
          <Th>Null</Th>
          <Th>Key</Th>
          <Th>Default</Th>
          <Th>Extra</Th>
        </Tr>
      </Thead>
      <Tbody>
        {columns.map((col) => (
          <Tr key={col.Field}>
            <Td fontWeight="medium">{col.Field}</Td>
            <Td>
              <Code>{col.Type}</Code>
            </Td>
            <Td>{col.Null === 'YES' ? 'YES' : 'NO'}</Td>
            <Td>
              {col.Key && (
                <Tooltip hasArrow label={getKeyDescription(col.Key)}>
                  <Badge colorScheme={getKeyColor(col.Key)}>{col.Key}</Badge>
                </Tooltip>
              )}
            </Td>
            <Td>{col.Default === null ? <Text color="gray.500">NULL</Text> : col.Default}</Td>
            <Td>{col.Extra}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );

  const getKeyColor = (key: string): string => {
    switch (key) {
      case 'PRI':
        return 'red';
      case 'UNI':
        return 'purple';
      case 'MUL':
        return 'blue';
      default:
        return 'gray';
    }
  };

  const getKeyDescription = (key: string): string => {
    switch (key) {
      case 'PRI':
        return 'Primary Key';
      case 'UNI':
        return 'Unique Key';
      case 'MUL':
        return 'Multiple Key (Index)';
      default:
        return key;
    }
  };

  const renderSampleData = (data: any[]) => {
    if (!data || data.length === 0) {
      return (
        <Alert status="info">
          <AlertIcon />
          No sample data available
        </Alert>
      );
    }

    // Extract column names from the first row
    const columns = Object.keys(data[0]);

    return (
      <Box overflowX="auto">
        <Table size="sm" variant="simple" borderWidth="1px" borderRadius="md">
          <Thead bg={bgLight}>
            <Tr>
              {columns.map((col) => (
                <Th key={col}>{col}</Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {data.map((row, idx) => (
              <Tr key={idx}>
                {columns.map((col) => (
                  <Td key={`${idx}-${col}`}>
                    {typeof row[col] === 'object'
                      ? JSON.stringify(row[col])
                      : String(row[col] === null ? 'NULL' : row[col])}
                  </Td>
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    );
  };

  const renderRelationships = (relationships: Relationship[]) => (
    <Table size="sm" variant="simple" borderWidth="1px" borderRadius="md">
      <Thead bg={bgLight}>
        <Tr>
          <Th>Table</Th>
          <Th>Column</Th>
          <Th>References</Th>
        </Tr>
      </Thead>
      <Tbody>
        {relationships.map((rel, idx) => (
          <Tr key={idx}>
            <Td fontWeight="medium">{rel.table_name}</Td>
            <Td>{rel.column_name}</Td>
            <Td>
              <HStack>
                <Text>{rel.referenced_table}</Text>
                <Text color="gray.500">({rel.referenced_column})</Text>
              </HStack>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );

  return (
    <Box p={6} maxW="1200px" mx="auto">
      <VStack spacing={6} align="stretch">
        <Box 
          borderRadius="lg" 
          bg="blue.50" 
          p={5} 
          borderWidth="1px" 
          borderColor="blue.200"
        >
          <Heading size="lg" mb={2} color="blue.700">Database Information</Heading>
          <Text color="blue.600">
            View detailed information about the questions and question banks tables in the database.
          </Text>
        </Box>

        <HStack>
          <Button 
            colorScheme="blue" 
            onClick={fetchDatabaseInfo} 
            isLoading={loading}
            leftIcon={<RepeatIcon />}
          >
            Refresh Database Info
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
            <Text mt={4} color="gray.600">Fetching database information...</Text>
          </Box>
        ) : dbInfo ? (
          <VStack spacing={6} align="stretch">
            <Card variant="outline" borderRadius="md" shadow="md">
              <CardHeader bg={bgLight} p={4}>
                <Heading size="md" color="blue.700">
                  Database: {dbInfo.database_name}
                </Heading>
              </CardHeader>
              <CardBody>
                <HStack spacing={4} mb={4}>
                  <Stat 
                    label="Question Banks" 
                    value={dbInfo.tables.question_banks.row_count} 
                    colorScheme="purple"
                  />
                  <Stat 
                    label="Questions" 
                    value={dbInfo.tables.questions.row_count} 
                    colorScheme="blue"
                  />
                </HStack>
              </CardBody>
            </Card>

            <Tabs variant="enclosed" colorScheme="blue">
              <TabList>
                <Tab fontWeight="medium">Question Banks</Tab>
                <Tab fontWeight="medium">Questions</Tab>
                <Tab fontWeight="medium">Relationships</Tab>
              </TabList>

              <TabPanels>
                <TabPanel p={0} pt={4}>
                  <Accordion allowMultiple defaultIndex={[0]} borderWidth="1px" borderRadius="md">
                    <AccordionItem borderTop="none">
                      <AccordionButton py={3} bg={bgLight}>
                        <Heading size="sm" flex="1" textAlign="left">
                          Table Structure
                        </Heading>
                        <AccordionIcon />
                      </AccordionButton>
                      <AccordionPanel pb={4} bg={bgDark}>
                        {renderTableStructure(dbInfo.tables.question_banks.structure)}
                      </AccordionPanel>
                    </AccordionItem>

                    <AccordionItem borderBottom="none">
                      <AccordionButton py={3} bg={bgLight}>
                        <Heading size="sm" flex="1" textAlign="left">
                          Sample Data
                        </Heading>
                        <AccordionIcon />
                      </AccordionButton>
                      <AccordionPanel pb={4} bg={bgDark}>
                        {renderSampleData(dbInfo.tables.question_banks.sample_data)}
                      </AccordionPanel>
                    </AccordionItem>
                  </Accordion>
                </TabPanel>

                <TabPanel p={0} pt={4}>
                  <Accordion allowMultiple defaultIndex={[0]} borderWidth="1px" borderRadius="md">
                    <AccordionItem borderTop="none">
                      <AccordionButton py={3} bg={bgLight}>
                        <Heading size="sm" flex="1" textAlign="left">
                          Table Structure
                        </Heading>
                        <AccordionIcon />
                      </AccordionButton>
                      <AccordionPanel pb={4} bg={bgDark}>
                        {renderTableStructure(dbInfo.tables.questions.structure)}
                      </AccordionPanel>
                    </AccordionItem>

                    <AccordionItem borderBottom="none">
                      <AccordionButton py={3} bg={bgLight}>
                        <Heading size="sm" flex="1" textAlign="left">
                          Sample Data
                        </Heading>
                        <AccordionIcon />
                      </AccordionButton>
                      <AccordionPanel pb={4} bg={bgDark}>
                        {renderSampleData(dbInfo.tables.questions.sample_data)}
                      </AccordionPanel>
                    </AccordionItem>
                  </Accordion>
                </TabPanel>

                <TabPanel p={0} pt={4}>
                  <Box borderWidth="1px" borderRadius="md" p={4}>
                    {dbInfo.relationships && dbInfo.relationships.length > 0 ? (
                      renderRelationships(dbInfo.relationships)
                    ) : (
                      <Alert status="info">
                        <AlertIcon />
                        No relationship information available
                      </Alert>
                    )}
                  </Box>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </VStack>
        ) : null}
      </VStack>
    </Box>
  );
};

// Helper component for stats
const Stat: React.FC<{ label: string; value: number; colorScheme: string }> = ({ 
  label, 
  value, 
  colorScheme 
}) => (
  <Box 
    borderWidth="1px" 
    borderRadius="md" 
    p={3}
    minW="150px"
    borderColor={`${colorScheme}.200`}
    bg={`${colorScheme}.50`}
  >
    <Text fontSize="sm" color={`${colorScheme}.700`} fontWeight="medium">{label}</Text>
    <Text fontSize="2xl" fontWeight="bold" color={`${colorScheme}.600`}>{value}</Text>
  </Box>
);

export default DatabaseInfo; 