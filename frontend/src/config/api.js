// API Configuration for Single Deployment
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? '' // Same domain in production (single deployment)
    : 'http://localhost:5000');

console.log('API Base URL:', API_BASE_URL);
console.log('Environment:', process.env.NODE_ENV);

export default API_BASE_URL;