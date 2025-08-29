// Learning path functionality for Apex platform
const express = require('express');
const crypto = require('crypto'); // Use Node.js built-in crypto module instead of uuid
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Generate UUIDs using Node.js crypto module
function generateUUID() {
  return crypto.randomUUID();
}

// File path for storing learning paths
const LEARNING_PATHS_FILE = path.join(__dirname, '..', 'data', 'learningPaths.json');

// Helper functions
const getLearningPaths = () => {
  try {
    if (!fs.existsSync(LEARNING_PATHS_FILE)) {
      fs.writeFileSync(LEARNING_PATHS_FILE, JSON.stringify([], null, 2));
      return [];
    }
    const data = fs.readFileSync(LEARNING_PATHS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading learning paths file:', error);
    return [];
  }
};

const saveLearningPaths = (learningPaths) => {
  try {
    if (!Array.isArray(learningPaths)) {
      console.error('Invalid learning paths data format');
      return false;
    }
    fs.writeFileSync(LEARNING_PATHS_FILE, JSON.stringify(learningPaths, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving learning paths file:', error);
    return false;
  }
};

// Get all learning paths for the authenticated user
router.get('/', (req, res) => {
  try {
    const learningPaths = getLearningPaths();
    const userPaths = learningPaths.filter(path => path.userId === req.user.userId);
    res.json(userPaths);
  } catch (error) {
    console.error('Error fetching learning paths:', error);
    res.status(500).json({ message: 'Failed to fetch learning paths' });
  }
});

// Create a new learning path
router.post('/', (req, res) => {
  try {
    const { name, description, courses, difficulty } = req.body;
    
    if (!name || !courses || !Array.isArray(courses)) {
      return res.status(400).json({ message: 'Invalid learning path data' });
    }

    const learningPaths = getLearningPaths();
    
    const newPath = {
      id: generateUUID(),
      userId: req.user.userId,
      name,
      description: description || `Learning path for ${name}`,
      courses,
      currentCourseIndex: 0,
      difficulty: difficulty || 'intermediate',
      adaptiveDifficulty: true,
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    learningPaths.push(newPath);
    saveLearningPaths(learningPaths);
    
    res.status(201).json(newPath);
  } catch (error) {
    console.error('Error creating learning path:', error);
    res.status(500).json({ message: 'Failed to create learning path' });
  }
});

// Update a learning path
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const learningPaths = getLearningPaths();
    const pathIndex = learningPaths.findIndex(p => p.id === id && p.userId === req.user.userId);
    
    if (pathIndex === -1) {
      return res.status(404).json({ message: 'Learning path not found' });
    }
    
    // Update the path
    const updatedPath = {
      ...learningPaths[pathIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    learningPaths[pathIndex] = updatedPath;
    saveLearningPaths(learningPaths);
    
    res.json(updatedPath);
  } catch (error) {
    console.error('Error updating learning path:', error);
    res.status(500).json({ message: 'Failed to update learning path' });
  }
});

// Delete a learning path
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const learningPaths = getLearningPaths();
    const pathIndex = learningPaths.findIndex(p => p.id === id && p.userId === req.user.userId);
    
    if (pathIndex === -1) {
      return res.status(404).json({ message: 'Learning path not found' });
    }
    
    learningPaths.splice(pathIndex, 1);
    saveLearningPaths(learningPaths);
    
    res.json({ message: 'Learning path deleted successfully' });
  } catch (error) {
    console.error('Error deleting learning path:', error);
    res.status(500).json({ message: 'Failed to delete learning path' });
  }
});

module.exports = router;