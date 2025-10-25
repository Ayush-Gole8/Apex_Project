const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const dataManager = require('./dataManager');
const { findRelevantContext, generateContextPrompt, engineeringKnowledgeBase } = require('./rag-knowledge');

const app = express();
const PORT = process.env.PORT || 5000;

// Validate JWT_SECRET
if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your_super_secure_jwt_secret_key_here_make_it_long_and_complex') {
  console.error('⚠️  WARNING: JWT_SECRET is not properly configured!');
  console.error('⚠️  Please set a secure JWT_SECRET in your .env file');
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ Cannot start server in production without a secure JWT_SECRET');
    process.exit(1);
  }
}

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

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',')
      : ['http://localhost:3000'];
    
    // In production with single deployment, allow same-origin
    if (process.env.NODE_ENV === 'production') {
      // Allow same-origin requests (no origin header means same-origin in production)
      return callback(null, true);
    }
    
    // In development, check against allowed origins
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// Trust proxy - Required for Render and other reverse proxies
app.set('trust proxy', 1);

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: true, // Trust X-Forwarded-For header
});

const aiGenerationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 AI generations per hour
  message: 'Too many course generation requests. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: true, // Trust X-Forwarded-For header
});

// Apply rate limiting to all routes
app.use('/api/', limiter);

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

// Root endpoint - API info (only for API requests)
app.get('/api', (req, res) => {
  res.json({ 
    message: 'ApeX API Server', 
    version: '1.0.0',
    endpoints: ['/health', '/api/auth', '/api/courses', '/api/generate-course']
  });
});

// API Routes go here (all your existing API routes)

// ...existing API routes...

// Load data from persistent storage
let users = dataManager.getUsers();
let courses = dataManager.getCourses();
let userCourses = dataManager.getUserCourses();

console.log(`📊 Loaded ${users.length} users, ${courses.length} courses, ${userCourses.length} user courses`);

// Initialize with default admin user if no users exist
const initializeDefaultUser = async () => {
  if (users.length === 0) {
    console.log('🔧 No users found, creating default admin user...');
    
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const defaultUser = {
      id: generateUserId(),
      name: 'Admin User',
      email: 'admin@apex.com',
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      coursesCompleted: 0,
      totalStudyTime: 0,
      favoriteTopics: []
    };
    
    users.push(defaultUser);
    dataManager.saveUsers(users);
    console.log('✅ Default admin user created: admin@apex.com / admin123');
  }
};

// Initialize default user
initializeDefaultUser();

// Helper functions
const generateUserId = () => Date.now().toString();
const generateCourseId = () => 'course_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

/**
 * Calculate accurate course duration based on content
 * @param {Object} course - The course object with modules
 * @returns {Object} - Duration info with formatted strings
 */
const calculateCourseDuration = (course) => {
  let totalMinutes = 0;
  
  if (course.modules && Array.isArray(course.modules)) {
    course.modules.forEach(module => {
      // Base reading time for detailed content (average reading speed: 200 words per minute)
      if (module.detailedContent) {
        const wordCount = module.detailedContent.split(/\s+/).length;
        totalMinutes += Math.ceil(wordCount / 200);
      }
      
      // Time for key points (30 seconds per point to read and understand)
      if (module.keyPoints && Array.isArray(module.keyPoints)) {
        totalMinutes += Math.ceil(module.keyPoints.length * 0.5);
      }
      
      // Time for topics (20 seconds per topic to review)
      if (module.topics && Array.isArray(module.topics)) {
        totalMinutes += Math.ceil(module.topics.length * 0.33);
      }
      
      // Time for practice exercises (5 minutes per exercise)
      if (module.practiceExercise) {
        const exerciseWords = module.practiceExercise.split(/\s+/).length;
        totalMinutes += Math.max(5, Math.ceil(exerciseWords / 150)); // At least 5 minutes
      }
      
      // Time for resources (2 minutes per resource to review)
      if (module.resources && Array.isArray(module.resources)) {
        totalMinutes += module.resources.length * 2;
      }
      
      // Time for common mistakes (1 minute per mistake to read)
      if (module.commonMistakes && Array.isArray(module.commonMistakes)) {
        totalMinutes += module.commonMistakes.length * 1;
      }
    });
  }
  
  // Add time for course overview (prerequisites, objectives, etc.)
  totalMinutes += 3;
  
  // Round to nearest 5 minutes
  totalMinutes = Math.ceil(totalMinutes / 5) * 5;
  
  // Ensure minimum 10 minutes
  totalMinutes = Math.max(10, totalMinutes);
  
  // Calculate duration range (±5 minutes)
  const minDuration = Math.max(10, totalMinutes - 5);
  const maxDuration = totalMinutes + 5;
  
  // Format duration string
  let durationString;
  if (totalMinutes < 60) {
    durationString = `${minDuration}-${maxDuration} minutes`;
  } else {
    const minHours = Math.floor(minDuration / 60);
    const minMins = minDuration % 60;
    const maxHours = Math.floor(maxDuration / 60);
    const maxMins = maxDuration % 60;
    
    if (minHours === maxHours) {
      if (minMins === 0 && maxMins === 0) {
        durationString = `${minHours} hour${minHours > 1 ? 's' : ''}`;
      } else {
        durationString = `${minHours}h ${minMins}m - ${maxHours}h ${maxMins}m`;
      }
    } else {
      durationString = `${minHours}h ${minMins}m - ${maxHours}h ${maxMins}m`;
    }
  }
  
  // Calculate estimated read time (just the reading, not exercises)
  const readOnlyMinutes = Math.ceil(totalMinutes * 0.6); // 60% of total time is reading
  const readTimeString = readOnlyMinutes < 60 ? 
    `${readOnlyMinutes} min` : 
    `${Math.floor(readOnlyMinutes / 60)}h ${readOnlyMinutes % 60}m`;
  
  return {
    totalMinutes,
    duration: durationString,
    estimatedReadTime: readTimeString
  };
};

// Middleware for authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
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

    // Input validation
    if (!name || !email || !password) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Validate name length
    if (name.trim().length < 2 || name.trim().length > 100) {
      return res.status(400).json({ message: 'Name must be between 2 and 100 characters' });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Sanitize inputs
    const sanitizedName = name.trim().replace(/[<>]/g, '');
    const sanitizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = users.find(user => user.email === sanitizedEmail);
    if (existingUser) {
      console.log('❌ User already exists:', sanitizedEmail);
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = {
      id: generateUserId(),
      name: sanitizedName,
      email: sanitizedEmail,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      coursesCompleted: 0,
      totalStudyTime: 0,
      favoriteTopics: []
    };

    users.push(user);

    // Save users to persistent storage
    dataManager.saveUsers(users);
    console.log('✅ New user registered:', sanitizedEmail);

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

    // Input validation
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Sanitize email
    const sanitizedEmail = email.trim().toLowerCase();

    // Find user
    const user = users.find(u => u.email === sanitizedEmail);
    if (!user) {
      console.log('❌ User not found:', sanitizedEmail);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log('❌ Invalid password for user:', sanitizedEmail);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ Login successful for user:', sanitizedEmail);
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

app.post('/api/generate-course', aiGenerationLimiter, authenticateToken, async (req, res) => {
  console.log('📝 Received course generation request from user:', req.user.email);
  console.log('Request body:', req.body);
  
  try {
    const { topic } = req.body;
    
    // Input validation
    if (!topic) {
      console.log('❌ No topic provided');
      return res.status(400).json({ message: 'Topic is required' });
    }

    // Validate topic length and content
    const sanitizedTopic = topic.trim();
    if (sanitizedTopic.length < 2) {
      return res.status(400).json({ message: 'Topic must be at least 2 characters long' });
    }
    
    if (sanitizedTopic.length > 200) {
      return res.status(400).json({ message: 'Topic must be less than 200 characters' });
    }

    // Remove potentially harmful characters
    const cleanTopic = sanitizedTopic.replace(/[<>{}]/g, '');

    console.log('🎯 Generating course for topic:', cleanTopic);

    // Check if Gemini API is configured
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      console.log('❌ Gemini API key not configured');
      return res.status(500).json({ 
        message: 'Gemini API key not configured. Please add your API key to the .env file.',
        instructions: 'Visit https://makersuite.google.com/app/apikey to get your API key'
      });
    }

    if (!genAI) {
      return res.status(500).json({ message: 'Gemini AI not initialized properly' });
    }

    // Implement RAG: Find relevant context from knowledge base
    console.log('🔍 Searching knowledge base for relevant context...');
    const relevantContext = findRelevantContext(cleanTopic, engineeringKnowledgeBase);
    const contextPrompt = generateContextPrompt(cleanTopic, relevantContext);
    
    console.log('📚 Found context for:', relevantContext.length > 0 ? 
      relevantContext.map(c => c.domain || c.concept).join(', ') : 'general engineering');

    // Model selection will be done in the loop below with fallback

    const prompt = `${contextPrompt}

You are a world-class engineering professor with 20+ years of teaching and reading experience. Create an exceptionally detailed, educational course on "${topic}" that provides deep understanding in limited time about the "${topic}".

CRITICAL REQUIREMENTS:
1. EDUCATIONAL DEPTH: Provide detailed explanations with brief paragraphs followed by bullet points and real-world examples.
2. PROFESSIONAL FORMAT: 
   - Use plain text without asterisks, underscores, or markdown symbols
   - Write in clear, readable paragraphs and small sections, dont keep the paragraphs too lengthy 
   - Separate paragraphs with double line breaks for readability
   - Do use **bold** or *italic* markdown - whenever necessary
3. VERIFIED RESOURCES: 
   - ONLY include real, working URLs from trusted educational websites and research websites
   - Each resource MUST have a specific, descriptive title which is relevant to the "${topic}" (not generic like "Documentation" or "Tutorial")
   - Verify the URL matches the topic being discussed
   - Acceptable sources:
     * GeeksforGeeks (geeksforgeeks.org) - for programming and CS topics
     * Mozilla Developer Network (developer.mozilla.org) - for web development
     * W3Schools (w3schools.com) - for web technologies
     * Khan Academy (khanacademy.org) - for general learning
     * Wikipedia (en.wikipedia.org) - for concepts and theory
     * Official documentation sites (python.org, nodejs.org, etc.)
     * MIT OpenCourseWare (ocw.mit.edu) - for university-level courses
     * Stanford Online (online.stanford.edu) - for CS and engineering
     * Coursera (coursera.org) - for structured courses
     * edX (edx.org) - for university courses
     * IEEE Xplore (ieee.org) - for electrical engineering and computer science
     * arXiv (arxiv.org) - for pre-print research papers
     * Stack Overflow (stackoverflow.com) - for programming Q&A
     * TutorialsPoint (tutorialspoint.com) - for programming tutorials
     * JavaTpoint (javatpoint.com) - for Java and related technologies
     * Programiz (programiz.com) - for programming tutorials
     * FreeCodeCamp (freecodecamp.org) - for web development and programming
     * The Rust Programming Language (rust-lang.org) - for Rust
     * Go Documentation (golang.org) - for Go
     * Microsoft Docs (docs.microsoft.com) - for Microsoft technologies
     * Apple Developer (developer.apple.com) - for Apple technologies
     * Android Developer (developer.android.com) - for Android
      - Example good title: "Decision Trees in Machine Learning - GeeksforGeeks Tutorial"
      - Example bad title: "Tutorial" or "Documentation"
4. COMPREHENSIVE EXPLANATIONS: Each module should have necessary and brief content, where the student can understand the topic quickly
5. PRACTICAL FOCUS: Include real-world applications and hands-on examples

For the topic "${topic}", create a course that helps students truly understand and grasp the subject matter quickly:
- WHY concepts work the way they do (with apt and concise explanations)
- HOW to apply them in real scenarios (with step-by-step guidance)
- WHEN to use different approaches (with decision frameworks)
- WHAT common mistakes to avoid (with prevention strategies)

Create the course in this EXACT JSON format:
{
  "title": "Professional course title reflecting comprehensive learning",
  "description": "Attractive and easy to understand 1-2 sentence description explaining what students will learn, why it's important, and how it applies to real engineering scenarios.",
  "difficulty": "Intermediate",
  "modules": [
    {
      "title": "Professional module title focusing on core understanding",
      "description": "Detailed gist of what this module teaches and why it's important",
      "topics": ["specific detailed topic 1", "specific detailed topic 2", "specific detailed topic 3"],
      "detailedContent": "Write a comprehensive 200-300 word explanation covering the core concepts in detail. Write in clear, readable sections which are divided as per the need of every topic separated by double line breaks. Explain the theory, provide context, discuss real-world applications, and include specific examples. DO NOT use markdown formatting like **bold** or *italic* - write in plain text only. This should be educational content that genuinely helps students understand the subject matter and the tone should be kept as it is easy to understand.",
      "keyPoints": [
        "Detailed explanation point 1 with concise context and specific examples. Write in plain text without markdown symbols.",
        "Detailed explanation point 2 with concise context and specific examples. Write in plain text without markdown symbols.",
        "Detailed explanation point 3 with concise context and specific examples. Write in plain text without markdown symbols.",
        "Detailed explanation point 4 with concise context and specific examples. Write in plain text without markdown symbols."
      ],
      "resources": [
        {
          "title": "Specific descriptive title - Source Name (e.g., 'Decision Trees Explained - GeeksforGeeks' or 'Python Lists Tutorial - W3Schools')",
          "url": "https://www.exact-working-url.com/specific-page-about-this-topic",
          "type": "article",
          "description": "Brief explanation of what this specific resource covers and why it's valuable for this topic"
        },
        {
          "title": "Another specific resource title - Source Name",
          "url": "https://www.another-working-url.com/relevant-page",
          "type": "documentation",
          "description": "What makes this resource useful for learning this concept"
        }
      ],
      "practiceExercise": "Detailed hands-on exercise with specific step-by-step instructions that takes 5-8 minutes to complete. Include what the student should do, what they should observe, and what they should learn from the exercise. Write in plain text without markdown.",
      "commonMistakes": [
        "Small explanation of common mistake 1 and comprehensive guidance on how to avoid it. Use bold and italic text whenever needed.",
        "Small explanation of common mistake 2 and comprehensive guidance on how to avoid it. Use bold and italic text whenever needed."
      ]
    }
  ],
  "prerequisites": ["Specific necessary prerequisite 1 with context", "Specific necessary prerequisite 2 with context"],
  "learningObjectives": [
    "By the end of this course, students will be able to [specific outcome with measurable criteria and further use cases]",
    "Students will understand [specific concept] and demonstrate this by [specific application or task]",
    "Students will master [specific skill] and use it to [specific real-world scenario]"
  ],
  "realWorldApplications": [
    "Detailed real-world application 1 with industry context and specific examples",
    "Detailed real-world application 2 with industry context and specific examples",
    "Detailed real-world application 3 with industry context and specific examples"
  ],
  "quickReference": [
    "Key formula or concept with concise explanation of when and how to use it",
    "Important principle with context and practical application guidelines",
    "Critical rule with comprehensive application examples"
  ],
  "assessmentQuestions": [
    "Thoughtful question 1 testing deep understanding with scenario-based context",
    "Practical question 2 testing application skills with real-world problem",
    "Analysis question 3 testing synthesis and critical thinking abilities"
  ],
  "nextSteps": [
    "Immediate next topic to study with specific educational resources and learning path",
    "Intermediate follow-up with detailed progression strategy",
    "Advanced exploration with expert-level resources and project suggestions"
  ]
}

IMPORTANT REMINDERS: 
- Write detailed, educational content in proper paragraphs with double line breaks between them
- Use plain text ONLY - absolutely NO markdown symbols like ** or * or _
- Include ONLY real, verified URLs with specific, descriptive titles
- Each resource title should mention the source (e.g., "Topic Name - GeeksforGeeks")
- Provide comprehensive explanations that genuinely help students learn
- Focus on practical understanding and real-world applications
- Make content readable and well-structured for web display
- Do NOT include "duration", "estimatedReadTime", or "estimatedTime" fields - these will be calculated automatically based on content length`;

    console.log('🤖 Sending enhanced educational request to Gemini AI...');
    const modelVersions = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.0-flash", "gemini-flash-latest"];
    let result = null;
    let lastError = null;
    
    for (const modelName of modelVersions) {
      try {
        console.log(`🔄 Trying model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        result = await model.generateContent(prompt);
        console.log(`✅ Successfully used model: ${modelName}`);
        break;
      } catch (modelError) {
        console.log(`❌ Model ${modelName} failed:`, modelError.message);
        lastError = modelError;
        continue;
      }
    }
    
    if (!result) {
      throw new Error(`All Gemini models failed. Last error: ${lastError?.message || 'Unknown error'}`);
    }
    
    const response = await result.response;
    let courseData = response.text();
    
    console.log('AI Response received, length:', courseData.length);
    console.log('First 500 characters of response:', courseData.substring(0, 500));
    
    // Clean up the response to extract JSON
    courseData = courseData.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    try {
      const parsedCourse = JSON.parse(courseData);
      
      console.log('✅ Successfully parsed course JSON');
      console.log('Course title:', parsedCourse.title);
      console.log('Number of modules:', parsedCourse.modules?.length || 0);
      if (parsedCourse.modules && parsedCourse.modules[0]) {
        console.log('First module has detailedContent:', !!parsedCourse.modules[0].detailedContent);
        console.log('First module detailedContent length:', parsedCourse.modules[0].detailedContent?.length || 0);
      }
      
      // Validate the course structure
      if (!parsedCourse.title || !parsedCourse.modules || parsedCourse.modules.length === 0) {
        throw new Error('Invalid course structure received from AI');
      }
      
      // Calculate accurate course duration based on content
      const durationInfo = calculateCourseDuration(parsedCourse);
      parsedCourse.duration = durationInfo.duration;
      parsedCourse.estimatedReadTime = durationInfo.estimatedReadTime;
      parsedCourse.totalMinutes = durationInfo.totalMinutes;
      
      // Calculate and set accurate estimated time for each module
      if (parsedCourse.modules && Array.isArray(parsedCourse.modules)) {
        parsedCourse.modules.forEach(module => {
          let moduleMinutes = 0;
          
          // Detailed content reading time
          if (module.detailedContent) {
            const wordCount = module.detailedContent.split(/\s+/).length;
            moduleMinutes += Math.ceil(wordCount / 200);
          }
          
          // Key points time
          if (module.keyPoints && Array.isArray(module.keyPoints)) {
            moduleMinutes += Math.ceil(module.keyPoints.length * 0.5);
          }
          
          // Practice exercise time
          if (module.practiceExercise) {
            const exerciseWords = module.practiceExercise.split(/\s+/).length;
            moduleMinutes += Math.max(5, Math.ceil(exerciseWords / 150));
          }
          
          // Resources review time
          if (module.resources && Array.isArray(module.resources)) {
            moduleMinutes += module.resources.length * 2;
          }
          
          // Common mistakes time
          if (module.commonMistakes && Array.isArray(module.commonMistakes)) {
            moduleMinutes += module.commonMistakes.length * 1;
          }
          
          // Round to nearest minute and ensure minimum 5 minutes
          moduleMinutes = Math.max(5, Math.ceil(moduleMinutes));
          
          // Set the module estimated time
          module.estimatedTime = `${moduleMinutes} min`;
        });
      }
      
      console.log('📊 Calculated course duration:', durationInfo.duration);
      console.log('📖 Estimated read time:', durationInfo.estimatedReadTime);
      
      // Add metadata and save course
      parsedCourse.generatedAt = new Date().toISOString();
      parsedCourse.isAIGenerated = true;
      parsedCourse.ragContext = relevantContext.length > 0 ? 
        relevantContext.map(c => c.domain || c.concept) : ['general engineering'];
      
      // Generate unique course ID and save
      const courseId = generateCourseId();
      parsedCourse.id = courseId;
      
      // Save course to user's history
      const userCourse = {
        id: courseId,
        userId: req.user.userId,
        topic: topic,
        course: parsedCourse,
        createdAt: new Date().toISOString(),
        completed: false,
        progress: 0
      };
      
      courses.push(parsedCourse);
      userCourses.push(userCourse);
      
      // Save to persistent storage
      dataManager.saveCourses(courses);
      dataManager.saveUserCourses(userCourses);
      
      console.log('✅ Course generated and saved for user:', req.user.email);
      res.json(parsedCourse);
    } catch (parseError) {
      console.error('❌ JSON parsing failed:', parseError.message);
      console.log('Raw AI response:', courseData.substring(0, 500) + '...');
      
      // Fallback: Return structured response with raw content
      res.json({
        title: `${topic} - Engineering Course`,
        description: `A focused course on ${topic} designed for quick learning and practical understanding.`,
        duration: "15-30 minutes",
        difficulty: "Intermediate",
        estimatedReadTime: "20 min",
        modules: [
          {
            title: `Understanding ${topic}`,
            description: `Core concepts and practical applications`,
            estimatedTime: "15 min",
            topics: [topic],
            keyPoints: ["AI-generated content", "Structured learning", "Practical focus"],
            resources: [],
            practiceExercise: `Apply the concepts of ${topic} in a practical scenario`
          }
        ],
        prerequisites: ["Basic engineering knowledge"],
        learningObjectives: [`Understand ${topic}`, `Apply concepts practically`],
        quickReference: ["Key concepts from AI response"],
        nextSteps: ["Further exploration", "Advanced topics"],
        rawContent: courseData,
        error: "JSON parsing failed, showing structured fallback",
        generatedAt: new Date().toISOString(),
        isAIGenerated: true,
        ragContext: relevantContext.length > 0 ? 
          relevantContext.map(c => c.domain || c.concept) : ['general engineering']
      });
    }
    
  } catch (error) {
    console.error('❌ Error generating course:', error);
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
    
    // Get cleanTopic and relevantContext from outer scope
    const { topic: requestTopic } = req.body;
    const sanitizedTopic = requestTopic?.trim() || 'Unknown Topic';
    const cleanTopic = sanitizedTopic.replace(/[<>{}]/g, '');
    
    // Recalculate relevantContext in case it's not in scope
    const relevantContext = findRelevantContext(cleanTopic, engineeringKnowledgeBase);
    
    // Generate a high-quality fallback course using RAG context
    console.log('🔄 Generating fallback course using RAG context...');
    
    const fallbackCourse = {
      title: `${cleanTopic} - Engineering Fundamentals`,
      description: `A comprehensive introduction to ${cleanTopic} covering essential concepts and practical applications. This course provides structured learning based on engineering principles.`,
      duration: "20-25 minutes",
      difficulty: relevantContext.length > 0 ? "Intermediate" : "Beginner",
      estimatedReadTime: "20 min",
      modules: [
        {
          title: `Introduction to ${cleanTopic}`,
          description: `Fundamental concepts and overview of ${cleanTopic}`,
          estimatedTime: "8 min",
          topics: relevantContext.length > 0 ? 
            relevantContext[0].topics?.slice(0, 3) || [`Basic ${cleanTopic}`, "Core principles", "Key terminology"] :
            [`Basic ${cleanTopic}`, "Core principles", "Key terminology"],
          keyPoints: [
            `Understand the fundamental concepts of ${cleanTopic}`,
            `Learn the practical applications and importance`,
            `Identify key components and relationships`
          ],
          resources: [
            {
              title: "Engineering Fundamentals Reference",
              url: "https://en.wikipedia.org/wiki/" + cleanTopic.replace(/\s+/g, '_'),
              type: "documentation",
              description: "Comprehensive overview and technical details"
            }
          ],
          practiceExercise: `Think of three real-world scenarios where ${cleanTopic} concepts would be applied`
        },
        {
          title: `Practical Applications of ${cleanTopic}`,
          description: `Real-world applications and problem-solving approaches`,
          estimatedTime: "12 min",
          topics: [`${cleanTopic} in practice`, "Problem-solving methods", "Case studies"],
          keyPoints: [
            `Apply ${cleanTopic} concepts to solve real problems`,
            `Understand best practices and common pitfalls`,
            `Develop analytical thinking skills`
          ],
          resources: [
            {
              title: "Engineering Problem Solving Guide",
              url: "https://www.khanacademy.org/computing",
              type: "tutorial",
              description: "Step-by-step problem solving techniques"
            }
          ],
          practiceExercise: `Analyze a simple problem related to ${cleanTopic} and outline a solution approach`
        }
      ],
      prerequisites: ["Basic engineering knowledge", "Mathematical fundamentals"],
      learningObjectives: [
        `Explain the core concepts of ${cleanTopic}`,
        `Apply ${cleanTopic} principles to solve problems`,
        `Identify practical applications in engineering`
      ],
      quickReference: [
        `Key formula/principle related to ${cleanTopic}`,
        "Important definitions and terminology",
        "Common problem-solving approaches"
      ],
      nextSteps: [
        `Study advanced ${cleanTopic} concepts`,
        "Explore related engineering topics",
        "Practice with more complex problems"
      ],
      generatedAt: new Date().toISOString(),
      isAIGenerated: false,
      isFallback: true,
      ragContext: relevantContext.length > 0 ? 
        relevantContext.map(c => c.domain || c.concept) : ['general engineering'],
      errorDetails: "Generated using RAG fallback due to AI service issues"
    };
    
    // Calculate accurate duration for fallback course
    const fallbackDurationInfo = calculateCourseDuration(fallbackCourse);
    fallbackCourse.duration = fallbackDurationInfo.duration;
    fallbackCourse.estimatedReadTime = fallbackDurationInfo.estimatedReadTime;
    fallbackCourse.totalMinutes = fallbackDurationInfo.totalMinutes;
    
    // Update module estimated times
    fallbackCourse.modules.forEach(module => {
      let moduleMinutes = 0;
      if (module.keyPoints) moduleMinutes += module.keyPoints.length * 0.5;
      if (module.practiceExercise) moduleMinutes += 5;
      if (module.resources) moduleMinutes += module.resources.length * 2;
      moduleMinutes = Math.max(5, Math.ceil(moduleMinutes));
      module.estimatedTime = `${moduleMinutes} min`;
    });
    
    console.log('📊 Fallback course duration:', fallbackDurationInfo.duration);
    
    // Generate unique course ID and save
    const courseId = generateCourseId();
    fallbackCourse.id = courseId;
    
    // Save course to user's history
    const userCourse = {
      id: courseId,
      userId: req.user.userId,
      topic: cleanTopic,
      course: fallbackCourse,
      createdAt: new Date().toISOString(),
      completed: false,
      progress: 0
    };
    
    courses.push(fallbackCourse);
    userCourses.push(userCourse);
    
    // Save to persistent storage
    dataManager.saveCourses(courses);
    dataManager.saveUserCourses(userCourses);
    
    console.log('✅ Fallback course generated successfully');
    
    res.status(200).json(fallbackCourse);
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

// Quiz Generation Endpoint
app.post('/api/courses/:courseId/generate-quiz', authenticateToken, aiGenerationLimiter, async (req, res) => {
  try {
    if (!genAI) {
      return res.status(503).json({ message: 'Gemini AI service not configured' });
    }

    const { courseId } = req.params;
    console.log('🎯 Quiz generation request for course:', courseId);

    // Find the course
    const userCourse = userCourses.find(uc => 
      uc.id === courseId && uc.userId === req.user.userId
    );

    if (!userCourse) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const course = userCourse.course;
    
    // Calculate quiz time based on course complexity
    const calculateQuizTime = (course) => {
      const moduleCount = course.modules?.length || 1;
      const difficulty = course.difficulty?.toLowerCase() || 'intermediate';
      
      let baseTime = 10; // 10 minutes base
      
      // Add time based on modules (1 min per module)
      baseTime += moduleCount * 1;
      
      // Adjust for difficulty
      if (difficulty === 'beginner') baseTime += 5;
      else if (difficulty === 'intermediate') baseTime += 8;
      else if (difficulty === 'advanced') baseTime += 12;
      
      return Math.max(10, Math.min(baseTime, 25)); // Between 10-25 minutes
    };

    const quizTimeMinutes = calculateQuizTime(course);

    // Create detailed prompt for quiz generation
    const quizPrompt = `Based on the following course content, generate exactly 10 multiple-choice questions (MCQs) to assess the student's understanding.

Course Title: ${course.title}
Course Description: ${course.description}
Difficulty Level: ${course.difficulty}

Course Content:
${course.modules.map((module, idx) => `
Module ${idx + 1}: ${module.title}
Topics: ${module.topics.join(', ')}
Key Points: ${module.keyPoints.join('; ')}
`).join('\n')}

Generate a quiz with these requirements:
1. Exactly 10 questions covering different modules and concepts
2. Each question should have 4 options (A, B, C, D)
3. Only ONE correct answer per question
4. Questions should test understanding, not just memorization
5. Mix of difficulty levels (3 easy, 5 medium, 2 hard)
6. Include scenario-based and application questions
7. Avoid trick questions - be fair and clear

Return ONLY valid JSON in this EXACT format (no markdown, no extra text):
{
  "quizTitle": "Quiz: [Course Title]",
  "timeLimit": ${quizTimeMinutes},
  "totalQuestions": 10,
  "questions": [
    {
      "id": 1,
      "question": "Clear, specific question text testing a key concept",
      "options": {
        "A": "First option",
        "B": "Second option",
        "C": "Third option",
        "D": "Fourth option"
      },
      "correctAnswer": "B",
      "explanation": "Brief explanation of why this answer is correct and why others are wrong",
      "difficulty": "easy",
      "topic": "Specific topic from the course"
    }
  ]
}

IMPORTANT: 
- Return ONLY the JSON object, no markdown formatting
- All 10 questions must be unique and relevant to the course content
- correctAnswer must be exactly one of: "A", "B", "C", or "D"
- Questions should be clear and professional`;

    console.log('🤖 Generating quiz with Gemini AI...');
    
    const modelVersions = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.0-flash"];
    let result = null;
    let lastError = null;
    
    for (const modelName of modelVersions) {
      try {
        console.log(`🔄 Trying model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        result = await model.generateContent(quizPrompt);
        console.log(`✅ Successfully used model: ${modelName}`);
        break;
      } catch (modelError) {
        console.log(`❌ Model ${modelName} failed:`, modelError.message);
        lastError = modelError;
        continue;
      }
    }
    
    if (!result) {
      throw new Error(`All Gemini models failed. Last error: ${lastError?.message || 'Unknown error'}`);
    }
    
    const response = await result.response;
    let quizData = response.text();
    
    console.log('✅ Quiz response received, length:', quizData.length);
    
    // Clean up the response to extract JSON
    quizData = quizData.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    try {
      const parsedQuiz = JSON.parse(quizData);
      
      // Validate quiz structure
      if (!parsedQuiz.questions || parsedQuiz.questions.length !== 10) {
        throw new Error('Invalid quiz structure: must have exactly 10 questions');
      }
      
      // Add metadata
      parsedQuiz.courseId = courseId;
      parsedQuiz.courseTopic = course.title;
      parsedQuiz.generatedAt = new Date().toISOString();
      
      console.log('✅ Quiz generated successfully with', parsedQuiz.questions.length, 'questions');
      console.log('⏱️ Time limit:', parsedQuiz.timeLimit, 'minutes');
      
      res.status(200).json(parsedQuiz);
      
    } catch (parseError) {
      console.error('❌ Failed to parse quiz JSON:', parseError);
      console.log('Raw response:', quizData.substring(0, 500));
      throw new Error('Failed to parse quiz response from AI');
    }
    
  } catch (error) {
    console.error('❌ Quiz generation error:', error);
    res.status(500).json({ 
      message: 'Failed to generate quiz',
      error: error.message 
    });
  }
});

// Submit Quiz and Save Results
app.post('/api/quizzes/:courseId/submit', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { answers, timeTaken, quizData } = req.body;
    
    console.log('📝 Quiz submission for course:', courseId);
    
    if (!answers || !quizData) {
      return res.status(400).json({ message: 'Missing quiz data or answers' });
    }
    
    // Calculate score
    let correctCount = 0;
    const detailedResults = quizData.questions.map((question, index) => {
      const userAnswer = answers[question.id];
      const isCorrect = userAnswer === question.correctAnswer;
      if (isCorrect) correctCount++;
      
      return {
        questionId: question.id,
        question: question.question,
        userAnswer: userAnswer || 'Not answered',
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation,
        topic: question.topic
      };
    });
    
    const scorePercentage = Math.round((correctCount / quizData.questions.length) * 100);
    const passed = scorePercentage >= 60;
    
    // Identify weak areas (topics with wrong answers)
    const weakAreas = detailedResults
      .filter(r => !r.isCorrect)
      .map(r => r.topic)
      .filter((topic, index, self) => self.indexOf(topic) === index);
    
    // Create quiz result
    const quizResult = {
      id: `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: req.user.userId,
      courseId,
      courseTopic: quizData.courseTopic,
      score: scorePercentage,
      correctAnswers: correctCount,
      totalQuestions: quizData.questions.length,
      passed,
      timeTaken: timeTaken || 0,
      timeLimit: quizData.timeLimit,
      weakAreas,
      detailedResults,
      submittedAt: new Date().toISOString()
    };
    
    // Load existing quiz results
    let quizResults = [];
    const quizResultsPath = path.join(__dirname, 'data', 'quiz_results.json');
    try {
      if (fs.existsSync(quizResultsPath)) {
        const data = fs.readFileSync(quizResultsPath, 'utf8');
        quizResults = JSON.parse(data);
      }
    } catch (error) {
      console.log('Creating new quiz results file');
    }
    
    // Add new result
    quizResults.push(quizResult);
    
    // Save to file
    fs.writeFileSync(quizResultsPath, JSON.stringify(quizResults, null, 2));
    
    console.log('✅ Quiz result saved:', {
      score: scorePercentage,
      passed,
      weakAreas
    });
    
    res.status(200).json({
      message: 'Quiz submitted successfully',
      result: quizResult
    });
    
  } catch (error) {
    console.error('❌ Quiz submission error:', error);
    res.status(500).json({ 
      message: 'Failed to submit quiz',
      error: error.message 
    });
  }
});

// Get Quiz Results for a Course
app.get('/api/quizzes/:courseId/results', authenticateToken, (req, res) => {
  try {
    const { courseId } = req.params;
    const quizResultsPath = path.join(__dirname, 'data', 'quiz_results.json');
    
    if (!fs.existsSync(quizResultsPath)) {
      return res.json({ results: [] });
    }
    
    const data = fs.readFileSync(quizResultsPath, 'utf8');
    const allResults = JSON.parse(data);
    
    // Filter results for this user and course
    const userResults = allResults.filter(r => 
      r.userId === req.user.userId && r.courseId === courseId
    ).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    
    res.json({ results: userResults });
    
  } catch (error) {
    console.error('Error fetching quiz results:', error);
    res.status(500).json({ message: 'Failed to fetch quiz results' });
  }
});

// Get All Quiz Results for User
app.get('/api/user/quiz-results', authenticateToken, (req, res) => {
  try {
    const quizResultsPath = path.join(__dirname, 'data', 'quiz_results.json');
    
    if (!fs.existsSync(quizResultsPath)) {
      return res.json({ results: [] });
    }
    
    const data = fs.readFileSync(quizResultsPath, 'utf8');
    const allResults = JSON.parse(data);
    
    // Filter results for this user
    const userResults = allResults.filter(r => r.userId === req.user.userId)
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    
    res.json({ results: userResults });
    
  } catch (error) {
    console.error('Error fetching user quiz results:', error);
    res.status(500).json({ message: 'Failed to fetch quiz results' });
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
      }
    ];

    console.log('Dashboard stats:', stats);

    res.json({
      user: req.user,
      stats,
      recentActivity,
      favoriteTopics,
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
  console.log(`🤖 Gemini API: ${process.env.GEMINI_API_KEY ? '✅ Configured' : '❌ Missing'}`);
  
  // Log static file serving info
  if (process.env.NODE_ENV === 'production') {
    const frontendPath = path.join(__dirname, '../frontend/build');
    console.log(`🎨 Serving React app from: ${frontendPath}`);
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