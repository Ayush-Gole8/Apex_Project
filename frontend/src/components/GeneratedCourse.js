import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiClock, FiBookOpen, FiExternalLink, FiPlay, FiDownload, FiCheck, FiAlertCircle } from 'react-icons/fi';
import Footer from './Footer';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import toast from 'react-hot-toast';
import { formatText, isValidUrl, getDomainFromUrl } from '../utils/textFormatting';

const GeneratedCourse = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { courseData, topic } = location.state || {};
  const [expandedModule, setExpandedModule] = useState(0);
  const [completedModules, setCompletedModules] = useState([]);

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
    (completedModules.length / courseData.modules.length) * 100 : 0;

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
                    <div
                      onClick={() => setExpandedModule(expandedModule === index ? null : index)}
                      className="w-full p-6 text-left flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold ${
                          completedModules.includes(index) 
                            ? 'bg-green-500' 
                            : 'bg-gradient-to-r from-emerald-custom-500 to-forest-500'
                        }`}>
                          {completedModules.includes(index) ? <FiCheck /> : index + 1}
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
                          completedModules.includes(index)
                            ? 'bg-green-500 text-white'
                            : 'bg-white/20 text-white/90 hover:bg-white/30'
                        }`}
                      >
                        {completedModules.includes(index) ? 'Completed' : 'Mark Complete'}
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
                          {/* Detailed Content */}
                          {module.detailedContent && (
                            <div className="mb-6">
                              <h4 className="text-white font-semibold mb-4 text-lg flex items-center space-x-2">
                                <FiBookOpen className="text-emerald-custom-400" />
                                <span>Detailed Explanation</span>
                              </h4>
                              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                                <div className="prose prose-invert max-w-none text-sm">
                                  {formatText(module.detailedContent)}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Key Points */}
                          {module.keyPoints && module.keyPoints.length > 0 && (
                            <div className="mb-6">
                              <h4 className="text-white font-semibold mb-4 text-lg flex items-center space-x-2">
                                <FiCheck className="text-emerald-custom-400" />
                                <span>Key Takeaways</span>
                              </h4>
                              <div className="bg-gradient-to-r from-emerald-custom-500/10 to-forest-500/10 border border-emerald-custom-500/20 rounded-lg p-5">
                                <ul className="space-y-4 list-none">
                                  {module.keyPoints.map((point, pointIndex) => (
                                    <li key={pointIndex} className="flex items-start space-x-3">
                                      <div className="w-6 h-6 bg-emerald-custom-500/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-emerald-custom-300 font-bold text-xs">{pointIndex + 1}</span>
                                      </div>
                                      <div className="flex-1 text-white/90 text-sm leading-relaxed">
                                        {formatText(point)}
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}

                          {/* Topics */}
                          {module.topics && module.topics.length > 0 && (
                            <div className="mb-6">
                              <h4 className="text-white font-semibold mb-4 text-lg flex items-center space-x-2">
                                <FiPlay className="text-emerald-custom-400" />
                                <span>Topics Covered in This Section</span>
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {module.topics.map((topic, topicIndex) => (
                                  <div key={topicIndex} className="flex items-start space-x-3 bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all">
                                    <div className="w-6 h-6 bg-gradient-to-br from-emerald-custom-500 to-forest-600 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                                      <FiCheck className="text-white" size={12} />
                                    </div>
                                    <span className="text-white/90 text-sm leading-relaxed flex-1">{topic}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Practice Exercise */}
                          {module.practiceExercise && (
                            <div className="mb-6">
                              <h4 className="text-white font-semibold mb-4 text-lg flex items-center space-x-2">
                                <FiPlay className="text-warm-orange-400" />
                                <span>Hands-On Practice</span>
                              </h4>
                              <div className="bg-warm-orange-500/10 border border-warm-orange-500/30 rounded-lg p-5">
                                <div className="text-warm-orange-200 text-sm leading-relaxed">
                                  {formatText(module.practiceExercise)}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Common Mistakes */}
                          {module.commonMistakes && module.commonMistakes.length > 0 && (
                            <div className="mb-6">
                              <h4 className="text-white font-semibold mb-4 text-lg flex items-center space-x-2">
                                <FiAlertCircle className="text-red-400" />
                                <span>Common Pitfalls to Avoid</span>
                              </h4>
                              <div className="space-y-3">
                                {module.commonMistakes.map((mistake, mistakeIndex) => (
                                  <div key={mistakeIndex} className="bg-red-500/10 border border-red-500/30 rounded-lg p-5">
                                    <div className="flex items-start space-x-3">
                                      <div className="w-6 h-6 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-red-400 font-bold text-xs">!</span>
                                      </div>
                                      <div className="flex-1 text-red-200 text-sm leading-relaxed">
                                        {formatText(mistake)}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Resources */}
                          {module.resources && module.resources.length > 0 && (
                            <div>
                              <h4 className="text-white font-semibold mb-4 text-lg flex items-center space-x-2">
                                <FiBookOpen className="text-emerald-custom-400" />
                                <span>Learning Resources</span>
                              </h4>
                              <div className="space-y-4">
                                {module.resources.map((resource, resourceIndex) => {
                                  const hasValidUrl = isValidUrl(resource.url);
                                  return (
                                    <div key={resourceIndex} className="bg-white/5 border border-white/10 rounded-lg p-5 hover:bg-white/10 transition-all">
                                      <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start space-x-4 flex-1">
                                          <div className="w-12 h-12 bg-gradient-to-br from-emerald-custom-500 to-forest-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                            {resource.type === 'video' ? <FiPlay className="text-white" size={18} /> : 
                                             resource.type === 'article' ? <FiBookOpen className="text-white" size={18} /> : 
                                             resource.type === 'documentation' ? <FiBookOpen className="text-white" size={18} /> :
                                             <FiDownload className="text-white" size={18} />}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <h5 className="text-white font-semibold text-base mb-2">
                                              {resource.title}
                                            </h5>
                                            <div className="flex items-center space-x-3 mb-2">
                                              <span className="text-xs px-2 py-1 bg-emerald-custom-500/20 text-emerald-custom-300 rounded-full capitalize">
                                                {resource.type || 'Resource'}
                                              </span>
                                              {hasValidUrl && (
                                                <span className="text-xs text-white/50">
                                                  {getDomainFromUrl(resource.url)}
                                                </span>
                                              )}
                                            </div>
                                            {resource.description && (
                                              <p className="text-white/80 text-sm leading-relaxed mb-3">
                                                {resource.description}
                                              </p>
                                            )}
                                            {hasValidUrl && (
                                              <a
                                                href={resource.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center space-x-2 text-emerald-custom-400 hover:text-emerald-custom-300 transition-colors text-sm font-medium"
                                              >
                                                <span>Visit Resource</span>
                                                <FiExternalLink size={14} />
                                              </a>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
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

          {/* Take Quiz Button */}
          <motion.div
            className="mt-12 text-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <div className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border-2 border-emerald-500/30 rounded-2xl p-8 mb-8">
              <h3 className="text-2xl font-bold text-white mb-3">Test Your Knowledge!</h3>
              <p className="text-white/70 mb-6 max-w-2xl mx-auto">
                Ready to assess your understanding? Take a quiz to evaluate what you've learned 
                and identify areas for improvement. You'll need 60% to pass.
              </p>
              <button
                onClick={() => navigate(`/quiz/${courseData.id}`, { 
                  state: { 
                    course: courseData,
                    topic: topic 
                  } 
                })}
                className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-blue-500 text-white text-lg font-semibold rounded-xl hover:shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-105"
              >
                <span>Take Quiz</span>
                <svg 
                  className="w-6 h-6 group-hover:translate-x-1 transition-transform" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <p className="text-white/50 text-sm mt-4">
                📋 10 questions • ⏱️ Time limited • 🎯 Multiple choice
              </p>
            </div>
          </motion.div>

          {/* Next Steps */}
          {courseData.nextSteps && courseData.nextSteps.length > 0 && (
            <motion.div
              className="bg-white/15 backdrop-blur-lg border border-white/25 rounded-xl p-6 mt-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
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