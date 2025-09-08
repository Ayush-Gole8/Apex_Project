import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { motion } from 'framer-motion';
import { FaClock, FaBookOpen, FaClipboardCheck, FaCheckCircle, FaChevronDown, FaChevronUp, FaExternalLinkAlt } from 'react-icons/fa';
import { apiUtils } from '../utils/api';

const GeneratedCourse = ({ course: initialCourse, onBack, onUpdate }) => {
  const { isDarkMode } = useTheme();
  const { isAuthenticated } = useAuth();
  const [courseData, setCourseData] = useState(initialCourse || null);
  const [loading, setLoading] = useState(!initialCourse);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [expandedModules, setExpandedModules] = useState({});
  const { courseId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const course = initialCourse || courseData;
    if (initialCourse) {
      setCourseData(initialCourse);
      if (initialCourse.modules && Array.isArray(initialCourse.modules) && initialCourse.modules.length > 0) {
        setExpandedModules({ 0: true });
      }
      return;
    }
    if (!courseId) return;

    const fetchCourse = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          setError('You must be logged in to view this course');
          setLoading(false);
          return;
        }
        const response = await apiUtils.getCourse(courseId);
        if (!response.ok) {
          throw new Error('Failed to fetch course');
        }
        const data = await response.json();
        const fetched = data.course || data;
        setCourseData(fetched);
        if (fetched.modules && Array.isArray(fetched.modules) && fetched.modules.length > 0) {
          setExpandedModules({ 0: true });
        }
      } catch (err) {
        console.error('Error fetching course:', err);
        setError(err.message || 'Failed to load course');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId, initialCourse]);

  const markCourseCompleted = async () => {
    try {
      setUpdating(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('You must be logged in to save progress');
        setUpdating(false);
        return;
      }
      const id = courseId || courseData?.id || courseData?._id;
      if (!id) {
        toast.error('Missing course id');
        return;
      }
      const response = await apiUtils.updateCourseProgress(id, 100, true);
      const responseData = await response.json();
      if (response.ok) {
        toast.success('Course marked as completed!');
        setCourseData(prevData => ({ ...prevData, completed: true, progress: 100 }));
        if (onUpdate) onUpdate();
      } else {
        toast.error(responseData.message || 'Failed to update progress');
      }
    } catch (error) {
      console.error('Error updating course progress:', error);
      toast.error('An error occurred while updating progress');
    } finally {
      setUpdating(false);
    }
  };

  const toggleModule = (index) => {
    setExpandedModules(prev => ({ ...prev, [index]: !prev[index] }));
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
          onClick={() => navigate('/dashboard')} 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">No course data available</div>
      </div>
    );
  }

  const course = courseData;
  const modules = Array.isArray(course.modules) ? course.modules : [];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`min-h-screen py-8 px-4 md:px-8 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}
    >
      {/* Back button */}
      {onBack && (
        <button 
          onClick={onBack}
          className={`mb-6 px-4 py-2 rounded flex items-center ${
            isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-200'
          }`}
        >
          <span className="mr-2">←</span> Back
        </button>
      )}
      
      {/* Course header */}
      <div className={`rounded-lg p-6 mb-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow-md'}`}>
        <h1 className="text-3xl font-bold mb-3">{course.title}</h1>
        <p className="text-lg mb-4">{course.description}</p>
        
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex items-center">
            <FaClock className={`mr-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <span>{course.duration || course.estimatedReadTime || '20-30 minutes'}</span>
          </div>
          <div className="flex items-center">
            <FaBookOpen className={`mr-2 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
            <span>{course.difficulty || 'Intermediate'}</span>
          </div>
          {course.completed ? (
            <div className="flex items-center">
              <FaCheckCircle className={`mr-2 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
              <span>Completed</span>
            </div>
          ) : (
            <button
              onClick={markCourseCompleted}
              disabled={updating}
              className={`flex items-center px-4 py-2 rounded ${
                updating ? 'opacity-75 cursor-not-allowed' : ''
              } ${isDarkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-600 text-white hover:bg-green-700'}`}
            >
              <FaClipboardCheck className="mr-2" />
              {updating ? 'Updating...' : 'Mark as Completed'}
            </button>
          )}
        </div>
        
        {/* Prerequisites */}
        {course.prerequisites && Array.isArray(course.prerequisites) && course.prerequisites.length > 0 && (
          <div className="mb-4">
            <h3 className="font-semibold text-lg mb-2">Prerequisites:</h3>
            <ul className="list-disc list-inside pl-2">
              {course.prerequisites.map((prereq, index) => (
                <li key={index} className="mb-1">{prereq}</li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Learning Objectives */}
        {course.learningObjectives && Array.isArray(course.learningObjectives) && course.learningObjectives.length > 0 && (
          <div className="mb-4">
            <h3 className="font-semibold text-lg mb-2">Learning Objectives:</h3>
            <ul className="list-disc list-inside pl-2">
              {course.learningObjectives.map((objective, index) => (
                <li key={index} className="mb-1">{objective}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {/* Modules */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold mb-4">Course Content</h2>
        
        {modules.map((module, index) => (
          <div 
            key={index}
            className={`rounded-lg overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow-md'}`}
          >
            {/* Module header */}
            <div 
              className={`p-4 cursor-pointer flex justify-between items-center ${
                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
              }`}
              onClick={() => toggleModule(index)}
            >
              <div>
                <h3 className="text-xl font-semibold">{module.title || `Module ${index + 1}`}</h3>
                {module.estimatedTime && (
                  <div className="text-sm flex items-center mt-1">
                    <FaClock className={`mr-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    <span>{module.estimatedTime}</span>
                  </div>
                )}
              </div>
              {expandedModules[index] ? (
                <FaChevronUp className="text-lg" />
              ) : (
                <FaChevronDown className="text-lg" />
              )}
            </div>
            
            {expandedModules[index] && (
              <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                {module.description && <p className="mb-4">{module.description}</p>}
                {module.topics && Array.isArray(module.topics) && module.topics.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Topics covered:</h4>
                    <div className="flex flex-wrap gap-2">
                      {module.topics.map((topic, idx) => (
                        <span key={idx} className={`px-3 py-1 rounded-full text-sm ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {module.detailedContent && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Detailed Content:</h4>
                    <div className="prose max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: (module.detailedContent || '').replace(/\n/g, '<br />') }} />
                    </div>
                  </div>
                )}
                {module.keyPoints && Array.isArray(module.keyPoints) && module.keyPoints.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Key Points:</h4>
                    <ul className={`list-disc list-inside pl-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {module.keyPoints.map((point, idx) => (
                        <li key={idx} className="mb-1">{point}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {module.practiceExercise && (
                  <div className={`mb-4 p-4 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                    <h4 className="font-semibold mb-2">Practice Exercise:</h4>
                    <p>{module.practiceExercise}</p>
                  </div>
                )}
                {module.commonMistakes && Array.isArray(module.commonMistakes) && module.commonMistakes.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Common Mistakes to Avoid:</h4>
                    <ul className={`list-disc list-inside pl-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {module.commonMistakes.map((mistake, idx) => (
                        <li key={idx} className="mb-1">{mistake}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {module.resources && Array.isArray(module.resources) && module.resources.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Resources:</h4>
                    <ul className={`space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {module.resources.map((resource, idx) => (
                        <li key={idx} className="mb-1">
                          <a 
                            href={resource.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={`flex items-center ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
                          >
                            <FaExternalLinkAlt className="mr-2 text-sm" />
                            {resource.title}
                          </a>
                          {resource.description && (
                            <p className="text-sm mt-1 ml-6">{resource.description}</p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Complete course button at bottom */}
      {!course.completed && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={markCourseCompleted}
            disabled={updating}
            className={`flex items-center px-6 py-3 rounded-lg ${
              updating ? 'opacity-75 cursor-not-allowed' : ''
            } ${isDarkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-600 text-white hover:bg-green-700'}`}
          >
            <FaCheckCircle className="mr-2" />
            {updating ? 'Updating...' : 'Mark Course as Completed'}
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default GeneratedCourse;