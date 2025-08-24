import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiArrowLeft, FiBook, FiClock, FiCalendar, FiPlay, 
  FiCheckCircle, FiSearch, FiFilter 
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import Footer from './Footer';

const PreviousCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    fetchUserCourses();
  }, [isAuthenticated, navigate]);

  const fetchUserCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/user/courses', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setCourses(response.data.courses);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleCourseClick = (course) => {
    navigate('/generated-course', {
      state: {
        courseData: course.course,
        topic: course.topic,
        isRevisit: true
      }
    });
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.course.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'completed') return matchesSearch && course.completed;
    if (filterStatus === 'in-progress') return matchesSearch && course.progress > 0 && !course.completed;
    if (filterStatus === 'not-started') return matchesSearch && course.progress === 0;
    
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-forest-800 via-dark-forest-700 to-dark-forest-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-custom-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-forest-800 via-dark-forest-700 to-dark-forest-800">
      {/* Header */}
      <div className="px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <motion.button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors mb-6"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            <FiArrowLeft />
            <span>Back to home</span>
          </motion.button>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Title */}
          <motion.div
            className="mb-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <h1 className="text-4xl font-bold text-white mb-2">My Courses</h1>
            <p className="text-white/80">
              Revisit your generated courses and track your learning progress
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="bg-white/12 backdrop-blur-lg border border-white/25 rounded-xl p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-emerald-custom-500/20 rounded-lg flex items-center justify-center">
                  <FiBook className="text-emerald-custom-500 text-xl" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{courses.length}</h3>
                  <p className="text-white/70">Total Courses</p>
                </div>
              </div>
            </div>

            <div className="bg-white/12 backdrop-blur-lg border border-white/25 rounded-xl p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-forest-500/20 rounded-lg flex items-center justify-center">
                  <FiCheckCircle className="text-forest-500 text-xl" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    {courses.filter(c => c.completed).length}
                  </h3>
                  <p className="text-white/70">Completed</p>
                </div>
              </div>
            </div>

            <div className="bg-white/12 backdrop-blur-lg border border-white/25 rounded-xl p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-warm-orange-500/20 rounded-lg flex items-center justify-center">
                  <FiPlay className="text-warm-orange-500 text-xl" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    {courses.filter(c => c.progress > 0 && !c.completed).length}
                  </h3>
                  <p className="text-white/70">In Progress</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Search and Filter */}
          <motion.div
            className="flex flex-col md:flex-row gap-4 mb-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-emerald-custom-500"
              />
            </div>
            
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg pl-10 pr-8 py-3 text-white focus:outline-none focus:border-emerald-custom-500 appearance-none cursor-pointer"
              >
                <option value="all">All Courses</option>
                <option value="completed">Completed</option>
                <option value="in-progress">In Progress</option>
                <option value="not-started">Not Started</option>
              </select>
            </div>
          </motion.div>

          {/* Courses Grid */}
          {filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-300 cursor-pointer group"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 * index }}
                  onClick={() => handleCourseClick(course)}
                >
                  {/* Status Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      course.completed 
                        ? 'bg-forest-500/20 text-forest-300'
                        : course.progress > 0 
                        ? 'bg-emerald-custom-500/20 text-emerald-custom-300'
                        : 'bg-gray-500/20 text-gray-300'
                    }`}>
                      {course.completed ? 'Completed' : course.progress > 0 ? 'In Progress' : 'Not Started'}
                    </span>
                    
                    {course.course.isAIGenerated && (
                      <span className="text-emerald-custom-500 text-xs">AI Generated</span>
                    )}
                  </div>

                  {/* Course Info */}
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-emerald-custom-300 transition-colors">
                    {course.course.title}
                  </h3>
                  
                  <p className="text-white/80 text-sm mb-4 line-clamp-2">
                    {course.course.description}
                  </p>

                  {/* Metadata */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-white/70 text-sm">
                      <FiClock size={14} />
                      <span>{course.course.duration}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-white/70 text-sm">
                      <FiCalendar size={14} />
                      <span>{new Date(course.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-white/70 text-sm">
                      <FiBook size={14} />
                      <span>{course.course.modules?.length || 0} modules</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-white/60 text-xs mb-1">
                      <span>Progress</span>
                      <span>{course.progress}%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-emerald-custom-500 to-forest-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button className="w-full bg-gradient-to-r from-emerald-custom-500/20 to-forest-500/20 border border-emerald-custom-500/30 text-white py-2 rounded-lg font-medium hover:from-emerald-custom-500/30 hover:to-forest-500/30 transition-all duration-300 group-hover:border-emerald-custom-400">
                    {course.completed ? 'Review Course' : course.progress > 0 ? 'Continue Learning' : 'Start Course'}
                  </button>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              className="text-center py-16"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiBook className="text-white/60 text-3xl" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {searchTerm || filterStatus !== 'all' ? 'No courses found' : 'No courses yet'}
              </h3>
              <p className="text-white/60 mb-6">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Start generating courses to see them here'
                }
              </p>
              {!searchTerm && filterStatus === 'all' && (
                <button
                  onClick={() => navigate('/')}
                  className="bg-gradient-to-r from-emerald-custom-500 to-forest-500 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg hover:shadow-emerald-custom-500/25 transition-all duration-300"
                >
                  Generate Your First Course
                </button>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default PreviousCourses;