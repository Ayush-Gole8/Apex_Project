// Skill assessment functionality for Apex platform
const express = require('express');
const crypto = require('crypto'); // Use Node.js built-in crypto module instead of uuid
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Generate UUIDs using Node.js crypto module
function generateUUID() {
  return crypto.randomUUID();
}

// File path for storing skill assessments
const SKILL_ASSESSMENTS_FILE = path.join(__dirname, '..', 'data', 'skillAssessments.json');

// Helper functions
const getSkillAssessments = () => {
  try {
    if (!fs.existsSync(SKILL_ASSESSMENTS_FILE)) {
      fs.writeFileSync(SKILL_ASSESSMENTS_FILE, JSON.stringify([], null, 2));
      return [];
    }
    const data = fs.readFileSync(SKILL_ASSESSMENTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading skill assessments file:', error);
    return [];
  }
};

const saveSkillAssessments = (assessments) => {
  try {
    if (!Array.isArray(assessments)) {
      console.error('Invalid skill assessments data format');
      return false;
    }
    fs.writeFileSync(SKILL_ASSESSMENTS_FILE, JSON.stringify(assessments, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving skill assessments file:', error);
    return false;
  }
};

// Get all skill assessments for the authenticated user
router.get('/', (req, res) => {
  try {
    const assessments = getSkillAssessments();
    const userAssessments = assessments.filter(assessment => assessment.userId === req.user.userId);
    res.json(userAssessments);
  } catch (error) {
    console.error('Error fetching skill assessments:', error);
    res.status(500).json({ message: 'Failed to fetch skill assessments' });
  }
});

// Generate a new skill assessment
router.post('/generate', async (req, res) => {
  try {
    const { topic } = req.body;
    
    if (!topic) {
      return res.status(400).json({ message: 'Topic is required' });
    }
    
    // Sample questions for demo purposes
    // In production, you would use the OpenAI API to generate these
    const sampleQuestions = [
      {
        question: `What is a key concept in ${topic}?`,
        options: [
          "Sample answer A", 
          "Sample answer B", 
          "Sample answer C", 
          "Sample answer D"
        ],
        correctAnswer: 1
      },
      {
        question: `Which of the following is true about ${topic}?`,
        options: [
          "Sample statement A", 
          "Sample statement B", 
          "Sample statement C", 
          "Sample statement D"
        ],
        correctAnswer: 2
      },
      {
        question: `How would you implement a ${topic} solution?`,
        options: [
          "Implementation approach A", 
          "Implementation approach B", 
          "Implementation approach C", 
          "Implementation approach D"
        ],
        correctAnswer: 0
      },
      {
        question: `What is a common challenge when working with ${topic}?`,
        options: [
          "Challenge A", 
          "Challenge B", 
          "Challenge C", 
          "Challenge D"
        ],
        correctAnswer: 3
      },
      {
        question: `Which tool is best for working with ${topic}?`,
        options: [
          "Tool A", 
          "Tool B", 
          "Tool C", 
          "Tool D"
        ],
        correctAnswer: 1
      }
    ];
    
    const assessments = getSkillAssessments();
    
    const newAssessment = {
      id: generateUUID(),
      userId: req.user.userId,
      topic,
      questions: sampleQuestions,
      userAnswers: [],
      skillGaps: [],
      recommendedCourses: [],
      learningStyle: {
        visual: 33,
        textual: 33,
        interactive: 34,
        current: 'balanced'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    assessments.push(newAssessment);
    saveSkillAssessments(assessments);
    
    res.status(201).json(newAssessment);
  } catch (error) {
    console.error('Error generating skill assessment:', error);
    res.status(500).json({ message: 'Failed to generate skill assessment' });
  }
});

// Submit answers to a skill assessment
router.post('/:id/submit', async (req, res) => {
  try {
    const { id } = req.params;
    const { answers, interactionData } = req.body;
    
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'Invalid answers format' });
    }
    
    const assessments = getSkillAssessments();
    const assessmentIndex = assessments.findIndex(a => a.id === id && a.userId === req.user.userId);
    
    if (assessmentIndex === -1) {
      return res.status(404).json({ message: 'Assessment not found' });
    }
    
    const assessment = assessments[assessmentIndex];
    assessment.userAnswers = answers;
    
    // Calculate skill gaps based on incorrect answers
    const skillGaps = [];
    let correctCount = 0;
    
    assessment.questions.forEach((question, index) => {
      if (answers[index] !== question.correctAnswer) {
        // Extract the topic from the question
        const topicMatch = question.question.match(/about (.+?)[\.\?]/i) || 
                          question.question.match(/in (.+?)[\.\?]/i);
        const subtopic = topicMatch ? topicMatch[1] : 'general ' + assessment.topic;
        skillGaps.push(subtopic);
      } else {
        correctCount++;
      }
    });
    
    assessment.skillGaps = [...new Set(skillGaps)]; // Remove duplicates
    
    // Update learning style based on interaction data
    if (interactionData) {
      const { timeSpentOnText, timeSpentOnVisuals, interactiveElementsUsed } = interactionData;
      
      // Simple algorithm to determine learning style preference
      const total = timeSpentOnText + timeSpentOnVisuals + interactiveElementsUsed;
      
      if (total > 0) {
        assessment.learningStyle = {
          textual: Math.round((timeSpentOnText / total) * 100),
          visual: Math.round((timeSpentOnVisuals / total) * 100),
          interactive: Math.round((interactiveElementsUsed / total) * 100),
          current: 'balanced'
        };
        
        // Determine dominant learning style
        const styles = {
          textual: assessment.learningStyle.textual,
          visual: assessment.learningStyle.visual,
          interactive: assessment.learningStyle.interactive
        };
        
        const dominantStyle = Object.keys(styles).reduce((a, b) => styles[a] > styles[b] ? a : b);
        assessment.learningStyle.current = dominantStyle;
      }
    }
    
    // For demo purposes, we'll create some dummy recommended courses
    // In production, you would fetch courses from your database
    assessment.recommendedCourses = [
      `${assessment.topic} Fundamentals`,
      `Advanced ${assessment.topic}`,
      `Practical ${assessment.topic} Implementation`
    ];
    
    assessment.updatedAt = new Date().toISOString();
    
    assessments[assessmentIndex] = assessment;
    saveSkillAssessments(assessments);
    
    res.json({ 
      assessment,
      performance: {
        correctAnswers: correctCount,
        totalQuestions: assessment.questions.length,
        percentage: Math.round((correctCount / assessment.questions.length) * 100)
      }
    });
  } catch (error) {
    console.error('Error submitting assessment answers:', error);
    res.status(500).json({ message: 'Failed to process assessment' });
  }
});

module.exports = router;