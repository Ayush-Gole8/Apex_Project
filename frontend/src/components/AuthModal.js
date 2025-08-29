import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const AuthModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <motion.div 
          className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl w-full max-w-md relative z-10 p-6"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">
              {isLogin ? 'Sign In' : 'Create Account'}
            </h2>
            <button 
              className="text-white/60 hover:text-white"
              onClick={onClose}
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-gradient-to-r from-emerald-custom-500 to-forest-500 rounded-lg py-3 text-white font-medium"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
            
            <div className="text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-white/70 hover:text-white text-sm font-medium"
              >
                {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
              </button>
            </div>
            
            <div className="text-center">
              <button
                onClick={() => {
                  navigate('/dashboard');
                  onClose();
                }}
                className="text-white/70 hover:text-white text-sm font-medium"
              >
                Continue as Guest
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthModal;