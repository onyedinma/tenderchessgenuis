import React, { useState } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  HStack,
  useColorModeValue,
  Badge,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';

interface Score {
  studentId: number;
  studentName: string;
  score: number;
  timestamp: string;
  section: 1 | 2;
  questionNumber: number;
}

const ScoringSystem: React.FC = () => {
  const [scores, setScores] = useState<Score[]>([]);
  const [selectedSection, setSelectedSection] = useState<1 | 2>(1);
  const bgColor = useColorModeValue('white', 'gray.700');

  // Sort scores by timestamp (most recent first) and score (highest first)
  const sortedScores = [...scores].sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return `${String(date.getMinutes()).padStart(2, '0')}:${String(
      date.getSeconds()
    ).padStart(2, '0')}.${String(date.getMilliseconds()).padStart(3, '0')}`;
  };

  return (
    <Box p={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading mb={2}>Scoring System</Heading>
          <Text color="gray.600">
            View and manage student scores for both sections
          </Text>
        </Box>

        <Tabs variant="enclosed">
          <TabList>
            <Tab>Section 1</Tab>
            <Tab>Section 2</Tab>
          </TabList>

          <TabPanels>
            {[1, 2].map((section) => (
              <TabPanel key={section}>
                <Box
                  bg={bgColor}
                  borderRadius="lg"
                  boxShadow="sm"
                  borderWidth="1px"
                  overflow="hidden"
                >
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Rank</Th>
                        <Th>Student Name</Th>
                        <Th isNumeric>Score</Th>
                        <Th>Question</Th>
                        <Th>Submission Time</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {sortedScores
                        .filter((score) => score.section === section)
                        .map((score, index) => (
                          <Tr key={`${score.studentId}-${score.questionNumber}`}>
                            <Td>{index + 1}</Td>
                            <Td>{score.studentName}</Td>
                            <Td isNumeric>
                              <Badge
                                colorScheme={score.score === 10 ? 'green' : 'red'}
                              >
                                {score.score} / 10
                              </Badge>
                            </Td>
                            <Td>Question {score.questionNumber}</Td>
                            <Td>{formatTimestamp(score.timestamp)}</Td>
                          </Tr>
                        ))}
                      {sortedScores.filter((score) => score.section === section)
                        .length === 0 && (
                        <Tr>
                          <Td colSpan={5} textAlign="center" py={8}>
                            <Text color="gray.600">
                              No scores available for Section {section}
                            </Text>
                          </Td>
                        </Tr>
                      )}
                    </Tbody>
                  </Table>
                </Box>
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </VStack>
    </Box>
  );
};

export default ScoringSystem; 