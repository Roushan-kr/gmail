export const debugGoogleAPI = () => {
  console.log('=== Google API Debug Info ===');
  console.log('Environment Variables:');
  console.log(
    'CLIENT_ID:',
    import.meta.env.VITE_GOOGLE_CLIENT_ID ? 'Set' : 'Missing'
  );
  console.log(
    'API_KEY:',
    import.meta.env.VITE_GOOGLE_API_KEY ? 'Set' : 'Missing'
  );

  console.log('Google APIs Status:');
  console.log('window.gapi:', typeof window.gapi);
  console.log('window.google:', typeof window.google);

  if (window.gapi) {
    console.log('gapi.client:', typeof window.gapi.client);
    console.log('gapi.client.getToken:', typeof window.gapi?.client?.getToken);

    try {
      if (
        window.gapi.client &&
        typeof window.gapi.client.getToken === 'function'
      ) {
        const token = window.gapi.client.getToken();
        console.log('Current token:', token ? 'Present' : 'None');
      } else {
        console.log('getToken method not available');
      }
    } catch (error) {
      console.log('Error getting token:', error.message);
    }
  }

  console.log('===========================');
};

export const testGoogleAPIs = async () => {
  try {
    if (!window.gapi || !window.gapi.client) {
      throw new Error('Google API client not available');
    }

    // Test if Gmail API is accessible
    const response = await window.gapi.client.gmail.users.getProfile({
      userId: 'me',
    });

    console.log('Gmail API test successful:', response);
    return true;
  } catch (error) {
    console.error('Gmail API test failed:', error);
    return false;
  }
};
