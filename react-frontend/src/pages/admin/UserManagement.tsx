import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Flex,
  Button,
  useDisclosure,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  HStack,
  FormControl,
  FormLabel,
  Card,
  CardBody,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Text,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Stack,
  Switch,
  CheckboxGroup,
  Checkbox,
} from '@chakra-ui/react';
import { FaPlus, FaSearch, FaEllipsisV, FaEdit, FaTrash, FaUsersCog, FaKey } from 'react-icons/fa';

// Mock data - User groups
const mockGroups = [
  { id: 1, name: 'Beginner', description: 'New chess players with ratings below 1200' },
  { id: 2, name: 'Intermediate', description: 'Players with ratings between 1200 and 1800' },
  { id: 3, name: 'Advanced', description: 'Players with ratings above 1800' },
  { id: 4, name: 'Coaches', description: 'Chess trainers and instructors' },
  { id: 5, name: 'Administrators', description: 'Site administrators with full access' },
];

// Mock data - Users
const mockUsers = [
  { 
    id: 1, 
    name: 'Alex Johnson', 
    email: 'alex@example.com', 
    role: 'user',
    joinDate: '2023-01-15T08:30:00',
    lastActive: '2023-09-20T14:25:00',
    groups: [1, 2],
    status: 'active'
  },
  { 
    id: 2, 
    name: 'Sarah Miller', 
    email: 'sarah@example.com', 
    role: 'user',
    joinDate: '2023-02-22T10:15:00',
    lastActive: '2023-09-19T16:40:00',
    groups: [2],
    status: 'active'
  },
  { 
    id: 3, 
    name: 'Michael Brown', 
    email: 'michael@example.com', 
    role: 'admin',
    joinDate: '2022-11-05T09:20:00',
    lastActive: '2023-09-21T11:30:00',
    groups: [3, 5],
    status: 'active'
  },
  { 
    id: 4, 
    name: 'Emily Wilson', 
    email: 'emily@example.com', 
    role: 'user',
    joinDate: '2023-03-10T11:45:00',
    lastActive: '2023-09-15T13:20:00',
    groups: [1],
    status: 'inactive'
  },
  { 
    id: 5, 
    name: 'David Chen', 
    email: 'david@example.com', 
    role: 'user',
    joinDate: '2023-04-18T14:30:00',
    lastActive: '2023-09-21T09:15:00',
    groups: [3],
    status: 'active'
  },
  { 
    id: 6, 
    name: 'Jessica Taylor', 
    email: 'jessica@example.com', 
    role: 'coach',
    joinDate: '2023-01-25T08:50:00',
    lastActive: '2023-09-20T15:45:00',
    groups: [3, 4],
    status: 'active'
  },
];

const UserManagement: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { 
    isOpen: isGroupModalOpen, 
    onOpen: onGroupModalOpen, 
    onClose: onGroupModalClose 
  } = useDisclosure();
  
  const [users, setUsers] = useState(mockUsers);
  const [groups, setGroups] = useState(mockGroups);
  const [filteredUsers, setFilteredUsers] = useState(mockUsers);
  const toast = useToast();
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [groupFilter, setGroupFilter] = useState('all');
  
  // Current user for edit modal
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Form state for adding/editing users
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    role: 'user',
    status: 'active',
    password: '',
    confirmPassword: '',
    groups: [] as number[]
  });
  
  // Form validation errors
  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Apply filters when any filter changes
  useEffect(() => {
    let filtered = [...users];
    
    // Filter by search query (name or email)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        user => 
          user.name.toLowerCase().includes(query) || 
          user.email.toLowerCase().includes(query)
      );
    }
    
    // Filter by role
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }
    
    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }
    
    // Filter by group
    if (groupFilter !== 'all') {
      const groupId = parseInt(groupFilter);
      filtered = filtered.filter(user => user.groups.includes(groupId));
    }
    
    setFilteredUsers(filtered);
  }, [searchQuery, roleFilter, statusFilter, groupFilter, users]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle role filter change
  const handleRoleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRoleFilter(e.target.value);
  };

  // Handle status filter change
  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  // Handle group filter change
  const handleGroupFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGroupFilter(e.target.value);
  };
  
  // Get group names for a user
  const getUserGroupNames = (groupIds: number[]) => {
    return groupIds.map(groupId => {
      const group = groups.find(g => g.id === groupId);
      return group ? group.name : '';
    }).join(', ');
  };
  
  // Handle edit user
  const handleEditUser = (user: any) => {
    setCurrentUser(user);
    // Populate the form with user data
    setUserForm({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      password: '',
      confirmPassword: '',
      groups: [...user.groups]
    });
    setFormErrors({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    onOpen();
  };
  
  // Handle open group management modal
  const handleManageGroups = (user: any) => {
    setCurrentUser(user);
    setUserForm(prev => ({
      ...prev,
      groups: [...user.groups]
    }));
    onGroupModalOpen();
  };
  
  // Handle delete user
  const handleDeleteUser = (userId: number) => {
    // In a real application, you would make an API call to delete the user
    setUsers(users.filter(user => user.id !== userId));
    
    toast({
      title: 'User deleted',
      description: 'The user has been successfully deleted',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };
  
  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is updated
    if (name in formErrors) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Handle status toggle
  const handleStatusToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const status = e.target.checked ? 'active' : 'inactive';
    setUserForm(prev => ({
      ...prev,
      status
    }));
  };
  
  // Handle group selection change
  const handleGroupChange = (selectedGroups: number[]) => {
    setUserForm(prev => ({
      ...prev,
      groups: selectedGroups
    }));
  };
  
  // Validate form
  const validateForm = () => {
    let valid = true;
    const errors = { ...formErrors };
    
    if (!userForm.name.trim()) {
      errors.name = 'Name is required';
      valid = false;
    }
    
    if (!userForm.email.trim()) {
      errors.email = 'Email is required';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(userForm.email)) {
      errors.email = 'Email is invalid';
      valid = false;
    }
    
    // Only validate password for new users or if a password was entered
    if (!currentUser || userForm.password) {
      if (!currentUser && !userForm.password) {
        errors.password = 'Password is required for new users';
        valid = false;
      } else if (userForm.password && userForm.password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
        valid = false;
      }
      
      if (userForm.password !== userForm.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
        valid = false;
      }
    }
    
    setFormErrors(errors);
    return valid;
  };
  
  // Submit user form
  const handleSubmitUser = () => {
    if (!validateForm()) return;
    
    if (currentUser) {
      // Update existing user
      setUsers(users.map(user => {
        if (user.id === currentUser.id) {
          return {
            ...user,
            name: userForm.name,
            email: userForm.email,
            role: userForm.role,
            status: userForm.status,
            groups: [...userForm.groups]
          };
        }
        return user;
      }));
      
      toast({
        title: 'User updated',
        description: 'The user has been successfully updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } else {
      // Add new user
      const newUser = {
        id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
        name: userForm.name,
        email: userForm.email,
        role: userForm.role,
        status: userForm.status,
        groups: [...userForm.groups],
        joinDate: new Date().toISOString(),
        lastActive: new Date().toISOString(),
      };
      
      setUsers([...users, newUser]);
      
      toast({
        title: 'User created',
        description: 'The new user has been successfully created',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
    
    onClose();
  };
  
  // Save group changes
  const handleSaveGroups = () => {
    if (currentUser) {
      setUsers(users.map(user => {
        if (user.id === currentUser.id) {
          return {
            ...user,
            groups: [...userForm.groups]
          };
        }
        return user;
      }));
      
      toast({
        title: 'Groups updated',
        description: 'User groups have been updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
    
    onGroupModalClose();
  };
  
  // Reset form when modal closes
  const resetForm = () => {
    setUserForm({
      name: '',
      email: '',
      role: 'user',
      status: 'active',
      password: '',
      confirmPassword: '',
      groups: []
    });
    setFormErrors({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading as="h1" size="xl">
          User Management
        </Heading>
        <Button leftIcon={<FaPlus />} colorScheme="blue" onClick={() => {
          setCurrentUser(null);
          resetForm();
          onOpen();
        }}>
          Add New User
        </Button>
      </Flex>

      {/* Filters */}
      <Card mb={5}>
        <CardBody>
          <HStack spacing={4} wrap="wrap">
            <FormControl minW={250}>
              <FormLabel>Search Users</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <FaSearch color="gray.300" />
                </InputLeftElement>
                <Input
                  placeholder="Search by name or email"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </InputGroup>
            </FormControl>
            
            <FormControl maxW={200}>
              <FormLabel>Role</FormLabel>
              <Select value={roleFilter} onChange={handleRoleFilterChange}>
                <option value="all">All Roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="coach">Coach</option>
              </Select>
            </FormControl>
            
            <FormControl maxW={200}>
              <FormLabel>Status</FormLabel>
              <Select value={statusFilter} onChange={handleStatusFilterChange}>
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </FormControl>
            
            <FormControl maxW={200}>
              <FormLabel>Group</FormLabel>
              <Select value={groupFilter} onChange={handleGroupFilterChange}>
                <option value="all">All Groups</option>
                {groups.map(group => (
                  <option key={group.id} value={group.id.toString()}>
                    {group.name}
                  </option>
                ))}
              </Select>
            </FormControl>
          </HStack>
        </CardBody>
      </Card>

      {/* User list table */}
      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>User</Th>
              <Th>Role</Th>
              <Th>Status</Th>
              <Th>Groups</Th>
              <Th>Join Date</Th>
              <Th>Last Active</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredUsers.map(user => (
              <Tr key={user.id}>
                <Td>
                  <Text fontWeight="bold">{user.name}</Text>
                  <Text fontSize="sm" color="gray.500">{user.email}</Text>
                </Td>
                <Td>
                  <Badge
                    colorScheme={
                      user.role === 'admin' ? 'red' :
                      user.role === 'coach' ? 'purple' : 'blue'
                    }
                  >
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                </Td>
                <Td>
                  <Badge
                    colorScheme={user.status === 'active' ? 'green' : 'gray'}
                  >
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </Badge>
                </Td>
                <Td>{getUserGroupNames(user.groups)}</Td>
                <Td>{new Date(user.joinDate).toLocaleDateString()}</Td>
                <Td>{new Date(user.lastActive).toLocaleDateString()}</Td>
                <Td>
                  <Menu>
                    <MenuButton
                      as={IconButton}
                      aria-label="Options"
                      icon={<FaEllipsisV />}
                      variant="ghost"
                      size="sm"
                    />
                    <MenuList>
                      <MenuItem icon={<FaEdit />} onClick={() => handleEditUser(user)}>
                        Edit User
                      </MenuItem>
                      <MenuItem icon={<FaUsersCog />} onClick={() => handleManageGroups(user)}>
                        Manage Groups
                      </MenuItem>
                      <MenuItem icon={<FaKey />} onClick={() => handleEditUser(user)}>
                        Reset Password
                      </MenuItem>
                      <MenuItem icon={<FaTrash />} onClick={() => handleDeleteUser(user.id)}>
                        Delete User
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
      
      {/* User Add/Edit Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {currentUser ? 'Edit User' : 'Add New User'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <FormControl isRequired isInvalid={!!formErrors.name}>
                <FormLabel>Full Name</FormLabel>
                <Input
                  name="name"
                  value={userForm.name}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                />
                {formErrors.name && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {formErrors.name}
                  </Text>
                )}
              </FormControl>
              
              <FormControl isRequired isInvalid={!!formErrors.email}>
                <FormLabel>Email Address</FormLabel>
                <Input
                  name="email"
                  type="email"
                  value={userForm.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                />
                {formErrors.email && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {formErrors.email}
                  </Text>
                )}
              </FormControl>
              
              <FormControl>
                <FormLabel>Role</FormLabel>
                <Select 
                  name="role"
                  value={userForm.role}
                  onChange={handleInputChange}
                >
                  <option value="user">User</option>
                  <option value="coach">Coach</option>
                  <option value="admin">Admin</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <Flex align="center" justify="space-between">
                  <FormLabel mb={0}>Status</FormLabel>
                  <Switch 
                    isChecked={userForm.status === 'active'} 
                    onChange={handleStatusToggle}
                    colorScheme="green"
                  />
                </Flex>
                <Text fontSize="sm" color="gray.500">
                  {userForm.status === 'active' ? 'User is active' : 'User is inactive'}
                </Text>
              </FormControl>
              
              <FormControl isInvalid={!!formErrors.password}>
                <FormLabel>{currentUser ? 'New Password (leave blank to keep current)' : 'Password'}</FormLabel>
                <Input
                  name="password"
                  type="password"
                  value={userForm.password}
                  onChange={handleInputChange}
                  placeholder={currentUser ? 'Enter new password' : 'Enter password'}
                />
                {formErrors.password && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {formErrors.password}
                  </Text>
                )}
              </FormControl>
              
              <FormControl isInvalid={!!formErrors.confirmPassword}>
                <FormLabel>Confirm Password</FormLabel>
                <Input
                  name="confirmPassword"
                  type="password"
                  value={userForm.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm password"
                />
                {formErrors.confirmPassword && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {formErrors.confirmPassword}
                  </Text>
                )}
              </FormControl>
              
              <FormControl>
                <FormLabel>Assign to Groups</FormLabel>
                <CheckboxGroup 
                  value={userForm.groups.map(id => id.toString())}
                  onChange={(values) => handleGroupChange(values.map(v => parseInt(v.toString())))}
                >
                  <Stack>
                    {groups.map(group => (
                      <Checkbox key={group.id} value={group.id.toString()}>
                        {group.name}
                      </Checkbox>
                    ))}
                  </Stack>
                </CheckboxGroup>
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSubmitUser}>
              {currentUser ? 'Save Changes' : 'Create User'}
            </Button>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Group Management Modal */}
      <Modal isOpen={isGroupModalOpen} onClose={onGroupModalClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Manage User Groups</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {currentUser && (
              <>
                <Text mb={4}>
                  Select the groups for <strong>{currentUser.name}</strong>:
                </Text>
                <CheckboxGroup 
                  value={userForm.groups.map(id => id.toString())}
                  onChange={(values) => handleGroupChange(values.map(v => parseInt(v.toString())))}
                >
                  <Stack spacing={2}>
                    {groups.map(group => (
                      <Checkbox key={group.id} value={group.id.toString()}>
                        <Box>
                          <Text fontWeight="bold">{group.name}</Text>
                          <Text fontSize="sm" color="gray.500">{group.description}</Text>
                        </Box>
                      </Checkbox>
                    ))}
                  </Stack>
                </CheckboxGroup>
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSaveGroups}>
              Save Changes
            </Button>
            <Button variant="ghost" onClick={onGroupModalClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default UserManagement; 