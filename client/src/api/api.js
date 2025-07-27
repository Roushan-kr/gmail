// This file is no longer needed since we're using Gmail API directly
// Keep it for backward compatibility or remove imports that reference it

export const API_URL = 'http://localhost:3001';

// Deprecated - use gmailApi.js instead
const API_GMAIL = async (urlObject, payload, type) => {
  console.warn(
    'API_GMAIL is deprecated. Use Gmail API functions from gmailApi.js instead'
  );
  return null;
};

export default API_GMAIL;
