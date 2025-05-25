import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Box, 
  Alert, 
  AlertIcon, 
  Spinner, 
  Text, 
  Button,
  VStack,
  Code,
  Collapse,
  useDisclosure
} from '@chakra-ui/react';
import axios from 'axios';
import SubmissionComparison from './SubmissionComparison';

const StudentSubmissionWrapper: React.FC = () => {
  const { bankId } = useParams<{ bankId: string }>();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionData, setSessionData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { isOpen, onToggle } = useDisclosure();
  const navigate = useNavigate();

  useEffect(() => {
    const checkStudentSession = async () => {
      try {
        console.log("Checking student session for submissions page...");
        const response = await axios.get('/api/auth/check-session.php', {
          withCredentials: true
        });
        
        console.log("Session check response:", response.data);
        setSessionData(response.data);
        
        if (response.data.loggedIn && (response.data.isStudent || response.data.student)) {
          // Student is logged in
          console.log("Student authenticated, continuing to submissions");
          setIsAuthenticated(true);
        } else {
          // Not logged in as student
          console.log("Not authenticated as student");
          setIsAuthenticated(false);
          setErrorMessage("You need to be logged in as a student to view submissions");
        }
      } catch (error: any) {
        console.error('Error checking student session:', error);
        setIsAuthenticated(false);
        setErrorMessage(error.message || "Authentication error");
      } finally {
        setLoading(false);
      }
    };
    
    checkStudentSession();
  }, []);

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
        <Text mt={4}>Checking your session...</Text>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Box textAlign="center" py={10}>
        <Alert status="error" mb={6}>
          <AlertIcon />
          {errorMessage || "You must be logged in to view submissions."}
        </Alert>
        
        <VStack spacing={4}>
          <Button onClick={() => navigate('/student/login')} colorScheme="blue" mr={3}>
            Go to Login
          </Button>
          
          <Button onClick={() => navigate('/student/dashboard')} colorScheme="gray">
            Back to Dashboard
          </Button>
          
          <Button size="sm" onClick={onToggle} variant="link">
            Show Session Debug Info
          </Button>
          
          <Collapse in={isOpen}>
            <Box 
              mt={2} 
              p={3} 
              bg="gray.50" 
              borderRadius="md" 
              maxWidth="500px" 
              textAlign="left" 
              fontSize="xs"
            >
              <Text fontWeight="bold" mb={2}>Session Data:</Text>
              <Code 
                display="block" 
                whiteSpace="pre-wrap" 
                p={2} 
                borderRadius="md"
              >
                {JSON.stringify(sessionData, null, 2)}
              </Code>
            </Box>
          </Collapse>
        </VStack>
      </Box>
    );
  }

  // If authenticated, render the actual SubmissionComparison component
  return <SubmissionComparison />;
};

export default StudentSubmissionWrapper; 