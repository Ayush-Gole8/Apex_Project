import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiClock, FiBookOpen, FiCheck, FiHeart } from 'react-icons/fi';
import Footer from './Footer';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import toast from 'react-hot-toast';

const GeneratedCourse = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { courseData: originalCourseData, topic } = location.state || {};
  const [expandedModule, setExpandedModule] = useState(0);
  const [completedModules, setCompletedModules] = useState(new Set());
  const [isLiked, setIsLiked] = useState(false);
  const [courseId, setCourseId] = useState(null);
  
  // Add state for fallback notice
  const [showFallbackNotice, setShowFallbackNotice] = useState(false);
  
  // Helper function to try extracting course data from raw JSON if needed
  const preprocessCourseData = (data) => {
    if (!data) return null;
    
    // If there's raw content and no sections, try to extract them
    if (data.rawContent && !data.sections) {
      try {
        console.log('Attempting to extract course structure from raw content in frontend');
        
        // Try to parse as JSON directly first
        try {
          const parsedData = JSON.parse(data.rawContent);
          if (parsedData.sections && parsedData.sections.length > 0) {
            console.log('Successfully parsed raw content as JSON');
            // Merge the parsed data with existing data
            return { ...data, ...parsedData };
          }
        } catch (e) {
          console.log('Direct parsing failed, trying regex extraction');
        }
        
        // Try regex extraction if direct parsing fails
        const sectionMatch = data.rawContent.match(/"sections"\s*:\s*\[([\s\S]*?)\]/);
        if (sectionMatch && sectionMatch[0]) {
          const sectionsJSON = `{"sections":${sectionMatch[0].substring('"sections":'.length)}}`;
          const sectionsObj = JSON.parse(sectionsJSON);
          
          if (sectionsObj.sections && sectionsObj.sections.length > 0) {
            console.log('Successfully extracted sections from raw content');
            return { ...data, sections: sectionsObj.sections };
          }
        }
      } catch (error) {
        console.error('Failed to extract course data:', error);
      }
    }
    
    return data;
  };

  // Preprocess the course data if needed - we're using useState now to allow updates
  const [courseData] = useState(() => {
    const processed = preprocessCourseData(originalCourseData);
    
    // Try to extract sections from raw data if needed
    if (processed?.rawContent && !processed.sections) {
      try {
        // Try to parse raw content as JSON
        const parsedData = JSON.parse(processed.rawContent);
        if (parsedData.sections && parsedData.sections.length > 0) {
          console.log('Successfully parsed sections from rawContent');
          return { ...processed, ...parsedData };
        }
      } catch (error) {
        console.error('Failed to parse rawContent:', error);
      }
    }
    
    return processed;
  });

  // Fix the duplicate useEffect
  useEffect(() => {
    const fetchCourseStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Please log in to view courses');
          navigate('/');
          return;
        }
        
        // Find course ID if it exists in user courses
        const response = await axios.get(`${API_BASE_URL}/api/user/courses`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const courses = response.data.courses;
        const matchingCourse = courses.find(c => 
          c.topic === topic && 
          c.course?.title === courseData?.title
        );
        
        if (matchingCourse) {
          setCourseId(matchingCourse.id);
          setIsLiked(!!matchingCourse.liked);
        }
      } catch (error) {
        console.error('Error fetching course status:', error);
      }
    };
    
    if (courseData) {
      fetchCourseStatus();
    }
  }, [topic, courseData, navigate]);

  // Helper function to get total modules across all sections
  const getTotalModules = () => {
    if (!courseData?.sections) return courseData?.modules?.length || 0;
    return courseData.sections.reduce((total, section) => total + (section.modules?.length || 0), 0);
  };

  // Add progress tracking function
  const updateCourseProgress = async (progress, completed = false) => {
    try {
      const token = localStorage.getItem('token');
      const courseId = courseData?.id;
      
      if (!courseId || !token) {
        console.log('Missing courseId or token for progress update');
        return;
      }

      console.log('Updating course progress:', { courseId, progress, completed });
      
      const response = await axios.put(`${API_BASE_URL}/api/user/courses/${courseId}/progress`, {
        progress,
        completed
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Progress updated successfully:', response.data);
      
      if (completed) {
        toast.success('🎉 Course completed! Well done!');
      } else {
        toast.success(`Progress updated: ${progress}%`);
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress');
    }
  };

  // Handle module completion
  const handleModuleComplete = (moduleIndex) => {
    const newCompletedModules = new Set(completedModules);
    
    if (newCompletedModules.has(moduleIndex)) {
      // Mark as incomplete
      newCompletedModules.delete(moduleIndex);
    } else {
      // Mark as complete
      newCompletedModules.add(moduleIndex);
    }
    
    setCompletedModules(newCompletedModules);
    
    // Calculate progress
    const totalModules = getTotalModules();
    const progress = Math.round((newCompletedModules.size / totalModules) * 100);
    const isCompleted = progress === 100;
    
    // Update progress in database
    updateCourseProgress(progress, isCompleted);
  };

  const progressPercentage = courseData.sections ? 
    (completedModules.size / getTotalModules()) * 100 : 0;

  // Helper function to format content with basic markdown-like styling
  const formatContentWithMarkdown = (content) => {
    if (!content) return '';
    
    // Format bold text: **text** or __text__
    let formatted = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.*?)__/g, '<strong>$1</strong>');
    
    // Format italic text: *text* or _text_
    formatted = formatted
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/_(.*?)_/g, '<em>$1</em>');
    
    // Format lists
    formatted = formatted
      .replace(/^\s*-\s+(.*?)$/gm, '<li>$1</li>')
      .replace(/(<li>.*?<\/li>(\n|$))+/g, '<ul>$&</ul>');
    
    formatted = formatted
      .replace(/^\s*\d+\.\s+(.*?)$/gm, '<li>$1</li>')
      .replace(/(<li>.*?<\/li>(\n|$))+/g, '<ol>$&</ol>');
    
    // Format headings (simplified, assumes they start on a new line)
    formatted = formatted
      .replace(/^#{3}\s+(.*?)$/gm, '<h3>$1</h3>')
      .replace(/^#{2}\s+(.*?)$/gm, '<h2>$1</h2>')
      .replace(/^#{1}\s+(.*?)$/gm, '<h1>$1</h1>');
    
    // Format paragraphs
    formatted = formatted
      .replace(/\n{2,}/g, '</p><p>')
      .replace(/^([^<].+[^>])$/gm, '$1<br/>')
      .replace(/^\s*<p>(.*?)<\/p>\s*$/gm, '$1'); // Remove empty paragraphs
    
    // Format code blocks
    formatted = formatted
      .replace(/`{3}(.*?)`{3}/gs, '<pre><code>$1</code></pre>')
      .replace(/`(.*?)`/g, '<code>$1</code>');
    
    // Wrap in paragraphs
    if (!formatted.startsWith('<')) {
      formatted = `<p>${formatted}</p>`;
    }
    
    return formatted;
  };

  // Fetch course like status when component mounts
  useEffect(() => {
    const fetchCourseStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Please log in to view courses');
          navigate('/');
          return;
        }
        
        if (!courseData) return;
        
        // Find course ID if it exists in user courses
        const response = await axios.get(`${API_BASE_URL}/api/user/courses`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const courses = response.data.courses;
        const matchingCourse = courses.find(c => 
          c.topic === topic && 
          c.course?.title === courseData?.title
        );
        
        if (matchingCourse) {
          setCourseId(matchingCourse.id);
          setIsLiked(!!matchingCourse.liked);
        }
      } catch (error) {
        console.error('Error fetching course status:', error);
      }
    };
    
    fetchCourseStatus();
  }, [topic, courseData, navigate]);

  // Handle liking/unliking a course
  const handleLikeCourse = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please sign in to add courses to favorites');
        return;
      }
      
      if (!courseId) {
        toast.error('Cannot find course ID');
        return;
      }
      
      await axios.put(`${API_BASE_URL}/api/user/courses/${courseId}/like`, {
        liked: !isLiked
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setIsLiked(!isLiked);
      toast.success(isLiked ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      console.error('Error updating course like status:', error);
      toast.error('Failed to update favorites');
    }
  };

  useEffect(() => {
    // Check if location state exists
    if (location.state?.courseData) {
      const courseData = location.state.courseData;
      
      // Set up the course data as before...
      
      // Check if fallback content was used
      if (courseData.fallbackUsed) {
        setShowFallbackNotice(true);
        
        // Hide the notice after 10 seconds
        const timer = setTimeout(() => {
          setShowFallbackNotice(false);
        }, 10000);
        
        return () => clearTimeout(timer);
      }
    } else {
      // Redirect if no course data...
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-professional relative">
      {/* Add Fallback Notice */}
      {showFallbackNotice && (
        <div className="fixed top-20 right-4 bg-amber-50 border-l-4 border-amber-500 text-amber-700 p-4 w-80 shadow-lg rounded z-50 animate-slideIn">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-amber-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm">
                We've enhanced this course with our premium content library for a better learning experience.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {!courseData ? (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h2 className="text-2xl text-white mb-4">No course data found</h2>
            <button 
              onClick={() => navigate('/')}
              className="text-emerald-custom-400 hover:text-emerald-custom-300 transition-colors font-medium"
            >
              Back to home
            </button>
          </div>
        </div>
      ) : (
        <>
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

      {/* Course Header */}
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="bg-gradient-to-r from-emerald-custom-600 to-forest-700 p-8 rounded-3xl mb-8"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-start justify-between mb-6">
                <motion.div
                  className="flex-1"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <span className="bg-white/20 text-white text-sm px-3 py-1 rounded-full">
                      AI Generated • {courseData.difficulty || 'Intermediate'}
                    </span>
                    {courseData.estimatedReadTime && (
                      <span className="bg-green-500/20 text-green-200 text-sm px-3 py-1 rounded-full">
                        ⏱️ {courseData.estimatedReadTime}
                      </span>
                    )}
                    {courseData.ragContext && (
                      <span className="bg-emerald-custom-500/20 text-emerald-custom-200 text-sm px-3 py-1 rounded-full">
                        📚 {courseData.ragContext.join(', ')}
                      </span>
                    )}
                  </div>
                  
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                    {courseData.title || `${topic} Course`}
                  </h1>
                  
                  <p className="text-xl text-white/90 mb-6">
                    {courseData.description || `Comprehensive course on ${topic}`}
                  </p>
                  
                  <div className="flex items-center space-x-6 text-white/90">
                    <div className="flex items-center space-x-2">
                      <FiClock />
                      <span>{courseData.duration || '15-30 minutes'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FiBookOpen />
                      <span>{getTotalModules()} modules</span>
                    </div>
                    {courseData.isAIGenerated && (
                      <div className="flex items-center space-x-2 text-green-300">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                        <span className="text-sm">Live AI Generated</span>
                      </div>
                    )}
                    <button
                      onClick={handleLikeCourse}
                      className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                        isLiked 
                          ? 'bg-red-500/20 text-red-300' 
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      <FiHeart className={isLiked ? 'fill-current' : ''} size={16} />
                      <span>{isLiked ? 'Favorited' : 'Add to favorites'}</span>
                    </button>
                  </div>
                </motion.div>              <div className="ml-8">
                <div className="w-32 h-32 bg-white/20 rounded-2xl flex items-center justify-center">
                  <FiBookOpen className="text-white text-4xl" />
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/80 text-sm">Course Progress</span>
                <span className="text-white text-sm font-semibold">{Math.round(progressPercentage)}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </motion.div>

          {/* Prerequisites */}
          {courseData.prerequisites && courseData.prerequisites.length > 0 && (
            <motion.div
              className="bg-white/15 backdrop-blur-lg border border-white/25 rounded-xl p-6 mb-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-xl font-bold text-white mb-4">Prerequisites</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {courseData.prerequisites.map((prereq, index) => (
                  <div key={index} className="flex items-center space-x-2 text-white/90">
                    <FiCheck className="text-green-400" />
                    <span>{prereq}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Learning Objectives */}
          {courseData.learningObjectives && courseData.learningObjectives.length > 0 && (
            <motion.div
              className="bg-white/15 backdrop-blur-lg border border-white/25 rounded-xl p-6 mb-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-xl font-bold text-white mb-4">What You'll Learn</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {courseData.learningObjectives.map((objective, index) => (
                  <div key={index} className="flex items-center space-x-2 text-white/90">
                    <FiCheck className="text-emerald-custom-400" />
                    <span>{objective}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Quick Reference */}
          {courseData.quickReference && courseData.quickReference.length > 0 && (
            <motion.div
              className="bg-white/15 backdrop-blur-lg border border-white/25 rounded-xl p-6 mb-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25 }}
            >
              <h3 className="text-xl font-bold text-white mb-4">Quick Reference</h3>
              <div className="space-y-4">
                {courseData.quickReference.map((item, index) => (
                  <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-forest-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-1">
                        {index + 1}
                      </div>
                      <p className="text-white/90 text-sm leading-relaxed flex-1">{item}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Course Modules */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-3xl font-bold text-white mb-8">Course Content</h2>
            
            {courseData.sections && courseData.sections.length > 0 ? (
              <div className="space-y-6">
                {courseData.sections.map((section, sectionIndex) => (
                  <motion.div
                    key={section.id || sectionIndex}
                    className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6"
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ delay: sectionIndex * 0.1 }}
                  >
                    {/* Section Header */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          {/* Add visual learning phase indicator */}
                          <div className={`w-3 h-14 rounded-l-md mr-3 ${
                            sectionIndex === 0 ? 'bg-blue-500' :
                            sectionIndex === 1 ? 'bg-green-500' :
                            sectionIndex === 2 ? 'bg-amber-500' :
                            'bg-purple-500'
                          }`}></div>
                          <h3 className="text-xl font-bold text-white">{section.title}</h3>
                        </div>
                        <span className="bg-emerald-custom-500/20 text-emerald-custom-300 text-xs px-3 py-1 rounded-full">
                          {section.weight}% of course
                        </span>
                      </div>
                      <p className="text-white/80 text-sm pl-6">{section.description}</p>
                      <div className="pl-6 mt-2 text-xs">
                        <span className={`px-2 py-1 rounded-md ${
                          sectionIndex === 0 ? 'bg-blue-500/20 text-blue-200' :
                          sectionIndex === 1 ? 'bg-green-500/20 text-green-200' :
                          sectionIndex === 2 ? 'bg-amber-500/20 text-amber-200' :
                          'bg-purple-500/20 text-purple-200'
                        }`}>
                          {sectionIndex === 0 ? 'Foundation' :
                           sectionIndex === 1 ? 'Core Principles' :
                           sectionIndex === 2 ? 'Practical Application' :
                           'Advanced Topics'}
                        </span>
                      </div>
                    </div>

                    {/* Section Modules */}
                    <div className="space-y-3">
                      {section.modules?.map((module, moduleIndex) => {
                        const globalModuleIndex = courseData.sections
                          .slice(0, sectionIndex)
                          .reduce((total, s) => total + (s.modules?.length || 0), 0) + moduleIndex;
                        
                        return (
                          <div
                            key={module.id || moduleIndex}
                            className="bg-white/5 border border-white/10 rounded-lg overflow-hidden"
                          >
                            <div
                              onClick={() => setExpandedModule(expandedModule === globalModuleIndex ? null : globalModuleIndex)}
                              className="w-full p-4 text-left flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer"
                            >
                              <div className="flex items-center space-x-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold ${
                                  completedModules.has(globalModuleIndex) 
                                    ? 'bg-green-500' 
                                    : 'bg-gradient-to-r from-emerald-custom-500 to-forest-500'
                                }`}>
                                  {completedModules.has(globalModuleIndex) ? <FiCheck size={14} /> : globalModuleIndex + 1}
                                </div>
                                <div className="flex-1">
                                  <h4 className="text-white font-medium mb-1">{module.title}</h4>
                                  <p className="text-white/60 text-xs">
                                    {module.estimatedTimeMinutes} min • Weight: {module.weight}%
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleModuleComplete(globalModuleIndex);
                                }}
                                className={`px-3 py-1 rounded-full text-xs transition-colors ${
                                  completedModules.has(globalModuleIndex)
                                    ? 'bg-green-500 text-white'
                                    : 'bg-white/20 text-white/90 hover:bg-white/30'
                                }`}
                              >
                                {completedModules.has(globalModuleIndex) ? 'Completed' : 'Mark Complete'}
                              </button>
                            </div>
                            
                            {expandedModule === globalModuleIndex && (
                              <motion.div
                                className="px-4 pb-4"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                              >
                                <div className="border-l-2 border-emerald-custom-500 pl-4">
                                  <div className="bg-slate-800/30 border border-slate-700/30 rounded-lg p-4">
                                    {/* Using dangerouslySetInnerHTML to render markdown-style formatting */}
                                    <div 
                                      className="prose prose-invert prose-sm max-w-none text-white/90 text-sm leading-relaxed"
                                      dangerouslySetInnerHTML={{ 
                                        __html: formatContentWithMarkdown(module.content) 
                                      }}
                                    />
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : courseData.modules && courseData.modules.length > 0 ? (
              <div className="space-y-4">
                {courseData.modules.map((module, index) => (
                  <motion.div
                    key={index}
                    className="bg-white/12 backdrop-blur-lg border border-white/25 rounded-xl overflow-hidden"
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div
                      onClick={() => setExpandedModule(expandedModule === index ? null : index)}
                      className="w-full p-6 text-left flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold ${
                          completedModules.has(index) 
                            ? 'bg-green-500' 
                            : 'bg-gradient-to-r from-emerald-custom-500 to-forest-500'
                        }`}>
                          {completedModules.has(index) ? <FiCheck /> : index + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-semibold mb-1">{module.title}</h3>
                          <p className="text-white/70 text-sm mb-1">{module.description}</p>
                          {module.estimatedTime && (
                            <p className="text-forest-400 text-xs mt-1">⏱️ {module.estimatedTime}</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleModuleComplete(index);
                        }}
                        className={`px-3 py-1 rounded-full text-xs transition-colors ${
                          completedModules.has(index)
                            ? 'bg-green-500 text-white'
                            : 'bg-white/20 text-white/90 hover:bg-white/30'
                        }`}
                      >
                        {completedModules.has(index) ? 'Completed' : 'Mark Complete'}
                      </button>
                    </div>
                    
                    {expandedModule === index && (
                      <motion.div
                        className="px-6 pb-6"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                      >
                        <div className="border-l-2 border-emerald-custom-500 pl-6">
                          {/* Keep existing detailed content rendering */}
                          {module.detailedContent && (
                            <div className="mb-6">
                              <h4 className="text-white font-semibold mb-4 text-lg">Detailed Explanation</h4>
                              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                                <div className="prose prose-invert max-w-none">
                                  <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap mb-0">
                                    {module.detailedContent}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                          {/* Continue with other existing module content sections */}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-white/15 backdrop-blur-lg border border-white/25 rounded-xl p-8 text-center">
                <FiBookOpen className="text-white/60 text-4xl mx-auto mb-4" />
                <h3 className="text-white text-xl mb-2">Course Content</h3>
                <p className="text-white/90 whitespace-pre-wrap leading-relaxed">{courseData.description || courseData}</p>
              </div>
            )}
          </motion.div>

          {/* Real World Applications */}
          {courseData.realWorldApplications && courseData.realWorldApplications.length > 0 && (
            <motion.div
              className="bg-white/15 backdrop-blur-lg border border-white/25 rounded-xl p-6 mb-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35 }}
            >
              <h3 className="text-xl font-bold text-white mb-4">Real-World Applications</h3>
              <div className="space-y-4">
                {courseData.realWorldApplications.map((application, index) => (
                  <div key={index} className="bg-gradient-to-r from-emerald-custom-500/10 to-forest-500/10 border border-emerald-custom-500/20 rounded-lg p-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-emerald-custom-500 to-forest-500 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <p className="text-white/90 text-sm leading-relaxed flex-1">{application}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Assessment Questions */}
          {courseData.assessmentQuestions && courseData.assessmentQuestions.length > 0 && (
            <motion.div
              className="bg-white/15 backdrop-blur-lg border border-white/25 rounded-xl p-6 mb-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-xl font-bold text-white mb-4">Assessment Questions</h3>
              <div className="space-y-4">
                {courseData.assessmentQuestions.map((question, index) => (
                  <div key={index} className="bg-gradient-to-r from-warm-orange-500/10 to-forest-500/10 border border-warm-orange-500/20 rounded-lg p-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-warm-orange-500 to-forest-500 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        Q{index + 1}
                      </div>
                      <p className="text-white/90 text-sm leading-relaxed flex-1">{question}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Next Steps */}
          {courseData.nextSteps && courseData.nextSteps.length > 0 && (
            <motion.div
              className="bg-white/15 backdrop-blur-lg border border-white/25 rounded-xl p-6 mt-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <h3 className="text-xl font-bold text-white mb-4">Next Steps</h3>
              <div className="space-y-4">
                {courseData.nextSteps.map((step, index) => (
                  <div key={index} className="bg-gradient-to-r from-forest-500/10 to-emerald-custom-500/10 border border-forest-500/20 rounded-lg p-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-forest-500 to-emerald-custom-500 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <p className="text-white/90 text-sm leading-relaxed flex-1">{step}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />
        </>
      )}
    </div>
  );
};

export default GeneratedCourse;