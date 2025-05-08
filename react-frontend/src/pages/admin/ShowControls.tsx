import React, { useState } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Switch,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useToast,
  Card,
  CardHeader,
  CardBody,
  Divider,
  HStack,
  Icon,
  Badge,
} from '@chakra-ui/react';
import { FaClock, FaUsers, FaLock, FaUnlock } from 'react-icons/fa';

interface TimerSettings {
  section1Duration: number;
  section2Duration: number;
}

const ShowControls: React.FC = () => {
  const [section2Enabled, setSection2Enabled] = useState(false);
  const [timerSettings, setTimerSettings] = useState<TimerSettings>({
    section1Duration: 60,
    section2Duration: 120,
  });
  const [isQuestionSending, setIsQuestionSending] = useState(false);
  const toast = useToast();

  const handleSendQuestions = async () => {
    try {
      setIsQuestionSending(true);
      // TODO: Implement API call to send questions
      toast({
        title: 'Questions Sent',
        description: 'Questions have been sent to all participants',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send questions',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsQuestionSending(false);
    }
  };

  const handleTimerChange = (section: 1 | 2, value: number) => {
    setTimerSettings(prev => ({
      ...prev,
      [section === 1 ? 'section1Duration' : 'section2Duration']: value,
    }));
  };

  return (
    <Box p={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading mb={2}>Show Controls</Heading>
          <Text color="gray.600">
            Manage quiz sections, timers, and participant access
          </Text>
        </Box>

        <Card>
          <CardHeader>
            <Heading size="md">Section Controls</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="section2-toggle" mb="0">
                  <HStack spacing={2}>
                    <Icon as={section2Enabled ? FaUnlock : FaLock} />
                    <Text>Enable Section 2</Text>
                  </HStack>
                </FormLabel>
                <Switch
                  id="section2-toggle"
                  isChecked={section2Enabled}
                  onChange={(e) => setSection2Enabled(e.target.checked)}
                />
              </FormControl>

              <Button
                leftIcon={<Icon as={FaUsers} />}
                colorScheme="blue"
                isLoading={isQuestionSending}
                onClick={handleSendQuestions}
              >
                Send Questions to Participants
              </Button>
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <Heading size="md">Timer Settings</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <FormControl>
                <FormLabel>
                  <HStack spacing={2}>
                    <Icon as={FaClock} />
                    <Text>Section 1 Duration (seconds)</Text>
                  </HStack>
                </FormLabel>
                <NumberInput
                  min={30}
                  max={300}
                  value={timerSettings.section1Duration}
                  onChange={(_, value) => handleTimerChange(1, value)}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel>
                  <HStack spacing={2}>
                    <Icon as={FaClock} />
                    <Text>Section 2 Duration (seconds)</Text>
                  </HStack>
                </FormLabel>
                <NumberInput
                  min={30}
                  max={600}
                  value={timerSettings.section2Duration}
                  onChange={(_, value) => handleTimerChange(2, value)}
                  isDisabled={!section2Enabled}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <Heading size="md">Show Status</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack justifyContent="space-between">
                <Text>Section 1</Text>
                <Badge colorScheme="green">Active</Badge>
              </HStack>
              <Divider />
              <HStack justifyContent="space-between">
                <Text>Section 2</Text>
                <Badge colorScheme={section2Enabled ? "green" : "red"}>
                  {section2Enabled ? "Active" : "Disabled"}
                </Badge>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default ShowControls; 