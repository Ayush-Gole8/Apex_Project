import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiClock, FiBookOpen, FiExternalLink, FiPlay, FiDownload, FiCheck } from 'react-icons/fi';
import Footer from './Footer';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const GeneratedCourse = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { courseData, topic } = location.state || {};
  const [expandedModule, setExpandedModule] = useState(0);
  const [completedModules, setCompletedModules] = useState(new Set());

  if (!courseData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-forest-800 via-dark-forest-700 to-dark-forest-800 flex items-center justify-center">
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
    );
  }

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
    const newCompletedModules = [...completedModules];
    if (newCompletedModules.includes(moduleIndex)) {
      // Mark as incomplete
      const index = newCompletedModules.indexOf(moduleIndex);
      newCompletedModules.splice(index, 1);
    } else {
      // Mark as complete
      newCompletedModules.push(moduleIndex);
    }
    
    setCompletedModules(newCompletedModules);
    
    // Calculate progress
    const progress = Math.round((newCompletedModules.length / (courseData?.modules?.length || 1)) * 100);
    const isCompleted = progress === 100;
    
    // Update progress in database
    updateCourseProgress(progress, isCompleted);
  };

  const progressPercentage = courseData.modules ? 
    (completedModules.size / courseData.modules.length) * 100 : 0;

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
              <div className="flex-1">
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
                    <span>{courseData.modules?.length || 0} modules</span>
                  </div>
                  {courseData.isAIGenerated && (
                    <div className="flex items-center space-x-2 text-green-300">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      <span className="text-sm">Live AI Generated</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="ml-8">
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
            <h2 className="text-3xl font-bold text-white mb-8">Course Modules</h2>
            
            {courseData.modules && courseData.modules.length > 0 ? (
              <div className="space-y-4">
                {courseData.modules.map((module, index) => (
                  <motion.div
                    key={index}
                    className="bg-white/12 backdrop-blur-lg border border-white/25 rounded-xl overflow-hidden"
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <button
                      onClick={() => setExpandedModule(expandedModule === index ? null : index)}
                      className="w-full p-6 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
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
                    </button>
                    
                    {expandedModule === index && (
                      <motion.div
                        className="px-6 pb-6"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                      >
                        <div className="border-l-2 border-emerald-custom-500 pl-6">
                          {/* Detailed Content */}
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

                          {/* Key Points */}
                          {module.keyPoints && module.keyPoints.length > 0 && (
                            <div className="mb-6">
                              <h4 className="text-white font-semibold mb-4 text-lg">Key Points</h4>
                              <div className="bg-gradient-to-r from-emerald-custom-500/10 to-forest-500/10 border border-emerald-custom-500/20 rounded-lg p-4">
                                <ul className="space-y-3 list-none">
                                  {module.keyPoints.map((point, pointIndex) => (
                                    <li key={pointIndex} className="flex items-start space-x-3">
                                      <div className="w-2 h-2 bg-emerald-custom-400 rounded-full mt-2 flex-shrink-0"></div>
                                      <span className="text-white/90 text-sm leading-relaxed flex-1">{point}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}

                          {/* Topics */}
                          {module.topics && module.topics.length > 0 && (
                            <div className="mb-6">
                              <h4 className="text-white font-semibold mb-4 text-lg">Topics Covered</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {module.topics.map((topic, topicIndex) => (
                                  <div key={topicIndex} className="flex items-center space-x-3 bg-white/5 rounded-lg p-3">
                                    <FiPlay className="text-emerald-custom-400 flex-shrink-0" size={14} />
                                    <span className="text-white/90 text-sm">{topic}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Practice Exercise */}
                          {module.practiceExercise && (
                            <div className="mb-6">
                              <h4 className="text-white font-semibold mb-4 text-lg">Practice Exercise</h4>
                              <div className="bg-warm-orange-500/10 border border-warm-orange-500/20 rounded-lg p-4">
                                <p className="text-warm-orange-200 text-sm leading-relaxed">{module.practiceExercise}</p>
                              </div>
                            </div>
                          )}

                          {/* Common Mistakes */}
                          {module.commonMistakes && module.commonMistakes.length > 0 && (
                            <div className="mb-6">
                              <h4 className="text-white font-semibold mb-4 text-lg">Common Mistakes to Avoid</h4>
                              <div className="space-y-3">
                                {module.commonMistakes.map((mistake, mistakeIndex) => (
                                  <div key={mistakeIndex} className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                                    <p className="text-red-200 text-sm leading-relaxed">{mistake}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}                          {/* Resources */}
                          {module.resources && module.resources.length > 0 && (
                            <div>
                              <h4 className="text-white font-semibold mb-4 text-lg">Learning Resources</h4>
                              <div className="space-y-4">
                                {module.resources.map((resource, resourceIndex) => (
                                  <div key={resourceIndex} className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors">
                                    <div className="flex items-start justify-between">
                                      <div className="flex items-start space-x-4 flex-1">
                                        <div className="w-10 h-10 bg-gradient-to-r from-emerald-custom-500 to-forest-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                          {resource.type === 'video' ? <FiPlay size={16} /> : 
                                           resource.type === 'article' ? <FiBookOpen size={16} /> : 
                                           <FiDownload size={16} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <h5 className="text-white font-medium text-sm mb-1">{resource.title}</h5>
                                          <p className="text-white/70 text-xs capitalize mb-2">{resource.type}</p>
                                          {resource.description && (
                                            <p className="text-white/80 text-xs leading-relaxed">{resource.description}</p>
                                          )}
                                        </div>
                                      </div>
                                      {resource.url && resource.url !== "REAL_PUBLIC_URL_ONLY" && (
                                        <a
                                          href={resource.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-emerald-custom-400 hover:text-emerald-custom-300 transition-colors flex-shrink-0 ml-4"
                                        >
                                          <FiExternalLink size={18} />
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
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
    </div>
  );
};

export default GeneratedCourse;