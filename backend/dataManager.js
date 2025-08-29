/**
 * Data Manager for Apex Learning Platform
 * Handles data persistence for users, courses, and user progress
 */

const fs = require('fs');
const path = require('path');

// File paths
const USERS_FILE = path.join(__dirname, 'data', 'users.json');
const COURSES_FILE = path.join(__dirname, 'data', 'courses.json');
const USER_COURSES_FILE = path.join(__dirname, 'data', 'userCourses.json');
const LEARNING_PATHS_FILE = path.join(__dirname, 'data', 'learningPaths.json');
const SKILL_ASSESSMENTS_FILE = path.join(__dirname, 'data', 'skillAssessments.json');
const CODE_SNIPPETS_FILE = path.join(__dirname, 'data', 'codeSnippets.json');

// Helper function to read a JSON file
const readJsonFile = (filePath, defaultValue = []) => {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`File not found, creating: ${filePath}`);
      fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2));
      return defaultValue;
    }
    
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return defaultValue;
  }
};

// Helper function to write to a JSON file
const writeJsonFile = (filePath, data) => {
  try {
    // Create directory if it doesn't exist
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Error writing to file ${filePath}:`, error);
    return false;
  }
};

// User data functions
const getUsers = () => readJsonFile(USERS_FILE);
const saveUsers = (users) => writeJsonFile(USERS_FILE, users);

// Course data functions
const getCourses = () => readJsonFile(COURSES_FILE);
const saveCourses = (courses) => writeJsonFile(COURSES_FILE, courses);

// User course data functions
const getUserCourses = () => readJsonFile(USER_COURSES_FILE);
const saveUserCourses = (userCourses) => writeJsonFile(USER_COURSES_FILE, userCourses);

// Learning paths functions
const getLearningPaths = () => readJsonFile(LEARNING_PATHS_FILE);
const saveLearningPaths = (paths) => writeJsonFile(LEARNING_PATHS_FILE, paths);

// Skill assessments functions
const getSkillAssessments = () => readJsonFile(SKILL_ASSESSMENTS_FILE);
const saveSkillAssessments = (assessments) => writeJsonFile(SKILL_ASSESSMENTS_FILE, assessments);

// Code snippets functions
const getCodeSnippets = () => readJsonFile(CODE_SNIPPETS_FILE);
const saveCodeSnippets = (snippets) => writeJsonFile(CODE_SNIPPETS_FILE, snippets);

// Generate a UUID (simple version)
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

module.exports = {
  getUsers,
  saveUsers,
  getCourses,
  saveCourses,
  getUserCourses,
  saveUserCourses,
  getLearningPaths,
  saveLearningPaths,
  getSkillAssessments,
  saveSkillAssessments,
  getCodeSnippets,
  saveCodeSnippets,
  generateUUID
};