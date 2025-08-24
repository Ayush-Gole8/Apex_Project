const fs = require('fs');
const path = require('path');

// Data storage paths
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const COURSES_FILE = path.join(DATA_DIR, 'courses.json');
const USER_COURSES_FILE = path.join(DATA_DIR, 'user_courses.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize data files if they don't exist
function initializeDataFiles() {
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(COURSES_FILE)) {
    fs.writeFileSync(COURSES_FILE, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(USER_COURSES_FILE)) {
    fs.writeFileSync(USER_COURSES_FILE, JSON.stringify([], null, 2));
  }
}

// Data management functions
const dataManager = {
  // Users
  getUsers: () => {
    try {
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading users file:', error);
      return [];
    }
  },

  saveUsers: (users) => {
    try {
      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
      return true;
    } catch (error) {
      console.error('Error saving users file:', error);
      return false;
    }
  },

  // Courses
  getCourses: () => {
    try {
      const data = fs.readFileSync(COURSES_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading courses file:', error);
      return [];
    }
  },

  saveCourses: (courses) => {
    try {
      fs.writeFileSync(COURSES_FILE, JSON.stringify(courses, null, 2));
      return true;
    } catch (error) {
      console.error('Error saving courses file:', error);
      return false;
    }
  },

  // User Courses
  getUserCourses: () => {
    try {
      const data = fs.readFileSync(USER_COURSES_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading user courses file:', error);
      return [];
    }
  },

  saveUserCourses: (userCourses) => {
    try {
      fs.writeFileSync(USER_COURSES_FILE, JSON.stringify(userCourses, null, 2));
      return true;
    } catch (error) {
      console.error('Error saving user courses file:', error);
      return false;
    }
  }
};

// Initialize data files on startup
initializeDataFiles();

module.exports = dataManager;