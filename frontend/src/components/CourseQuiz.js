import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { FiArrowLeft } from 'react-icons/fi';
import API_BASE_URL from '../config/api';

const CourseQuiz = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { course } = location.state || {};

  const [loading, setLoading] = useState(true);
  const [quizData, setQuizData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState(null);

  // Fetch or generate quiz
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Please login to take quiz');
          navigate('/');
          return;
        }

        if (!courseId) {
          toast.error('Invalid course');
          navigate('/my-courses');
          return;
        }

        toast.loading('Generating quiz questions...', { id: 'quiz-load' });

        const response = await axios.post(
          `${API_BASE_URL}/api/courses/${courseId}/generate-quiz`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        setQuizData(response.data);
        setTimeRemaining(response.data.timeLimit * 60); // Convert to seconds
        toast.success('Quiz loaded successfully!', { id: 'quiz-load' });
        setLoading(false);
      } catch (error) {
        console.error('Error loading quiz:', error);
        toast.error(error.response?.data?.message || 'Failed to load quiz', { id: 'quiz-load' });
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [courseId, navigate]);

  // Timer countdown
  useEffect(() => {
    if (!quizStarted || quizSubmitted || timeRemaining === null) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz(true); // Auto-submit when time runs out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizStarted, quizSubmitted, timeRemaining]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartQuiz = () => {
    setQuizStarted(true);
    toast.success('Quiz started! Good luck! 🍀');
  };

  const handleAnswerSelect = (questionId, answer) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = async (autoSubmit = false) => {
    try {
      if (!autoSubmit) {
        const unanswered = quizData.questions.length - Object.keys(selectedAnswers).length;
        if (unanswered > 0) {
          const confirm = window.confirm(
            `You have ${unanswered} unanswered question(s). Do you want to submit anyway?`
          );
          if (!confirm) return;
        }
      }

      const timeTaken = (quizData.timeLimit * 60) - timeRemaining;
      toast.loading('Submitting quiz...', { id: 'quiz-submit' });

      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/api/quizzes/${courseId}/submit`,
        {
          answers: selectedAnswers,
          timeTaken,
          quizData
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setQuizResult(response.data.result);
      setQuizSubmitted(true);
      
      if (autoSubmit) {
        toast.error('Time\'s up! Quiz auto-submitted.', { id: 'quiz-submit' });
      } else {
        toast.success('Quiz submitted successfully!', { id: 'quiz-submit' });
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('Failed to submit quiz', { id: 'quiz-submit' });
    }
  };

  const getQuestionStatus = (questionId) => {
    return selectedAnswers[questionId] ? 'answered' : 'unanswered';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-forest-800 via-dark-forest-700 to-dark-forest-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-custom-500 mx-auto mb-4"></div>
          <p className="text-white/80 text-lg">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quizData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-forest-800 via-dark-forest-700 to-dark-forest-800 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl text-white mb-4">Failed to load quiz</h2>
          <button
            onClick={() => navigate('/my-courses')}
            className="px-6 py-2 bg-gradient-to-r from-emerald-custom-500 to-forest-500 text-white rounded-lg hover:shadow-lg hover:shadow-emerald-custom-500/50 transition-all"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  // Quiz Result Display
  if (quizSubmitted && quizResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-forest-800 via-dark-forest-700 to-dark-forest-800 py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Result Header */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 mb-8">
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.6 }}
                className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 ${
                  quizResult.passed 
                    ? 'bg-emerald-custom-500/20 text-emerald-custom-400 border-2 border-emerald-custom-500/50' 
                    : 'bg-red-500/20 text-red-400 border-2 border-red-500/50'
                }`}
              >
                {quizResult.passed ? (
                  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </motion.div>
              
              <h1 className="text-3xl font-bold text-white mb-2">
                {quizResult.passed ? '🎉 Congratulations!' : '📚 Keep Learning!'}
              </h1>
              <p className="text-white/60 text-lg">
                {quizResult.passed 
                  ? 'You passed the quiz!' 
                  : 'Don\'t worry, review the topics and try again.'}
              </p>
            </div>

            {/* Score Display */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-br from-white/5 to-white/10 border border-white/20 rounded-xl p-4 text-center">
                <p className="text-white/60 text-sm mb-1">Score</p>
                <p className="text-2xl font-bold text-white">{quizResult.score}%</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-custom-500/10 to-forest-500/10 border border-emerald-custom-500/30 rounded-xl p-4 text-center">
                <p className="text-white/60 text-sm mb-1">Correct</p>
                <p className="text-2xl font-bold text-emerald-custom-400">
                  {quizResult.correctAnswers}/{quizResult.totalQuestions}
                </p>
              </div>
              <div className="bg-gradient-to-br from-white/5 to-white/10 border border-white/20 rounded-xl p-4 text-center">
                <p className="text-white/60 text-sm mb-1">Time Taken</p>
                <p className="text-2xl font-bold text-white">{formatTime(quizResult.timeTaken)}</p>
              </div>
              <div className="bg-gradient-to-br from-white/5 to-white/10 border border-white/20 rounded-xl p-4 text-center">
                <p className="text-white/60 text-sm mb-1">Status</p>
                <p className={`text-2xl font-bold ${quizResult.passed ? 'text-emerald-custom-400' : 'text-red-400'}`}>
                  {quizResult.passed ? 'Passed' : 'Failed'}
                </p>
              </div>
            </div>

            {/* Weak Areas */}
            {quizResult.weakAreas.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <span className="mr-2">⚠️</span>
                  Areas to Improve
                </h3>
                <div className="flex flex-wrap gap-2">
                  {quizResult.weakAreas.map((area, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Detailed Results */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Question Review</h2>
            
            <div className="space-y-6">
              {quizResult.detailedResults.map((result, index) => (
                <motion.div
                  key={result.questionId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-6 rounded-xl border-2 ${
                    result.isCorrect 
                      ? 'bg-emerald-custom-500/10 border-emerald-custom-500/30' 
                      : 'bg-red-500/10 border-red-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-white font-medium flex-1">
                      <span className="text-white/60 mr-2">Q{index + 1}.</span>
                      {result.question}
                    </h3>
                    {result.isCorrect ? (
                      <span className="flex-shrink-0 text-emerald-400 text-2xl ml-4">✓</span>
                    ) : (
                      <span className="flex-shrink-0 text-red-400 text-2xl ml-4">✗</span>
                    )}
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-sm">
                      <span className="text-white/60">Your Answer: </span>
                      <span className={result.isCorrect ? 'text-emerald-custom-400' : 'text-red-400'}>
                        {result.userAnswer}
                      </span>
                    </p>
                    {!result.isCorrect && (
                      <p className="text-sm">
                        <span className="text-white/60">Correct Answer: </span>
                        <span className="text-emerald-custom-400">{result.correctAnswer}</span>
                      </p>
                    )}
                    <p className="text-sm">
                      <span className="text-white/60">Topic: </span>
                      <span className="text-white/80">{result.topic}</span>
                    </p>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-sm text-white/80">{result.explanation}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate(`/course/${courseId}`, { state: { course: course || quizResult.courseTopic } })}
              className="px-8 py-3 bg-gradient-to-r from-emerald-custom-500 to-forest-500 hover:shadow-lg hover:shadow-emerald-custom-500/50 text-white rounded-xl font-medium transition-all"
            >
              Review Course
            </button>
            <button
              onClick={() => navigate('/my-courses')}
              className="px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-medium transition-colors"
            >
              My Courses
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-medium transition-colors"
            >
              Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Quiz Start Screen
  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-forest-800 via-dark-forest-700 to-dark-forest-800 flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">{quizData.quizTitle}</h1>
            <p className="text-white/60">Test your knowledge on {quizData.courseTopic}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-emerald-custom-500/10 to-forest-500/10 border border-emerald-custom-500/30 rounded-xl p-6 text-center">
              <p className="text-white/60 text-sm mb-2">Questions</p>
              <p className="text-3xl font-bold text-white">{quizData.totalQuestions}</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-custom-500/10 to-forest-500/10 border border-emerald-custom-500/30 rounded-xl p-6 text-center">
              <p className="text-white/60 text-sm mb-2">Time Limit</p>
              <p className="text-3xl font-bold text-emerald-custom-400">{quizData.timeLimit} min</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-custom-500/10 to-forest-500/10 border border-emerald-custom-500/30 rounded-xl p-6 text-center">
              <p className="text-white/60 text-sm mb-2">Passing Score</p>
              <p className="text-3xl font-bold text-white">60%</p>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
              <span className="mr-2">📋</span>
              Quiz Instructions
            </h3>
            <ul className="space-y-2 text-white/80 text-sm">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>This quiz contains {quizData.totalQuestions} multiple-choice questions</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>You have {quizData.timeLimit} minutes to complete the quiz</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Each question has only one correct answer</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>You can navigate between questions using Next/Previous buttons</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>The quiz will auto-submit when time runs out</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>You need 60% to pass the quiz</span>
              </li>
            </ul>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleStartQuiz}
              className="flex-1 px-8 py-4 bg-gradient-to-r from-emerald-custom-500 to-forest-500 hover:shadow-lg hover:shadow-emerald-custom-500/50 text-white rounded-xl font-medium text-lg transition-all"
            >
              Start Quiz
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Quiz Taking Interface
  const question = quizData.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quizData.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-forest-800 via-dark-forest-700 to-dark-forest-800 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header with Timer and Back Button */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to leave the quiz? Your progress will be lost.')) {
                  navigate(-1);
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 
                       border border-white/20 rounded-lg transition-all duration-300"
            >
              <FiArrowLeft className="text-lg" />
              <span>Back</span>
            </button>
            
            <div>
              <h2 className="text-2xl font-bold text-white">{quizData.quizTitle}</h2>
              <p className="text-white/60 text-sm">Question {currentQuestion + 1} of {quizData.questions.length}</p>
            </div>
            <div className={`text-center ${timeRemaining < 60 ? 'animate-pulse' : ''}`}>
              <p className="text-white/60 text-sm mb-1">Time Remaining</p>
              <p className={`text-3xl font-bold ${
                timeRemaining < 60 ? 'text-red-400' : 'text-emerald-custom-400'
              }`}>
                {formatTime(timeRemaining)}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/10 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-2 bg-gradient-to-r from-emerald-custom-500 to-forest-500 rounded-full"
            />
          </div>
        </div>

        {/* Question Navigation */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 mb-6">
          <h3 className="text-white/80 text-sm mb-3">Question Navigator</h3>
          <div className="grid grid-cols-10 gap-2">
            {quizData.questions.map((q, index) => (
              <button
                key={q.id}
                onClick={() => setCurrentQuestion(index)}
                className={`w-10 h-10 rounded-lg font-medium text-sm transition-all ${
                  index === currentQuestion
                    ? 'bg-gradient-to-r from-emerald-custom-500 to-forest-500 text-white scale-110 shadow-lg shadow-emerald-custom-500/50'
                    : getQuestionStatus(q.id) === 'answered'
                    ? 'bg-emerald-custom-500/20 text-emerald-custom-400 border border-emerald-custom-500/30 hover:bg-emerald-custom-500/30'
                    : 'bg-white/5 border border-white/20 text-white/60 hover:bg-white/10'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 mb-6"
          >
            {/* Question */}
            <div className="mb-8">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl text-white font-medium flex-1">
                  {question.question}
                </h3>
                <span className={`flex-shrink-0 ml-4 px-3 py-1 rounded-full text-xs font-medium ${
                  question.difficulty === 'easy' 
                    ? 'bg-green-500/20 text-green-400'
                    : question.difficulty === 'medium'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {question.difficulty}
                </span>
              </div>
              <p className="text-white/60 text-sm">Topic: {question.topic}</p>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {Object.entries(question.options).map(([key, value]) => (
                <motion.button
                  key={key}
                  onClick={() => handleAnswerSelect(question.id, key)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`w-full p-4 rounded-xl text-left transition-all ${
                    selectedAnswers[question.id] === key
                      ? 'bg-gradient-to-r from-emerald-custom-500/20 to-forest-500/20 border-2 border-emerald-custom-500 text-white shadow-lg shadow-emerald-custom-500/20'
                      : 'bg-white/5 border-2 border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <span className="font-semibold mr-3">{key}.</span>
                  {value}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex gap-4 justify-between">
          <button
            onClick={handlePreviousQuestion}
            disabled={currentQuestion === 0}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
          >
            ← Previous
          </button>

          <div className="flex gap-4">
            {currentQuestion === quizData.questions.length - 1 ? (
              <button
                onClick={() => handleSubmitQuiz(false)}
                className="px-8 py-3 bg-gradient-to-r from-emerald-custom-500 to-forest-500 hover:shadow-lg hover:shadow-emerald-custom-500/50 text-white rounded-xl font-medium transition-all"
              >
                Submit Quiz
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="px-6 py-3 bg-gradient-to-r from-emerald-custom-500 to-forest-500 hover:shadow-lg hover:shadow-emerald-custom-500/50 text-white rounded-xl font-medium transition-all"
              >
                Next →
              </button>
            )}
          </div>
        </div>

        {/* Submit Early Button */}
        {currentQuestion < quizData.questions.length - 1 && (
          <div className="text-center mt-6">
            <button
              onClick={() => handleSubmitQuiz(false)}
              className="px-6 py-2 text-white/60 hover:text-white text-sm underline"
            >
              Submit Quiz Early
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseQuiz;
