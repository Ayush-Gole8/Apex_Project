// API configuration and utilities
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '' // Same origin in production
  : 'http://localhost:5000';

// Common headers function
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// API utility functions
export const apiUtils = {
  // Auth endpoints
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return response;
  },

  register: async (name, email, password) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    return response;
  },

  getCurrentUser: async () => {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: getAuthHeaders()
    });
    return response;
  },

  // Course endpoints
  generateCourse: async (topic) => {
    const response = await fetch(`${API_BASE_URL}/api/generate-course`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ topic })
    });
    return response;
  },

  getCourses: async () => {
    const response = await fetch(`${API_BASE_URL}/api/courses`);
    return response;
  },

  getUserCourses: async () => {
    const response = await fetch(`${API_BASE_URL}/api/user/courses`, {
      headers: getAuthHeaders()
    });
    return response;
  },

  getCourse: async (courseId) => {
    const response = await fetch(`${API_BASE_URL}/api/user/courses/${courseId}`, {
      headers: getAuthHeaders()
    });
    return response;
  },

  updateCourseProgress: async (courseId, progress, completed = false) => {
    const response = await fetch(`${API_BASE_URL}/api/user/courses/${courseId}/progress`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ progress, completed })
    });
    return response;
  },

  getUserDashboard: async () => {
    const response = await fetch(`${API_BASE_URL}/api/user/dashboard`, {
      headers: getAuthHeaders()
    });
    return response;
  }
};

export default {
  baseURL: API_BASE_URL
};