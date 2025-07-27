const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const DISCOVERY_DOC =
  'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest';
const SCOPES =
  'https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly';

let gapi,
  tokenClient,
  isInitialized = false;

export const initializeGapi = async () => {
  return new Promise((resolve, reject) => {
    // Validate API credentials
    if (
      !CLIENT_ID ||
      CLIENT_ID === 'your_actual_client_id_here.apps.googleusercontent.com'
    ) {
      reject(
        new Error(
          'Please replace VITE_GOOGLE_CLIENT_ID with your actual Google Client ID from Google Cloud Console'
        )
      );
      return;
    }

    if (
      !API_KEY ||
      API_KEY === 'your_actual_api_key_here' ||
      API_KEY === 'AIzaSyABC123DEF456GHI789JKL'
    ) {
      reject(
        new Error(
          'Please replace VITE_GOOGLE_API_KEY with your actual Google API Key from Google Cloud Console'
        )
      );
      return;
    }

    // Validate OAuth Client ID format
    if (!CLIENT_ID.match(/^\d+-[a-zA-Z0-9]+\.apps\.googleusercontent\.com$/)) {
      reject(
        new Error(
          'Invalid OAuth Client ID format. It should look like: 123456789-abcd1234.apps.googleusercontent.com'
        )
      );
      return;
    }

    if (!window.gapi) {
      reject(
        new Error(
          'Google API script not loaded. Please check your internet connection.'
        )
      );
      return;
    }

    gapi = window.gapi;
    console.log('Initializing Google API with credentials...');

    gapi.load('client', async () => {
      try {
        await gapi.client.init({
          apiKey: API_KEY,
          discoveryDocs: [DISCOVERY_DOC],
        });

        console.log('Google API Client initialized successfully');

        // Wait for Google Identity Services
        let attempts = 0;
        const maxAttempts = 20;

        const waitForGIS = () => {
          return new Promise((gisResolve, gisReject) => {
            const checkGIS = () => {
              attempts++;
              if (
                window.google &&
                window.google.accounts &&
                window.google.accounts.oauth2
              ) {
                gisResolve();
              } else if (attempts >= maxAttempts) {
                gisReject(new Error('Google Identity Services not available'));
              } else {
                setTimeout(checkGIS, 100);
              }
            };
            checkGIS();
          });
        };

        await waitForGIS();

        try {
          tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: '', // defined later
          });
          console.log('OAuth2 token client initialized');
        } catch (tokenError) {
          if (tokenError.message.includes('OAuth client was not found')) {
            throw new Error(`OAuth Client ID not found. Please verify:
1. Your Client ID is correct: ${CLIENT_ID}
2. OAuth consent screen is configured
3. Your domain (http://localhost:3000) is added to authorized origins
4. The OAuth Client ID is enabled and not deleted`);
          }
          throw tokenError;
        }

        isInitialized = true;
        resolve();
      } catch (error) {
        console.error('Failed to initialize GAPI:', error);

        if (
          error.message.includes('400') ||
          error.message.includes('invalid')
        ) {
          reject(
            new Error(
              'Invalid API key. Please check your Google API key in the .env file.'
            )
          );
        } else if (error.message.includes('OAuth client was not found')) {
          reject(
            new Error(
              `OAuth Client ID "${CLIENT_ID}" was not found. Please check your Google Cloud Console setup.`
            )
          );
        } else {
          reject(error);
        }
      }
    });
  });
};

export const isSignedIn = () => {
  try {
    if (!gapi || !gapi.client || typeof gapi.client.getToken !== 'function') {
      return false;
    }

    const token = gapi.client.getToken();
    return token !== null && token.access_token && !isTokenExpired(token);
  } catch (error) {
    console.error('Error checking sign-in status:', error);
    return false;
  }
};

export const signIn = () => {
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      reject(
        new Error('Token client not initialized. Please refresh the page.')
      );
      return;
    }

    if (!isInitialized || !gapi || !gapi.client) {
      reject(new Error('Google API not initialized. Please refresh the page.'));
      return;
    }

    tokenClient.callback = async (resp) => {
      if (resp.error !== undefined) {
        console.error('OAuth error:', resp.error);
        if (resp.error === 'popup_closed_by_user') {
          reject(new Error('Sign-in cancelled by user'));
        } else if (resp.error === 'access_denied') {
          reject(
            new Error('Access denied. Please grant the required permissions.')
          );
        } else {
          reject(new Error(`Sign-in failed: ${resp.error}`));
        }
        return;
      }

      try {
        // Ensure gapi.client is available before setting token
        if (!gapi.client || typeof gapi.client.setToken !== 'function') {
          throw new Error('Google API client not properly initialized');
        }

        // Set the access token
        gapi.client.setToken({ access_token: resp.access_token });

        // Test the connection by making a simple API call
        await gapi.client.gmail.users.getProfile({ userId: 'me' });

        console.log('Sign-in successful');
        resolve(resp);
      } catch (error) {
        console.error('Error setting token or testing connection:', error);
        reject(new Error('Failed to complete sign-in process'));
      }
    };

    // Check if user is already signed in
    try {
      const existingToken = gapi.client.getToken();
      if (existingToken !== null && existingToken.access_token) {
        tokenClient.requestAccessToken({ prompt: '' });
      } else {
        tokenClient.requestAccessToken({ prompt: 'consent' });
      }
    } catch (error) {
      console.error('Error checking existing token:', error);
      tokenClient.requestAccessToken({ prompt: 'consent' });
    }
  });
};

export const signOut = () => {
  try {
    if (gapi && gapi.client && typeof gapi.client.getToken === 'function') {
      const token = gapi.client.getToken();
      if (token !== null) {
        window.google.accounts.oauth2.revoke(token.access_token);
        gapi.client.setToken('');
      }
    }
  } catch (error) {
    console.error('Error during sign out:', error);
  }
};

// Helper function to check if token is expired
const isTokenExpired = (token) => {
  if (!token || !token.expires_at) {
    return false;
  }
  return Date.now() >= token.expires_at * 1000;
};

export const getEmails = async (query = '', maxResults = 50) => {
  try {
    if (!isSignedIn()) {
      throw new Error('User not signed in');
    }

    const response = await gapi.client.gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: maxResults,
    });

    const messages = response.result.messages || [];

    if (messages.length === 0) {
      return [];
    }

    const emailPromises = messages.slice(0, 20).map((message) =>
      gapi.client.gmail.users.messages.get({
        userId: 'me',
        id: message.id,
        format: 'full',
      })
    );

    const emails = await Promise.all(emailPromises);
    return emails.map((email) => parseGmailMessage(email.result));
  } catch (error) {
    console.error('Error fetching emails:', error);
    throw error;
  }
};

export const sendEmail = async (to, subject, body) => {
  try {
    if (!isSignedIn()) {
      throw new Error('User not signed in');
    }

    const email = [
      'Content-Type: text/plain; charset="UTF-8"\r\n',
      'MIME-Version: 1.0\r\n',
      `To: ${to}\r\n`,
      `Subject: ${subject}\r\n\r\n`,
      body,
    ].join('');

    const base64EncodedEmail = btoa(unescape(encodeURIComponent(email)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const response = await gapi.client.gmail.users.messages.send({
      userId: 'me',
      resource: {
        raw: base64EncodedEmail,
      },
    });

    return response;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

export const starEmail = async (messageId, star = true) => {
  try {
    if (!isSignedIn()) {
      throw new Error('User not signed in');
    }

    const response = await gapi.client.gmail.users.messages.modify({
      userId: 'me',
      id: messageId,
      resource: {
        addLabelIds: star ? ['STARRED'] : [],
        removeLabelIds: star ? [] : ['STARRED'],
      },
    });
    return response;
  } catch (error) {
    console.error('Error starring email:', error);
    throw error;
  }
};

export const trashEmail = async (messageId) => {
  try {
    if (!isSignedIn()) {
      throw new Error('User not signed in');
    }

    const response = await gapi.client.gmail.users.messages.trash({
      userId: 'me',
      id: messageId,
    });
    return response;
  } catch (error) {
    console.error('Error trashing email:', error);
    throw error;
  }
};

export const deleteEmail = async (messageId) => {
  try {
    if (!isSignedIn()) {
      throw new Error('User not signed in');
    }

    const response = await gapi.client.gmail.users.messages.delete({
      userId: 'me',
      id: messageId,
    });
    return response;
  } catch (error) {
    console.error('Error deleting email:', error);
    throw error;
  }
};

const parseGmailMessage = (message) => {
  const headers = message.payload?.headers || [];
  const getHeader = (name) => {
    const header = headers.find(
      (h) => h.name.toLowerCase() === name.toLowerCase()
    );
    return header ? header.value : '';
  };

  let body = '';

  const extractBody = (payload) => {
    if (payload.body?.data) {
      return decodeBase64(payload.body.data);
    }

    if (payload.parts) {
      for (const part of payload.parts) {
        // Look for text/plain first, then text/html
        if (part.mimeType === 'text/plain' && part.body?.data) {
          return decodeBase64(part.body.data);
        }
      }

      // If no plain text, try HTML and strip tags
      for (const part of payload.parts) {
        if (part.mimeType === 'text/html' && part.body?.data) {
          const htmlContent = decodeBase64(part.body.data);
          return stripHtmlTags(htmlContent);
        }

        // Check nested parts
        if (part.parts) {
          const nestedBody = extractBody(part);
          if (nestedBody) return nestedBody;
        }
      }
    }

    return '';
  };

  body = extractBody(message.payload);

  const fromHeader = getHeader('From');
  const toHeader = getHeader('To');
  const dateHeader = getHeader('Date');

  // Extract name and email from "Name <email@domain.com>" format
  const extractNameAndEmail = (headerValue) => {
    if (!headerValue) return { name: 'Unknown', email: '' };

    const match =
      headerValue.match(/^(.*?)\s*<(.+)>$/) || headerValue.match(/^(.+)$/);
    if (match) {
      if (match[2]) {
        // Format: "Name <email>"
        return {
          name: match[1].trim().replace(/"/g, '') || match[2].split('@')[0],
          email: match[2].trim(),
        };
      } else {
        // Format: "email" only
        return {
          name: match[1].split('@')[0],
          email: match[1].trim(),
        };
      }
    }
    return { name: 'Unknown', email: '' };
  };

  const fromData = extractNameAndEmail(fromHeader);
  const toData = extractNameAndEmail(toHeader);

  // Parse date
  let parsedDate;
  try {
    parsedDate = dateHeader
      ? new Date(dateHeader)
      : new Date(parseInt(message.internalDate));
  } catch {
    parsedDate = new Date(parseInt(message.internalDate));
  }

  return {
    _id: message.id,
    id: message.id,
    to: toData.email,
    from: fromHeader,
    subject: getHeader('Subject') || '(no subject)',
    body: cleanEmailBody(body),
    date: parsedDate,
    name: fromData.name,
    starred: message.labelIds?.includes('STARRED') || false,
    bin: message.labelIds?.includes('TRASH') || false,
    type: determineEmailType(message.labelIds || []),
  };
};

// Helper function to decode base64 URL-safe strings
const decodeBase64 = (data) => {
  try {
    const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
    const padding = base64.length % 4;
    const paddedBase64 = padding ? base64 + '='.repeat(4 - padding) : base64;
    return decodeURIComponent(escape(atob(paddedBase64)));
  } catch (error) {
    console.error('Error decoding base64:', error);
    return '';
  }
};

// Helper function to strip HTML tags
const stripHtmlTags = (html) => {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
};

// Helper function to clean email body
const cleanEmailBody = (body) => {
  if (!body) return '';

  // Remove excessive whitespace and line breaks
  let cleaned = body
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // Remove common email signatures and footers
  const signatureMarkers = [
    '--',
    'Sent from my iPhone',
    'Sent from my Android',
    'Get Outlook for',
    'Virus-free',
  ];

  signatureMarkers.forEach((marker) => {
    const index = cleaned.indexOf(marker);
    if (index !== -1) {
      cleaned = cleaned.substring(0, index).trim();
    }
  });

  return cleaned;
};

// Helper function to determine email type
const determineEmailType = (labelIds) => {
  if (labelIds.includes('SENT')) return 'sent';
  if (labelIds.includes('DRAFT')) return 'drafts';
  if (labelIds.includes('TRASH')) return 'bin';
  return 'inbox';
};
