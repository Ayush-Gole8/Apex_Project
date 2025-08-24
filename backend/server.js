const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const dataManager = require('./dataManager');
const { findRelevantContext, generateContextPrompt, engineeringKnowledgeBase } = require('./rag-knowledge');

const app = express();
const PORT = process.env.PORT || 5000;

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

// CORS configuration - less restrictive for single deployment
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' ? false : 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from React build
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
}

// Middleware to log requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
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

// Helper functions
const generateUserId = () => Date.now().toString();
const generateCourseId = () => 'course_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

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
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
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
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

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
    console.error('Login error:', error);
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
    status: 'Server is running properly'
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

app.post('/api/generate-course', authenticateToken, async (req, res) => {
  console.log('📝 Received course generation request from user:', req.user.email);
  console.log('Request body:', req.body);
  
  try {
    const { topic } = req.body;
    
    if (!topic) {
      console.log('❌ No topic provided');
      return res.status(400).json({ message: 'Topic is required' });
    }

    console.log('🎯 Generating course for topic:', topic);

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
    const relevantContext = findRelevantContext(topic, engineeringKnowledgeBase);
    const contextPrompt = generateContextPrompt(topic, relevantContext);
    
    console.log('📚 Found context for:', relevantContext.length > 0 ? 
      relevantContext.map(c => c.domain || c.concept).join(', ') : 'general engineering');

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `${contextPrompt}

You are a world-class engineering professor with 20+ years of teaching experience. Create an exceptionally detailed, educational course on "${topic}" that provides deep understanding in 15-30 minutes.

CRITICAL REQUIREMENTS:
1. EDUCATIONAL DEPTH: Provide detailed explanations with comprehensive paragraphs followed by bullet points
2. PROFESSIONAL FORMAT: No emojis, use clean bullet points and professional language
3. VERIFIED RESOURCES: Only include real, working URLs from educational websites like:
   - GeeksforGeeks (geeksforgeeks.org)
   - Mozilla Developer Network (developer.mozilla.org)
   - W3Schools (w3schools.com)
   - Khan Academy (khanacademy.org)
   - MIT OpenCourseWare (ocw.mit.edu)
   - Stanford Online (online.stanford.edu)
   - Coursera course materials
   - edX course materials
   - Wikipedia (wikipedia.org)
   - Official documentation sites
4. COMPREHENSIVE EXPLANATIONS: Each module should have detailed content with proper paragraphs
5. PRACTICAL FOCUS: Include real-world applications and hands-on examples

For the topic "${topic}", create a course that helps students truly understand:
- WHY concepts work the way they do (with detailed explanations)
- HOW to apply them in real scenarios (with step-by-step guidance)
- WHEN to use different approaches (with decision frameworks)
- WHAT common mistakes to avoid (with prevention strategies)

Create the course in this EXACT JSON format:
{
  "title": "Professional course title reflecting comprehensive learning",
  "description": "Detailed 4-5 sentence description explaining what students will learn, why it's important, and how it applies to real engineering scenarios.",
  "duration": "20-30 minutes",
  "difficulty": "Intermediate",
  "estimatedReadTime": "25 min",
  "modules": [
    {
      "title": "Professional module title focusing on core understanding",
      "description": "Detailed description of what this module teaches and why it's important",
      "estimatedTime": "8-12 min",
      "topics": ["specific detailed topic 1", "specific detailed topic 2", "specific detailed topic 3"],
      "detailedContent": "Write a comprehensive 300-400 word explanation covering the core concepts in detail. Explain the theory, provide context, discuss real-world applications, and include specific examples. This should be educational content that genuinely helps students understand the subject matter. Use proper paragraphs and professional language without emojis.",
      "keyPoints": [
        "Detailed explanation point 1 with comprehensive context and specific examples",
        "Detailed explanation point 2 with comprehensive context and specific examples", 
        "Detailed explanation point 3 with comprehensive context and specific examples",
        "Detailed explanation point 4 with comprehensive context and specific examples"
      ],
      "resources": [
        {
          "title": "Resource title from reputable educational source",
          "url": "Real working URL from GeeksforGeeks, MDN, W3Schools, Khan Academy, MIT, Stanford, Wikipedia, or official documentation",
          "type": "article/tutorial/documentation/course",
          "description": "Detailed explanation of why this specific resource is valuable for learning this topic"
        }
      ],
      "practiceExercise": "Detailed hands-on exercise with specific step-by-step instructions that takes 5-8 minutes to complete. Include what the student should do, what they should observe, and what they should learn from the exercise.",
      "commonMistakes": [
        "Detailed explanation of common mistake 1 and comprehensive guidance on how to avoid it",
        "Detailed explanation of common mistake 2 and comprehensive guidance on how to avoid it"
      ]
    }
  ],
  "prerequisites": ["Specific detailed prerequisite 1 with context", "Specific detailed prerequisite 2 with context"],
  "learningObjectives": [
    "By the end of this course, students will be able to [specific detailed outcome with measurable criteria]",
    "Students will understand [specific concept] and demonstrate this by [specific application or task]",
    "Students will master [specific skill] and use it to [specific real-world scenario]"
  ],
  "realWorldApplications": [
    "Detailed real-world application 1 with industry context and specific examples",
    "Detailed real-world application 2 with industry context and specific examples",
    "Detailed real-world application 3 with industry context and specific examples"
  ],
  "quickReference": [
    "Key formula or concept with detailed explanation of when and how to use it",
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

IMPORTANT: 
- Write detailed, educational content in proper paragraphs
- Use professional language without emojis
- Include only real, verified URLs from educational websites
- Provide comprehensive explanations that genuinely help students learn
- Focus on practical understanding and real-world applications`;

    console.log('🤖 Sending enhanced educational request to Gemini AI...');
    
    // Try different model versions with fallback
    const modelVersions = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
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
    
    // Clean up the response to extract JSON
    courseData = courseData.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    try {
      const parsedCourse = JSON.parse(courseData);
      
      // Validate the course structure
      if (!parsedCourse.title || !parsedCourse.modules || parsedCourse.modules.length === 0) {
        throw new Error('Invalid course structure received from AI');
      }
      
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
    
    // Generate a high-quality fallback course using RAG context
    console.log('🔄 Generating fallback course using RAG context...');
    
    const fallbackCourse = {
      title: `${topic} - Engineering Fundamentals`,
      description: `A comprehensive introduction to ${topic} covering essential concepts and practical applications. This course provides structured learning based on engineering principles.`,
      duration: "20-25 minutes",
      difficulty: relevantContext.length > 0 ? "Intermediate" : "Beginner",
      estimatedReadTime: "20 min",
      modules: [
        {
          title: `Introduction to ${topic}`,
          description: `Fundamental concepts and overview of ${topic}`,
          estimatedTime: "8 min",
          topics: relevantContext.length > 0 ? 
            relevantContext[0].topics?.slice(0, 3) || [`Basic ${topic}`, "Core principles", "Key terminology"] :
            [`Basic ${topic}`, "Core principles", "Key terminology"],
          keyPoints: [
            `Understand the fundamental concepts of ${topic}`,
            `Learn the practical applications and importance`,
            `Identify key components and relationships`
          ],
          resources: [
            {
              title: "Engineering Fundamentals Reference",
              url: "https://en.wikipedia.org/wiki/" + topic.replace(/\s+/g, '_'),
              type: "documentation",
              description: "Comprehensive overview and technical details"
            }
          ],
          practiceExercise: `Think of three real-world scenarios where ${topic} concepts would be applied`
        },
        {
          title: `Practical Applications of ${topic}`,
          description: `Real-world applications and problem-solving approaches`,
          estimatedTime: "12 min",
          topics: [`${topic} in practice`, "Problem-solving methods", "Case studies"],
          keyPoints: [
            `Apply ${topic} concepts to solve real problems`,
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
          practiceExercise: `Analyze a simple problem related to ${topic} and outline a solution approach`
        }
      ],
      prerequisites: ["Basic engineering knowledge", "Mathematical fundamentals"],
      learningObjectives: [
        `Explain the core concepts of ${topic}`,
        `Apply ${topic} principles to solve problems`,
        `Identify practical applications in engineering`
      ],
      quickReference: [
        `Key formula/principle related to ${topic}`,
        "Important definitions and terminology",
        "Common problem-solving approaches"
      ],
      nextSteps: [
        `Study advanced ${topic} concepts`,
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
    
    // Generate unique course ID and save
    const courseId = generateCourseId();
    fallbackCourse.id = courseId;
    
    // Save course to user's history
    const userCourse = {
      id: courseId,
      userId: req.user.userId,
      topic: topic,
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
  const { progress, completed } = req.body;
  
  const userCourse = userCourses.find(uc => 
    uc.userId === req.user.userId && uc.id === req.params.courseId
  );
  
  if (!userCourse) {
    return res.status(404).json({ message: 'Course not found' });
  }
  
  userCourse.progress = progress || userCourse.progress;
  userCourse.completed = completed !== undefined ? completed : userCourse.completed;
  userCourse.lastAccessedAt = new Date().toISOString();
  
  // Update user stats
  const user = users.find(u => u.id === req.user.userId);
  if (user && completed && !userCourse.completed) {
    user.coursesCompleted += 1;
    user.totalStudyTime += 25; // Assume 25 minutes per course
  }
  
  // Save to persistent storage
  dataManager.saveUserCourses(userCourses);
  dataManager.saveUsers(users);
  
  res.json({ message: 'Progress updated', course: userCourse });
});

app.get('/api/user/dashboard', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userCourses = dataManager.getUserCourses();
    const userCoursesData = userCourses.filter(course => course.userId === userId);
    
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