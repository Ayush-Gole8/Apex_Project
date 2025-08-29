const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();
const fs = require('fs');

// DataManager initialization
const dataManager = require('./dataManager');

const { findRelevantContext, generateContextPrompt, engineeringKnowledgeBase, isEducationalQuery } = require('./rag-knowledge');

const app = express();
const PORT = process.env.PORT || 3001;

// Ensure all data directories exist
const DATA_DIRS = [
  path.join(__dirname, 'data'),
];

DATA_DIRS.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Create a basic .env file if it doesn't exist
if (!fs.existsSync(path.join(__dirname, '.env'))) {
  console.log('Creating default .env file');
  const defaultEnv = `PORT=3001
JWT_SECRET=your_jwt_secret_replace_in_production
NODE_ENV=development
GEMINI_API_KEY=your_gemini_api_key_here`;
  
  fs.writeFileSync(path.join(__dirname, '.env'), defaultEnv);
  console.log('Created default .env file. Please update with real values before production use.');
}

// Define file paths for learning paths and skill assessments
const LEARNING_PATHS_FILE = path.join(__dirname, 'data', 'learningPaths.json');
const SKILL_ASSESSMENTS_FILE = path.join(__dirname, 'data', 'skillAssessments.json');

// Initialize Gemini AI
let genAI = null;
if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log('✅ Gemini AI initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing Gemini AI:', error.message);
  }
} else {
  console.log('⚠️ Gemini API key not configured');
}

// CORS configuration - less restrictive for development
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? false  // Same-origin in production
    : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001'], // Multiple origins in development
  credentials: true,
  optionsSuccessStatus: 200
};

// Special CORS middleware for development to log CORS issues
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // Log CORS headers for debugging
    if (req.method === 'OPTIONS') {
      console.log('📢 CORS preflight request:', {
        origin: req.headers.origin,
        method: req.method,
        path: req.path
      });
    }
    
    next();
  });
}

// Add CORS debugging middleware
app.use((req, res, next) => {
  // Log the request origin and other key headers
  console.log(`Request: ${req.method} ${req.path}`);
  console.log(`Origin: ${req.headers.origin || 'No Origin Header'}`);
  console.log(`User-Agent: ${req.headers['user-agent'] || 'No User-Agent Header'}`);
  
  // Add detailed CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Educational-only middleware for /api/generate-course
app.use('/api/generate-course', (req, res, next) => {
  try {
    const topic = (req.body && req.body.topic) ? String(req.body.topic) : '';
    if (!isEducationalQuery(topic)) {
      console.log('Blocked non-educational generate request for topic:', topic);
      const wittyReplies = [
        "I'm flattered, but I'm built to teach engineering — please ask an engineering topic and I'll create a course.",
        "That's sweet, but I'm here for learning. Try asking about a technical topic instead.",
        "I appreciate the sentiment, but I'm your study assistant. Give me an engineering subject and I'll generate a course for you."
      ];
      const message = wittyReplies[Math.floor(Math.random() * wittyReplies.length)] + ' (Note: I only provide educational content.)';
      return res.json({ non_educational: true, message });
    }
    console.log('✅ Educational topic detected:', topic);
    next();
  } catch (err) {
    console.error('Error in educational filter middleware:', err);
    next();
  }
});

// Serve static files from React build
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
}

// Middleware to log requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.method === 'POST') {
    console.log('Request body:', req.body);
  }
  next();
});

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'ApeX Server is running',
    timestamp: new Date().toISOString(),
    gemini: {
      configured: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here'),
      initialized: !!genAI
    }
  });
});

// Debug endpoint for educational query detection
app.post('/api/debug/is-educational', (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic) {
      return res.status(400).json({ message: 'Topic is required' });
    }
    
    console.log('Testing educational filter for:', topic);
    
    // Check if it passes the educational filter
    const isEducational = isEducationalQuery(topic);
    
    // Check against whitelist
    const lower = topic.toLowerCase().trim();
    const whitelistMatch = ['apache', 'kafka', 'apache kafka', 'devops'].find(item => 
      lower === item || lower.includes(item)
    );
    
    res.json({
      topic: topic,
      isEducational: isEducational,
      whitelistMatch: whitelistMatch || null,
      message: isEducational ? 
        'Topic is considered educational' : 
        'Topic is NOT considered educational',
      recommendation: 'If this topic should be allowed, make sure it is in the educationalTopics whitelist'
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ message: 'Error debugging topic', error: error.message });
  }
});

// Root endpoint - API info (only for API requests)
app.get('/api', (req, res) => {
  res.json({ 
    message: 'ApeX API Server', 
    version: '1.0.0',
    endpoints: ['/health', '/api/auth', '/api/courses', '/api/generate-course']
  });
});

// API Routes go here (all your existing API routes)

// Simple endpoint to check if server is running
app.get('/api/ping', (req, res) => {
  res.json({ 
    status: 'success',
    message: 'Apex backend server is running correctly on port ' + PORT,
    timestamp: new Date().toISOString()
  });
});

// ...existing API routes...

// Load data from persistent storage
let users = dataManager.getUsers();
let courses = dataManager.getCourses();
let userCourses = dataManager.getUserCourses();

console.log(`📊 Loaded ${users.length} users, ${courses.length} courses, ${userCourses.length} user courses`);

// Initialize with default admin user if no users exist
const initializeDefaultUser = async () => {
  // We're not creating default users to prevent unauthorized access
  // Admin users should be created through the registration process
  console.log('📊 User system initialized');
};

// Initialize default user
initializeDefaultUser();

// Helper functions
const generateUserId = () => Date.now().toString();
const generateCourseId = () => 'course_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Middleware for authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication required. Please log in.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token. Please log in again.' });
    }
    
    // Find the user in our database to confirm they exist
    const userExists = users.find(u => u.id === user.userId);
    if (!userExists) {
      return res.status(403).json({ message: 'User not found. Please register or log in.' });
    }
    
    req.user = user;
    next();
  });
};

// Pre-defined courses data
const predefinedCourses = [
  {
    id: 1,
    title: "Data Structures & Algorithms",
    description: "Master fundamental DSA concepts",
    difficulty: "Intermediate",
    duration: "4 weeks",
    topics: ["Arrays", "Linked Lists", "Trees", "Graphs", "Sorting", "Searching"],
    color: "bg-gradient-to-r from-blue-500 to-purple-600"
  },
  {
    id: 2,
    title: "Machine Learning Fundamentals",
    description: "Introduction to ML algorithms and concepts",
    difficulty: "Beginner",
    duration: "6 weeks",
    topics: ["Linear Regression", "Decision Trees", "Neural Networks", "Feature Engineering"],
    color: "bg-gradient-to-r from-green-500 to-teal-600"
  },
  {
    id: 3,
    title: "Web Development with React",
    description: "Build modern web applications",
    difficulty: "Intermediate",
    duration: "5 weeks",
    topics: ["Components", "State Management", "Hooks", "Router", "API Integration"],
    color: "bg-gradient-to-r from-orange-500 to-red-600"
  },
  {
    id: 4,
    title: "Database Design & SQL",
    description: "Master database concepts and SQL",
    difficulty: "Beginner",
    duration: "3 weeks",
    topics: ["ER Diagrams", "Normalization", "Queries", "Joins", "Optimization"],
    color: "bg-gradient-to-r from-indigo-500 to-blue-600"
  },
  {
    id: 5,
    title: "System Design",
    description: "Design scalable distributed systems",
    difficulty: "Advanced",
    duration: "8 weeks",
    topics: ["Load Balancing", "Caching", "Microservices", "Databases", "Scalability"],
    color: "bg-gradient-to-r from-purple-500 to-pink-600"
  },
  {
    id: 6,
    title: "DevOps & Cloud Computing",
    description: "Learn deployment and cloud services",
    difficulty: "Intermediate",
    duration: "6 weeks",
    topics: ["Docker", "Kubernetes", "AWS", "CI/CD", "Monitoring"],
    color: "bg-gradient-to-r from-cyan-500 to-blue-600"
  }
];

// Authentication Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('📝 Registration request received:', { body: req.body });
    
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      console.log('❌ User already exists:', email);
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = {
      id: generateUserId(),
      name,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      coursesCompleted: 0,
      totalStudyTime: 0,
      favoriteTopics: []
    };

    users.push(user);

    // Save users to persistent storage
    dataManager.saveUsers(users);
    console.log('✅ New user registered:', email);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        coursesCompleted: user.coursesCompleted,
        totalStudyTime: user.totalStudyTime
      }
    });
  } catch (error) {
    console.error('💥 Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('🔐 Login request received:', { body: req.body, headers: req.headers['content-type'] });
    
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log('❌ Invalid password for user:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ Login successful for user:', email);
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        coursesCompleted: user.coursesCompleted,
        totalStudyTime: user.totalStudyTime
      }
    });
  } catch (error) {
    console.error('💥 Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const userCoursesList = userCourses.filter(uc => uc.userId === user.id);
  
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    coursesCompleted: user.coursesCompleted,
    totalStudyTime: user.totalStudyTime,
    totalCourses: userCoursesList.length,
    recentActivity: userCoursesList.slice(-5).reverse()
  });
});

// Routes
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend is working!', 
    geminiConfigured: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here'),
    timestamp: new Date().toISOString(),
    status: 'Server is running properly',
    usersCount: users.length,
    sampleUsers: users.map(u => ({ id: u.id, name: u.name, email: u.email }))
  });
});

// Debug endpoint to check users
app.get('/api/debug/users', (req, res) => {
  res.json({
    totalUsers: users.length,
    users: users.map(u => ({ 
      id: u.id, 
      name: u.name, 
      email: u.email,
      createdAt: u.createdAt 
    }))
  });
});

app.get('/api/status', (req, res) => {
  const isGeminiConfigured = !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here');
  
  res.json({
    server: 'running',
    gemini: {
      configured: isGeminiConfigured,
      status: isGeminiConfigured ? 'ready' : 'needs_api_key',
      message: isGeminiConfigured ? 
        'Gemini AI is configured and ready' : 
        'Please add your Gemini API key to .env file'
    },
    endpoints: {
      courses: '/api/courses',
      generateCourse: '/api/generate-course',
      test: '/api/test'
    }
  });
});

app.get('/api/test-course', (req, res) => {
  // Test the mock course generation
  try {
    const mockCourse = {
      title: "Test Course - React Fundamentals",
      description: "A comprehensive course covering React fundamentals for testing purposes.",
      duration: "4-6 weeks",
      difficulty: "Intermediate",
      modules: [
        {
          title: "Introduction to React",
          description: "Get started with React basics",
          topics: ["Components", "JSX", "Props"],
          resources: [
            {
              title: "React Documentation",
              url: "https://reactjs.org/docs",
              type: "documentation"
            }
          ]
        }
      ],
      prerequisites: ["Basic JavaScript knowledge"],
      learningObjectives: ["Understand React components", "Build interactive UIs"],
      practicalProjects: ["Build a React app"]
    };
    
    console.log('✅ Test course generated successfully');
    res.json(mockCourse);
  } catch (error) {
    console.error('❌ Error in test course generation:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/test-models', async (req, res) => {
  try {
    if (!genAI) {
      return res.status(500).json({ error: 'Gemini AI not initialized' });
    }
    
    // Try to list available models
    const models = await genAI.listModels();
    const availableModels = models.map(model => ({
      name: model.name,
      displayName: model.displayName,
      description: model.description
    }));
    
    res.json({
      message: 'Available Gemini models',
      models: availableModels,
      totalCount: availableModels.length
    });
  } catch (error) {
    console.error('Error listing models:', error);
    res.status(500).json({ 
      error: 'Failed to list models',
      message: error.message 
    });
  }
});

// Create a mock course generator function that always returns a valid course for any topic
// This is a temporary solution for the HTML tags filtering issue
const generateCourseMock = (topic) => {
  return {
    title: `Complete Guide to ${topic}`,
    description: `Learn all about ${topic} in this comprehensive course.`,
    sections: [
      {
        title: "Introduction to " + topic,
        content: `Welcome to the course on ${topic}. This section will introduce you to the basics.`,
        exercises: [
          {
            question: `What is the primary purpose of ${topic}?`,
            options: ["Option A", "Option B", "Option C", "Option D"],
            correctAnswer: 0
          }
        ]
      },
      {
        title: "Advanced " + topic,
        content: `Now let's dive deeper into ${topic} and explore advanced concepts.`,
        exercises: [
          {
            question: `How would you implement ${topic} in a real-world project?`,
            options: ["Method A", "Method B", "Method C", "Method D"],
            correctAnswer: 1
          }
        ]
      }
    ],
    resources: [
      {
        title: "Official Documentation",
        url: "https://example.com/docs"
      },
      {
        title: "Recommended Practice",
        url: "https://example.com/practice"
      }
    ]
  };
};

// Helper function to safely parse JSON with error handling
function safeParseJSON(jsonString) {
  try {
    // Remove any extra content or comments before/after JSON object
    const jsonPattern = /{[\s\S]*}/;
    const match = jsonString.match(jsonPattern);
    
    if (!match) {
      console.error('Could not extract valid JSON pattern');
      return null;
    }
    
    // Parse the extracted JSON
    return JSON.parse(match[0]);
  } catch (error) {
    console.error('JSON parsing error:', error);
    console.error('Original string:', jsonString);
    return null;
  }
}

// Helper function to extract sections from raw content when JSON parsing fails
function extractSectionsFromRawContent(rawContent) {
  try {
    // Look for sections array pattern
    const sectionPattern = /"sections"\s*:\s*\[([\s\S]*?)\]\s*,/;
    const sectionMatch = rawContent.match(sectionPattern);
    
    if (!sectionMatch || !sectionMatch[1]) {
      return null;
    }
    
    // Create a valid JSON to parse by wrapping the sections content
    const sectionsJSON = `{"sections":[${sectionMatch[1]}]}`;
    const sectionsObj = safeParseJSON(sectionsJSON);
    
    if (!sectionsObj || !sectionsObj.sections) {
      return null;
    }
    
    // Basic validation of sections format
    return sectionsObj.sections.map(section => {
      // Ensure required fields exist
      return {
        id: section.id || `section_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        title: section.title || "Unnamed Section",
        description: section.description || "No description provided",
        weight: section.weight || 25,
        modules: Array.isArray(section.modules) ? section.modules.map(module => ({
          id: module.id || `module_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          title: module.title || "Unnamed Module",
          content: module.content || "No content provided",
          estimatedTimeMinutes: module.estimatedTimeMinutes || 5,
          weight: module.weight || 100
        })) : []
      };
    });
  } catch (error) {
    console.error('Error extracting sections:', error);
    return null;
  }
}

app.get('/api/courses', (req, res) => {
  res.json(predefinedCourses);
});

app.get('/api/courses/:id', (req, res) => {
  const course = predefinedCourses.find(c => c.id === parseInt(req.params.id));
  if (!course) {
    return res.status(404).json({ message: 'Course not found' });
  }
  res.json(course);
});

// Course generation endpoint
app.post('/api/generate-course', authenticateToken, async (req, res) => {
  try {
    const { topic } = req.body;
    
    if (!topic) {
      return res.status(400).json({ message: 'Topic is required' });
    }
    
    console.log(`🎓 Generating course for topic: ${topic}`);
    
    // Create a user-friendly ID
    const courseId = generateUUID();
    let course = null;
    
    // Try Gemini API first if available
    if (genAI) {
      try {
        console.log('🤖 Using Gemini AI for course generation');
        
        // Find relevant context from RAG knowledge base
        const relevantContext = findRelevantContext(topic, engineeringKnowledgeBase);
        const contextPrompt = generateContextPrompt(topic, relevantContext);
        
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(contextPrompt);
        const response = await result.response;
        const text = response.text();
        
        console.log('📝 Gemini response received, parsing...');
        
        // Try to parse the JSON response
        const parsedCourse = safeParseJSON(text);
        
        if (parsedCourse && !parsedCourse.non_educational && !isGenericTemplate(parsedCourse)) {
          course = parsedCourse;
          console.log('✅ Successfully generated course with Gemini AI');
        } else {
          console.log('⚠️ Gemini response was generic or non-educational, using fallback');
          throw new Error('Generic response from Gemini');
        }
        
      } catch (geminiError) {
        console.log('❌ Gemini AI error:', geminiError.message);
        console.log('🔄 Falling back to enhanced course generator');
      }
    }
    
    // Use fallback generator if Gemini failed or not available
    if (!course) {
      const { generateDetailedCourse } = require('./utils/fallbackCourseGenerator');
      console.log(`📚 Using enhanced fallback generator for topic: ${topic}`);
      course = generateDetailedCourse(topic);
    }
    
    // For Bresenham line drawing algorithm specifically, add specialized content
    if (topic.toLowerCase().includes('bresenham') && topic.toLowerCase().includes('line')) {
      // Add specialized Bresenham line algorithm content
      course = {
        title: "Comprehensive Guide to Bresenham's Line Drawing Algorithm",
        topic: topic,
        summary: "Master the elegant and efficient Bresenham's line drawing algorithm, a fundamental technique in computer graphics for rasterizing lines on pixel-based displays. This course explores the algorithm's principles, implementation, optimizations, and practical applications.",
        estimatedDurationMinutes: 90,
        sections: [
          {
            id: `section_${Date.now()}_1`,
            title: "Introduction to Bresenham's Line Algorithm",
            description: "Understand the fundamentals of line rasterization and why Bresenham's algorithm is so important in computer graphics.",
            weight: 25,
            modules: [
              {
                id: `module_${Date.now()}_1`,
                title: "The Challenge of Line Rasterization",
                content: `## The Pixel-Based Display Challenge

In computer graphics, we often need to represent continuous mathematical objects (like lines) on discrete pixel grids. This process, called rasterization, is fundamental to all graphics rendering.

### The Line Drawing Problem

A line with endpoints (x₁,y₁) and (x₂,y₂) has an infinite number of points represented by the equation:
\`y = mx + b\` where \`m\` is the slope and \`b\` is the y-intercept.

However, displays can only illuminate discrete pixels. The challenge becomes:
- Which pixels should we illuminate to best represent the mathematical line?
- How can we do this efficiently without using floating-point calculations?

### Why Efficiency Matters

Before Bresenham's algorithm (developed by Jack Bresenham in 1962 while working at IBM):
- Line drawing required floating-point calculations (multiplication and division)
- These operations were extremely slow on early computers
- Errors from floating-point precision caused visual artifacts

Bresenham's brilliant insight was creating an algorithm that:
- Uses only integer addition, subtraction, and bit shifting
- Makes decisions about which pixels to illuminate using only integer calculations
- Eliminates floating-point operations entirely

### Core Principles of Bresenham's Approach

The algorithm works by:
1. Determining which pixels lie closest to the mathematical line
2. Making incremental decisions about which pixel to illuminate next
3. Using an error accumulation technique to track deviation from the true line
4. Maintaining visual fidelity while using only integer operations`,
                estimatedTimeMinutes: 15,
                weight: 100
              }
            ]
          },
          {
            id: `section_${Date.now()}_2`,
            title: "The Algorithm Explained",
            description: "Step through the mathematical principles and implementation details of the Bresenham line algorithm.",
            weight: 35,
            modules: [
              {
                id: `module_${Date.now()}_2`,
                title: "Mathematical Foundation",
                content: `## Core Mathematical Concepts

Bresenham's algorithm is elegant because it transforms a seemingly floating-point problem into a purely integer-based solution.

### Understanding the Decision Variable

For each step along the major axis (usually x), we need to decide whether to increment the minor axis (usually y) or keep it the same.

The decision is based on a decision variable (sometimes called an "error term"), which tracks how far we've deviated from the true mathematical line.

### Step-by-Step Derivation

Let's derive the algorithm for the first octant (0 ≤ m ≤ 1):

1. For a line from (x₁,y₁) to (x₂,y₂), we define:
   - Δx = x₂ - x₁ (always positive in first octant)
   - Δy = y₂ - y₁ (always positive in first octant)

2. For each pixel (x,y), we need to choose between (x+1,y) and (x+1,y+1)

3. Define our error term as:
   - e = actual y-value - current y pixel
   - Initially, e = 0

4. At each step:
   - If e < 0.5, choose (x+1,y) and update e = e + Δy/Δx
   - If e ≥ 0.5, choose (x+1,y+1) and update e = e + Δy/Δx - 1

5. Multiply all terms by 2Δx to eliminate fractions:
   - If 2Δx·e < Δx, choose (x+1,y) and update e = e + 2Δy
   - If 2Δx·e ≥ Δx, choose (x+1,y+1) and update e = e + 2Δy - 2Δx

6. Simplify further by initializing error term as e = 2Δy - Δx

### The Algorithm in Pseudocode

\`\`\`
function bresenham(x1, y1, x2, y2):
    dx = abs(x2 - x1)
    dy = abs(y2 - y1)
    sx = sign(x2 - x1)  // 1 or -1
    sy = sign(y2 - y1)  // 1 or -1
    
    error = 2 * dy - dx
    x = x1
    y = y1
    
    while x != x2:
        plot(x, y)
        
        if error >= 0:
            y = y + sy
            error = error - 2 * dx
        
        x = x + sx
        error = error + 2 * dy
\`\`\``,
                estimatedTimeMinutes: 20,
                weight: 60
              },
              {
                id: `module_${Date.now()}_3`,
                title: "Complete Implementation",
                content: `## Comprehensive Implementation

Let's implement the complete Bresenham line algorithm that works for all slopes and directions.

### Code Implementation (JavaScript)

\`\`\`javascript
function drawBresenhamLine(x1, y1, x2, y2, plotFunction) {
    // plotFunction is a callback that illuminates a pixel at (x,y)
    
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const sx = x1 < x2 ? 1 : -1;
    const sy = y1 < y2 ? 1 : -1;
    
    let err = dx - dy;
    
    while (true) {
        plotFunction(x1, y1);
        
        if (x1 === x2 && y1 === y2) break;
        
        const e2 = 2 * err;
        
        if (e2 > -dy) {
            if (x1 === x2) break;
            err -= dy;
            x1 += sx;
        }
        
        if (e2 < dx) {
            if (y1 === y2) break;
            err += dx;
            y1 += sy;
        }
    }
}
\`\`\`

### Implementation in C++

\`\`\`cpp
void drawBresenhamLine(int x1, int y1, int x2, int y2, 
                       std::function<void(int, int)> plot) {
    int dx = std::abs(x2 - x1);
    int dy = std::abs(y2 - y1);
    int sx = x1 < x2 ? 1 : -1;
    int sy = y1 < y2 ? 1 : -1;
    int err = dx - dy;
    
    while (true) {
        plot(x1, y1);
        
        if (x1 == x2 && y1 == y2) break;
        
        int e2 = 2 * err;
        
        if (e2 > -dy) {
            if (x1 == x2) break;
            err -= dy;
            x1 += sx;
        }
        
        if (e2 < dx) {
            if (y1 == y2) break;
            err += dx;
            y1 += sy;
        }
    }
}
\`\`\`

### Implementation in Python

\`\`\`python
def draw_bresenham_line(x1, y1, x2, y2, plot_function):
    dx = abs(x2 - x1)
    dy = abs(y2 - y1)
    sx = 1 if x1 < x2 else -1
    sy = 1 if y1 < y2 else -1
    err = dx - dy
    
    while True:
        plot_function(x1, y1)
        
        if x1 == x2 and y1 == y2:
            break
            
        e2 = 2 * err
        
        if e2 > -dy:
            if x1 == x2:
                break
            err -= dy
            x1 += sx
            
        if e2 < dx:
            if y1 == y2:
                break
            err += dx
            y1 += sy
\`\`\`

### Canvas Implementation Example

Here's how to use the algorithm with HTML Canvas:

\`\`\`javascript
function drawLineOnCanvas(ctx, x1, y1, x2, y2, color) {
    const plotPixel = (x, y) => {
        ctx.fillStyle = color || 'black';
        ctx.fillRect(x, y, 1, 1);
    };
    
    drawBresenhamLine(x1, y1, x2, y2, plotPixel);
}

// Usage:
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
drawLineOnCanvas(ctx, 10, 10, 100, 50, 'red');
\`\`\``,
                estimatedTimeMinutes: 15,
                weight: 40
              }
            ]
          },
          {
            id: `section_${Date.now()}_3`,
            title: "Optimizations and Variations",
            description: "Explore advanced optimizations and variations of the Bresenham algorithm for different applications.",
            weight: 25,
            modules: [
              {
                id: `module_${Date.now()}_4`,
                title: "Performance Optimizations",
                content: `## Optimizing Bresenham's Algorithm

Although the basic algorithm is already efficient, several optimizations can further improve performance.

### Incremental Optimization

The standard implementation recalculates values at each step. We can optimize by using incremental updates:

\`\`\`javascript
function optimizedBresenhamLine(x1, y1, x2, y2, plot) {
    let dx = Math.abs(x2 - x1);
    let dy = Math.abs(y2 - y1);
    let sx = (x1 < x2) ? 1 : -1;
    let sy = (y1 < y2) ? 1 : -1;
    
    // Optimization: Swap axes for slopes > 1
    let steep = dy > dx;
    if (steep) {
        // Swap x and y
        [x1, y1] = [y1, x1];
        [x2, y2] = [y2, x2];
        [dx, dy] = [dy, dx];
        [sx, sy] = [sy, sx];
    }
    
    // Further optimization: Ensure we're always going left to right
    if (x1 > x2) {
        [x1, x2] = [x2, x1];
        [y1, y2] = [y2, y1];
        sx = -sx;
        sy = -sy;
    }
    
    let err = dx / 2; // Using integer division if in a language that supports it
    let y = y1;
    
    for (let x = x1; x <= x2; x++) {
        // If we swapped the axes earlier, swap them back for plotting
        steep ? plot(y, x) : plot(x, y);
        
        err -= dy;
        if (err < 0) {
            y += sy;
            err += dx;
        }
    }
}
\`\`\`

### Bit-Shifting Optimization

For power-of-two operations, we can use bit shifting for even faster calculations:

\`\`\`c
void bitShiftBresenham(int x1, int y1, int x2, int y2) {
    int dx = abs(x2 - x1);
    int dy = abs(y2 - y1);
    int sx = (x1 < x2) ? 1 : -1;
    int sy = (y1 < y2) ? 1 : -1;
    
    int err = dx - dy;
    
    while (true) {
        plot(x1, y1);
        if (x1 == x2 && y1 == y2) break;
        
        int e2 = err << 1; // Bit shift left = multiply by 2
        
        if (e2 > -dy) {
            err -= dy;
            x1 += sx;
        }
        
        if (e2 < dx) {
            err += dx;
            y1 += sy;
        }
    }
}
\`\`\`

### SIMD and Parallel Implementations

Modern processors support SIMD (Single Instruction, Multiple Data) operations that can process multiple pixels simultaneously:

- GPU implementations can draw multiple line segments in parallel
- SIMD instructions can process 4-8 pixels in a single operation
- Multithreading can distribute line drawing across CPU cores

## Common Variations

### Thick Lines

The basic Bresenham algorithm draws 1-pixel wide lines. For thicker lines:

\`\`\`javascript
function drawThickLine(x1, y1, x2, y2, thickness, plot) {
    // Draw multiple offset lines
    for (let i = -Math.floor(thickness/2); i <= thickness/2; i++) {
        drawBresenhamLine(x1, y1+i, x2, y2+i, plot);
        drawBresenhamLine(x1+i, y1, x2+i, y2, plot);
    }
}
\`\`\`

### Anti-aliased Lines

The Xiaolin Wu line algorithm is a modification that adds anti-aliasing:

\`\`\`javascript
function drawAntialiasedLine(x1, y1, x2, y2, plot) {
    // Wu's algorithm uses fractional intensities
    function plotPixel(x, y, brightness) {
        // brightness is between 0 and 1
        plot(Math.floor(x), Math.floor(y), brightness);
    }
    
    // Wu's algorithm implementation
    // ...
}
\`\`\`

### Dashed Lines

Modifying the algorithm to create dashed lines:

\`\`\`javascript
function drawDashedLine(x1, y1, x2, y2, dashLength, gapLength, plot) {
    let dx = Math.abs(x2 - x1);
    let dy = Math.abs(y2 - y1);
    let sx = (x1 < x2) ? 1 : -1;
    let sy = (y1 < y2) ? 1 : -1;
    let err = dx - dy;
    
    let dashCounter = 0;
    let drawing = true;
    
    while (true) {
        if (drawing) {
            plot(x1, y1);
        }
        
        if (x1 === x2 && y1 === y2) break;
        
        dashCounter++;
        if (drawing && dashCounter >= dashLength) {
            drawing = false;
            dashCounter = 0;
        } else if (!drawing && dashCounter >= gapLength) {
            drawing = true;
            dashCounter = 0;
        }
        
        let e2 = 2 * err;
        if (e2 > -dy) {
            err -= dy;
            x1 += sx;
        }
        if (e2 < dx) {
            err += dx;
            y1 += sy;
        }
    }
}
\`\`\``,
                estimatedTimeMinutes: 20,
                weight: 100
              }
            ]
          },
          {
            id: `section_${Date.now()}_4`,
            title: "Applications and Extensions",
            description: "Discover how the Bresenham algorithm extends to other shapes and its applications in computer graphics.",
            weight: 15,
            modules: [
              {
                id: `module_${Date.now()}_5`,
                title: "Beyond Lines: Circles and Ellipses",
                content: `## Extending to Other Shapes

The principles of Bresenham's algorithm extend beyond lines to other shapes.

### Bresenham's Circle Algorithm

Drawing circles uses similar integer-only decision-making:

\`\`\`javascript
function drawBresenhamCircle(xCenter, yCenter, radius, plot) {
    let x = 0;
    let y = radius;
    let d = 3 - 2 * radius;
    
    function drawCirclePoints(x, y) {
        // Draw points in all octants
        plot(xCenter + x, yCenter + y);
        plot(xCenter - x, yCenter + y);
        plot(xCenter + x, yCenter - y);
        plot(xCenter - x, yCenter - y);
        plot(xCenter + y, yCenter + x);
        plot(xCenter - y, yCenter + x);
        plot(xCenter + y, yCenter - x);
        plot(xCenter - y, yCenter - x);
    }
    
    while (y >= x) {
        drawCirclePoints(x, y);
        
        x++;
        
        // Update decision parameter
        if (d > 0) {
            y--;
            d = d + 4 * (x - y) + 10;
        } else {
            d = d + 4 * x + 6;
        }
    }
}
\`\`\`

### Midpoint Ellipse Algorithm

An extension for drawing ellipses:

\`\`\`javascript
function drawMidpointEllipse(xCenter, yCenter, a, b, plot) {
    // a and b are the semi-major and semi-minor axes
    let x = 0;
    let y = b;
    
    // Region 1
    let d1 = b*b - a*a*b + a*a/4;
    let dx = 2*b*b*x;
    let dy = 2*a*a*y;
    
    while (dx < dy) {
        // Plot points in all four quadrants
        plot(xCenter + x, yCenter + y);
        plot(xCenter - x, yCenter + y);
        plot(xCenter + x, yCenter - y);
        plot(xCenter - x, yCenter - y);
        
        x++;
        dx += 2*b*b;
        
        if (d1 < 0) {
            d1 += dx + b*b;
        } else {
            y--;
            dy -= 2*a*a;
            d1 += dx - dy + b*b;
        }
    }
    
    // Region 2
    let d2 = b*b*(x+0.5)*(x+0.5) + a*a*(y-1)*(y-1) - a*a*b*b;
    
    while (y >= 0) {
        // Plot points in all four quadrants
        plot(xCenter + x, yCenter + y);
        plot(xCenter - x, yCenter + y);
        plot(xCenter + x, yCenter - y);
        plot(xCenter - x, yCenter - y);
        
        y--;
        dy -= 2*a*a;
        
        if (d2 > 0) {
            d2 += a*a - dy;
        } else {
            x++;
            dx += 2*b*b;
            d2 += a*a + dx - dy;
        }
    }
}
\`\`\`

## Real-World Applications

### Graphics Hardware

- GPU rasterization pipelines implement variants of Bresenham
- Hardware-accelerated line drawing in graphics cards
- Digital plotters and CNC machines

### Imaging and Medical Applications

- Line detection in medical imaging
- CT scan reconstruction algorithms
- Path planning in radiation therapy

### Computer Vision

- Edge detection algorithms
- Feature extraction from images
- Line and shape recognition

### Game Development

- Raycasting engines (like early Wolfenstein 3D)
- Line-of-sight calculations
- Path finding visualization

### CAD/CAM Systems

- Vector graphics display
- Tool path generation for manufacturing
- Architectural drawing applications

## Advanced Topics

### 3D Line Drawing

Extending to three dimensions:

\`\`\`javascript
function drawBresenham3DLine(x1, y1, z1, x2, y2, z2, plot) {
    let dx = Math.abs(x2 - x1);
    let dy = Math.abs(y2 - y1);
    let dz = Math.abs(z2 - z1);
    
    let sx = x1 < x2 ? 1 : -1;
    let sy = y1 < y2 ? 1 : -1;
    let sz = z1 < z2 ? 1 : -1;
    
    // Identify dominant axis
    let dm = Math.max(dx, dy, dz);
    let i = dm;
    
    x1 *= dm; x2 *= dm;
    y1 *= dm; y2 *= dm;
    z1 *= dm; z2 *= dm;
    
    let x = x1, y = y1, z = z1;
    
    while (i--) {
        plot(Math.round(x/dm), Math.round(y/dm), Math.round(z/dm));
        
        x += sx;
        y += sy;
        z += sz;
    }
}
\`\`\`

### Line Clipping Algorithms

Combining Bresenham with Cohen-Sutherland clipping:

\`\`\`javascript
function clipAndDrawLine(x1, y1, x2, y2, xmin, ymin, xmax, ymax, plot) {
    // Cohen-Sutherland clipping
    // ... [clipping code] ...
    
    // If line is visible, draw with Bresenham
    if (visible) {
        drawBresenhamLine(x1, y1, x2, y2, plot);
    }
}
\`\`\``,
                estimatedTimeMinutes: 25,
                weight: 100
              }
            ]
          }
        ],
        prerequisites: [
          "Basic understanding of computer graphics concepts",
          "Familiarity with coordinate systems and 2D geometry",
          "Programming experience in any language"
        ],
        learningObjectives: [
          "Understand the mathematical principles behind Bresenham's line drawing algorithm",
          "Implement the algorithm efficiently in various programming languages",
          "Apply optimizations to improve performance for specific use cases",
          "Extend the algorithm to other shapes like circles and ellipses",
          "Integrate the algorithm into real-world graphics applications"
        ],
        studyNext: [
          "Graphics Rasterization Algorithms",
          "Computer Graphics Fundamentals",
          "Xiaolin Wu's Line Algorithm (Anti-aliased Lines)",
          "Cohen-Sutherland Line Clipping",
          "Polygon Filling Algorithms"
        ],
        ragContext: ["computer graphics", "line drawing", "rasterization", "bresenham algorithm"]
      };
    }
    // Store the generated course
    const userCourse = {
      id: courseId,
      userId: req.user.userId,
      topic,
      course,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      progress: 0,
      completed: false,
      liked: false
    };
    
    // Save to our data store
    userCourses.push(userCourse);
    dataManager.saveUserCourses(userCourses);
    
    // Log successful course generation
    console.log(`✅ Successfully generated course on "${topic}" with ID: ${courseId}`);
    
    // Return the generated course
    res.json(course);
  } catch (error) {
    console.error('❌ Error generating course:', error);
    res.status(500).json({ 
      message: 'Failed to generate course', 
      error: error.message
    });
  }
});

app.get('/api/user/courses', authenticateToken, (req, res) => {
  const userCoursesList = userCourses.filter(uc => uc.userId === req.user.userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  res.json({
    courses: userCoursesList,
    total: userCoursesList.length,
    completed: userCoursesList.filter(c => c.completed).length
  });
});

app.get('/api/user/courses/:courseId', authenticateToken, (req, res) => {
  const userCourse = userCourses.find(uc => 
    uc.userId === req.user.userId && uc.id === req.params.courseId
  );
  
  if (!userCourse) {
    return res.status(404).json({ message: 'Course not found' });
  }
  
  res.json(userCourse);
});

app.put('/api/user/courses/:courseId/like', authenticateToken, (req, res) => {
  try {
    console.log('Like update request:', {
      courseId: req.params.courseId,
      userId: req.user.userId,
      body: req.body
    });
    
    const { liked } = req.body;
    
    const userCourse = userCourses.find(uc => 
      uc.userId === req.user.userId && uc.id === req.params.courseId
    );
    
    if (!userCourse) {
      console.log('Course not found for user');
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Update liked status
    userCourse.liked = liked !== undefined ? liked : !userCourse.liked;
    userCourse.lastUpdatedAt = new Date().toISOString();
    
    console.log('Updated course liked status:', {
      liked: userCourse.liked
    });
    
    // Save to persistent storage
    dataManager.saveUserCourses(userCourses);
    
    console.log('Like status saved successfully');
    res.json({ 
      message: userCourse.liked ? 'Course added to favorites' : 'Course removed from favorites', 
      course: userCourse
    });
  } catch (error) {
    console.error('Error updating like status:', error);
    res.status(500).json({ message: 'Failed to update like status' });
  }
});

app.delete('/api/user/courses/:courseId', authenticateToken, (req, res) => {
  try {
    console.log('Delete course request:', {
      courseId: req.params.courseId,
      userId: req.user.userId
    });
    
    const courseIndex = userCourses.findIndex(uc => 
      uc.userId === req.user.userId && uc.id === req.params.courseId
    );
    
    if (courseIndex === -1) {
      console.log('Course not found for user');
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Remove course
    userCourses.splice(courseIndex, 1);
    
    // Save to persistent storage
    dataManager.saveUserCourses(userCourses);
    
    console.log('Course deleted successfully');
    res.json({ 
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ message: 'Failed to delete course' });
  }
});

app.put('/api/user/courses/:courseId/progress', authenticateToken, (req, res) => {
  try {
    console.log('Progress update request:', {
      courseId: req.params.courseId,
      userId: req.user.userId,
      body: req.body
    });
    
    const { progress, completed } = req.body;
    
    const userCourse = userCourses.find(uc => 
      uc.userId === req.user.userId && uc.id === req.params.courseId
    );
    
    if (!userCourse) {
      console.log('Course not found for user');
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Update course progress
    const wasCompleted = userCourse.completed;
    userCourse.progress = progress || userCourse.progress;
    userCourse.completed = completed !== undefined ? completed : userCourse.completed;
    userCourse.lastAccessedAt = new Date().toISOString();
    
    console.log('Updated course progress:', {
      progress: userCourse.progress,
      completed: userCourse.completed,
      wasCompleted
    });
    
    // Update user stats if course was just completed
    const user = users.find(u => u.id === req.user.userId);
    if (user && completed && !wasCompleted) {
      user.coursesCompleted += 1;
      user.totalStudyTime += 25; // Assume 25 minutes per course
      console.log('Updated user stats:', {
        coursesCompleted: user.coursesCompleted,
        totalStudyTime: user.totalStudyTime
      });
    }
    
    // Save to persistent storage
    dataManager.saveUserCourses(userCourses);
    dataManager.saveUsers(users);
    
    console.log('Progress saved successfully');
    res.json({ 
      message: 'Progress updated successfully', 
      course: userCourse,
      stats: user ? {
        coursesCompleted: user.coursesCompleted,
        totalStudyTime: user.totalStudyTime
      } : null
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ message: 'Failed to update progress' });
  }
});

app.get('/api/user/dashboard', authenticateToken, async (req, res) => {
  try {
    console.log('Dashboard request from user:', req.user);
    const userId = req.user.userId; // Fix: use userId instead of id
    const userCourses = dataManager.getUserCourses();
    const userCoursesData = userCourses.filter(course => course.userId === userId);
    
    console.log(`Found ${userCoursesData.length} courses for user ${userId}`);
    
    // Calculate stats
    const stats = {
      totalCourses: userCoursesData.length,
      completedCourses: userCoursesData.filter(c => c.completed).length,
      inProgressCourses: userCoursesData.filter(c => c.progress > 0 && !c.completed).length,
      likedCourses: userCoursesData.filter(c => c.liked).length,
      totalStudyTime: userCoursesData.reduce((total, course) => {
        // Estimate study time based on course content
        const estimatedTime = course.course?.modules?.length * 15 || 30;
        return total + (course.progress > 0 ? estimatedTime : 0);
      }, 0),
      coursesThisWeek: userCoursesData.filter(c => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(c.createdAt) > weekAgo;
      }).length,
      completionRate: userCoursesData.length > 0 
        ? Math.round((userCoursesData.filter(c => c.completed).length / userCoursesData.length) * 100)
        : 0
    };

    // Recent activity
    const recentActivity = userCoursesData
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(course => ({
        topic: course.course?.title || course.topic || 'Unknown Topic',
        createdAt: course.createdAt
      }));

    // Favorite courses
    const favoriteCourses = userCoursesData
      .filter(course => course.liked)
      .sort((a, b) => new Date(b.lastUpdatedAt || b.createdAt) - new Date(a.lastUpdatedAt || a.createdAt))
      .slice(0, 3);

    // Favorite topics (simplified)
    const topicCounts = {};
    userCoursesData.forEach(course => {
      const topic = course.topic || 'General';
      topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    });
    
    const favoriteTopics = Object.entries(topicCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([topic, count]) => ({ topic, count }));

    // Achievements (sample)
    const achievements = [
      {
        name: "First Course",
        description: "Generated your first AI course",
        unlocked: userCoursesData.length > 0
      },
      {
        name: "Course Collector",
        description: "Generated 5 or more courses",
        unlocked: userCoursesData.length >= 5
      },
      {
        name: "Dedicated Learner",
        description: "Completed 3 or more courses",
        unlocked: stats.completedCourses >= 3
      },
      {
        name: "Course Enthusiast",
        description: "Added 3 or more courses to favorites",
        unlocked: stats.likedCourses >= 3
      }
    ];

    console.log('Dashboard stats:', stats);

    res.json({
      user: req.user,
      stats,
      recentActivity,
      favoriteTopics,
      favoriteCourses,
      achievements
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Failed to load dashboard data' });
  }
});

// Admin data stats endpoint
app.get('/api/admin/data-stats', (req, res) => {
  // Debug endpoint to check data persistence
  res.json({
    users: users.length,
    courses: courses.length,
    userCourses: userCourses.length,
    sampleUser: users.length > 0 ? {
      id: users[0].id,
      name: users[0].name,
      email: users[0].email,
      coursesCompleted: users[0].coursesCompleted
    } : null,
    recentCourses: userCourses.slice(-3).map(uc => ({
      id: uc.id,
      topic: uc.topic,
      userId: uc.userId,
      completed: uc.completed
    }))
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Serve React app for all non-API routes (MUST BE LAST!)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    const indexPath = path.join(__dirname, '../frontend/build/index.html');
    console.log(`Serving React app from: ${indexPath}`);
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error('Error serving React app:', err);
        res.status(500).send('Error loading application');
      }
    });
  });
} else {
  app.get('/', (req, res) => {
    res.json({ 
      message: 'ApeX API Server - Development Mode', 
      version: '1.0.0',
      note: 'Frontend should be running on port 3000'
    });
  });
}

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 ApeX Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API endpoint: http://localhost:${PORT}/api`);
  console.log(`🔗 Ping endpoint: http://localhost:${PORT}/api/ping`);
  console.log(`🤖 Gemini API: ${process.env.GEMINI_API_KEY ? '✅ Configured' : '❌ Missing'}`);
  
  // Log all available network interfaces
  const networkInterfaces = require('os').networkInterfaces();
  console.log('\n📡 Available network interfaces:');
  Object.keys(networkInterfaces).forEach(interfaceName => {
    const interfaces = networkInterfaces[interfaceName];
    interfaces.forEach(iface => {
      if (iface.family === 'IPv4') {
        console.log(`   - ${interfaceName}: ${iface.address} (${iface.internal ? 'internal' : 'external'})`);
        if (!iface.internal) {
          console.log(`     Try accessing: http://${iface.address}:${PORT}/api/ping`);
        }
      }
    });
  });
  
  // Log static file serving info
  if (process.env.NODE_ENV === 'production') {
    const frontendPath = path.join(__dirname, '../frontend/build');
    console.log(`\n🎨 Serving React app from: ${frontendPath}`);
    console.log(`🌐 React app available at: http://localhost:${PORT}`);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Import new API route handlers
const learningPathsRouter = require('./routes/learningPaths');
const skillAssessmentsRouter = require('./routes/skillAssessments');
const codeExecutionRouter = require('./routes/codeExecution');

// Mount new API routes with authentication middleware
app.use('/api/learning-paths', authenticateToken, learningPathsRouter);
app.use('/api/skill-assessments', authenticateToken, skillAssessmentsRouter);
app.use('/api/code-snippets', authenticateToken, codeExecutionRouter);
app.use('/api/execute-code', codeExecutionRouter);

// Code execution endpoint - simplified for demo
app.post('/api/execute-code', (req, res) => {
  const { code, language } = req.body;
  
  if (!code) {
    return res.status(400).json({ message: 'Code is required' });
  }
  
  // Simulate code execution with a delay
  setTimeout(() => {
    let output = '';
    
    // Simulate different language outputs
    switch (language?.toLowerCase() || 'javascript') {
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

// Simple endpoint to check if server is running
app.get('/api/ping', (req, res) => {
  res.json({ 
    status: 'success',
    message: 'Apex backend server is running correctly on port ' + PORT,
    timestamp: new Date().toISOString()
  });
});

// Create necessary data folders and files
const ensureDataFiles = () => {
  console.log('Ensuring data files exist...');
  
  // Create data directory if it doesn't exist
  if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
    console.log('Created data directory');
  }
  
  // Define data files to check/create
  const dataFiles = [
    { 
      path: path.join(__dirname, 'data', 'users.json'),
      defaultContent: '[]'
    },
    { 
      path: path.join(__dirname, 'data', 'courses.json'),
      defaultContent: '[]'
    },
    { 
      path: path.join(__dirname, 'data', 'userCourses.json'),
      defaultContent: '[]'
    },
    {
      path: path.join(__dirname, 'data', 'learningPaths.json'),
      defaultContent: '[]'
    },
    {
      path: path.join(__dirname, 'data', 'skillAssessments.json'),
      defaultContent: '[]'
    },
    {
      path: path.join(__dirname, 'data', 'codeSnippets.json'),
      defaultContent: '[]'
    }
  ];
  
  // Create any missing data files
  dataFiles.forEach(file => {
    if (!fs.existsSync(file.path)) {
      fs.writeFileSync(file.path, file.defaultContent);
      console.log(`Created data file: ${file.path}`);
    }
  });
};

// Run initialization
ensureDataFiles();

// Run data migrations to ensure data consistency
try {
  const dataMigration = require('./data-migration');
  console.log('Data migration completed successfully');
} catch (error) {
  console.error('Error during data migration:', error);
}

// Clear client caches endpoint
app.get('/api/refresh', (req, res) => {
  res.json({ 
    refresh: true, 
    message: 'Client should clear local storage and refresh',
    timestamp: new Date().toISOString() 
  });
});

// Add this function after the generateDetailedCourse check in the generate-course route
// This ensures we detect when the AI response is generic or lacks detailed content

// Check if the generated course is a generic template
function isGenericTemplate(course) {
  if (!course) return true;
  
  // Check for generic titles
  if (course.title && (
    course.title.startsWith('Complete Guide to') ||
    course.title.startsWith('Introduction to') ||
    course.title.startsWith('Guide to')
  ) && course.title.length < 40) {
    return true;
  }
  
  // Check for minimal content in sections
  if (course.sections && course.sections.length > 0) {
    // Look at the first few sections to see if they contain substantial content
    const contentfulSections = course.sections.slice(0, 2).filter(section => {
      if (!section.modules || section.modules.length === 0) return false;
      
      // Check if the modules have substantial content
      const hasSubstantialContent = section.modules.some(module => {
        if (!module.content) return false;
        
        // Check content length
        const contentLength = module.content.length;
        if (contentLength < 500) return false;
        
        // Check for code examples, which indicate real educational content
        const hasCodeExample = module.content.includes('```');
        
        // Check for bullet points and subheadings, indicating structured content
        const hasStructure = (
          module.content.includes('###') || 
          module.content.includes('- ') || 
          module.content.includes('1. ')
        );
        
        return hasCodeExample || hasStructure;
      });
      
      return hasSubstantialContent;
    });
    
    // If we don't have enough contentful sections, consider it generic
    if (contentfulSections.length < Math.min(2, course.sections.length)) {
      return true;
    }
  }
  
  // If summary is very short or generic
  if (course.summary && course.summary.length < 100) {
    return true;
  }
  
  return false;
}