// API Configuration for Single Deployment
const baseURL = process.env.NODE_ENV === 'production' 
  ? '' // Empty string for same-origin in production
  : 'http://localhost:5000';

export default {
  baseURL
};