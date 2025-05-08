import axios from 'axios';

// Test direct axios call without the instance
export const testDirectApiCall = () => {
  console.log('Testing direct API call to /api/test.php');
  return axios.get('/api/test.php', {
    withCredentials: true
  });
};

// Test direct call to the auth session check
export const testSessionCall = () => {
  console.log('Testing direct API call to /api/auth/check-session.php');
  return axios.get('/api/auth/check-session.php', {
    withCredentials: true
  });
};

// Test alternate URL format
export const testAlternateUrl = () => {
  console.log('Testing API call with alternate URL format');
  return axios.get('/api/auth/check-session.php', {
    withCredentials: true,
    baseURL: window.location.origin,
  });
};

export default {
  testDirectApiCall,
  testSessionCall,
  testAlternateUrl
}; 