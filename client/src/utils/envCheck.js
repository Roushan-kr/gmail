export const validateEnvironment = () => {
  const errors = [];

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

  // Check Client ID
  if (!clientId) {
    errors.push('VITE_GOOGLE_CLIENT_ID is not set in .env file');
  } else if (
    clientId === 'your_actual_client_id_here.apps.googleusercontent.com'
  ) {
    errors.push(
      'VITE_GOOGLE_CLIENT_ID is still set to the example value. Please use your actual Google Client ID.'
    );
  } else if (!clientId.includes('.apps.googleusercontent.com')) {
    errors.push(
      'VITE_GOOGLE_CLIENT_ID appears to be invalid (should end with .apps.googleusercontent.com)'
    );
  } else if (
    !clientId.match(/^\d+-[a-zA-Z0-9]+\.apps\.googleusercontent\.com$/)
  ) {
    errors.push(
      'VITE_GOOGLE_CLIENT_ID format is invalid. Should be like: 123456789-abcd1234.apps.googleusercontent.com'
    );
  }

  // Check API Key
  if (!apiKey) {
    errors.push('VITE_GOOGLE_API_KEY is not set in .env file');
  } else if (
    apiKey === 'your_actual_api_key_here' ||
    apiKey === 'AIzaSyABC123DEF456GHI789JKL'
  ) {
    errors.push(
      'VITE_GOOGLE_API_KEY is still set to the example value. Please use your actual Google API Key.'
    );
  } else if (!apiKey.startsWith('AIza')) {
    errors.push(
      'VITE_GOOGLE_API_KEY appears to be invalid (should start with AIza)'
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    config: {
      clientId: clientId ? `${clientId.substring(0, 15)}...` : 'Missing',
      apiKey: apiKey ? `${apiKey.substring(0, 10)}...` : 'Missing',
    },
  };
};

export const getSetupInstructions = () => {
  return `
🔧 Google API Setup Instructions:

1. Go to Google Cloud Console: https://console.cloud.google.com/
2. Create a new project or select an existing one
3. Enable the Gmail API:
   - Navigate to APIs & Services > Library
   - Search for "Gmail API" and click Enable

4. Configure OAuth Consent Screen:
   - Go to APIs & Services > OAuth consent screen
   - Choose "External" user type
   - Fill in required fields (App name, User support email, etc.)
   - Add your email to Test users if using External type

5. Create OAuth 2.0 Client ID:
   - Go to APIs & Services > Credentials
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Application type: Web application
   - Name: Gmail Clone (or any name you prefer)
   - Authorized JavaScript origins: http://localhost:3000
   - Authorized redirect URIs: http://localhost:3000
   - Copy the generated Client ID

6. Create API Key:
   - In the same Credentials page
   - Click "Create Credentials" > "API Key"
   - Copy the generated API Key

7. Update your .env file:
   VITE_GOOGLE_CLIENT_ID=your_copied_client_id
   VITE_GOOGLE_API_KEY=your_copied_api_key

8. Restart the development server: npm run dev

⚠️ Common Issues:
- Make sure OAuth consent screen is configured
- Verify authorized origins include http://localhost:3000
- Client ID should not be deleted or disabled
- API key should have Gmail API access
  `;
};
