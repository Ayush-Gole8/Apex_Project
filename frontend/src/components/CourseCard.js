import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { motion } from 'framer-motion';
import { FaClock, FaBook } from 'react-icons/fa';

const CourseCard = ({ course }) => {
  const { isDarkMode } = useTheme();
  
  if (!course) {
    return null;
  }
  
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`rounded-lg overflow-hidden shadow-lg ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}
    >
      <div className={`p-5 ${course.color || 'bg-gradient-to-r from-green-600 to-emerald-600'}`}>
        <h3 className="text-white text-xl font-bold">{course.title || 'Untitled Course'}</h3>
      </div>
      
      <div className="p-5">
        <p className="mb-4">{course.description || 'No description available.'}</p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FaClock className="mr-1 text-gray-500" />
            <span className="text-sm">{course.duration || '15-30 min'}</span>
          </div>
          <div className="flex items-center">
            <FaBook className="mr-1 text-gray-500" />
            <span className="text-sm">{course.difficulty || 'Intermediate'}</span>
          </div>
        </div>
        
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">Topics</h4>
          <div className="flex flex-wrap gap-2">
            {course.topics && course.topics.length > 0 ? (
              <>
                {course.topics.slice(0, 3).map((topic, idx) => (
                  <span 
                    key={idx}
                    className={`px-2 py-1 rounded-full text-xs ${
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                    }`}
                  >
                    {topic}
                  </span>
                ))}
                {course.topics.length > 3 && (
                  <span 
                    className={`px-2 py-1 rounded-full text-xs ${
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                    }`}
                  >
                    +{course.topics.length - 3} more
                  </span>
                )}
              </>
            ) : (
              <span 
                className={`px-2 py-1 rounded-full text-xs ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                }`}
              >
                General
              </span>
            )}
          </div>
        </div>
        
        <Link
          to={`/courses/${course.id || course._id || 'unknown'}`}
          className={`block w-full text-center py-2 rounded-md transition-colors ${
            isDarkMode 
              ? 'bg-green-600 text-white hover:bg-green-700' 
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          View Course
        </Link>
      </div>
    </motion.div>
  );
};

export default CourseCard;