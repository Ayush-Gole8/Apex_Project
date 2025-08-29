/**
 * Data migration and cleanup utility for Apex
 * This script helps clean up and migrate data structures to handle schema changes
 */

const fs = require('fs');
const path = require('path');
const dataManager = require('./dataManager');

console.log('Starting data migration and cleanup...');

// User data migration
const migrateUserData = () => {
  console.log('Migrating user data...');
  
  try {
    const users = dataManager.getUsers();
    let modified = false;
    
    // Process each user to ensure they have all required fields
    users.forEach(user => {
      // Add missing fields with default values
      if (!user.createdAt) {
        user.createdAt = new Date().toISOString();
        modified = true;
      }
      
      if (!user.preferences) {
        user.preferences = {
          theme: 'dark',
          notifications: true
        };
        modified = true;
      }
    });
    
    if (modified) {
      dataManager.saveUsers(users);
      console.log('User data migration completed.');
    } else {
      console.log('No user data changes needed.');
    }
  } catch (error) {
    console.error('Error migrating user data:', error);
  }
};

// User courses migration
const migrateUserCourses = () => {
  console.log('Migrating user courses data...');
  
  try {
    const userCourses = dataManager.getUserCourses();
    let modified = false;
    
    // Process each user course to fix schema issues
    userCourses.forEach(course => {
      // Convert 'favorite' to 'liked' if needed
      if (course.hasOwnProperty('favorite') && !course.hasOwnProperty('liked')) {
        course.liked = course.favorite;
        delete course.favorite;
        modified = true;
      }
      
      // Ensure progress is a number
      if (typeof course.progress !== 'number') {
        course.progress = parseInt(course.progress || 0) || 0;
        modified = true;
      }
      
      // Add missing fields
      if (!course.updatedAt) {
        course.updatedAt = course.createdAt || new Date().toISOString();
        modified = true;
      }
    });
    
    if (modified) {
      dataManager.saveUserCourses(userCourses);
      console.log('User courses migration completed.');
    } else {
      console.log('No user courses changes needed.');
    }
  } catch (error) {
    console.error('Error migrating user courses:', error);
  }
};

// Run migrations
migrateUserData();
migrateUserCourses();

console.log('Data migration and cleanup completed.');

module.exports = {
  migrateUserData,
  migrateUserCourses
};