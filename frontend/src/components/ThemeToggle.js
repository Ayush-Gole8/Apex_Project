import React from 'react';
import { motion } from 'framer-motion';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className={`relative w-12 h-6 rounded-full p-1 transition-colors duration-300 ${
        isDark 
          ? 'bg-gray-700 hover:bg-gray-600' 
          : 'bg-emerald-custom-200 hover:bg-emerald-custom-300'
      }`}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle theme"
    >
      {/* Toggle Background */}
      <motion.div
        className={`w-4 h-4 rounded-full flex items-center justify-center ${
          isDark 
            ? 'bg-gray-200 text-gray-800' 
            : 'bg-white text-emerald-custom-600'
        }`}
        animate={{
          x: isDark ? 0 : 24
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30
        }}
      >
        {isDark ? (
          <FiMoon size={10} />
        ) : (
          <FiSun size={10} />
        )}
      </motion.div>

      {/* Background Icons */}
      <div className="absolute inset-0 flex items-center justify-between px-1 pointer-events-none">
        <FiMoon 
          size={10} 
          className={`transition-opacity ${isDark ? 'opacity-50' : 'opacity-20'}`}
        />
        <FiSun 
          size={10} 
          className={`transition-opacity ${isDark ? 'opacity-20' : 'opacity-50'}`}
        />
      </div>
    </motion.button>
  );
};

export default ThemeToggle;