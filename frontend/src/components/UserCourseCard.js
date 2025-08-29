import React from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiHeart, FiTrash2, FiBook, FiArrowRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import API_BASE_URL from '../config/api';

const UserCourseCard = ({ course, onCourseUpdate, onCourseDelete }) => {
  const navigate = useNavigate();

  const handleCourseClick = () => {
    navigate('/generated-course', { 
      state: { 
        courseData: course.course, 
        topic: course.topic 
      } 
    });
  };

  const handleLikeToggle = async (e) => {
    e.stopPropagation(); // Prevent card click
    
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/api/user/courses/${course.id}/like`, {
        liked: !course.liked
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      toast.success(course.liked ? 'Removed from favorites' : 'Added to favorites');
      if (onCourseUpdate) {
        onCourseUpdate({
          ...course,
          liked: !course.liked
        });
      }
    } catch (error) {
      console.error('Error updating course:', error);
      toast.error('Failed to update course');
    }
  };

  const handleDeleteCourse = async (e) => {
    e.stopPropagation(); // Prevent card click
    
    if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_BASE_URL}/api/user/courses/${course.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        toast.success('Course deleted successfully');
        if (onCourseDelete) {
          onCourseDelete(course.id);
        }
      } catch (error) {
        console.error('Error deleting course:', error);
        toast.error('Failed to delete course');
      }
    }
  };

  // Extract data from course object
  const courseData = course.course || {};
  const title = courseData.title || `Course on ${course.topic}`;
  const description = courseData.description || 'No description available';
  const duration = courseData.duration || '15-30 minutes';
  const date = new Date(course.createdAt).toLocaleDateString();
  const progress = course.progress || 0;
  
  return (
    <motion.div
      className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 cursor-pointer group"
      whileHover={{ 
        y: -5, 
        transition: { duration: 0.2 }
      }}
      onClick={handleCourseClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-r from-emerald-custom-500 to-forest-500 rounded-xl flex items-center justify-center">
            <FiBook className="text-white" />
          </div>
          <div>
            <span className="text-xs text-white/60">{date}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <motion.button
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              course.liked ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleLikeToggle}
          >
            <FiHeart className={course.liked ? 'fill-current' : ''} size={16} />
          </motion.button>
          
          <motion.button
            className="w-8 h-8 bg-white/10 text-white/60 rounded-full flex items-center justify-center hover:bg-red-500/20 hover:text-red-400 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleDeleteCourse}
          >
            <FiTrash2 size={16} />
          </motion.button>
        </div>
      </div>
      
      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-custom-300 transition-colors line-clamp-2">
        {title}
      </h3>
      
      <p className="text-white/70 text-sm mb-4 line-clamp-2">
        {description}
      </p>
      
      <div className="mb-4">
        <div className="flex justify-between text-white/80 text-xs mb-1">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-1.5">
          <div 
            className="bg-gradient-to-r from-emerald-custom-500 to-forest-500 h-1.5 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1 text-white/70">
          <FiClock size={14} />
          <span className="text-xs">{duration}</span>
        </div>
        
        <div className="flex items-center space-x-1 text-emerald-custom-400">
          <span className="text-xs font-medium">View Course</span>
          <FiArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </motion.div>
  );
};

export default UserCourseCard;