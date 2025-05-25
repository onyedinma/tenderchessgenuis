import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  HStack,
  Avatar,
  Badge,
  IconButton,
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  FormHelperText,
  InputGroup,
  InputRightElement,
  Switch,
  Divider,
  useColorModeValue,
  Card,
  CardHeader,
  CardBody,
  Icon,
  Image,
  Grid,
  Spinner,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react';
import { FaUserPlus, FaEdit, FaTrash, FaEye, FaEyeSlash, FaExternalLinkAlt, FaUserCheck, FaUserSlash } from 'react-icons/fa';
import axios from 'axios';

interface Student {
  id: number;
  name: string;
  username: string;
  photo: string;
  isActive: boolean;
  lastLogin: string | null;
}

const StudentManagement: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure();
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  
  const [showPassword, setShowPassword] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    photo: null as File | null,
    photoPreview: '',
    isActive: true,
  });
  
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.700');
  
  // Fetch students on component mount
  useEffect(() => {
    fetchStudents();
  }, []);
  
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/students/get-all.php');
      if (response.data && response.data.success) {
        setStudents(response.data.students);
      } else {
        toast({
          title: 'Error',
          description: response.data.message || 'Failed to fetch students',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch students',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({
        ...formData,
        photo: file,
        photoPreview: URL.createObjectURL(file)
      });
    }
  };

  const handleAddStudent = () => {
    // Reset form data
    setFormData({
      name: '',
      username: '',
      password: '',
      photo: null,
      photoPreview: '',
      isActive: true,
    });
    setEditingStudent(null);
    onOpen();
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      username: student.username,
      password: '',
      photo: null,
      photoPreview: student.photo ? `/${student.photo}` : '',
      isActive: student.isActive,
    });
    onOpen();
  };

  const confirmDeleteStudent = (studentId: number) => {
    setDeleteId(studentId);
    onAlertOpen();
  };

  const handleDeleteStudent = async () => {
    if (!deleteId) return;
    
    try {
      const response = await axios.delete(`/students/delete.php?id=${deleteId}`);
      if (response.data && response.data.success) {
        toast({
          title: 'Success',
          description: 'Student deleted successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        fetchStudents();
      } else {
        toast({
          title: 'Error',
          description: response.data.message || 'Failed to delete student',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error deleting student:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete student',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      onAlertClose();
      setDeleteId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.username || (!editingStudent && !formData.password)) {
      toast({
        title: 'Error',
        description: 'Please fill all required fields',
        status: 'error',
        duration: 3000,
      });
      return;
    }
    
    try {
      let photoData = '';
      
      // If there's a new photo, convert it to base64
      if (formData.photo) {
        const reader = new FileReader();
        photoData = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(formData.photo);
        });
      }
      
      if (editingStudent) {
        // Update existing student
        const updateData = {
          id: editingStudent.id,
          name: formData.name,
          username: formData.username,
          isActive: formData.isActive,
          photo: photoData || undefined, // Only send if there's a new photo
          password: formData.password || undefined, // Only send if password is being changed
        };
        
        const response = await axios.put(`/students/update.php?id=${editingStudent.id}`, updateData);
        
        if (response.data && response.data.success) {
          // Update the students array with the updated student
          setStudents(students.map(s => 
            s.id === editingStudent.id ? response.data.student : s
          ));
          
          toast({
            title: 'Success',
            description: 'Student updated successfully',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        } else {
          throw new Error(response.data.message || 'Failed to update student');
        }
      } else {
        // Add new student
        const newStudentData = {
          name: formData.name,
          username: formData.username,
          password: formData.password,
          isActive: formData.isActive,
          photo: photoData,
        };
        
        const response = await axios.post('/students/create.php', newStudentData);
        
        if (response.data && response.data.success) {
          // Add the new student to the list
          setStudents([...students, response.data.student]);
          
          toast({
            title: 'Success',
            description: 'Student created successfully',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        } else {
          throw new Error(response.data.message || 'Failed to create student');
        }
      }
      
      onClose();
    } catch (error) {
      let errorMessage = 'An unexpected error occurred';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 3000,
      });
      
      console.error('Error saving student:', error);
    }
  };

  return (
    <Box p={8}>
      <VStack spacing={8} align="stretch">
        <HStack justify="space-between">
          <Box>
            <Heading mb={2}>Student Management</Heading>
            <Text color="gray.600">
              Add, edit, or remove students for the Chess Quiz Show
            </Text>
          </Box>
          <Button
            leftIcon={<FaUserPlus />}
            colorScheme="blue"
            onClick={handleAddStudent}
          >
            Add Student
          </Button>
        </HStack>

        {/* Student List */}
        <Card bg={bgColor} boxShadow="sm">
          <CardHeader>
            <HStack justify="space-between">
              <Heading size="md">Students ({students.length})</Heading>
              <Badge colorScheme="green">{students.filter(s => s.isActive).length} Active</Badge>
            </HStack>
          </CardHeader>
          <CardBody>
            {loading ? (
              <Box textAlign="center" py={10}>
                <Spinner size="xl" />
                <Text mt={4}>Loading students...</Text>
              </Box>
            ) : students.length === 0 ? (
              <Box textAlign="center" py={10}>
                <Text fontSize="lg">No students found</Text>
                <Text fontSize="sm" color="gray.500" mt={2}>
                  Click "Add Student" to create your first student
                </Text>
              </Box>
            ) : (
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Photo</Th>
                    <Th>Name</Th>
                    <Th>Username</Th>
                    <Th>Status</Th>
                    <Th>Last Login</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {students.map((student) => (
                    <Tr key={student.id}>
                      <Td>
                        <Avatar 
                          size="md" 
                          name={student.name} 
                          src={student.photo ? `/${student.photo}` : undefined}
                        />
                      </Td>
                      <Td>{student.name}</Td>
                      <Td>{student.username}</Td>
                      <Td>
                        <Badge colorScheme={student.isActive ? 'green' : 'red'}>
                          {student.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </Td>
                      <Td>{student.lastLogin ? new Date(student.lastLogin).toLocaleString() : 'Never'}</Td>
                      <Td>
                        <HStack spacing={2}>
                          <IconButton
                            aria-label="Edit student"
                            icon={<FaEdit />}
                            size="sm"
                            colorScheme="blue"
                            onClick={() => handleEditStudent(student)}
                          />
                          <IconButton
                            aria-label="Delete student"
                            icon={<FaTrash />}
                            size="sm"
                            colorScheme="red"
                            onClick={() => confirmDeleteStudent(student.id)}
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
          </CardBody>
        </Card>

        {/* Add/Edit Student Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              {editingStudent ? 'Edit Student' : 'Add New Student'}
            </ModalHeader>
            <ModalCloseButton />
            <form onSubmit={handleSubmit}>
              <ModalBody>
                <VStack spacing={4} align="stretch">
                  <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
                    <FormControl isRequired>
                      <FormLabel>Full Name</FormLabel>
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter student's full name"
                      />
                      <FormHelperText>
                        This name will be displayed during the quiz show
                      </FormHelperText>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Username</FormLabel>
                      <Input
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        placeholder="Create a unique username"
                      />
                      <FormHelperText>
                        Used for login purposes only
                      </FormHelperText>
                    </FormControl>
                  </Grid>

                  <FormControl isRequired={!editingStudent}>
                    <FormLabel>{editingStudent ? 'New Password (optional)' : 'Password'}</FormLabel>
                    <InputGroup>
                      <Input
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder={editingStudent ? 'Leave blank to keep current password' : 'Enter password'}
                      />
                      <InputRightElement width="4.5rem">
                        <IconButton
                          h="1.75rem"
                          size="sm"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          icon={showPassword ? <FaEyeSlash /> : <FaEye />}
                          onClick={() => setShowPassword(!showPassword)}
                          variant="ghost"
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Photo</FormLabel>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      p={1}
                    />
                    <FormHelperText>
                      Photo will appear alongside student's answers on screen
                    </FormHelperText>
                  </FormControl>

                  {(formData.photoPreview || (editingStudent && editingStudent.photo)) && (
                    <Box mt={2}>
                      <Heading size="xs" mb={2}>Photo Preview</Heading>
                      <Image
                        src={formData.photoPreview || (editingStudent?.photo ? `/${editingStudent.photo}` : undefined)}
                        alt="Student photo preview"
                        maxH="100px"
                        borderRadius="md"
                      />
                    </Box>
                  )}

                  <Divider />

                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="is-active" mb="0">
                      Student Status
                    </FormLabel>
                    <Switch
                      id="is-active"
                      name="isActive"
                      isChecked={formData.isActive}
                      onChange={handleInputChange}
                      colorScheme="green"
                    />
                    <Text ml={2} fontSize="sm" color={formData.isActive ? 'green.500' : 'red.500'}>
                      {formData.isActive ? 'Active' : 'Inactive'}
                    </Text>
                  </FormControl>
                </VStack>
              </ModalBody>

              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={onClose}>
                  Cancel
                </Button>
                <Button colorScheme="blue" type="submit">
                  {editingStudent ? 'Save Changes' : 'Add Student'}
                </Button>
              </ModalFooter>
            </form>
          </ModalContent>
        </Modal>
        
        {/* Delete Confirmation Dialog */}
        <AlertDialog
          isOpen={isAlertOpen}
          leastDestructiveRef={cancelRef}
          onClose={onAlertClose}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Delete Student
              </AlertDialogHeader>

              <AlertDialogBody>
                Are you sure you want to delete this student? This action cannot be undone.
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onAlertClose}>
                  Cancel
                </Button>
                <Button colorScheme="red" onClick={handleDeleteStudent} ml={3}>
                  Delete
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </VStack>
    </Box>
  );
};

export default StudentManagement; 