import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { FaBookOpen, FaClock, FaGraduationCap, FaBrain, FaRobot, FaHistory } from 'react-icons/fa';
import GeneratedCourse from './GeneratedCourse';
import { toast } from 'react-hot-toast';
import { apiUtils } from '../utils/api';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  
  const [dashboardData, setDashboardData] = useState(null);
  const [userCourses, setUserCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [topic, setTopic] = useState('');
  const [generating, setGenerating] = useState(false);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/');
          return;
        }
        
        // Fetch dashboard stats and user courses
        const [dashboardResponse, coursesResponse] = await Promise.all([
          apiUtils.getUserDashboard(),
          apiUtils.getUserCourses()
        ]);
        
        if (!dashboardResponse.ok || !coursesResponse.ok) {
          throw new Error('Failed to fetch data');
        }
        
        const dashboardJson = await dashboardResponse.json();
        const coursesJson = await coursesResponse.json();
        setDashboardData(dashboardJson);
        setUserCourses(coursesJson.courses || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [navigate]);
  
  const handleGenerateCourse = async (e) => {
    e.preventDefault();
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }
    setGenerating(true);
    try {
      const response = await apiUtils.generateCourse(topic);
      const data = await response.json();
      if (response.ok) {
        setSelectedCourse(data.course || data);
        toast.success('Course generated successfully!');
        // Refresh user courses
        const coursesResponse = await apiUtils.getUserCourses();
        if (coursesResponse.ok) {
          const coursesData = await coursesResponse.json();
          setUserCourses(coursesData.courses || []);
        }
      } else {
        toast.error(data.message || 'Failed to generate course');
      }
    } catch (error) {
      console.error('Error generating course:', error);
      toast.error('Failed to generate course');
    } finally {
      setGenerating(false);
    }
  };
  
  const handleCourseClick = (course) => {
    setSelectedCourse(course);
  };
  
  const handleBackToDashboard = () => {
    setSelectedCourse(null);
  };
  
  const handleCourseUpdate = async () => {
    try {
      const [coursesResponse, dashboardResponse] = await Promise.all([
        apiUtils.getUserCourses(),
        apiUtils.getUserDashboard()
      ]);
      
      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json();
        setUserCourses(coursesData.courses || []);
      }
      if (dashboardResponse.ok) {
        const dashboardJson = await dashboardResponse.json();
        setDashboardData(dashboardJson);
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-red-500 text-xl mb-4">Error: {error}</div>
        <button 
          onClick={() => navigate('/')} 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Return to Home
        </button>
      </div>
    );
  }
  
  if (selectedCourse) {
    return (
      <GeneratedCourse 
        course={selectedCourse} 
        onBack={handleBackToDashboard}
        onUpdate={handleCourseUpdate}
      />
    );
  }
  
  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
      {/* Header */}
      <header className={`py-4 px-4 md:px-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow'}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold">
            <span className="text-green-600">Ape</span>X
          </Link>
          
          <div className="flex items-center">
            <button
              onClick={() => logout()}
              className={`px-4 py-2 rounded-md ${
                isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600' 
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-8 px-4 md:px-8">
        {/* Generate Course Section */}
        <section className={`mb-12 p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow-md'}`}>
          <h2 className="text-2xl font-bold mb-4">Generate a New Course</h2>
          
          <form onSubmit={handleGenerateCourse} className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter an engineering topic..."
              className={`flex-grow p-3 rounded-md outline-none ${
                isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border border-gray-300'
              }`}
            />
            <button
              type="submit"
              disabled={generating}
              className={`px-6 py-3 rounded-md ${
                generating 
                  ? 'bg-green-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700'
              } text-white font-medium`}
            >
              {generating ? (
                <div className="flex items-center">
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Generating...
                </div>
              ) : (
                'Generate Course'
              )}
            </button>
          </form>
          <p className="mt-2 text-sm text-gray-500">
            Example topics: "Docker containers", "Neural networks", "Database indexing"
          </p>
        </section>
        
        {/* Dashboard Stats */}
        {dashboardData && (
          <section className="mb-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow-md'}`}>
              <div className="flex items-center">
                <div className={`rounded-full p-3 ${isDarkMode ? 'bg-green-900' : 'bg-green-100'}`}>
                  <FaBookOpen className={isDarkMode ? 'text-green-300' : 'text-green-600'} size={24} />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Total Courses</h3>
                  <p className="text-2xl font-semibold">{dashboardData.stats.totalCourses}</p>
                </div>
              </div>
            </div>
            
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow-md'}`}>
              <div className="flex items-center">
                <div className={`rounded-full p-3 ${isDarkMode ? 'bg-green-900' : 'bg-green-100'}`}>
                  <FaGraduationCap className={isDarkMode ? 'text-green-300' : 'text-green-600'} size={24} />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Completed</h3>
                  <p className="text-2xl font-semibold">{dashboardData.stats.completedCourses}</p>
                </div>
              </div>
            </div>
            
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow-md'}`}>
              <div className="flex items-center">
                <div className={`rounded-full p-3 ${isDarkMode ? 'bg-emerald-900' : 'bg-emerald-100'}`}>
                  <FaClock className={isDarkMode ? 'text-emerald-300' : 'text-emerald-600'} size={24} />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Study Time</h3>
                  <p className="text-2xl font-semibold">{dashboardData.stats.totalStudyTime} min</p>
                </div>
              </div>
            </div>
            
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow-md'}`}>
              <div className="flex items-center">
                <div className={`rounded-full p-3 ${isDarkMode ? 'bg-lime-900' : 'bg-lime-100'}`}>
                  <FaBrain className={isDarkMode ? 'text-lime-300' : 'text-lime-600'} size={24} />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Completion Rate</h3>
                  <p className="text-2xl font-semibold">{dashboardData.stats.completionRate}%</p>
                </div>
              </div>
            </div>
          </section>
        )}
        
        {/* Recent Courses */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Your Courses</h2>
          
          {userCourses.length === 0 ? (
            <div className={`p-8 rounded-lg text-center ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow-md'}`}>
              <FaRobot size={48} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">No courses yet</h3>
              <p className="mb-4">Generate your first course by entering a topic above</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userCourses.map((userCourse) => (
                <div 
                  key={userCourse.id}
                  className={`p-6 rounded-lg cursor-pointer transition duration-200 ${
                    isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white shadow-md hover:shadow-lg'
                  }`}
                  onClick={() => handleCourseClick(userCourse.course)}
                >
                  <h3 className="text-xl font-semibold mb-2">{userCourse.course.title}</h3>
                  <p className="mb-4 line-clamp-2">{userCourse.course.description}</p>
                  
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                      <FaClock className="mr-2 text-gray-500" />
                      <span>{userCourse.course.duration || userCourse.course.estimatedReadTime || '20-30 minutes'}</span>
                    </div>
                    <div>
                      {userCourse.completed ? (
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          isDarkMode ? 'bg-green-800 text-green-200' : 'bg-green-100 text-green-800'
                        }`}>
                          Completed
                        </span>
                      ) : (
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          isDarkMode ? 'bg-emerald-800 text-emerald-200' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          In Progress
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">
                      Created: {new Date(userCourse.createdAt).toLocaleDateString()}
                    </span>
                    <button 
                      className={`font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCourseClick(userCourse.course);
                      }}
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        
        {/* Recent Activity */}
        {dashboardData && dashboardData.recentActivity && dashboardData.recentActivity.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
            
            <div className={`rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow-md'}`}>
              <ul className="divide-y divide-gray-200">
                {dashboardData.recentActivity.map((activity, index) => (
                  <li key={index} className="p-4">
                    <div className="flex items-start">
                      <div className={`rounded-full p-2 mt-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <FaHistory className="text-gray-500" />
                      </div>
                      <div className="ml-3">
                        <p className="font-medium">{activity.topic}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(activity.createdAt).toLocaleDateString()} at {' '}
                          {new Date(activity.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Dashboard;