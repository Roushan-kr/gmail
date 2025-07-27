const AI_CONTEXT_KEY = 'gmail_clone_ai_context';
const MAX_CONTEXT_ENTRIES = 50;

export const saveAIContext = (contextData) => {
  try {
    const context = getAIContext();
    const newEntry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...contextData,
    };

    context.unshift(newEntry);

    // Keep only recent entries
    const limitedContext = context.slice(0, MAX_CONTEXT_ENTRIES);
    localStorage.setItem(AI_CONTEXT_KEY, JSON.stringify(limitedContext));

    return newEntry;
  } catch (error) {
    console.error('Error saving AI context:', error);
    return null;
  }
};

export const getAIContext = () => {
  try {
    const context = localStorage.getItem(AI_CONTEXT_KEY);
    return context ? JSON.parse(context) : [];
  } catch (error) {
    console.error('Error loading AI context:', error);
    return [];
  }
};

export const buildContextualPrompt = (
  originalEmail,
  userInstruction,
  resumeData
) => {
  const context = getAIContext();
  const recentInteractions = context.slice(0, 5); // Last 5 interactions

  let contextualInfo = '';

  if (recentInteractions.length > 0) {
    contextualInfo = `
Previous Email Interactions Context:
${recentInteractions
  .map(
    (interaction) =>
      `- ${interaction.type}: ${
        interaction.summary || interaction.emailSubject
      }`
  )
  .join('\n')}
`;
  }

  const resumeInfo = resumeData
    ? `
Candidate Profile:
Name: ${resumeData.fullName}
Education: ${resumeData.education}
Skills: ${resumeData.skills}
Experience: ${resumeData.experience}
Projects: ${resumeData.projects}
`
    : '';

  return `
${contextualInfo}

${resumeInfo}

Current Email:
From: ${originalEmail.from}
Subject: ${originalEmail.subject}
Body: ${originalEmail.body}

User Instruction: ${userInstruction}

Generate a professional email reply in PLAIN TEXT format (no markdown, no formatting). The reply should:
1. Be ready to send as-is in an email client
2. Use proper email etiquette and formatting
3. Be professional but conversational
4. Include appropriate greetings and closings
5. Maintain consistency with previous interactions
6. Leverage the candidate's background appropriately
7. Address the current email specifically

Do not include any markdown formatting, headers, bold text, or special characters. Write as if typing directly in an email compose window.
`;
};

export const clearAIContext = () => {
  try {
    localStorage.removeItem(AI_CONTEXT_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing AI context:', error);
    return false;
  }
};
