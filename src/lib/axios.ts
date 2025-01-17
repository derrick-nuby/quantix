import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '/api',  // Ensure this is set correctly
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to log and modify requests
axiosInstance.interceptors.request.use((config) => {
  // Ensure the URL starts with /api
  if (config.url && !config.url.startsWith('/api')) {
    config.url = `/api${config.url}`;
  }

  console.log('Request:', config.method?.toUpperCase(), config.url);
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add a response interceptor for logging
axiosInstance.interceptors.response.use((response) => {
  console.log('Response:', response.status, response.config.url);
  return response;
}, (error) => {
  console.error('Error:', error.response?.status, error.response?.config.url, error.message);
  return Promise.reject(error);
});

export default axiosInstance;
