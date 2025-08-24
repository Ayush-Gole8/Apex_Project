import React from 'react';
import { motion } from 'framer-motion';
import { FiHeart, FiGithub, FiLinkedin, FiMail } from 'react-icons/fi';

const Footer = () => {
  return (
    <motion.footer 
      className="bg-gradient-to-r from-dark-forest-900 via-dark-forest-800 to-dark-forest-900 border-t border-white/10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          {/* Logo Section */}
          <motion.div 
            className="flex items-center space-x-3 mb-4 md:mb-0"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-custom-500 to-forest-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-lg">A</span>
            </div>
            <span className="text-xl font-bold text-white">APE<span className="text-emerald-custom-400">X</span></span>
          </motion.div>

          {/* Made By Section */}
          <motion.div 
            className="flex items-center space-x-2 text-white/70 mb-4 md:mb-0"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span className="text-sm">Made with</span>
            <FiHeart className="text-red-400 animate-pulse" size={14} />
            <span className="text-sm">by</span>
            <span className="text-emerald-custom-400 font-semibold">Ayush Gole</span>
            <span className="text-sm">• 2025</span>
          </motion.div>

          {/* Social Links */}
          <motion.div 
            className="flex items-center space-x-4"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <a 
              href="https://github.com/Ayush-Gole8" 
              className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all duration-300"
              aria-label="GitHub"
            >
              <FiGithub size={16} />
            </a>
            <a 
              href="https://www.linkedin.com/in/ayush-gole8/" 
              className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all duration-300"
              aria-label="LinkedIn"
            >
              <FiLinkedin size={16} />
            </a>
            <a 
              href="mailto:ayushgole1910@gmail.com" 
              className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all duration-300"
              aria-label="Email"
            >
              <FiMail size={16} />
            </a>
          </motion.div>
        </div>

        {/* Additional Info */}
        <motion.div 
          className="mt-6 pt-6 border-t border-white/10 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-white/50 text-xs">
            AI-powered learning platform for engineering students • Built with React & Node.js
          </p>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;