import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiArrowLeft, FiBook, FiClock, FiTrendingUp, FiAward, 
  FiCalendar, FiTarget, FiStar, FiPlay, FiBarChart2
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import Footer from './Footer';
import API_BASE_URL from '../config/api';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    fetchDashboardData();
    
    // Auto-refresh dashboard data every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    
    // Refresh when component becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchDashboardData();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, navigate]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching dashboard data with token:', token ? 'present' : 'missing');
      
      const response = await axios.get(`${API_BASE_URL}/api/user/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Dashboard data received:', response.data);
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      console.error('Error response:', error.response?.data);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Add refresh function
  const refreshDashboard = () => {
    setLoading(true);
    fetchDashboardData();
  };

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

      {/* Dashboard Content */}
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <motion.div
            className="mb-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome back, {dashboardData?.user?.name}! 👋
            </h1>
            <p className="text-white/70">
              Here's your learning progress and achievements
            </p>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              className="bg-gradient-to-r from-emerald-custom-600 to-emerald-custom-700 p-6 rounded-2xl"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center justify-between mb-4">
                <FiBook className="text-white text-2xl" />
                <span className="text-white/70 text-sm">Total</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1">
                {dashboardData?.stats?.totalCourses || 0}
              </h3>
              <p className="text-white/80 text-sm">Courses Generated</p>
            </motion.div>

            <motion.div
              className="bg-gradient-to-r from-forest-600 to-forest-700 p-6 rounded-2xl"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-4">
                <FiTarget className="text-white text-2xl" />
                <span className="text-white/70 text-sm">Completed</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1">
                {dashboardData?.stats?.completedCourses || 0}
              </h3>
              <p className="text-white/80 text-sm">Courses Finished</p>
            </motion.div>

            <motion.div
              className="bg-gradient-to-r from-emerald-custom-500 to-dark-forest-600 p-6 rounded-2xl"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-4">
                <FiClock className="text-white text-2xl" />
                <span className="text-white/70 text-sm">Study Time</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1">
                {dashboardData?.stats?.totalStudyTime || 0}m
              </h3>
              <p className="text-white/80 text-sm">Minutes Learned</p>
            </motion.div>

            <motion.div
              className="bg-gradient-to-r from-warm-orange-600 to-warm-orange-500 p-6 rounded-2xl"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center justify-between mb-4">
                <FiTrendingUp className="text-white text-2xl" />
                <span className="text-white/70 text-sm">This Week</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1">
                {dashboardData?.stats?.coursesThisWeek || 0}
              </h3>
              <p className="text-white/80 text-sm">New Courses</p>
            </motion.div>
          </div>

          {/* Progress Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Completion Rate */}
            <motion.div
              className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <FiBarChart2 className="mr-2" />
                Learning Progress
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-white/80 text-sm mb-2">
                    <span>Completion Rate</span>
                    <span>{dashboardData?.stats?.completionRate || 0}%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-forest-400 to-emerald-custom-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${dashboardData?.stats?.completionRate || 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {dashboardData?.stats?.completedCourses || 0}
                    </div>
                    <div className="text-white/60 text-sm">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      {dashboardData?.stats?.inProgressCourses || 0}
                    </div>
                    <div className="text-white/60 text-sm">In Progress</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Achievements */}
            <motion.div
              className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <FiAward className="mr-2" />
                Achievements
              </h3>
              
              <div className="space-y-4">
                {dashboardData?.achievements?.map((achievement, index) => (
                  <div 
                    key={index}
                    className={`flex items-center space-x-3 p-3 rounded-lg ${
                      achievement.unlocked 
                        ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30' 
                        : 'bg-white/5 border border-white/10'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      achievement.unlocked ? 'bg-yellow-500' : 'bg-white/20'
                    }`}>
                      <FiStar className={achievement.unlocked ? 'text-white' : 'text-white/40'} />
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-semibold ${achievement.unlocked ? 'text-yellow-300' : 'text-white/60'}`}>
                        {achievement.name}
                      </h4>
                      <p className="text-white/60 text-sm">{achievement.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Recent Activity & Favorite Topics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Activity */}
            <motion.div
              className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <FiCalendar className="mr-2" />
                Recent Activity
              </h3>
              
              <div className="space-y-3">
                {dashboardData?.recentActivity?.length > 0 ? (
                  dashboardData.recentActivity.slice(0, 5).map((course, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                      <div className="w-10 h-10 bg-gradient-to-r from-emerald-custom-500 to-forest-500 rounded-lg flex items-center justify-center">
                        <FiPlay className="text-white" size={14} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-medium text-sm truncate">{course.topic}</h4>
                        <p className="text-white/60 text-xs">
                          {new Date(course.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-white/60 text-center py-4">No recent activity</p>
                )}
              </div>
            </motion.div>

            {/* Favorite Topics */}
            <motion.div
              className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <FiStar className="mr-2" />
                Favorite Topics
              </h3>
              
              <div className="space-y-3">
                {dashboardData?.favoriteTopics?.length > 0 ? (
                  dashboardData.favoriteTopics.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-white/80 capitalize">{item.topic}</span>
                      <span className="text-emerald-custom-400 font-semibold">{item.count}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-white/60 text-center py-4">No favorite topics yet</p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Dashboard;