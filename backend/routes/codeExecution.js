// Code execution API routes for Apex platform
const express = require('express');
const crypto = require('crypto'); // Use Node.js built-in crypto module instead of uuid
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const router = express.Router();

// Generate UUIDs using Node.js crypto module
function generateUUID() {
  return crypto.randomUUID();
}

// File path for storing code snippets
const CODE_SNIPPETS_FILE = path.join(__dirname, '..', 'data', 'codeSnippets.json');
const SHARED_CODE_FILE = path.join(__dirname, '..', 'data', 'sharedCode.json');

// Helper functions
const getCodeSnippets = () => {
  try {
    if (!fs.existsSync(CODE_SNIPPETS_FILE)) {
      fs.writeFileSync(CODE_SNIPPETS_FILE, JSON.stringify([], null, 2));
      return [];
    }
    const data = fs.readFileSync(CODE_SNIPPETS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading code snippets file:', error);
    return [];
  }
};

const saveCodeSnippets = (snippets) => {
  try {
    if (!Array.isArray(snippets)) {
      console.error('Invalid code snippets data format');
      return false;
    }
    fs.writeFileSync(CODE_SNIPPETS_FILE, JSON.stringify(snippets, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving code snippets file:', error);
    return false;
  }
};

const getSharedCode = () => {
  try {
    if (!fs.existsSync(SHARED_CODE_FILE)) {
      fs.writeFileSync(SHARED_CODE_FILE, JSON.stringify([], null, 2));
      return [];
    }
    const data = fs.readFileSync(SHARED_CODE_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading shared code file:', error);
    return [];
  }
};

const saveSharedCode = (sharedCode) => {
  try {
    if (!Array.isArray(sharedCode)) {
      console.error('Invalid shared code data format');
      return false;
    }
    fs.writeFileSync(SHARED_CODE_FILE, JSON.stringify(sharedCode, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving shared code file:', error);
    return false;
  }
};

// Execute code (simulated for security reasons)
router.post('/execute-code', (req, res) => {
  const { code, language } = req.body;
  
  if (!code || !language) {
    return res.status(400).json({ message: 'Code and language are required' });
  }
  
  // IMPORTANT: In a production environment, NEVER execute user code directly!
  // This should be done in a secure, sandboxed environment like AWS Lambda, Docker containers, etc.
  // The code below is just a simulation for demonstration purposes.
  
  // Simulate code execution with a delay
  setTimeout(() => {
    let output = '';
    
    // Simulate different language outputs
    switch (language.toLowerCase()) {
      case 'javascript':
        output = 'JavaScript output:\nConsole.log output would appear here.\nCode executed successfully!';
        break;
      case 'python':
        output = 'Python output:\n>>> print("Hello, World!")\nHello, World!\n>>> x = 10\n>>> print(x * 2)\n20';
        break;
      case 'java':
        output = 'Java output:\nCompiling Java code...\nCompiled successfully!\nHello, World!';
        break;
      default:
        output = `Execution for ${language} is simulated in this demo.\nIn a production environment, code would be executed in a secure sandbox.`;
    }
    
    res.json({ output });
  }, 1000);
});

// Save a code snippet
router.post('/', (req, res) => {
  try {
    const { code, language, title } = req.body;
    
    if (!code || !language) {
      return res.status(400).json({ message: 'Code and language are required' });
    }
    
    const snippets = getCodeSnippets();
    
    const newSnippet = {
      id: generateUUID(),
      userId: req.user.userId,
      title: title || `${language} Snippet ${new Date().toLocaleDateString()}`,
      code,
      language,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    snippets.push(newSnippet);
    saveCodeSnippets(snippets);
    
    res.status(201).json(newSnippet);
  } catch (error) {
    console.error('Error saving code snippet:', error);
    res.status(500).json({ message: 'Failed to save code snippet' });
  }
});

// Get all code snippets for the authenticated user
router.get('/', (req, res) => {
  try {
    const snippets = getCodeSnippets();
    const userSnippets = snippets.filter(snippet => snippet.userId === req.user.userId);
    res.json(userSnippets);
  } catch (error) {
    console.error('Error fetching code snippets:', error);
    res.status(500).json({ message: 'Failed to fetch code snippets' });
  }
});

// Share code (create a shareable link)
router.post('/shared', (req, res) => {
  try {
    const { code, language } = req.body;
    
    if (!code || !language) {
      return res.status(400).json({ message: 'Code and language are required' });
    }
    
    const sharedCode = getSharedCode();
    
    const newSharedCode = {
      id: generateUUID(),
      userId: req.user ? req.user.userId : 'anonymous',
      code,
      language,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
    };
    
    sharedCode.push(newSharedCode);
    saveSharedCode(sharedCode);
    
    res.status(201).json({ id: newSharedCode.id });
  } catch (error) {
    console.error('Error sharing code:', error);
    res.status(500).json({ message: 'Failed to share code' });
  }
});

// Get shared code by ID
router.get('/shared/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const sharedCode = getSharedCode();
    const code = sharedCode.find(c => c.id === id);
    
    if (!code) {
      return res.status(404).json({ message: 'Shared code not found' });
    }
    
    // Check if the code has expired
    if (new Date(code.expiresAt) < new Date()) {
      return res.status(404).json({ message: 'Shared code has expired' });
    }
    
    res.json(code);
  } catch (error) {
    console.error('Error fetching shared code:', error);
    res.status(500).json({ message: 'Failed to fetch shared code' });
  }
});

module.exports = router;