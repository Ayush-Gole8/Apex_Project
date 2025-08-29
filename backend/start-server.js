#!/usr/bin/env node

/**
 * Apex Backend Starter Script
 * This script provides a more reliable way to start the backend server
 * with better error handling and diagnostics.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  brightRed: '\x1b[91m',
  brightGreen: '\x1b[92m',
  brightYellow: '\x1b[93m',
  brightBlue: '\x1b[94m'
};

// Banner
console.log(`${colors.cyan}┌────────────────────────────────────┐${colors.reset}`);
console.log(`${colors.cyan}│     Apex Backend Starter Script     │${colors.reset}`);
console.log(`${colors.cyan}└────────────────────────────────────┘${colors.reset}`);
console.log('');

// Check if server.js exists
const serverJsPath = path.join(__dirname, 'server.js');
if (!fs.existsSync(serverJsPath)) {
  console.error(`${colors.red}Error: server.js not found at ${serverJsPath}${colors.reset}`);
  process.exit(1);
}

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log(`${colors.yellow}Warning: .env file not found. Creating default .env file...${colors.reset}`);
  const defaultEnv = `PORT=3001
JWT_SECRET=apex_jwt_secret_dev_only_change_in_production
NODE_ENV=development
GEMINI_API_KEY=your_gemini_api_key_here`;
  
  fs.writeFileSync(envPath, defaultEnv);
  console.log(`${colors.green}Created default .env file at ${envPath}${colors.reset}`);
  console.log(`${colors.yellow}Note: You should update the JWT_SECRET and GEMINI_API_KEY with real values.${colors.reset}`);
}

// Check if port 3001 is available
function checkPort(callback) {
  const tester = http.createServer()
    .once('error', err => {
      if (err.code === 'EADDRINUSE') {
        console.log(`${colors.yellow}Warning: Port 3001 is already in use.${colors.reset}`);
        callback(false);
      } else {
        console.error(`${colors.red}Error checking port: ${err.message}${colors.reset}`);
        callback(false);
      }
    })
    .once('listening', () => {
      tester.close();
      callback(true);
    })
    .listen(3001);
}

// Check if data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  console.log(`${colors.yellow}Creating data directory...${colors.reset}`);
  fs.mkdirSync(dataDir, { recursive: true });
  console.log(`${colors.green}Created data directory at ${dataDir}${colors.reset}`);
}

// Ensure all required data files exist
const requiredDataFiles = [
  'users.json',
  'courses.json',
  'userCourses.json'
];

requiredDataFiles.forEach(file => {
  const filePath = path.join(dataDir, file);
  if (!fs.existsSync(filePath)) {
    console.log(`${colors.yellow}Creating empty ${file}...${colors.reset}`);
    fs.writeFileSync(filePath, '[]');
    console.log(`${colors.green}Created ${file}${colors.reset}`);
  }
});

// Start the server
function startServer() {
  console.log(`${colors.cyan}Starting server...${colors.reset}`);
  
  // Run data migrations if needed
  try {
    if (fs.existsSync(path.join(__dirname, 'data-migration.js'))) {
      console.log(`${colors.yellow}Running data migrations...${colors.reset}`);
      require('./data-migration');
      console.log(`${colors.green}Data migrations completed successfully${colors.reset}`);
    }
  } catch (error) {
    console.error(`${colors.red}Error during data migration: ${error.message}${colors.reset}`);
    console.log(`${colors.yellow}Continuing with server startup...${colors.reset}`);
  }

  // Load environment variables
  require('dotenv').config();
  
  // Check for PORT in env file
  const port = process.env.PORT || 3001;
  
  const serverProcess = spawn('node', ['server.js'], {
    stdio: 'inherit',
    env: process.env
  });

  serverProcess.on('error', (error) => {
    console.error(`${colors.red}Failed to start server: ${error.message}${colors.reset}`);
  });

  serverProcess.on('close', (code) => {
    if (code !== 0) {
      console.error(`${colors.red}Server process exited with code ${code}${colors.reset}`);
    } else {
      console.log(`${colors.green}Server process exited normally${colors.reset}`);
    }
  });

  // Handle process termination
  const exitHandler = () => {
    if (serverProcess && !serverProcess.killed) {
      console.log(`${colors.yellow}Shutting down server...${colors.reset}`);
      serverProcess.kill();
    }
    process.exit(0);
  };

  // Handle various termination signals
  process.on('SIGINT', exitHandler);
  process.on('SIGTERM', exitHandler);
  process.on('SIGUSR1', exitHandler);
  process.on('SIGUSR2', exitHandler);
}

// Main execution
checkPort((isAvailable) => {
  if (isAvailable) {
    console.log(`${colors.green}Port 3001 is available. Starting server...${colors.reset}`);
    startServer();
  } else {
    console.log(`${colors.yellow}Suggestions to fix port issues:${colors.reset}`);
    console.log(`${colors.yellow}1. Find and stop the process using port 3001${colors.reset}`);
    console.log(`${colors.yellow}2. Change the PORT value in .env file${colors.reset}`);
    console.log(`${colors.yellow}3. Run the server with a different port: PORT=3002 node server.js${colors.reset}`);
    
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    readline.question(`${colors.cyan}Do you want to try starting the server anyway? (y/n) ${colors.reset}`, (answer) => {
      readline.close();
      if (answer.toLowerCase() === 'y') {
        console.log(`${colors.yellow}Attempting to start server anyway...${colors.reset}`);
        startServer();
      } else {
        console.log(`${colors.red}Server startup aborted.${colors.reset}`);
        process.exit(1);
      }
    });
  }
});