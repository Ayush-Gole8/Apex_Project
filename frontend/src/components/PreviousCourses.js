import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiSearch, FiGrid, FiList, FiFilter, FiChevronDown, FiHeart, FiClock, FiCalendar, FiCheck, FiTrash2 } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';
import Footer from './Footer';
import UserCourseCard from './UserCourseCard';
import API_BASE_URL from '../config/api';

const PreviousCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [viewMode, setViewMode] = useState('grid');
  
  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }
      
      const response = await axios.get(`${API_BASE_URL}/api/user/courses`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.courses) {
        setCourses(response.data.courses);
      } else {
        // Fallback to sample data
        console.log('No courses data returned from API, using sample data');
        setCourses(sampleCourses);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Failed to load your courses. Please try again later.');
      // Fallback to sample data
      setCourses(sampleCourses);
    } finally {
      setLoading(false);
    }
  }, [navigate]);
  
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };
  
  const handleSortChange = (newSort) => {
    setSortBy(newSort);
  };
  
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };
  
  const handleDeleteCourse = async (courseId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/user/courses/${courseId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Update local state
      setCourses(courses.filter(course => course.id !== courseId));
      toast.success('Course deleted successfully');
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error('Failed to delete course');
    }
  };
  
  const handleFavoriteCourse = async (courseId, isFavorite) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/api/user/courses/${courseId}/like`, 
        { liked: isFavorite },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Update local state
      setCourses(courses.map(course => 
        course.id === courseId ? { ...course, liked: isFavorite } : course
      ));
      
      toast.success(isFavorite ? 'Added to favorites' : 'Removed from favorites');
    } catch (error) {
      console.error('Error updating favorite status:', error);
      toast.error('Failed to update favorite status');
    }
  };
  
  // Filter and sort courses
  const filteredCourses = Array.isArray(courses) 
    ? courses.filter(course => {
        // Apply search filter if any
        const searchMatch = !searchTerm || 
          (course.topic && course.topic.toLowerCase().includes(searchTerm.toLowerCase())) || 
          (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase()));
        
        // Apply completion filter
        const filterMatch = (filter === 'all') ||
          (filter === 'completed' && course.completed) ||
          (filter === 'inprogress' && !course.completed && course.progress > 0) ||
          (filter === 'notstarted' && course.progress === 0) ||
          (filter === 'favorites' && course.favorite);
          
        return searchMatch && filterMatch;
      }).sort((a, b) => {
        // Apply sorting
        if (sortBy === 'date') {
          return new Date(b.createdAt) - new Date(a.createdAt);
        } else if (sortBy === 'name') {
          return (a.topic || '').localeCompare(b.topic || '');
        } else if (sortBy === 'progress') {
          return (b.progress || 0) - (a.progress || 0);
        }
        return 0;
      })
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-forest-800 via-dark-forest-700 to-dark-forest-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-custom-500"></div>
      </div>
    );
  }
  
  // Sample data for development (remove in production)
  const sampleCourses = [
    {
      id: '1',
      topic: 'Machine Learning Fundamentals',
      description: 'Introduction to core machine learning concepts and algorithms',
      progress: 75,
      favorite: true,
      completed: false,
      lastAccessedAt: '2023-05-15T10:30:00Z',
      createdAt: '2023-05-10T08:20:00Z'
    },
    {
      id: '2',
      topic: 'React.js: Modern Web Development',
      description: 'Build modern web applications with React and related technologies',
      progress: 100,
      favorite: true,
      completed: true,
      lastAccessedAt: '2023-05-18T14:45:00Z',
      createdAt: '2023-05-01T09:15:00Z'
    },
    {
      id: '3',
      topic: 'Data Structures and Algorithms',
      description: 'Comprehensive guide to essential programming concepts',
      progress: 30,
      favorite: false,
      completed: false,
      lastAccessedAt: '2023-05-20T16:20:00Z',
      createdAt: '2023-05-12T11:30:00Z'
    },
    {
      id: '4',
      topic: 'Cloud Computing with AWS',
      description: 'Learn to build scalable applications on Amazon Web Services',
      progress: 0,
      favorite: false,
      completed: false,
      lastAccessedAt: null,
      createdAt: '2023-05-19T10:00:00Z'
    },
    {
      id: '5',
      topic: 'Python for Data Science',
      description: 'Master Python libraries for data analysis and visualization',
      progress: 90,
      favorite: true,
      completed: false,
      lastAccessedAt: '2023-05-21T09:10:00Z',
      createdAt: '2023-04-25T13:45:00Z'
    }
  ];
  
  // Use sample data if no courses are loaded
  const displayCourses = filteredCourses.length > 0 ? filteredCourses : sampleCourses;

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-forest-800 via-dark-forest-700 to-dark-forest-800">
      {/* Header */}
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

      {/* Main Content */}
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row md:items-center justify-between mb-8"
          >
            <h1 className="text-4xl font-bold text-white mb-4 md:mb-0">My Courses</h1>
            <div className="flex flex-wrap items-center gap-4">
              {/* Search Input */}
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="bg-white/10 border border-white/20 text-white placeholder-white/60 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-custom-500"
                />
              </div>
              
              {/* View Mode Toggle */}
              <div className="flex items-center bg-white/10 border border-white/20 rounded-lg">
                <button
                  onClick={() => handleViewModeChange('grid')}
                  className={`p-2 rounded-l-lg ${viewMode === 'grid' ? 'bg-emerald-custom-500 text-white' : 'text-white/60 hover:text-white'}`}
                >
                  <FiGrid size={20} />
                </button>
                <button
                  onClick={() => handleViewModeChange('list')}
                  className={`p-2 rounded-r-lg ${viewMode === 'list' ? 'bg-emerald-custom-500 text-white' : 'text-white/60 hover:text-white'}`}
                >
                  <FiList size={20} />
                </button>
              </div>
            </div>
          </motion.div>
          
          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-wrap items-center gap-4 mb-8"
          >
            <div className="flex items-center text-white/80">
              <FiFilter className="mr-2" />
              <span>Filter:</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleFilterChange('all')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium ${filter === 'all' ? 'bg-emerald-custom-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
              >
                All Courses
              </button>
              <button
                onClick={() => handleFilterChange('inprogress')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium ${filter === 'inprogress' ? 'bg-emerald-custom-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
              >
                In Progress
              </button>
              <button
                onClick={() => handleFilterChange('completed')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium ${filter === 'completed' ? 'bg-emerald-custom-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
              >
                Completed
              </button>
              <button
                onClick={() => handleFilterChange('notstarted')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium ${filter === 'notstarted' ? 'bg-emerald-custom-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
              >
                Not Started
              </button>
              <button
                onClick={() => handleFilterChange('favorites')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium ${filter === 'favorites' ? 'bg-emerald-custom-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
              >
                <FiHeart className="inline mr-1" />
                Favorites
              </button>
            </div>
            
            <div className="ml-auto flex items-center gap-2">
              <span className="text-white/80">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="bg-white/10 border border-white/20 text-white rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-custom-500"
              >
                <option value="date">Date Added</option>
                <option value="name">Name</option>
                <option value="progress">Progress</option>
              </select>
            </div>
          </motion.div>
          
          {/* Courses Grid/List */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/40 text-white rounded-lg p-4 mb-6">
              <p>{error}</p>
            </div>
          )}
          
          {displayCourses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/10 border border-white/20 rounded-xl p-10 text-center"
            >
              <h3 className="text-xl font-semibold text-white mb-2">No courses found</h3>
              <p className="text-white/70 mb-6">You haven't generated any courses yet or none match your current filters.</p>
              <button
                onClick={() => navigate('/')}
                className="bg-gradient-to-r from-emerald-custom-500 to-forest-500 text-white px-6 py-2 rounded-lg font-medium"
              >
                Generate a Course
              </button>
            </motion.div>
          ) : viewMode === 'grid' ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {displayCourses.map((course, index) => (
                <UserCourseCard
                  key={course.id || index}
                  course={course}
                  onCourseUpdate={(updatedCourse) => {
                    setCourses(courses.map(c => c.id === updatedCourse.id ? updatedCourse : c));
                  }}
                  onCourseDelete={(courseId) => {
                    setCourses(courses.filter(c => c.id !== courseId));
                  }}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-4"
            >
              {displayCourses.map((course, index) => (
                <div
                  key={course.id || index}
                  className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center gap-4 cursor-pointer hover:bg-white/15 transition-colors"
                  onClick={() => navigate('/generated-course', { state: { courseData: course.course, topic: course.topic } })}
                >
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-white/60">{new Date(course.createdAt).toLocaleDateString()}</span>
                      {course.completed && (
                        <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full flex items-center">
                          <FiCheck size={10} className="mr-1" />
                          Completed
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-1">{course.course?.title || `Course on ${course.topic}`}</h3>
                    <p className="text-white/70 text-sm line-clamp-1">{course.course?.description || 'No description available'}</p>
                  </div>
                  
                  <div className="w-full md:w-48">
                    <div className="flex justify-between text-white/80 text-xs mb-1">
                      <span>Progress</span>
                      <span>{course.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-1.5">
                      <div 
                        className="bg-gradient-to-r from-emerald-custom-500 to-forest-500 h-1.5 rounded-full"
                        style={{ width: `${course.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        course.liked ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white/60 hover:bg-white/20'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFavoriteCourse(course.id, !course.liked);
                      }}
                    >
                      <FiHeart className={course.liked ? 'fill-current' : ''} size={16} />
                    </button>
                    
                    <button
                      className="w-8 h-8 bg-white/10 text-white/60 rounded-full flex items-center justify-center hover:bg-red-500/20 hover:text-red-400"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCourse(course.id);
                      }}
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
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