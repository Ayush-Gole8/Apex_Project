const engineeringKnowledgeBase = {
  "computer_science": {
    topics: [
      "data structures", "algorithms", "programming languages", "software engineering",
      "databases", "computer networks", "operating systems", "machine learning",
      "artificial intelligence", "cybersecurity", "web development", "mobile development",
      "system design", "distributed systems", "cloud computing", "devops", "embedded systems",
      "computer graphics", "human-computer interaction", "compiler design", "computer vision",
      "natural language processing", "robotics", "quantum computing", "blockchain"
    ],
    concepts: {
      "algorithms": {
        sorting: ["bubble sort", "merge sort", "quick sort", "heap sort", "radix sort", "counting sort", "bucket sort"],
        searching: ["linear search", "binary search", "depth-first search", "breadth-first search", "A* search"],
        graph: ["Dijkstra", "Bellman-Ford", "Floyd-Warshall", "Kruskal", "Prim", "topological sort"],
        dynamic_programming: ["knapsack", "longest common subsequence", "edit distance", "fibonacci"],
        greedy: ["activity selection", "huffman coding", "fractional knapsack"],
        divide_conquer: ["merge sort", "quick sort", "binary search", "closest pair"],
        backtracking: ["n-queens", "sudoku solver", "maze solving", "subset sum"],
        string: ["KMP", "Boyer-Moore", "Rabin-Karp", "Z algorithm", "suffix arrays"]
      },
      "data_structures": {
        linear: ["arrays", "linked lists", "stacks", "queues", "deques"],
        trees: ["binary trees", "BST", "AVL trees", "red-black trees", "B-trees", "tries", "segment trees"],
        graphs: ["adjacency matrix", "adjacency list", "weighted graphs", "directed graphs"],
        hashing: ["hash tables", "hash functions", "collision resolution", "bloom filters"],
        heaps: ["min heap", "max heap", "binary heap", "fibonacci heap"],
        advanced: ["disjoint sets", "fenwick tree", "suffix tree", "rope data structure"]
      },
      "computer_graphics": {
        fundamentals: ["rasterization", "vector graphics", "pixel manipulation", "color models"],
        algorithms: ["line drawing", "circle drawing", "polygon filling", "clipping", "transformations"],
        rendering: ["ray tracing", "rasterization", "shading models", "texture mapping"],
        graphics_3d: ["3D transformations", "projection", "hidden surface removal", "lighting models"]
      },
      "machine_learning": {
        supervised: ["linear regression", "logistic regression", "decision trees", "random forest", "SVM", "neural networks"],
        unsupervised: ["k-means", "hierarchical clustering", "PCA", "DBSCAN", "gaussian mixture"],
        deep_learning: ["CNN", "RNN", "LSTM", "transformers", "GANs", "autoencoders"],
        reinforcement: ["Q-learning", "policy gradients", "actor-critic", "Monte Carlo methods"]
      },
      "web_development": {
        frontend: ["HTML5", "CSS3", "JavaScript", "React", "Vue", "Angular", "TypeScript"],
        backend: ["Node.js", "Express", "REST APIs", "GraphQL", "microservices"],
        databases: ["SQL", "NoSQL", "MongoDB", "PostgreSQL", "Redis", "database design"],
        tools: ["webpack", "babel", "npm", "yarn", "git", "docker"]
      },
      "cybersecurity": {
        fundamentals: ["confidentiality", "integrity", "availability", "authentication", "authorization"],
        cryptography: ["symmetric encryption", "asymmetric encryption", "hashing", "digital signatures"],
        network_security: ["firewalls", "IDS/IPS", "VPN", "SSL/TLS", "network protocols"],
        web_security: ["XSS", "SQL injection", "CSRF", "OWASP top 10", "secure coding"]
      },
      "databases": {
        relational: ["SQL", "normalization", "ACID properties", "indexing", "query optimization"],
        nosql: ["document stores", "key-value stores", "column stores", "graph databases"],
        design: ["ER modeling", "schema design", "denormalization", "partitioning", "replication"]
      },
      "operating_systems": {
        fundamentals: ["processes", "threads", "scheduling", "memory management", "file systems"],
        concurrency: ["synchronization", "deadlocks", "semaphores", "mutexes", "monitors"],
        memory: ["virtual memory", "paging", "segmentation", "garbage collection"],
        storage: ["file systems", "disk scheduling", "RAID", "storage hierarchy"]
      },
      "networks": {
        protocols: ["TCP/IP", "HTTP/HTTPS", "DNS", "DHCP", "routing protocols"],
        models: ["OSI model", "TCP/IP model", "network topologies"],
        security: ["network security", "encryption", "authentication", "access control"]
      }
    }
  },
  
  "software_engineering": {
    topics: [
      "software development lifecycle", "agile methodologies", "design patterns",
      "testing", "version control", "continuous integration", "software architecture",
      "requirements engineering", "project management", "code quality"
    ],
    concepts: {
      "design_patterns": {
        creational: ["singleton", "factory", "abstract factory", "builder", "prototype"],
        structural: ["adapter", "decorator", "facade", "composite", "bridge"],
        behavioral: ["observer", "strategy", "command", "iterator", "template method"]
      },
      "testing": {
        types: ["unit testing", "integration testing", "system testing", "acceptance testing"],
        techniques: ["black box", "white box", "test-driven development", "behavior-driven development"],
        tools: ["Jest", "Mocha", "Selenium", "JUnit", "pytest"]
      }
    }
  }
};

module.exports = {
  engineeringKnowledgeBase,
  findRelevantContext,
  generateContextPrompt,
  isEducationalQuery
};
    topics: [
      "circuit analysis", "electronics", "power systems", "control systems",
      "signal processing", "electromagnetics", "microprocessors", "embedded systems",
      "power electronics", "renewable energy", "smart grids", "analog and digital design"
    ],
    concepts: {
      "circuit_analysis": {
        fundamentals: ["Ohm's law", "Kirchhoff's laws", "AC/DC circuits", "impedance", "phasors"],
        components: ["resistors", "capacitors", "inductors", "diodes", "transistors", "op-amps"],
        analysis: ["nodal analysis", "mesh analysis", "Thevenin equivalent", "frequency response"]
      },
      "electronics": {
        analog: ["amplifiers", "filters", "oscillators", "power supplies", "op-amp circuits"],
        digital: ["logic gates", "flip-flops", "counters", "microcontrollers", "FPGA basics"]
      },
      "power_systems": {
        fundamentals: ["generation", "transmission", "distribution"],
        devices: ["transformers", "switchgears", "circuit breakers"],
        renewable: ["solar PV", "wind turbines", "battery storage", "inverters"]
      }
    }
  },

  "mechanical_engineering": {
    topics: [
      "thermodynamics", "fluid mechanics", "materials science", "manufacturing",
      "design engineering", "robotics", "automotive engineering", "aerospace",
      "mechatronics", "cad/cae", "vibration", "hvac"
    ],
    concepts: {
      "thermodynamics": {
        laws: ["first law", "second law", "entropy", "enthalpy"],
        cycles: ["Carnot cycle", "Otto cycle", "Rankine cycle", "Brayton cycle"],
        applications: ["heat engines", "refrigeration", "power plants", "thermal systems design"]
      },
      "fluid_mechanics": {
        fundamentals: ["pressure", "buoyancy", "fluid statics", "fluid dynamics", "continuity equation"],
        flow: ["laminar flow", "turbulent flow", "boundary layers", "Reynolds number"]
      },
      "manufacturing": {
        processes: ["casting", "machining", "forming", "welding", "additive manufacturing (3D printing)"],
        quality: ["tolerances", "surface finish", "metrology"]
      }
    }
  },

  "civil_engineering": {
    topics: [
      "structural engineering", "geotechnical engineering", "transportation",
      "environmental engineering", "construction management", "water resources",
      "hydraulics", "surveying", "road design", "foundation engineering"
    ],
    concepts: {
      "structural_engineering": {
        materials: ["concrete", "steel", "wood", "composite materials"],
        analysis: ["statics", "dynamics", "structural analysis", "design codes (IS, Eurocode)"],
        structures: ["beams", "columns", "foundations", "bridges", "trusses"]
      }
    }
  },

  "chemical_engineering": {
    topics: [
      "process engineering", "reaction engineering", "transport phenomena", "thermodynamics",
      "unit operations", "process control", "chemical safety", "separation processes"
    ],
    concepts: {
      "reaction_engineering": {
        fundamentals: ["rate laws", "batch vs continuous reactors", "catalysis"],
        design: ["CSTR", "PFR", "kinetics", "conversion and selectivity"]
      },
      "separation_processes": {
        fundamentals: ["distillation", "absorption", "extraction", "membrane separation"],
        design: ["mass transfer", "stage calculation", "equipments"]
      }
    }
  },

  "materials_science": {
    topics: [
      "crystallography", "mechanical properties", "phase diagrams", "polymers",
      "ceramics", "composites", "corrosion", "materials characterization"
    ],
    concepts: {
      "mechanical_properties": {
        fundamentals: ["tensile strength", "yield strength", "hardness", "fatigue"],
        testing: ["tensile test", "charpy impact", "hardness tests"]
      },
      "materials_characterization": {
        techniques: ["XRD", "SEM", "TEM", "DSC", "FTIR"]
      }
    }
  },

  "aerospace_engineering": {
    topics: [
      "aerodynamics", "flight mechanics", "propulsion", "space systems", "structure",
      "avionics", "guidance and control", "orbital mechanics"
    ],
    concepts: {
      "aerodynamics": {
        fundamentals: ["lift", "drag", "boundary layers", "airfoil theory"],
        tools: ["wind tunnel testing", "CFD basics"]
      },
      "propulsion": {
        types: ["jet engines", "rocket engines", "propellers"],
        concepts: ["thrust", "specific impulse"]
      }
    }
  },

  "biomedical_engineering": {
    topics: [
      "biomechanics", "medical imaging", "biomaterials", "medical devices", "physiological modeling"
    ],
    concepts: {
      "medical_imaging": {
        fundamentals: ["x-ray", "CT", "MRI", "ultrasound"],
        image_processing: ["segmentation", "registration", "denoising"]
      }
    }
  }
};

// RAG Helper Functions (left intentionally functionally intact)
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

// Heuristic to determine if a query is educational
function isEducationalQuery(topic) {
  if (!topic || typeof topic !== 'string') return false;
  const lower = topic.trim().toLowerCase();

  // Quick filters for clearly non-educational / personal intents
  const personalMarkers = [
    'i love you','love you','love u','i love u','i love','marry me','will you','date me',
    'how are you','hello','hi','hey','thanks','thank you','i miss you','miss you','i like you',
    'kiss','hug','romantic','flirt','dating','boyfriend','girlfriend','propose'
  ];
  for (const p of personalMarkers) {
    if (lower === p || lower.startsWith(p + ' ') || lower.endsWith(' ' + p) || lower.includes(' ' + p + ' ')) return false;
  }

  // Blacklist for unsafe or harmful intents
  const forbidden = [
    'bomb','kill','murder','weapon','attack','explode','hacking','illegal','porn','sex','drugs',
    'how to make a bomb','manufacture explosive','suicide','terror','bypass security','crack password','steal data','cheat exam','fraud'
  ];
  for (const f of forbidden) {
    if (lower === f || lower.startsWith(f + ' ') || lower.endsWith(' ' + f) || lower.includes(' ' + f + ' ')) return false;
  }

  // Whitelist of known educational engineering and technology topics that should always pass
  const educationalTopics = [
    'apache', 'kafka', 'apache kafka', 'devops', 'cloud', 'docker', 'kubernetes', 'ci/cd', 'jenkins',
    'data science', 'big data', 'hadoop', 'spark', 'machine learning', 'artificial intelligence',
    'web development', 'frontend', 'backend', 'database', 'sql', 'nosql', 'react', 'angular', 'vue',
    'node.js', 'python', 'java', 'c++', 'c#', 'javascript', 'typescript', 'rust', 'go', 'golang',
    'cloud computing', 'aws', 'azure', 'gcp', 'serverless', 'microservices', 'distributed systems',
    'blockchain', 'cryptocurrency', 'cybersecurity', 'networking', 'operating systems', 'linux',
    'data structures', 'algorithms', 'computer science', 'software engineering', 'system design',
    'aerospace', 'thermodynamics', 'fluid mechanics', 'chemical engineering', 'materials science', 'biomedical', 'mechatronics'
  ];
  
  for (const edu of educationalTopics) {
    if (lower === edu || lower.includes(edu)) return true;
  }

  // Check for presence of technical/engineering keywords if not already matched
  const techKeywords = [
    'algorithm','data','machine','learning','neural','operating system','operating','deadlock',
    'network','circuit','thermodynamics','control','structural','database','security','encryption',
    'software','hardware','programming','compiler','compiler design','embedded','robotics','signal',
    'fluid','mechanics','materials','civil','electrical','mechanical','chemical','algorithm',
    'protocol','database','design','aerodynamics','propulsion','reaction','distillation'
  ];
  
  const hasTech = techKeywords.some(k => lower.includes(k));
  if (!hasTech) {
    // If short queries or natural-language personal phrases, treat as non-educational
    if (lower.split(' ').length <= 3) return false;
  }

  return true;
}

const generateContextPrompt = (topic, relevantContext) => {
  const basePrompt = `You are an expert educational content creator specializing in engineering and computer science. Generate a comprehensive, structured course on "${topic}".

${relevantContext.length > 0 ? `
Relevant knowledge context:
${relevantContext.map(ctx => `- ${ctx.topic}: ${ctx.details.join(', ')}`).join('\n')}
` : ''}

Create a detailed course with the following structure. Return ONLY valid JSON (no markdown, no extra text):

{
  "title": "Course title (descriptive and engaging)",
  "summary": "2-3 sentence course overview explaining what students will learn and why it matters",
  "estimatedDurationMinutes": 90,
  "sections": [
    {
      "id": "section_1",
      "title": "Section title",
      "description": "Brief description of what this section covers",
      "weight": 25,
      "modules": [
        {
          "id": "module_1",
          "title": "Module title",
          "content": "Detailed content in markdown format with:\n- Clear explanations\n- Code examples (use \`\`\`language blocks)\n- Practical applications\n- Key concepts\n- Step-by-step instructions where applicable\nMinimum 500 characters of substantial educational content.",
          "estimatedTimeMinutes": 15,
          "weight": 100
        }
      ]
    }
  ],
  "prerequisites": ["List of prerequisites"],
  "learningObjectives": ["List of specific learning outcomes"],
  "studyNext": ["List of recommended follow-up topics"],
  "ragContext": ["${topic}", "related concepts"]
}

Requirements:
1. Create 4-6 sections covering the topic comprehensively
2. Each section should have 1-3 modules with substantial content (minimum 500 characters each)
3. Include practical examples, code snippets, and real-world applications
4. Use proper markdown formatting in content
5. Make content educational, not promotional
6. Focus on practical learning with actionable insights
7. Include specific, measurable learning objectives
8. Ensure content is technically accurate and up-to-date

Topic: "${topic}"

Generate the course now:`;

  return basePrompt;
};

// Export helpers
module.exports = {
  engineeringKnowledgeBase,
  findRelevantContext,
  generateContextPrompt,
  isEducationalQuery
};
