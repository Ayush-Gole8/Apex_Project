import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiLock, FiMail, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import Footer from './Footer';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login, register, isAuthenticated } = useAuth();
  
  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !password || (!isLogin && !name)) {
      toast.error('Please fill in all fields');
      return;
    }
    
    try {
      setLoading(true);
      
      if (isLogin) {
        // Login
        const result = await login(email, password);
        if (result.success) {
          toast.success('Welcome back!');
          navigate('/dashboard');
        } else {
          toast.error(result.message || 'Login failed');
        }
      } else {
        // Register
        const result = await register(name, email, password);
        if (result.success) {
          toast.success('Account created successfully!');
          navigate('/dashboard');
        } else {
          toast.error(result.message || 'Registration failed');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  const toggleMode = () => {
    setIsLogin(!isLogin);
    // Clear form fields
    setEmail('');
    setPassword('');
    setName('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-forest-800 via-dark-forest-700 to-dark-forest-800 flex flex-col">
      <div className="flex-grow flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-8 shadow-xl"
          >
            {/* Logo */}
            <div className="flex items-center justify-center mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-custom-500 to-forest-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-black text-2xl">A</span>
              </div>
              <span className="ml-3 text-3xl font-bold text-white">APE<span className="text-emerald-custom-400">X</span></span>
            </div>
            
            <h2 className="text-2xl font-bold text-white text-center mb-2">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-white/70 text-center mb-8">
              {isLogin ? 'Sign in to continue learning' : 'Join our learning platform today'}
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name field (register only) */}
              {!isLogin && (
                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2" htmlFor="name">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiUser className="text-white/50" />
                    </div>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-white/10 border border-white/20 text-white placeholder-white/50 text-sm rounded-lg focus:ring-emerald-custom-500 focus:border-emerald-custom-500 block w-full pl-10 p-2.5"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
              )}
              
              {/* Email field */}
              <div>
                <label className="block text-white/90 text-sm font-medium mb-2" htmlFor="email">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="text-white/50" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/10 border border-white/20 text-white placeholder-white/50 text-sm rounded-lg focus:ring-emerald-custom-500 focus:border-emerald-custom-500 block w-full pl-10 p-2.5"
                    placeholder="name@example.com"
                  />
                </div>
              </div>
              
              {/* Password field */}
              <div>
                <label className="block text-white/90 text-sm font-medium mb-2" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="text-white/50" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white/10 border border-white/20 text-white placeholder-white/50 text-sm rounded-lg focus:ring-emerald-custom-500 focus:border-emerald-custom-500 block w-full pl-10 p-2.5"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              
              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-custom-500 to-forest-500 hover:from-emerald-custom-600 hover:to-forest-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <span className="animate-pulse">Processing...</span>
                ) : (
                  <>
                    <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                    <FiArrowRight className="ml-2" />
                  </>
                )}
              </button>
              
              {/* Toggle Login/Register */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-emerald-custom-300 hover:text-emerald-custom-400 text-sm font-medium transition-colors"
                >
                  {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                </button>
              </div>
            </form>
          </motion.div>
          
          {/* Guest entry */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-6 text-center"
          >
            <button
              onClick={() => navigate('/dashboard')}
              className="text-white/70 hover:text-white text-sm font-medium transition-colors"
            >
              Continue as Guest
            </button>
          </motion.div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default LoginPage;