import React from 'react';
import { marked } from 'marked'; // For rendering markdown
import hljs from 'highlight.js'; // For code syntax highlighting
import 'highlight.js/styles/atom-one-dark.css'; // Code highlighting style

// Configure marked to use highlight.js for code blocks
marked.setOptions({
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    return hljs.highlightAuto(code).value;
  },
  breaks: true,
  gfm: true
});

const CourseContentRenderer = ({ content }) => {
  // If no content, show placeholder
  if (!content || content.trim() === '') {
    return (
      <div className="p-4 bg-gray-100 rounded-lg text-gray-500 italic">
        No content available for this section.
      </div>
    );
  }
  
  // Render markdown content to HTML
  const htmlContent = marked(content);
  
  return (
    <div 
      className="prose prose-lg max-w-none prose-headings:text-emerald-600 prose-a:text-forest-500 prose-code:text-gray-800 prose-code:bg-gray-100 prose-code:p-0.5 prose-code:rounded"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

export default CourseContentRenderer;