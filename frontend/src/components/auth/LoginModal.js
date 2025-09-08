import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { FaEnvelope, FaLock, FaTimes, FaGoogle, FaGithub } from 'react-icons/fa';

const LoginModal = ({ onClose, onRegisterClick }) => {
  const { login } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setErrorMsg('Please enter both email and password');
      return;
    }
    
    setLoading(true);
    setErrorMsg('');
    
    try {
      const success = await login(email, password);
      
      if (success) {
        toast.success('Login successful!');
        onClose();
        navigate('/dashboard');
      } else {
        setErrorMsg('Invalid email or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMsg('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div 
        className={`relative w-full max-w-md p-6 rounded-lg shadow-xl ${
          isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
        }`}
      >
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <FaTimes size={20} />
        </button>
        
        <h2 className="text-2xl font-bold mb-6 text-center">Welcome Back</h2>
        
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {errorMsg}
          </div>
        )}
        
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label 
              htmlFor="email" 
              className="block text-sm font-medium mb-1"
            >
              Email
            </label>
            <div className={`flex items-center border rounded-md ${
              isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300'
            }`}>
              <span className="pl-3 text-gray-500">
                <FaEnvelope />
              </span>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className={`w-full p-3 pl-2 outline-none rounded-md ${
                  isDarkMode ? 'bg-gray-700 text-white' : 'bg-white'
                }`}
                required
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label 
              htmlFor="password" 
              className="block text-sm font-medium mb-1"
            >
              Password
            </label>
            <div className={`flex items-center border rounded-md ${
              isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300'
            }`}>
              <span className="pl-3 text-gray-500">
                <FaLock />
              </span>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full p-3 pl-2 outline-none rounded-md ${
                  isDarkMode ? 'bg-gray-700 text-white' : 'bg-white'
                }`}
                required
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full p-3 rounded-md text-white font-medium ${
              loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Logging in...
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <button 
            onClick={onRegisterClick}
            className={`text-blue-600 hover:underline ${isDarkMode && 'text-blue-400'}`}
          >
            Don't have an account? Sign up
          </button>
        </div>
        
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className={`px-2 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} text-gray-500`}>
                Or continue with
              </span>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              className={`py-3 px-4 rounded-md flex justify-center items-center ${
                isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-white hover:bg-gray-50 border border-gray-300'
              }`}
            >
              <FaGoogle className="mr-2" />
              Google
            </button>
            <button
              type="button"
              className={`py-3 px-4 rounded-md flex justify-center items-center ${
                isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-white hover:bg-gray-50 border border-gray-300'
              }`}
            >
              <FaGithub className="mr-2" />
              GitHub
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;