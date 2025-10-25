import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token and get user data
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(response.data.user);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error fetching user:', error);
          // Token expired or invalid
          if (error.response?.status === 401 || error.response?.status === 403) {
            console.log('Token expired or invalid, logging out...');
            localStorage.removeItem('token');
            setUser(null);
            setIsAuthenticated(false);
            delete axios.defaults.headers.common['Authorization'];
          }
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []); // Empty dependency array is intentional - only run on mount

  // Add axios interceptor to handle 401/403 responses globally
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        // Only handle auth errors if there's an actual response from the server
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          // Token expired or invalid
          console.log('Token expired or invalid, logging out...');
          localStorage.removeItem('token');
          setUser(null);
          setIsAuthenticated(false);
          delete axios.defaults.headers.common['Authorization'];
          
          // Don't redirect if we're already on home or if it's a network error
          if (window.location.pathname !== '/') {
            // Use a small timeout to allow other error handlers to run first
            setTimeout(() => {
              if (window.location.pathname !== '/') {
                window.location.href = '/';
              }
            }, 100);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  const login = async (email, password) => {
    try {
      console.log('🔐 Login attempt:', { 
        email, 
        apiUrl: `${API_BASE_URL}/api/auth/login`,
        baseUrl: API_BASE_URL 
      });
      
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email,
        password
      });
      
      console.log('✅ Login successful:', response.data);
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.error('❌ Login error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
        name,
        email,
        password
      });
      
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    delete axios.defaults.headers.common['Authorization'];
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};