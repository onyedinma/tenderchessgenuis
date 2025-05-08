import { extendTheme } from '@chakra-ui/react';

// Global style overrides
const styles = {
  global: {
    body: {
      bg: 'gray.50',
      color: 'gray.800',
    },
  },
};

// Custom colors
const colors = {
  brand: {
    50: '#e6f7ff',
    100: '#b3e0ff',
    200: '#80caff',
    300: '#4db3ff',
    400: '#1a9dff',
    500: '#0086e6',
    600: '#0069b3',
    700: '#004d80',
    800: '#00304d',
    900: '#00141f',
  },
  section: {
    1: '#2ecc71',
    2: '#e74c3c',
    both: '#f39c12',
  },
  difficulty: {
    easy: '#2ecc71',
    medium: '#f39c12',
    hard: '#e74c3c',
  }
};

// Component style overrides
const components = {
  Button: {
    baseStyle: {
      borderRadius: 'md',
      fontWeight: 'semibold',
    },
    variants: {
      solid: {
        bg: 'brand.500',
        color: 'white',
        _hover: {
          bg: 'brand.600',
        },
      },
      outline: {
        border: '2px solid',
        borderColor: 'brand.500',
        color: 'brand.500',
      },
    },
  },
  Card: {
    baseStyle: {
      container: {
        borderRadius: 'lg',
        boxShadow: 'md',
      },
    },
  },
};

// Extend the theme
const theme = extendTheme({
  styles,
  colors,
  components,
  fonts: {
    heading: '"Inter", sans-serif',
    body: '"Inter", sans-serif',
  },
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
});

export default theme; 