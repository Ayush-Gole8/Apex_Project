const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { generateDetailedCourse } = require('../utils/fallbackCourseGenerator');

// In the generate-course route handler, after getting the AI response but before sending it back
router.post('/generate-course', authenticateToken, async (req, res) => {
  try {
    const { topic } = req.body;
    
    // ...existing code that calls the AI service...
    let response = {}; // This should be the response from your AI service
    
    // After getting the response from the AI service but before sending to client:
    
    // Check if we got a generic response (contains generic sections without detailed content)
    const isGenericResponse = isGenericAIResponse(response);
    
    // If the response is generic, use our fallback generator
    if (isGenericResponse) {
      console.log(`AI returned generic content for topic "${topic}". Using fallback generator.`);
      const detailedCourse = generateDetailedCourse(topic);
      
      // Return the detailed course with a warning that it's using fallback content
      return res.status(200).json({
        ...detailedCourse,
        fallbackUsed: true,
        message: "Using enhanced course structure from our library."
      });
    }
    
    // Otherwise return the AI-generated response as normal
    res.status(200).json(response);
    
  } catch (error) {
    console.error('Error generating course:', error);
    res.status(500).json({ error: 'An error occurred while generating the course.' });
  }
});

// Helper function to determine if the AI response is generic
function isGenericAIResponse(response) {
  // Check for indicators of a generic response:
  
  // 1. Check if sections exist but don't have detailed content
  if (response.sections && 
      response.sections.length > 0 && 
      (!response.sections[0].content || response.sections[0].content.length < 300)) {
    return true;
  }
  
  // 2. Check if the learning objectives are generic
  if (response.learningObjectives && 
      response.learningObjectives.length > 0 &&
      response.learningObjectives.every(obj => 
        obj.includes("fundamental principles") || 
        obj.includes("concepts") || 
        obj.includes("Apply") || 
        obj.includes("Evaluate")
      )) {
    return true;
  }
  
  // 3. Check if summary is very short or generic
  if (response.summary && 
      (response.summary.length < 100 || 
       response.summary.includes("comprehensive course"))) {
    return true;
  }
  
  return false;
}

module.exports = router;