import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const CodePlayground = () => {
  const [code, setCode] = useState(`// Welcome to ApeX Code Playground
// Write your code here and click "Run Code" to execute

function greet(name) {
  return \`Hello, \${name}! Welcome to ApeX Learning Platform.\`;
}

console.log(greet("Developer"));

// Try writing some algorithms:
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log("Fibonacci sequence:");
for (let i = 0; i < 10; i++) {
  console.log(\`F(\${i}) = \${fibonacci(i)}\`);
}
`);
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState('');

  const languages = [
    { value: 'javascript', label: 'JavaScript', icon: '🟨' },
    { value: 'python', label: 'Python', icon: '🐍' },
    { value: 'java', label: 'Java', icon: '☕' },
    { value: 'cpp', label: 'C++', icon: '⚡' }
  ];

  const languageTemplates = {
    javascript: `// JavaScript Example
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet("World"));

// Array methods example
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log("Doubled:", doubled);`,

    python: `# Python Example
def greet(name):
    return f"Hello, {name}!"

print(greet("World"))

# List comprehension example
numbers = [1, 2, 3, 4, 5]
doubled = [n * 2 for n in numbers]
print("Doubled:", doubled)

# Simple algorithm
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print("Fibonacci sequence:")
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")`,

    java: `// Java Example
public class Main {
    public static void main(String[] args) {
        System.out.println(greet("World"));
        
        // Array example
        int[] numbers = {1, 2, 3, 4, 5};
        System.out.println("Original array:");
        for (int num : numbers) {
            System.out.print(num + " ");
        }
        System.out.println();
        
        // Simple algorithm
        System.out.println("Fibonacci sequence:");
        for (int i = 0; i < 10; i++) {
            System.out.println("F(" + i + ") = " + fibonacci(i));
        }
    }
    
    public static String greet(String name) {
        return "Hello, " + name + "!";
    }
    
    public static int fibonacci(int n) {
        if (n <= 1) return n;
        return fibonacci(n - 1) + fibonacci(n - 2);
    }
}`,

    cpp: `// C++ Example
#include <iostream>
#include <vector>
using namespace std;

string greet(string name) {
    return "Hello, " + name + "!";
}

int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

int main() {
    cout << greet("World") << endl;
    
    // Vector example
    vector<int> numbers = {1, 2, 3, 4, 5};
    cout << "Original numbers: ";
    for (int num : numbers) {
        cout << num << " ";
    }
    cout << endl;
    
    // Fibonacci sequence
    cout << "Fibonacci sequence:" << endl;
    for (int i = 0; i < 10; i++) {
        cout << "F(" << i << ") = " << fibonacci(i) << endl;
    }
    
    return 0;
}`
  };

  const runCode = async () => {
    setIsRunning(true);
    setError('');
    setOutput('');

    try {
      const response = await axios.post(`${API_BASE_URL}/api/execute-code`, {
        code,
        language
      });

      setOutput(response.data.output || 'Code executed successfully (no output)');
    } catch (error) {
      console.error('Code execution error:', error);
      setError(error.response?.data?.message || 'Failed to execute code');
      setOutput('Error executing code. Please check your syntax and try again.');
    } finally {
      setIsRunning(false);
    }
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    setCode(languageTemplates[newLanguage] || '// Write your code here');
    setOutput('');
    setError('');
  };

  const clearCode = () => {
    setCode('// Write your code here');
    setOutput('');
    setError('');
  };

  return (
    <div className="w-full h-full min-h-[80vh] bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-100 dark:bg-gray-700 p-4 border-b border-gray-200 dark:border-gray-600">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Code Editor
            </h2>
            <div className="flex space-x-2">
              {languages.map((lang) => (
                <button
                  key={lang.value}
                  onClick={() => handleLanguageChange(lang.value)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    language === lang.value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                  }`}
                >
                  {lang.icon} {lang.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={clearCode}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
            >
              Clear
            </button>
            <button
              onClick={runCode}
              disabled={isRunning}
              className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors ${
                isRunning
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isRunning ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Running...
                </span>
              ) : (
                '▶️ Run Code'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row h-full">
        {/* Code Editor */}
        <div className="flex-1 flex flex-col">
          <div className="bg-gray-50 dark:bg-gray-900 px-4 py-2 border-b border-gray-200 dark:border-gray-600">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Code Editor
            </h3>
          </div>
          <div className="flex-1 p-4">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full min-h-[400px] p-4 font-mono text-sm bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Write your code here..."
              spellCheck="false"
            />
          </div>
        </div>

        {/* Output Panel */}
        <div className="lg:w-1/2 flex flex-col border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-600">
          <div className="bg-gray-50 dark:bg-gray-900 px-4 py-2 border-b border-gray-200 dark:border-gray-600">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Output
            </h3>
          </div>
          <div className="flex-1 p-4">
            {error ? (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <h4 className="text-red-800 dark:text-red-400 font-medium mb-2">Error:</h4>
                <pre className="text-red-600 dark:text-red-300 text-sm whitespace-pre-wrap font-mono">
                  {error}
                </pre>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 h-full min-h-[400px]">
                <pre className="text-gray-800 dark:text-gray-200 text-sm whitespace-pre-wrap font-mono">
                  {output || 'Click "Run Code" to see the output here...'}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 border-t border-gray-200 dark:border-gray-600">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          💡 This is a demo code playground. In production, code would be executed in a secure sandbox environment.
        </p>
      </div>
    </div>
  );
};

export default CodePlayground;