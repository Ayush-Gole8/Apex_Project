// Engineering Knowledge Base for RAG
const engineeringKnowledgeBase = {
  "computer_science": {
    topics: [
      "data structures", "algorithms", "programming languages", "software engineering",
      "databases", "computer networks", "operating systems", "machine learning",
      "artificial intelligence", "cybersecurity", "web development", "mobile development"
    ],
    concepts: {
      "data_structures": {
        fundamentals: ["arrays", "linked lists", "stacks", "queues", "trees", "graphs", "hash tables"],
        applications: ["searching", "sorting", "graph traversal", "dynamic programming"],
        timeComplexity: ["Big O notation", "space complexity", "time-space tradeoffs"]
      },
      "algorithms": {
        sorting: ["bubble sort", "merge sort", "quick sort", "heap sort"],
        searching: ["linear search", "binary search", "depth-first search", "breadth-first search"],
        optimization: ["greedy algorithms", "dynamic programming", "divide and conquer"]
      },
      "web_development": {
        frontend: ["HTML", "CSS", "JavaScript", "React", "Vue", "Angular"],
        backend: ["Node.js", "Express", "REST APIs", "GraphQL"],
        databases: ["SQL", "MongoDB", "PostgreSQL", "Redis"]
      },
      "machine_learning": {
        supervised: ["linear regression", "logistic regression", "decision trees", "random forest", "SVM"],
        unsupervised: ["k-means clustering", "hierarchical clustering", "PCA"],
        deep_learning: ["neural networks", "CNN", "RNN", "transformers"]
      }
    }
  },
  "electrical_engineering": {
    topics: [
      "circuit analysis", "electronics", "power systems", "control systems",
      "signal processing", "electromagnetics", "microprocessors", "embedded systems"
    ],
    concepts: {
      "circuit_analysis": {
        fundamentals: ["Ohm's law", "Kirchhoff's laws", "AC/DC circuits", "impedance"],
        components: ["resistors", "capacitors", "inductors", "diodes", "transistors"],
        analysis: ["nodal analysis", "mesh analysis", "Thevenin equivalent"]
      },
      "electronics": {
        analog: ["amplifiers", "filters", "oscillators", "power supplies"],
        digital: ["logic gates", "flip-flops", "counters", "microcontrollers"]
      }
    }
  },
  "mechanical_engineering": {
    topics: [
      "thermodynamics", "fluid mechanics", "materials science", "manufacturing",
      "design engineering", "robotics", "automotive engineering", "aerospace"
    ],
    concepts: {
      "thermodynamics": {
        laws: ["first law", "second law", "entropy", "enthalpy"],
        cycles: ["Carnot cycle", "Otto cycle", "Rankine cycle"],
        applications: ["heat engines", "refrigeration", "power plants"]
      },
      "fluid_mechanics": {
        fundamentals: ["pressure", "buoyancy", "fluid statics", "fluid dynamics"],
        flow: ["laminar flow", "turbulent flow", "boundary layers"]
      }
    }
  },
  "civil_engineering": {
    topics: [
      "structural engineering", "geotechnical engineering", "transportation",
      "environmental engineering", "construction management", "water resources"
    ],
    concepts: {
      "structural_engineering": {
        materials: ["concrete", "steel", "wood", "composite materials"],
        analysis: ["statics", "dynamics", "structural analysis", "design codes"],
        structures: ["beams", "columns", "foundations", "bridges"]
      }
    }
  }
};

// RAG Helper Functions
function findRelevantContext(topic, knowledgeBase) {
  const topicLower = topic.toLowerCase();
  let relevantContext = [];
  
  // Search through all engineering domains
  Object.keys(knowledgeBase).forEach(domain => {
    const domainData = knowledgeBase[domain];
    
    // Check if topic matches domain topics
    const matchingTopics = domainData.topics.filter(t => 
      topicLower.includes(t.toLowerCase()) || t.toLowerCase().includes(topicLower)
    );
    
    if (matchingTopics.length > 0) {
      relevantContext.push({
        domain: domain.replace('_', ' '),
        topics: matchingTopics,
        concepts: domainData.concepts
      });
    }
    
    // Search within concepts
    Object.keys(domainData.concepts).forEach(conceptKey => {
      if (topicLower.includes(conceptKey.toLowerCase()) || conceptKey.toLowerCase().includes(topicLower)) {
        relevantContext.push({
          domain: domain.replace('_', ' '),
          concept: conceptKey.replace('_', ' '),
          details: domainData.concepts[conceptKey]
        });
      }
    });
  });
  
  return relevantContext;
}

function generateContextPrompt(topic, context) {
  if (context.length === 0) {
    return `Create a focused engineering course on "${topic}". Ensure it's educational, practical, and can be completed in 15-30 minutes.`;
  }
  
  let contextText = `Based on the following engineering knowledge context:\n\n`;
  
  context.forEach(ctx => {
    if (ctx.topics) {
      contextText += `Domain: ${ctx.domain}\nRelated topics: ${ctx.topics.join(', ')}\n\n`;
    }
    if (ctx.concept && ctx.details) {
      contextText += `Concept: ${ctx.concept}\n`;
      Object.keys(ctx.details).forEach(key => {
        if (Array.isArray(ctx.details[key])) {
          contextText += `${key}: ${ctx.details[key].join(', ')}\n`;
        }
      });
      contextText += '\n';
    }
  });
  
  return contextText;
}

module.exports = {
  engineeringKnowledgeBase,
  findRelevantContext,
  generateContextPrompt
};