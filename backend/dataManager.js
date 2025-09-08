const fs = require('fs');
const path = require('path');

// Define data directory and file paths
const dataDir = path.join(__dirname, 'data');
const usersFile = path.join(dataDir, 'users.json');
const coursesFile = path.join(dataDir, 'courses.json');
const userCoursesFile = path.join(dataDir, 'userCourses.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log(`Created data directory: ${dataDir}`);
}

// Helper function to ensure a file exists with default data
const ensureFileExists = (filePath, defaultData = []) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    console.log(`Created file: ${filePath}`);
    return true;
  }
  return false;
};

// Ensure all data files exist
ensureFileExists(usersFile);
ensureFileExists(coursesFile);
ensureFileExists(userCoursesFile);

// Load data from file
const loadData = (filePath, defaultValue = []) => {
  try {
    ensureFileExists(filePath, defaultValue);
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading data from ${filePath}:`, error.message);
    return defaultValue;
  }
};

// Save data to file
const saveData = (filePath, data) => {
  try {
    ensureFileExists(filePath, []);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error saving data to ${filePath}:`, error.message);
    return false;
  }
};

// User data management
const getUsers = () => loadData(usersFile);
const saveUsers = (users) => saveData(usersFile, users);

// Course data management
const getCourses = () => loadData(coursesFile);
const saveCourses = (courses) => saveData(coursesFile, courses);

// User course data management
const getUserCourses = () => loadData(userCoursesFile);
const saveUserCourses = (userCourses) => saveData(userCoursesFile, userCourses);

module.exports = {
  getUsers,
  saveUsers,
  getCourses,
  saveCourses,
  getUserCourses,
  saveUserCourses
};