import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiClock, FiUsers, FiStar, FiCheck, FiPlay, FiBookOpen } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';
import Footer from './Footer';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedModule, setExpandedModule] = useState(null);

  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/courses/${id}`);
        setCourse(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching course:', error);
        toast.error('Course not found');
        navigate('/');
      }
    };

    fetchCourseDetail();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-forest-800 via-dark-forest-700 to-dark-forest-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-custom-500"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-forest-800 via-dark-forest-700 to-dark-forest-800 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl text-white mb-4">Course not found</h2>
          <button 
            onClick={() => navigate('/')}
            className="text-emerald-custom-400 hover:text-emerald-custom-300 transition-colors"
          >
            Back to home
          </button>
        </div>
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
            <span>Back to courses</span>
          </motion.button>
        </div>
      </div>

      {/* Course Hero */}
      <div className="px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <span className="bg-white/20 text-white text-sm px-3 py-1 rounded-full mb-4 inline-block">
                {course.difficulty}
              </span>
              
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                {course.title}
              </h1>
              
              <p className="text-xl text-gray-300 mb-8">
                {course.description}
              </p>
              
              <div className="flex items-center space-x-6 mb-8">
                <div className="flex items-center space-x-2 text-white/70">
                  <FiClock />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center space-x-2 text-white/70">
                  <FiUsers />
                  <span>{Math.floor(Math.random() * 1000) + 500}+ students</span>
                </div>
                <div className="flex items-center space-x-2 text-yellow-400">
                  <FiStar />
                  <span>4.{Math.floor(Math.random() * 3) + 7}</span>
                </div>
              </div>
              
              <motion.button
                className="bg-gradient-to-r from-emerald-custom-500 to-forest-500 text-white px-8 py-4 rounded-lg font-semibold hover:shadow-lg hover:shadow-emerald-custom-500/25 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Learning
              </motion.button>
            </motion.div>
            
            <motion.div
              className={`${course.color} p-8 rounded-3xl relative overflow-hidden`}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="relative z-10">
                <FiBookOpen className="text-white text-6xl mb-6" />
                <h3 className="text-2xl font-bold text-white mb-4">Course Overview</h3>
                <p className="text-white/80 mb-6">
                  Master {course.title.toLowerCase()} with hands-on projects and real-world applications.
                </p>
                <div className="space-y-2">
                  {course.topics.slice(0, 4).map((topic, index) => (
                    <div key={index} className="flex items-center space-x-2 text-white/80">
                      <FiCheck className="text-green-400" />
                      <span className="text-sm">{topic}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/10 rounded-full"></div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            className="text-3xl font-bold text-white mb-8"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
          >
            Course Modules
          </motion.h2>
          
          <div className="space-y-4">
            {course.topics.map((topic, index) => (
              <motion.div
                key={index}
                className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl overflow-hidden"
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <button
                  onClick={() => setExpandedModule(expandedModule === index ? null : index)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-emerald-custom-500 to-forest-500 rounded-lg flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">Module {index + 1}: {topic}</h3>
                      <p className="text-white/60 text-sm">Learn the fundamentals of {topic.toLowerCase()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-white/60">
                    <FiPlay />
                    <span className="text-sm">{Math.floor(Math.random() * 45) + 15} min</span>
                  </div>
                </button>
                
                {expandedModule === index && (
                  <motion.div
                    className="px-6 pb-6"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <div className="border-l-2 border-emerald-custom-500 pl-6 space-y-3">
                      <div className="flex items-center space-x-3 text-white/80">
                        <FiCheck className="text-green-400" />
                        <span className="text-sm">Introduction to {topic}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-white/80">
                        <FiCheck className="text-green-400" />
                        <span className="text-sm">Practical Examples</span>
                      </div>
                      <div className="flex items-center space-x-3 text-white/80">
                        <FiCheck className="text-green-400" />
                        <span className="text-sm">Hands-on Exercise</span>
                      </div>
                      <div className="flex items-center space-x-3 text-white/80">
                        <div className="w-4 h-4 border-2 border-white/40 rounded"></div>
                        <span className="text-sm">Quiz & Assessment</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default CourseDetail;