// These URLs are no longer used as we're using Gmail API directly
// Keeping for compatibility with existing hooks
export const API_URLS = {
  sendEmail: {
    endpoint: 'gmail-send',
    method: 'GMAIL_API',
  },
  getEmail: {
    endpoint: 'gmail-get',
    method: 'GMAIL_API',
  },
  trashEmail: {
    endpoint: 'gmail-trash',
    method: 'GMAIL_API',
  },
  starredEmail: {
    endpoint: 'gmail-star',
    method: 'GMAIL_API',
  },
  deleteEmail: {
    endpoint: 'gmail-delete',
    method: 'GMAIL_API',
  },
};
