/**
 * Cookie Manager for Gmail Clone App
 * Handles authentication tokens, user preferences, and session data
 */

export const cookieManager = {
  // Set a cookie with expiration
  set: (name, value, days = 7) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

    document.cookie = `${name}=${encodeURIComponent(
      value
    )};expires=${expires.toUTCString()};path=/;SameSite=Strict;Secure`;
  },

  // Get cookie value
  get: (name) => {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');

    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length, c.length));
      }
    }
    return null;
  },

  // Delete a cookie
  delete: (name) => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  },

  // Check if cookies are enabled
  isEnabled: () => {
    try {
      const testCookie = 'test_cookie_support';
      cookieManager.set(testCookie, 'test', 1);
      const enabled = cookieManager.get(testCookie) === 'test';
      cookieManager.delete(testCookie);
      return enabled;
    } catch (error) {
      return false;
    }
  },

  // Clear all app cookies
  clearAll: () => {
    const cookies = document.cookie.split(';');
    const appCookies = [
      'gmail_auth_token',
      'gmail_user_prefs',
      'gmail_session',
      'gmail_theme',
    ];

    appCookies.forEach((cookieName) => {
      cookieManager.delete(cookieName);
    });
  },
};

// Specific cookie functions for Gmail Clone
export const authCookies = {
  // Store authentication state
  setAuthToken: (token, expiresIn = 3600) => {
    const expiryDate = new Date();
    expiryDate.setSeconds(expiryDate.getSeconds() + expiresIn);

    cookieManager.set(
      'gmail_auth_token',
      JSON.stringify({
        token: token,
        expires: expiryDate.toISOString(),
      }),
      1
    ); // 1 day expiry
  },

  // Get authentication token
  getAuthToken: () => {
    try {
      const authData = cookieManager.get('gmail_auth_token');
      if (!authData) return null;

      const parsed = JSON.parse(authData);
      const now = new Date();
      const expires = new Date(parsed.expires);

      if (now > expires) {
        cookieManager.delete('gmail_auth_token');
        return null;
      }

      return parsed.token;
    } catch (error) {
      cookieManager.delete('gmail_auth_token');
      return null;
    }
  },

  // Clear auth token
  clearAuth: () => {
    cookieManager.delete('gmail_auth_token');
  },
};

export const userPreferences = {
  // Save user preferences
  setPreferences: (prefs) => {
    cookieManager.set('gmail_user_prefs', JSON.stringify(prefs), 30); // 30 days
  },

  // Get user preferences
  getPreferences: () => {
    try {
      const prefs = cookieManager.get('gmail_user_prefs');
      return prefs
        ? JSON.parse(prefs)
        : {
            theme: 'light',
            sidebarOpen: true,
            emailsPerPage: 25,
            autoSave: true,
            language: 'en',
          };
    } catch (error) {
      return {
        theme: 'light',
        sidebarOpen: true,
        emailsPerPage: 25,
        autoSave: true,
        language: 'en',
      };
    }
  },

  // Update specific preference
  updatePreference: (key, value) => {
    const current = userPreferences.getPreferences();
    current[key] = value;
    userPreferences.setPreferences(current);
  },
};
