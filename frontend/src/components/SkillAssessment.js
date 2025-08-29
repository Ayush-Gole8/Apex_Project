import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiSend, FiBookOpen, FiTarget, FiAward, FiCheckCircle, FiXCircle, FiBarChart, FiClock } from 'react-icons/fi';
import API_BASE_URL from '../config/api';
import Footer from './Footer';

const SkillAssessment = () => {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [assessment, setAssessment] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assessmentCompleted, setAssessmentCompleted] = useState(false);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Handle topic submission
  const handleTopicSubmit = async (e) => {
    e.preventDefault();
    
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Please sign in to take an assessment');
        navigate('/');
        return;
      }
      
      const response = await axios.post(`${API_BASE_URL}/api/skill-assessments/generate`, {
        topic: topic.trim()
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setAssessment(response.data);
      setAnswers(new Array(response.data.questions.length).fill(null));
      setLoading(false);
    } catch (error) {
      console.error('Error generating assessment:', error);
      toast.error('Failed to generate assessment');
      setLoading(false);
    }
  };
  
  // Handle answer selection
  const handleAnswerSelect = (questionIndex, answerIndex) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = answerIndex;
    setAnswers(newAnswers);
  };
  
  // Move to next question
  const handleNextQuestion = () => {
    if (currentQuestion < assessment.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };
  
  // Move to previous question
  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };
  
  // Submit assessment
  const handleSubmitAssessment = async () => {
    // Check if all questions are answered
    if (answers.includes(null)) {
      toast.error('Please answer all questions before submitting');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      
      // Mock interaction data for learning style detection
      const interactionData = {
        timeSpentOnText: Math.random() * 100,
        timeSpentOnVisuals: Math.random() * 100,
        interactiveElementsUsed: Math.random() * 100
      };
      
      const response = await axios.post(`${API_BASE_URL}/api/skill-assessments/${assessment.id}/submit`, {
        answers,
        interactionData
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setResults(response.data);
      setAssessmentCompleted(true);
      toast.success('Assessment completed successfully!');
    } catch (error) {
      console.error('Error submitting assessment:', error);
      toast.error('Failed to submit assessment');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Create learning path from assessment results
  const handleCreateLearningPath = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(`${API_BASE_URL}/api/learning-paths`, {
        name: `${topic} Learning Path`,
        description: `Personalized learning path for ${topic} based on your skill assessment`,
        courses: ['course_1', 'course_2', 'course_3'], // Placeholder courses
        difficulty: results.performance.percentage > 70 ? 'advanced' : 
                   results.performance.percentage > 40 ? 'intermediate' : 'beginner'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      toast.success('Learning path created successfully!');
      navigate(`/learning-path/${response.data.id}`);
    } catch (error) {
      console.error('Error creating learning path:', error);
      toast.error('Failed to create learning path');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-forest-800 via-dark-forest-700 to-dark-forest-800 text-white">
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
      
      <div className="px-6 py-8">
        <div className="max-w-3xl mx-auto">
          {!assessment ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center mb-12">
                <FiBookOpen className="text-emerald-custom-400 text-5xl mx-auto mb-4" />
                <h1 className="text-4xl font-bold mb-4">Skill Assessment</h1>
                <p className="text-white/70 text-lg">
                  Assess your knowledge and get personalized learning recommendations
                </p>
              </div>
              
              <form onSubmit={handleTopicSubmit} className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <label className="block text-white text-lg font-medium mb-4">
                  What topic would you like to be assessed on?
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. React, Machine Learning, Data Structures"
                    className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-custom-500"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-emerald-custom-500 to-forest-500 hover:from-emerald-custom-600 hover:to-forest-600 text-white px-6 py-3 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <FiSend className="mr-2" />
                        <span>Begin</span>
                      </>
                    )}
                  </button>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-white font-medium mb-2">Popular Topics</h3>
                  <div className="flex flex-wrap gap-2">
                    {['Data Structures', 'Algorithms', 'Machine Learning', 'React', 'System Design', 'Node.js'].map((suggestedTopic) => (
                      <button
                        key={suggestedTopic}
                        type="button"
                        onClick={() => setTopic(suggestedTopic)}
                        className="bg-white/10 hover:bg-white/20 transition-colors px-3 py-1 rounded-full text-sm"
                      >
                        {suggestedTopic}
                      </button>
                    ))}
                  </div>
                </div>
              </form>
              
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 text-center">
                  <FiTarget className="text-emerald-custom-400 text-3xl mx-auto mb-3" />
                  <h3 className="text-lg font-medium mb-2">Identify Gaps</h3>
                  <p className="text-white/70 text-sm">
                    Discover areas that need improvement for your specific learning goals
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 text-center">
                  <FiBarChart className="text-emerald-custom-400 text-3xl mx-auto mb-3" />
                  <h3 className="text-lg font-medium mb-2">Track Progress</h3>
                  <p className="text-white/70 text-sm">
                    Monitor your knowledge growth over time with periodic assessments
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 text-center">
                  <FiAward className="text-emerald-custom-400 text-3xl mx-auto mb-3" />
                  <h3 className="text-lg font-medium mb-2">Personalized Learning</h3>
                  <p className="text-white/70 text-sm">
                    Get custom learning paths tailored to your current skill level
                  </p>
                </div>
              </div>
            </motion.div>
          ) : assessmentCompleted ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20"
            >
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-emerald-custom-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiAward className="text-emerald-custom-400 text-4xl" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Assessment Complete!</h2>
                <p className="text-white/70">
                  Your assessment on {topic} has been analyzed
                </p>
              </div>
              
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Performance</h3>
                  <span className="text-lg font-bold">{results.performance.percentage}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2.5">
                  <div 
                    className="bg-gradient-to-r from-emerald-custom-500 to-forest-500 h-2.5 rounded-full"
                    style={{ width: `${results.performance.percentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-white/70 text-sm mt-2">
                  <span>Beginner</span>
                  <span>Intermediate</span>
                  <span>Advanced</span>
                </div>
              </div>
              
              <div className="mb-8">
                <h3 className="font-medium mb-3">Identified Skill Gaps</h3>
                <ul className="space-y-2">
                  {results.assessment.skillGaps.length > 0 ? (
                    results.assessment.skillGaps.map((gap, index) => (
                      <li key={index} className="bg-white/5 px-4 py-2 rounded-lg flex items-center">
                        <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>
                        {gap}
                      </li>
                    ))
                  ) : (
                    <li className="bg-white/5 px-4 py-2 rounded-lg flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                      No significant skill gaps identified
                    </li>
                  )}
                </ul>
              </div>
              
              <div className="mb-8">
                <h3 className="font-medium mb-3">Your Learning Style</h3>
                <div className="bg-white/5 p-4 rounded-lg">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="w-full bg-white/10 rounded-full h-2 mb-1">
                        <div 
                          className="bg-blue-400 h-2 rounded-full"
                          style={{ width: `${results.assessment.learningStyle.visual}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-white/70">Visual</span>
                      <div className="text-lg font-medium">{results.assessment.learningStyle.visual}%</div>
                    </div>
                    <div className="text-center">
                      <div className="w-full bg-white/10 rounded-full h-2 mb-1">
                        <div 
                          className="bg-purple-400 h-2 rounded-full"
                          style={{ width: `${results.assessment.learningStyle.textual}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-white/70">Textual</span>
                      <div className="text-lg font-medium">{results.assessment.learningStyle.textual}%</div>
                    </div>
                    <div className="text-center">
                      <div className="w-full bg-white/10 rounded-full h-2 mb-1">
                        <div 
                          className="bg-green-400 h-2 rounded-full"
                          style={{ width: `${results.assessment.learningStyle.interactive}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-white/70">Interactive</span>
                      <div className="text-lg font-medium">{results.assessment.learningStyle.interactive}%</div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-white/70 mb-1">Dominant Style</div>
                    <div className="font-medium">{results.assessment.learningStyle.current.charAt(0).toUpperCase() + results.assessment.learningStyle.current.slice(1)} Learner</div>
                  </div>
                </div>
              </div>
              
              <div className="mb-8">
                <h3 className="font-medium mb-3">Recommended Learning Path</h3>
                <div className="space-y-2">
                  {results.assessment.recommendedCourses.map((course, index) => (
                    <div key={index} className="bg-white/5 px-4 py-3 rounded-lg flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="w-6 h-6 bg-gradient-to-r from-emerald-custom-500 to-forest-500 rounded-full flex items-center justify-center text-white text-xs mr-3">
                          {index + 1}
                        </span>
                        <span>{course}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-center">
                <button
                  onClick={handleCreateLearningPath}
                  className="bg-gradient-to-r from-emerald-custom-500 to-forest-500 hover:from-emerald-custom-600 hover:to-forest-600 text-white px-8 py-3 rounded-lg transition-colors"
                >
                  Create Learning Path
                </button>
              </div>
            </motion.div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">{topic} Assessment</h2>
                <div className="text-white/70">
                  Question {currentQuestion + 1} of {assessment.questions.length}
                </div>
              </div>
              
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-6"
              >
                <h3 className="text-xl font-medium mb-4">
                  {assessment.questions[currentQuestion].question}
                </h3>
                
                <div className="space-y-3">
                  {assessment.questions[currentQuestion].options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(currentQuestion, index)}
                      className={`w-full text-left p-4 rounded-lg transition-colors ${
                        answers[currentQuestion] === index
                          ? 'bg-emerald-custom-500/30 border-2 border-emerald-custom-500'
                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-6 h-6 rounded-full mr-3 flex items-center justify-center ${
                          answers[currentQuestion] === index
                            ? 'bg-emerald-custom-500 text-white'
                            : 'bg-white/10'
                        }`}>
                          {String.fromCharCode(65 + index)}
                        </div>
                        <div>{option}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
              
              <div className="flex justify-between">
                <button
                  onClick={handlePrevQuestion}
                  disabled={currentQuestion === 0}
                  className="px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {currentQuestion < assessment.questions.length - 1 ? (
                  <button
                    onClick={handleNextQuestion}
                    disabled={answers[currentQuestion] === null}
                    className="px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitAssessment}
                    disabled={answers[currentQuestion] === null || isSubmitting}
                    className="px-6 py-2 rounded-lg bg-gradient-to-r from-emerald-custom-500 to-forest-500 hover:from-emerald-custom-600 hover:to-forest-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
                  </button>
                )}
              </div>
              
              <div className="mt-8">
                <div className="w-full bg-white/20 rounded-full h-1.5">
                  <div 
                    className="bg-gradient-to-r from-emerald-custom-500 to-forest-500 h-1.5 rounded-full"
                    style={{ width: `${((currentQuestion + 1) / assessment.questions.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default SkillAssessment;