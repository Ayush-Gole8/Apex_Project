import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FiArrowRight, FiChevronDown, FiCode, FiDatabase, FiLayers, FiCpu, FiBox, FiCommand, FiSend, 
  FiUser, FiBarChart2, FiBook, FiLogOut, FiMessageCircle, FiClock, FiUsers, FiStar } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';
import gsap from 'gsap';
import API_BASE_URL from '../config/api';
import { useAuth } from '../contexts/AuthContext';
import Footer from './Footer';
import AuthModal from './AuthModal';

const Landing = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();
  
  const { user, logout, isAuthenticated } = useAuth();
  
  const heroRef = useRef();
  const coursesRef = useRef();
  
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  useEffect(() => {
    fetchCourses();
    initAnimations();
  }, []);

  const fetchCourses = async () => {
    try {
      console.log('Fetching courses from:', `${API_BASE_URL}/api/courses`);
      const response = await axios.get(`${API_BASE_URL}/api/courses`, {
        timeout: 10000 // 10 second timeout
      });
      setCourses(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching courses:', error);
      // Use sample courses if API is unavailable
      setCourses([
        {
          id: 1,
          title: "Data Structures & Algorithms",
          description: "Master fundamental DSA concepts",
          difficulty: "Intermediate",
          duration: "4 weeks",
          topics: ["Arrays", "Linked Lists", "Trees", "Graphs", "Sorting", "Searching"],
          color: "bg-gradient-to-r from-blue-500 to-purple-600"
        },
        {
          id: 2,
          title: "Machine Learning Fundamentals",
          description: "Introduction to ML algorithms and concepts",
          difficulty: "Beginner",
          duration: "6 weeks",
          topics: ["Linear Regression", "Decision Trees", "Neural Networks", "Feature Engineering"],
          color: "bg-gradient-to-r from-green-500 to-teal-600"
        },
        {
          id: 3,
          title: "Web Development with React",
          description: "Build modern web applications",
          difficulty: "Intermediate",
          duration: "5 weeks",
          topics: ["Components", "State Management", "Hooks", "Router", "API Integration"],
          color: "bg-gradient-to-r from-orange-500 to-red-600"
        }
      ]);
      setLoading(false);
      toast.error('Failed to load courses from API, showing sample data');
    }
  };

  const initAnimations = () => {
    // Hero section animation
    gsap.fromTo(heroRef.current.children, 
      { y: 100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, stagger: 0.2, delay: 0.5 }
    );

    // Floating animation for hero elements
    gsap.to(".float-element", {
      y: -20,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "power2.inOut",
      stagger: 0.3
    });
  };

  const handleCourseClick = (courseId) => {
    navigate(`/course/${courseId}`);
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    // Enforce authentication with clear error message
    if (!isAuthenticated) {
      toast.error('Please sign in to generate courses');
      setShowAuthModal(true);
      return;
    }

    console.log('Submitting chat request for topic:', chatInput);
    setIsGenerating(true);
    try {
      const token = localStorage.getItem('token');
      
      // First try to ping the backend to check connectivity
      try {
        await axios.get(`${API_BASE_URL}/api/ping`, { 
          timeout: 3000,
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (pingError) {
        console.error('Backend ping failed:', pingError);
        toast.error('Cannot connect to course generator service. Please check your connection.');
        setIsGenerating(false);
        return;
      }
      
      const response = await axios.post(`${API_BASE_URL}/api/generate-course`, {
        topic: chatInput
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout for course generation
      });
      
      console.log('Course generation successful:', response.data);
      
      // Handle different response types
      if (response.data.non_educational) {
        // Non-educational content request
        toast.error(response.data.message);
        return;
      }
      
      if (response.data.error) {
        // There was an error but we have fallback content
        console.warn('Using fallback content due to:', response.data.error);
        toast.warning('Using simplified course structure. Some features may be limited.');
      }
      
      // If we have rawContent and sections are available in it, we'll extract sections in GeneratedCourse
      // The backend already tried to extract sections from rawContent
      navigate('/generated-course', { 
        state: { 
          courseData: response.data, 
          topic: chatInput 
        } 
      });
    } catch (error) {
      console.error('Error generating course:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Full error object:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
        code: error.code
      });
      
      let errorMessage = 'Failed to generate course';
      
      if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        errorMessage = 'Cannot connect to server. Please check if the backend is running.';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. The server might be busy or unavailable.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please sign in again.';
        setShowAuthModal(true);
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.instructions) {
        errorMessage = error.response.data.instructions;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
      setChatInput('');
    }
  };

  return (
    <div className="min-h-screen bg-professional relative overflow-hidden">
      {/* Animated Background - More Subtle */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
        <motion.div 
          className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-custom-500 rounded-full mix-blend-multiply filter blur-xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-forest-500 rounded-full mix-blend-multiply filter blur-xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.1, 0.2]
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        <motion.div 
          className="absolute top-40 left-1/2 w-80 h-80 bg-emerald-custom-600 rounded-full mix-blend-multiply filter blur-xl"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.15, 0.25, 0.15]
          }}
          transition={{ 
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
        />
      </div>

      {/* Navbar */}
      <nav className="relative z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div 
            className="flex items-center space-x-3"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-custom-500 to-forest-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-2xl tracking-tight">A</span>
            </div>
            <span className="logo-text text-white">APE<span className="text-emerald-custom-400">X</span></span>
          </motion.div>
          
          <motion.div 
            className="flex items-center space-x-4"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="nav-item flex items-center space-x-2 bg-white/10 backdrop-blur-lg rounded-full px-4 py-2 border border-white/20 hover:bg-white/20 transition-colors"
                >
                  <FiBarChart2 className="text-emerald-custom-500" />
                  <span className="text-sm text-white font-medium">Dashboard</span>
                </button>
                
                <button
                  onClick={() => navigate('/my-courses')}
                  className="nav-item flex items-center space-x-2 bg-white/10 backdrop-blur-lg rounded-full px-4 py-2 border border-white/20 hover:bg-white/20 transition-colors"
                >
                  <FiBook className="text-forest-500" />
                  <span className="text-sm text-white font-medium">My Courses</span>
                </button>
                
                <div className="nav-item flex items-center space-x-3 bg-white/10 backdrop-blur-lg rounded-full px-4 py-2 border border-white/20">
                  <FiUser className="text-emerald-custom-500" />
                  <span className="text-sm text-white font-medium">{user?.name || 'Guest'}</span>
                </div>
                
                <button
                  onClick={logout}
                  className="flex items-center justify-center w-10 h-10 bg-red-500/20 backdrop-blur-lg rounded-full border border-red-500/20 hover:bg-red-500/30 transition-colors"
                >
                  <FiLogOut className="text-red-400" size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center space-x-3 bg-gradient-to-r from-emerald-custom-500 to-forest-500 rounded-full px-6 py-2 text-white font-medium hover:shadow-lg hover:shadow-emerald-custom-500/25 transition-all duration-300"
              >
                <FiUser />
                <span>Sign In</span>
              </button>
            )}
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 float-element text-crisp">
            <span className="gradient-text">AI-Powered</span>
            <br />
            <span className="text-white text-enhanced">Learning</span>
          </h1>
          <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto float-element leading-relaxed">
            Discover personalized courses tailored to your learning journey. 
            Get instant AI-generated content on any engineering topic.
          </p>
          <motion.button
            className="bg-gradient-to-r from-emerald-custom-500 to-forest-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-lg hover:shadow-emerald-custom-500/25 transition-all duration-300 float-element"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowChat(true)}
          >
            Start Learning Now
          </motion.button>
        </div>
      </section>

      {/* Featured Courses */}
      <section ref={coursesRef} className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            className="text-4xl font-bold text-center mb-16 gradient-text"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            Featured Engineering Courses
          </motion.h2>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-custom-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" ref={ref}>
              {courses.map((course, index) => (
                <motion.div
                  key={course.id}
                  className="module-card p-6 cursor-pointer group"
                  initial={{ y: 50, opacity: 0 }}
                  animate={inView ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
                  transition={{ 
                    duration: 0.6, 
                    delay: index * 0.1,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                  onClick={() => handleCourseClick(course.id)}
                  whileHover={{ 
                    y: -8, 
                    scale: 1.02,
                    transition: { duration: 0.3, ease: "easeOut" }
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-custom-500 to-forest-500 rounded-xl flex items-center justify-center">
                      <FiBook className="text-white text-xl" />
                    </div>
                    <span className="bg-white/15 text-white text-xs px-3 py-1 rounded-full font-medium">
                      {course.difficulty}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-custom-300 transition-colors">
                    {course.title}
                  </h3>
                  
                  <p className="text-white/80 mb-4 text-sm leading-relaxed">
                    {course.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-white/70 text-sm mb-4">
                    <div className="flex items-center space-x-1">
                      <FiClock size={14} />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FiUsers size={14} />
                      <span>{Math.floor(Math.random() * 1000) + 500}+</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 text-yellow-400">
                      <FiStar size={14} />
                      <span className="text-sm font-medium">4.{Math.floor(Math.random() * 3) + 7}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-emerald-custom-400">
                      <span className="text-sm font-medium">{course.topics.length} modules</span>
                      <FiArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Chat Interface */}
      <motion.div
        className={`fixed bottom-6 right-6 z-50 ${showChat ? 'w-96' : 'w-auto'}`}
        initial={false}
        animate={{ 
          width: showChat ? 384 : 'auto',
          height: showChat ? 400 : 60 
        }}
        transition={{ duration: 0.3 }}
      >
        {!showChat ? (
          <motion.button
            className="bg-gradient-to-r from-emerald-custom-500 to-forest-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={() => setShowChat(true)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FiMessageCircle size={24} />
          </motion.button>
        ) : (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 h-full flex flex-col">
            <div className="p-4 border-b border-white/20 flex items-center justify-between">
              <h3 className="text-white font-semibold">AI Course Generator</h3>
              <button 
                onClick={() => setShowChat(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 p-4 flex flex-col justify-center">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-custom-500 to-forest-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiBook className="text-white text-2xl" />
                </div>
                <p className="text-white/90 text-sm leading-relaxed">
                  Ask me to create a course on any engineering topic!
                </p>
              </div>
            </div>
            
            <form onSubmit={handleChatSubmit} className="p-4 border-t border-white/20">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="e.g., Machine Learning for Beginners"
                  className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:border-emerald-custom-500 text-sm"
                  disabled={isGenerating}
                />
                <button
                  type="submit"
                  disabled={isGenerating || !chatInput.trim()}
                  className="bg-gradient-to-r from-emerald-custom-500 to-forest-500 text-white p-2 rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <FiSend size={16} />
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </motion.div>      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Landing;