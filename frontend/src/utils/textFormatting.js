// Utility functions for formatting text content

/**
 * Formats markdown-like text to React elements
 * Handles: **bold**, *italic*, bullet points, paragraphs
 */
export const formatText = (text) => {
  if (!text) return null;

  // Split into paragraphs
  const paragraphs = text.split(/\n\n+/);

  return paragraphs.map((para, paraIndex) => {
    // Check if it's a bullet point
    if (para.trim().startsWith('- ') || para.trim().startsWith('• ')) {
      const items = para.split(/\n/).filter(line => line.trim());
      return (
        <ul key={paraIndex} className="list-disc list-inside space-y-2 mb-4">
          {items.map((item, itemIndex) => {
            const cleanItem = item.replace(/^[-•]\s*/, '');
            return (
              <li key={itemIndex} className="text-white/90 leading-relaxed">
                {formatInlineText(cleanItem)}
              </li>
            );
          })}
        </ul>
      );
    }

    // Regular paragraph
    return (
      <p key={paraIndex} className="text-white/90 leading-relaxed mb-4 last:mb-0">
        {formatInlineText(para)}
      </p>
    );
  });
};

/**
 * Formats inline text (bold, italic)
 */
const formatInlineText = (text) => {
  const parts = [];
  let currentIndex = 0;
  
  // Pattern to match **bold** and *italic*
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > currentIndex) {
      parts.push(text.substring(currentIndex, match.index));
    }

    const matched = match[0];
    if (matched.startsWith('**') && matched.endsWith('**')) {
      // Bold text
      parts.push(
        <strong key={match.index} className="font-semibold text-emerald-custom-300">
          {matched.slice(2, -2)}
        </strong>
      );
    } else if (matched.startsWith('*') && matched.endsWith('*')) {
      // Italic text
      parts.push(
        <em key={match.index} className="italic text-white/95">
          {matched.slice(1, -1)}
        </em>
      );
    }

    currentIndex = match.index + matched.length;
  }

  // Add remaining text
  if (currentIndex < text.length) {
    parts.push(text.substring(currentIndex));
  }

  return parts.length > 0 ? parts : text;
};

/**
 * Cleans text by removing excessive asterisks and formatting
 */
export const cleanText = (text) => {
  if (!text) return '';
  
  return text
    .replace(/\*\*\*/g, '') // Remove triple asterisks
    .replace(/\*\*/g, '') // Remove double asterisks for bold
    .replace(/\*/g, '') // Remove single asterisks for italic
    .trim();
};

/**
 * Formats a list of items with proper bullet points
 */
export const formatList = (items) => {
  if (!items || !Array.isArray(items)) return null;

  return items.map((item, index) => ({
    id: index,
    text: cleanText(item)
  }));
};

/**
 * Validates and formats URLs
 */
export const isValidUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  
  // Check if it's a placeholder
  const placeholders = ['REAL_PUBLIC_URL_ONLY', 'your_url_here', 'example.com'];
  if (placeholders.some(placeholder => url.includes(placeholder))) {
    return false;
  }

  // Check if it's a valid URL format
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Extracts domain name from URL for display
 */
export const getDomainFromUrl = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return 'External Resource';
  }
};
