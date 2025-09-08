import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { motion } from 'framer-motion';
import { FaRocket, FaLightbulb, FaGraduationCap, FaClock } from 'react-icons/fa';
import LoginModal from './auth/LoginModal';
import RegisterModal from './auth/RegisterModal';
import CourseCard from './CourseCard';
import GeneratedCourse from './GeneratedCourse';
import { apiUtils } from '../utils/api';
import heroImage from '../assets/hero-image.svg';

const Landing = () => {
  const { isDarkMode } = useTheme();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [topic, setTopic] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedCourse, setGeneratedCourse] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  
  useEffect(() => {
    fetchCourses();
  }, []);
  
  const fetchCourses = async () => {
    try {
      setCoursesLoading(true);
      const response = await apiUtils.getCourses();
      if (response.ok) {
        const data = await response.json();
        // Support both array and { courses: [] }
        const list = Array.isArray(data) ? data : (data.courses || []);
        setCourses(list);
      } else {
        setCourses([]);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
    } finally {
      setCoursesLoading(false);
    }
  };
  
  const handleLogin = () => setShowLoginModal(true);
  const handleRegister = () => setShowRegisterModal(true);
  const closeModals = () => { setShowLoginModal(false); setShowRegisterModal(false); };
  const handleTopicChange = (e) => setTopic(e.target.value);
  
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!topic.trim()) { toast.error('Please enter a topic'); return; }
    setGenerating(true);
    setErrorMessage('');
    try {
      const token = localStorage.getItem('token');
      if (!token && !isAuthenticated) {
        toast.error('Please log in to generate a course');
        setShowLoginModal(true);
        setGenerating(false);
        return;
      }
      const response = await apiUtils.generateCourse(topic);
      const data = await response.json();
      if (response.ok) {
        // Support both {course} and direct course object
        setGeneratedCourse(data.course || data);
        toast.success('Course generated successfully!');
      } else {
        setErrorMessage(data.message || 'Failed to generate course. Please try again later.');
        toast.error('Failed to generate course');
      }
    } catch (error) {
      console.error('Error generating course:', error);
      setErrorMessage('Failed to generate course. Please try again later.');
      toast.error('Failed to generate course');
    } finally {
      setGenerating(false);
    }
  };
  
  const handleBackToHome = () => { setGeneratedCourse(null); setTopic(''); };
  
  if (generatedCourse) {
    return (
      <GeneratedCourse 
        course={generatedCourse} 
        onBack={handleBackToHome}
      />
    );
  }
  
  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      {/* Hero Section */}
      <section className={`py-20 px-4 md:px-8 lg:px-16 ${isDarkMode ? 'bg-gray-800' : 'bg-green-50'}`}>
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 mb-12 lg:mb-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className={`text-4xl md:text-5xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Master Complex Engineering Topics in <span className="text-green-600">Minutes</span>
              </h1>
              <p className="text-xl mb-8">
                AI-powered microlearning courses designed for busy engineers.
                Understand key concepts quickly and effectively.
              </p>
              
              <div className="space-y-4 max-w-md">
                <form onSubmit={handleChatSubmit} className="flex flex-col space-y-3">
                  <div className={`flex rounded-lg overflow-hidden shadow-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
                    <input
                      type="text"
                      value={topic}
                      onChange={handleTopicChange}
                      placeholder="Enter an engineering topic..."
                      className={`flex-grow p-4 outline-none ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`}
                    />
                    <button
                      type="submit"
                      disabled={generating}
                      className={`px-6 py-4 bg-green-600 text-white font-medium flex items-center ${
                        generating ? 'opacity-70 cursor-not-allowed' : 'hover:bg-green-700'
                      }`}
                    >
                      {generating ? (
                        <>
                          <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <FaRocket className="mr-2" /> Generate Course
                        </>
                      )}
                    </button>
                  </div>
                  
                  {errorMessage && (
                    <div className="p-3 bg-red-100 text-red-700 rounded-md">
                      {errorMessage}
                    </div>
                  )}
                  
                  <p className="text-sm text-gray-500">
                    Example topics: "Binary search trees", "React hooks", "Kubernetes architecture"
                  </p>
                </form>
                
                {!isAuthenticated && (
                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mt-6">
                    <button
                      onClick={handleLogin}
                      className={`px-6 py-3 rounded-md ${
                        isDarkMode 
                          ? 'bg-blue-600 text-white hover:bg-blue-700' 
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      onClick={handleRegister}
                      className={`px-6 py-3 rounded-md ${
                        isDarkMode 
                          ? 'bg-gray-700 text-white hover:bg-gray-600' 
                          : 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      Create Account
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
          <div className="lg:w-1/2 lg:pl-16">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <img
                src={heroImage}
                alt="AI Learning Illustration"
                className="w-full max-w-md mx-auto"
              />
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Engineers Love ApeX</h2>
            <p className="text-xl max-w-3xl mx-auto">
              Designed specifically for engineering professionals who need to learn quickly
              and effectively.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ y: -5 }}
              className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow-md'}`}
            >
              <div className={`rounded-full w-12 h-12 flex items-center justify-center mb-4 ${
                isDarkMode ? 'bg-blue-500' : 'bg-blue-100'
              }`}>
                <FaClock className={isDarkMode ? 'text-white' : 'text-blue-600'} size={20} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Quick Learning</h3>
              <p>
                Courses designed to be completed in 15-30 minutes, perfect for busy professionals.
              </p>
            </motion.div>
            
            <motion.div
              whileHover={{ y: -5 }}
              className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow-md'}`}
            >
              <div className={`rounded-full w-12 h-12 flex items-center justify-center mb-4 ${
                isDarkMode ? 'bg-green-500' : 'bg-green-100'
              }`}>
                <FaLightbulb className={isDarkMode ? 'text-white' : 'text-green-600'} size={20} />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered Content</h3>
              <p>
                Courses generated by advanced AI, tailored to your specific learning needs.
              </p>
            </motion.div>
            
            <motion.div
              whileHover={{ y: -5 }}
              className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow-md'}`}
            >
              <div className={`rounded-full w-12 h-12 flex items-center justify-center mb-4 ${
                isDarkMode ? 'bg-purple-500' : 'bg-purple-100'
              }`}>
                <FaGraduationCap className={isDarkMode ? 'text-white' : 'text-purple-600'} size={20} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Engineering Focus</h3>
              <p>
                Content designed specifically for engineers with practical examples and applications.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Featured Courses */}
      <section className={`py-16 px-4 md:px-8 ${isDarkMode ? 'bg-gray-800' : 'bg-green-50'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Featured Courses</h2>
            <Link 
              to="/courses" 
              className={`px-4 py-2 rounded-md ${
                isDarkMode 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              View All Courses
            </Link>
          </div>
          
          {coursesLoading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.slice(0, 6).map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      </section>
      
      {/* How It Works */}
      <section className="py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How ApeX Works</h2>
            <p className="text-xl max-w-3xl mx-auto">
              Generate customized engineering courses in seconds with our AI-powered platform.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className={`rounded-full w-16 h-16 flex items-center justify-center mb-4 mx-auto ${
                isDarkMode ? 'bg-blue-600' : 'bg-blue-100'
              }`}>
                <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-blue-600'}`}>1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Enter a Topic</h3>
              <p>
                Type any engineering topic you want to learn about.
              </p>
            </div>
            
            <div className="text-center">
              <div className={`rounded-full w-16 h-16 flex items-center justify-center mb-4 mx-auto ${
                isDarkMode ? 'bg-blue-600' : 'bg-blue-100'
              }`}>
                <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-blue-600'}`}>2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Generates Course</h3>
              <p>
                Our AI creates a tailored course with key concepts, examples, and resources.
              </p>
            </div>
            
            <div className="text-center">
              <div className={`rounded-full w-16 h-16 flex items-center justify-center mb-4 mx-auto ${
                isDarkMode ? 'bg-blue-600' : 'bg-blue-100'
              }`}>
                <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-blue-600'}`}>3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Learn & Apply</h3>
              <p>
                Study the material at your own pace and apply your new knowledge immediately.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className={`py-16 px-4 md:px-8 ${isDarkMode ? 'bg-gray-800' : 'bg-green-600 text-white'}`}>
        <div className="max-w-7xl mx-auto text-center">
          <h2 className={`text-3xl font-bold mb-4 ${!isDarkMode && 'text-white'}`}>
            Ready to Accelerate Your Engineering Learning?
          </h2>
          <p className={`text-xl max-w-3xl mx-auto mb-8 ${!isDarkMode && 'text-blue-100'}`}>
            Join thousands of engineers who are learning faster and more effectively with ApeX.
          </p>
          
          <button
            onClick={isAuthenticated ? () => window.scrollTo(0, 0) : handleRegister}
            className={`px-8 py-3 rounded-md text-lg font-medium ${
              isDarkMode 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-white text-green-600 hover:bg-green-50'
            }`}
          >
            {isAuthenticated ? 'Generate a Course Now' : 'Create Free Account'}
          </button>
        </div>
      </section>
      
      {/* Login/Register Modals */}
      {showLoginModal && (
        <LoginModal 
          onClose={closeModals} 
          onRegisterClick={() => {
            setShowLoginModal(false);
            setShowRegisterModal(true);
          }}
        />
      )}
      
      {showRegisterModal && (
        <RegisterModal 
          onClose={closeModals} 
          onLoginClick={() => {
            setShowRegisterModal(false);
            setShowLoginModal(true);
          }}
        />
      )}
    </div>
  );
};

export default Landing;