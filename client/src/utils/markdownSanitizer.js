export const sanitizeMarkdownResponse = (text) => {
  if (!text) return '';

  // Remove markdown headers (# ## ###)
  let sanitized = text.replace(/^#{1,6}\s+/gm, '');

  // Convert **bold** to plain text (email doesn't need bold formatting)
  sanitized = sanitized.replace(/\*\*(.*?)\*\*/g, '$1');

  // Convert *italic* to plain text
  sanitized = sanitized.replace(/\*(.*?)\*/g, '$1');

  // Remove markdown links but keep the text
  sanitized = sanitized.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // Remove code blocks (```)
  sanitized = sanitized.replace(/```[\s\S]*?```/g, '');

  // Remove inline code (`code`)
  sanitized = sanitized.replace(/`([^`]+)`/g, '$1');

  // Convert markdown lists to simple format
  sanitized = sanitized.replace(/^\s*[-*+]\s+/gm, '• ');
  sanitized = sanitized.replace(/^\s*\d+\.\s+/gm, '');

  // Remove excessive line breaks
  sanitized = sanitized.replace(/\n{3,}/g, '\n\n');

  // Remove leading/trailing whitespace
  sanitized = sanitized.trim();

  return sanitized;
};

export const formatEmailContent = (text) => {
  if (!text) return '';

  // First sanitize markdown
  let formatted = sanitizeMarkdownResponse(text);

  // Ensure proper email formatting
  formatted = formatted
    // Add proper spacing after greetings
    .replace(/(Dear|Hello|Hi)\s+([^,\n]+),?\s*\n/g, '$1 $2,\n\n')
    // Add spacing before closing
    .replace(
      /\n(Best regards|Sincerely|Thank you|Thanks)\s*,?\s*\n/g,
      '\n\n$1,\n'
    )
    // Ensure signature has proper spacing
    .replace(/\n([A-Z][a-zA-Z\s]+)?\s*$/g, '\n\n$1');

  // Remove any remaining markdown artifacts
  formatted = formatted
    .replace(/>\s*/g, '') // Remove quote markers
    .replace(/\|/g, '') // Remove table separators
    .replace(/---+/g, '') // Remove horizontal rules
    .replace(/={3,}/g, ''); // Remove equals signs

  return formatted.trim();
};

export const cleanAIResponse = (response) => {
  if (!response) return '';

  // Remove common AI disclaimers and meta-text
  let cleaned = response
    .replace(
      /^(Here's|Here is|I'll|I will|Let me|I can|I'd be happy to).*?[:]\s*/i,
      ''
    )
    .replace(/\b(AI|artificial intelligence|language model)\b/gi, '')
    .replace(/\b(I'm an AI|as an AI|AI assistant)\b/gi, '')
    .replace(/\b(Please note|Note that|Keep in mind)\b/gi, '');

  // Remove instruction-like text
  cleaned = cleaned
    .replace(/^(Please|Make sure to|Don't forget to|Remember to).*$/gm, '')
    .replace(/\(.*?customize.*?\)/gi, '')
    .replace(/\[.*?insert.*?\]/gi, '');

  // Apply markdown sanitization and email formatting
  return formatEmailContent(cleaned);
};
