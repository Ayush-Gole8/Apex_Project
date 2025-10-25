// Test script to verify Gemini API returns real content
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
  console.log('🧪 Testing Gemini API...');
  console.log('API Key configured:', !!process.env.GEMINI_API_KEY);
  
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  const testTopic = "decision trees in machine learning";
  
  const prompt = `Create a detailed educational course on "${testTopic}".

Create the course in this JSON format:
{
  "title": "Professional course title",
  "description": "Detailed 4-5 sentence description",
  "duration": "20-30 minutes",
  "difficulty": "Intermediate",
  "modules": [
    {
      "title": "Module title",
      "description": "Module description",
      "estimatedTime": "10 min",
      "topics": ["topic 1", "topic 2", "topic 3"],
      "detailedContent": "Write a comprehensive 300-400 word explanation covering the core concepts in detail. This should be educational content that genuinely helps students understand the subject matter.",
      "keyPoints": [
        "Detailed key point 1",
        "Detailed key point 2",
        "Detailed key point 3"
      ],
      "resources": [
        {
          "title": "Resource title",
          "url": "https://www.geeksforgeeks.org/decision-tree/",
          "type": "article",
          "description": "Why this resource is valuable"
        }
      ],
      "practiceExercise": "Detailed hands-on exercise with specific instructions",
      "commonMistakes": [
        "Explanation of common mistake 1",
        "Explanation of common mistake 2"
      ]
    }
  ],
  "prerequisites": ["Prerequisite 1", "Prerequisite 2"],
  "learningObjectives": ["Objective 1", "Objective 2"],
  "realWorldApplications": ["Application 1", "Application 2"],
  "quickReference": ["Formula 1", "Principle 2"],
  "nextSteps": ["Next topic 1", "Next topic 2"]
}

IMPORTANT: Write detailed, educational content with real explanations, not placeholders.`;

  // Try different model names (Updated for current Gemini API - October 2025)
  const modelNamesToTry = [
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-2.0-flash",
    "gemini-flash-latest",
    "gemini-pro-latest"
  ];
  
  let successModel = null;
  let result = null;
  
  for (const modelName of modelNamesToTry) {
    try {
      console.log(`\n📤 Trying model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      result = await model.generateContent(prompt);
      successModel = modelName;
      console.log(`✅ Success with model: ${modelName}`);
      break;
    } catch (error) {
      console.log(`❌ Failed with ${modelName}:`, error.message.substring(0, 100));
      continue;
    }
  }
  
  if (!result) {
    throw new Error('All model names failed');
  }
  
  try {
    const response = await result.response;
    let courseData = response.text();
    
    console.log('\n✅ Response received!');
    console.log('Response length:', courseData.length, 'characters');
    console.log('\n📋 First 1000 characters of response:');
    console.log('='.repeat(80));
    console.log(courseData.substring(0, 1000));
    console.log('='.repeat(80));
    
    // Try to parse as JSON
    courseData = courseData.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    try {
      const parsed = JSON.parse(courseData);
      console.log('\n✅ Successfully parsed as JSON');
      console.log('Title:', parsed.title);
      console.log('Modules:', parsed.modules?.length || 0);
      if (parsed.modules && parsed.modules[0]) {
        console.log('\n📚 First Module:');
        console.log('  Title:', parsed.modules[0].title);
        console.log('  DetailedContent length:', parsed.modules[0].detailedContent?.length || 0);
        console.log('  DetailedContent preview:', parsed.modules[0].detailedContent?.substring(0, 200) || 'MISSING');
        console.log('  KeyPoints count:', parsed.modules[0].keyPoints?.length || 0);
        console.log('  Resources count:', parsed.modules[0].resources?.length || 0);
      }
    } catch (parseError) {
      console.log('\n❌ Failed to parse JSON:', parseError.message);
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

testGemini();
