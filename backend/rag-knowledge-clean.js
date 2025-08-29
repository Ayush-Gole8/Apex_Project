const engineeringKnowledgeBase = {
  "computer_science": {
    topics: [
      "data structures", "algorithms", "programming languages", "software engineering",
      "databases", "computer networks", "operating systems", "machine learning",
      "artificial intelligence", "cybersecurity", "web development", "mobile development",
      "system design", "distributed systems", "cloud computing", "devops"
    ],
    concepts: {
      "algorithms": {
        sorting: ["bubble sort", "merge sort", "quick sort", "heap sort"],
        searching: ["linear search", "binary search", "depth-first search", "breadth-first search"],
        graph: ["Dijkstra", "Bellman-Ford", "Floyd-Warshall", "Kruskal", "Prim"]
      },
      "data_structures": {
        linear: ["arrays", "linked lists", "stacks", "queues"],
        trees: ["binary trees", "BST", "AVL trees", "red-black trees"],
        graphs: ["adjacency matrix", "adjacency list", "weighted graphs"]
      }
    }
  }
};

// Educational topic whitelist
const educationalTopics = [
  'algorithms', 'data structures', 'programming', 'software engineering',
  'machine learning', 'artificial intelligence', 'computer graphics', 'databases',
  'javascript', 'python', 'java', 'c++', 'react', 'node.js',
  'apache', 'kafka', 'apache kafka', 'devops', 'docker', 'kubernetes',
  'bresenham', 'line drawing', 'computer graphics', 'rasterization'
];

// Find relevant context from the knowledge base
const findRelevantContext = (topic, knowledgeBase) => {
  const relevantContext = [];
  const topicLower = topic.toLowerCase();
  
  Object.keys(knowledgeBase).forEach(domain => {
    const domainData = knowledgeBase[domain];
    
    if (domainData.topics) {
      const matchingTopics = domainData.topics.filter(t => 
        topicLower.includes(t.toLowerCase()) || t.toLowerCase().includes(topicLower)
      );
      
      if (matchingTopics.length > 0) {
        relevantContext.push({
          domain,
          topic: matchingTopics[0],
          details: matchingTopics
        });
      }
    }
  });
  
  return relevantContext.slice(0, 5);
};

// Check if a query is educational
const isEducationalQuery = (query) => {
  if (!query || typeof query !== 'string') {
    return false;
  }
  
  const queryLower = query.toLowerCase().trim();
  
  const directMatch = educationalTopics.some(topic => {
    const topicLower = topic.toLowerCase();
    return queryLower === topicLower || 
           queryLower.includes(topicLower) || 
           topicLower.includes(queryLower);
  });
  
  if (directMatch) {
    return true;
  }
  
  const educationalKeywords = [
    'algorithm', 'programming', 'code', 'software', 'development',
    'engineering', 'computer', 'science', 'learning', 'tutorial'
  ];
  
  return educationalKeywords.some(keyword => queryLower.includes(keyword));
};

const generateContextPrompt = (topic, relevantContext) => {
  return `You are an expert educational content creator. Generate a comprehensive course on "${topic}".

Create a detailed course with proper JSON structure including title, sections with modules, and educational content.

Topic: "${topic}"`;
};

module.exports = {
  engineeringKnowledgeBase,
  findRelevantContext,
  generateContextPrompt,
  isEducationalQuery
};