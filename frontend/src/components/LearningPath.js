import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiCheck, FiAward, FiBarChart2, FiClock, FiCalendar, FiBookOpen, FiTarget } from 'react-icons/fi';
import API_BASE_URL from '../config/api';
import Footer from './Footer';

const LearningPath = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [learningPath, setLearningPath] = useState(null);
  const [currentCourseIndex, setCurrentCourseIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch learning path data
  const fetchLearningPath = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Please sign in to view your learning path');
        navigate('/');
        return;
      }
      
      const response = await axios.get(`${API_BASE_URL}/api/learning-paths/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setLearningPath(response.data);
      setCurrentCourseIndex(response.data.currentCourseIndex || 0);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching learning path:', error);
      setError('Failed to load learning path');
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchLearningPath();
  }, [fetchLearningPath]);

  // Navigate to course
  const handleNavigateToCourse = (courseId) => {
    navigate(`/course/${courseId}`);
  };

  // Mark course as completed
  const handleMarkCourseCompleted = async (courseIndex) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.put(`${API_BASE_URL}/api/learning-paths/${id}/progress`, {
        courseIndex,
        completed: true
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      fetchLearningPath(); // Refresh data
      toast.success('Course marked as completed!');
    } catch (error) {
      console.error('Error updating course progress:', error);
      toast.error('Failed to update progress');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-forest-800 via-dark-forest-700 to-dark-forest-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-custom-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-forest-800 via-dark-forest-700 to-dark-forest-800 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p className="text-white/70 mb-6">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gradient-to-r from-emerald-custom-500 to-forest-500 text-white px-6 py-2 rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Sample data for development (replace with actual data in production)
  const sampleLearningPath = {
    id: id,
    name: "React Development Mastery",
    description: "Complete path to master React.js development from basics to advanced concepts",
    difficulty: "intermediate",
    progress: 35,
    courses: [
      {
        id: "course_1",
        title: "React Fundamentals",
        description: "Learn the core concepts of React including JSX, components, and props",
        completed: true,
        progress: 100,
        duration: 180,
        difficulty: "beginner"
      },
      {
        id: "course_2",
        title: "React Hooks in Depth",
        description: "Master all React hooks and create custom hooks for your applications",
        completed: false,
        progress: 60,
        duration: 210,
        difficulty: "intermediate"
      },
      {
        id: "course_3",
        title: "State Management with Redux",
        description: "Learn to manage complex application state with Redux",
        completed: false,
        progress: 0,
        duration: 240,
        difficulty: "intermediate"
      },
      {
        id: "course_4",
        title: "Advanced React Patterns",
        description: "Explore advanced React patterns for building scalable applications",
        completed: false,
        progress: 0,
        duration: 270,
        difficulty: "advanced"
      }
    ],
    createdAt: "2023-05-15T10:30:00Z",
    updatedAt: "2023-05-20T14:45:00Z"
  };

  // Use sample data if API doesn't return actual data
  const pathData = learningPath || sampleLearningPath;

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-forest-800 via-dark-forest-700 to-dark-forest-800 text-white">
      <div className="px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <motion.button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors mb-6"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            <FiArrowLeft />
            <span>Back to Dashboard</span>
          </motion.button>
        </div>
      </div>
      
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <h1 className="text-4xl font-bold">{pathData.name}</h1>
              <div className="mt-4 md:mt-0 flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  pathData.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400' :
                  pathData.difficulty === 'intermediate' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-purple-500/20 text-purple-400'
                }`}>
                  {pathData.difficulty.charAt(0).toUpperCase() + pathData.difficulty.slice(1)}
                </span>
                <span className="text-white/60 text-sm">
                  Created: {new Date(pathData.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            <p className="text-white/70 text-lg mb-6">
              {pathData.description}
            </p>
            
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <h3 className="text-xl font-semibold flex items-center">
                  <FiBarChart2 className="mr-2 text-emerald-custom-400" />
                  Progress Overview
                </h3>
                <div className="mt-2 md:mt-0 text-white/60">
                  {Math.round(pathData.progress)}% Complete
                </div>
              </div>
              
              <div className="w-full bg-white/10 rounded-full h-3 mb-6">
                <div 
                  className="bg-gradient-to-r from-emerald-custom-500 to-forest-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${pathData.progress}%` }}
                ></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/5 rounded-lg p-4 flex items-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-custom-500/20 flex items-center justify-center mr-3">
                    <FiCheck className="text-emerald-custom-400" />
                  </div>
                  <div>
                    <div className="text-sm text-white/60">Completed</div>
                    <div className="text-xl font-semibold">
                      {pathData.courses.filter(course => course.completed).length}/{pathData.courses.length}
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4 flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mr-3">
                    <FiClock className="text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm text-white/60">Total Time</div>
                    <div className="text-xl font-semibold">
                      {pathData.courses.reduce((acc, course) => acc + course.duration, 0) / 60} hours
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4 flex items-center">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mr-3">
                    <FiCalendar className="text-purple-400" />
                  </div>
                  <div>
                    <div className="text-sm text-white/60">Last Updated</div>
                    <div className="text-xl font-semibold">
                      {new Date(pathData.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <FiBookOpen className="mr-2 text-emerald-custom-400" />
              Your Learning Journey
            </h2>
            
            <div className="space-y-6">
              {pathData.courses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className={`border rounded-xl overflow-hidden ${
                    course.completed 
                      ? 'border-emerald-custom-500/50 bg-emerald-custom-900/20' 
                      : currentCourseIndex === index
                        ? 'border-blue-500/50 bg-blue-900/20'
                        : 'border-white/20 bg-white/5'
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                          course.completed 
                            ? 'bg-emerald-custom-500 text-white' 
                            : currentCourseIndex === index
                              ? 'bg-blue-500 text-white'
                              : 'bg-white/20 text-white/60'
                        }`}>
                          {course.completed ? (
                            <FiCheck />
                          ) : (
                            <span>{index + 1}</span>
                          )}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold">{course.title}</h3>
                          <p className="text-white/60 mt-1">{course.description}</p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        course.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400' :
                        course.difficulty === 'intermediate' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-purple-500/20 text-purple-400'
                      }`}>
                        {course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-white/60 mb-1">
                        <span>Progress</span>
                        <span>{course.progress}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            course.completed 
                              ? 'bg-emerald-custom-500' 
                              : 'bg-blue-500'
                          }`}
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-white/60">
                        <div className="flex items-center">
                          <FiClock className="mr-1" />
                          <span>{course.duration} min</span>
                        </div>
                        {course.completed && (
                          <div className="flex items-center text-emerald-custom-400">
                            <FiCheck className="mr-1" />
                            <span>Completed</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex space-x-3">
                        {!course.completed && (
                          <button
                            onClick={() => handleMarkCourseCompleted(index)}
                            className="px-3 py-1 bg-emerald-custom-500/20 hover:bg-emerald-custom-500/30 text-emerald-custom-400 rounded-md text-sm transition-colors"
                          >
                            Mark Complete
                          </button>
                        )}
                        <button
                          onClick={() => handleNavigateToCourse(course.id)}
                          className={`px-4 py-1 rounded-md text-sm ${
                            course.completed 
                              ? 'bg-white/10 hover:bg-white/20 text-white' 
                              : currentCourseIndex === index
                                ? 'bg-gradient-to-r from-emerald-custom-500 to-forest-500 hover:from-emerald-custom-600 hover:to-forest-600 text-white'
                                : 'bg-white/10 hover:bg-white/20 text-white'
                          }`}
                        >
                          {course.completed ? 'Review' : currentCourseIndex === index ? 'Continue' : 'Start'}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 mb-8"
          >
            <h3 className="text-xl font-semibold flex items-center mb-4">
              <FiTarget className="mr-2 text-emerald-custom-400" />
              Learning Path Completion
            </h3>
            
            <p className="text-white/70 mb-6">
              When you complete all courses in this learning path, you'll receive a certificate of completion that you can share on your professional profiles.
            </p>
            
            {pathData.progress === 100 ? (
              <div className="bg-emerald-custom-900/30 border border-emerald-custom-500/50 rounded-lg p-4 flex items-center">
                <div className="w-12 h-12 bg-emerald-custom-500/20 rounded-full flex items-center justify-center mr-4">
                  <FiAward className="text-emerald-custom-400 text-xl" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-emerald-custom-400">Congratulations!</h4>
                  <p className="text-white/70">
                    You've completed this learning path. Your certificate is ready.
                  </p>
                </div>
                <button className="ml-auto bg-gradient-to-r from-emerald-custom-500 to-forest-500 text-white px-4 py-2 rounded-lg">
                  View Certificate
                </button>
              </div>
            ) : (
              <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center mr-3">
                    <FiTarget className="text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold">Your progress</h4>
                    <p className="text-white/70">
                      Complete all courses to earn your certificate
                    </p>
                  </div>
                </div>
                
                <div className="w-full bg-white/10 rounded-full h-3 mb-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${pathData.progress}%` }}
                  ></div>
                </div>
                
                <div className="text-right text-sm text-white/60">
                  {pathData.courses.filter(course => course.completed).length} of {pathData.courses.length} courses completed
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default LearningPath;