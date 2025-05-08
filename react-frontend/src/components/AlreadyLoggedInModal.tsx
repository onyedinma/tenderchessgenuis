import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  VStack,
} from '@chakra-ui/react';

interface AlreadyLoggedInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

const AlreadyLoggedInModal: React.FC<AlreadyLoggedInModalProps> = ({
  isOpen,
  onClose,
  onLogout,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Already Logged In</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4}>
            <Text>
              You are already logged in on another device. Would you like to log out from the other session and continue here?
            </Text>
            <Button colorScheme="blue" onClick={onLogout} width="100%">
              Log Out Other Session
            </Button>
            <Button variant="ghost" onClick={onClose} width="100%">
              Cancel
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default AlreadyLoggedInModal; 