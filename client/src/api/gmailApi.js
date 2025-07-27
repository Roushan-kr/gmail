const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const DISCOVERY_DOC =
  'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest';
const SCOPES =
  'https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly';

const TOKEN_STORAGE_KEY = 'gmail_clone_auth_token';
const TOKEN_EXPIRY_KEY = 'gmail_clone_token_expiry';

let gapi,
  tokenClient,
  isInitialized = false;

// Token management functions
const saveToken = (token) => {
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(token));
    // Set expiry time (tokens usually last 1 hour)
    const expiryTime = Date.now() + 3600 * 1000; // 1 hour from now
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
  } catch (error) {
    console.error('Error saving token:', error);
  }
};

const getStoredToken = () => {
  try {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);

    if (token && expiry) {
      const expiryTime = parseInt(expiry);
      if (Date.now() < expiryTime) {
        return JSON.parse(token);
      } else {
        // Token expired, remove it
        clearStoredToken();
      }
    }
  } catch (error) {
    console.error('Error retrieving token:', error);
  }
  return null;
};

const clearStoredToken = () => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
};

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
    console.log('Initializing Google API...');

    gapi.load('client', async () => {
      try {
        await gapi.client.init({
          apiKey: API_KEY,
          discoveryDocs: [DISCOVERY_DOC],
        });

        console.log('Google API Client initialized successfully');

        // Check for stored token and restore session
        const storedToken = getStoredToken();
        if (storedToken) {
          gapi.client.setToken(storedToken);
          console.log('Restored authentication from stored token');
        }

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
        reject(error);
      }
    });
  });
};

export const signIn = () => {
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      reject(
        new Error('Token client not initialized. Please refresh the page.')
      );
      return;
    }

    if (!isInitialized) {
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
        // Create token object with expiry
        const tokenData = {
          access_token: resp.access_token,
          expires_at: Math.floor(Date.now() / 1000) + (resp.expires_in || 3600),
        };

        // Set the access token
        gapi.client.setToken(tokenData);

        // Save token for persistence
        saveToken(tokenData);

        // Test the connection
        await gapi.client.gmail.users.getProfile({ userId: 'me' });

        console.log('Sign-in successful and token saved');
        resolve(resp);
      } catch (error) {
        console.error('Error setting token or testing connection:', error);
        clearStoredToken();
        reject(new Error('Failed to complete sign-in process'));
      }
    };

    // Check if user is already signed in with valid token
    const storedToken = getStoredToken();
    if (storedToken && isTokenValid(storedToken)) {
      console.log('Using existing valid token');
      resolve({ access_token: storedToken.access_token });
      return;
    }

    // Request new token
    if (storedToken) {
      // Try refresh first
      tokenClient.requestAccessToken({ prompt: '' });
    } else {
      // First time login
      tokenClient.requestAccessToken({ prompt: 'consent' });
    }
  });
};

export const isSignedIn = () => {
  if (!gapi || !gapi.client) {
    return false;
  }

  // Check stored token first
  const storedToken = getStoredToken();
  if (storedToken && isTokenValid(storedToken)) {
    // Ensure gapi has the token
    const currentToken = gapi.client.getToken();
    if (!currentToken || !currentToken.access_token) {
      gapi.client.setToken(storedToken);
    }
    return true;
  }

  // Check current gapi token
  const token = gapi.client.getToken();
  return token !== null && token.access_token && isTokenValid(token);
};

const isTokenValid = (token) => {
  if (!token || !token.expires_at) {
    return false;
  }
  // Add 5 minute buffer before expiry
  const bufferTime = 5 * 60; // 5 minutes in seconds
  return Date.now() / 1000 < token.expires_at - bufferTime;
};

export const signOut = () => {
  try {
    if (gapi && gapi.client) {
      const token = gapi.client.getToken();
      if (token !== null && token.access_token) {
        window.google.accounts.oauth2.revoke(token.access_token);
        gapi.client.setToken('');
      }
    }
    clearStoredToken();
    console.log('Sign out successful');
  } catch (error) {
    console.error('Error during sign out:', error);
    clearStoredToken(); // Clear even if revoke fails
  }
};

// Auto-refresh token before expiry
const autoRefreshToken = () => {
  const storedToken = getStoredToken();
  if (storedToken && tokenClient) {
    const timeUntilExpiry = storedToken.expires_at * 1000 - Date.now();
    const refreshTime = Math.max(timeUntilExpiry - 10 * 60 * 1000, 60000); // Refresh 10 minutes before expiry, but at least in 1 minute

    setTimeout(() => {
      if (isSignedIn()) {
        tokenClient.requestAccessToken({ prompt: '' });
      }
    }, refreshTime);
  }
};

// Start auto-refresh when initialized
export const startTokenRefresh = () => {
  autoRefreshToken();
  // Set up periodic refresh check every 30 minutes
  setInterval(autoRefreshToken, 30 * 60 * 1000);
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

export const sendEmail = async (to, subject, body, attachments = []) => {
  try {
    if (!gapi || !gapi.client || !gapi.client.gmail) {
      throw new Error('Gmail API not available');
    }

    // Create email message
    let email = [
      'Content-Type: text/plain; charset="UTF-8"\n',
      'MIME-Version: 1.0\n',
      `To: ${to}\n`,
      `Subject: ${subject}\n\n`,
      body,
    ].join('');

    // If there are attachments, create multipart message
    if (attachments && attachments.length > 0) {
      const boundary = '----=_NextPart_' + Date.now();

      email = [
        `Content-Type: multipart/mixed; boundary="${boundary}"\n`,
        'MIME-Version: 1.0\n',
        `To: ${to}\n`,
        `Subject: ${subject}\n\n`,
        `--${boundary}\n`,
        'Content-Type: text/plain; charset="UTF-8"\n\n',
        body,
        '\n',
      ].join('');

      // Add each attachment
      for (const attachment of attachments) {
        const fileData = await convertFileToBase64(attachment.file);
        email += [
          `--${boundary}\n`,
          `Content-Type: ${attachment.type}; name="${attachment.name}"\n`,
          'Content-Transfer-Encoding: base64\n',
          `Content-Disposition: attachment; filename="${attachment.name}"\n\n`,
          fileData,
          '\n',
        ].join('');
      }

      email += `--${boundary}--`;
    }

    // Encode the email
    const encodedEmail = btoa(unescape(encodeURIComponent(email)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const response = await gapi.client.gmail.users.messages.send({
      userId: 'me',
      resource: {
        raw: encodedEmail,
      },
    });

    console.log('Email sent successfully:', response);
    return response;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Helper function to convert file to base64
const convertFileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1]; // Remove data:type;base64, prefix
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
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
