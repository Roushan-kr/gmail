import { useState, useCallback } from 'react';
import * as gmailApi from '../api/gmailApi';

const useGmailApi = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const execute = useCallback(async (operation, ...args) => {
        try {
            setLoading(true);
            setError(null);
            const result = await operation(...args);
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        getEmails: (query, maxResults) => execute(gmailApi.getEmails, query, maxResults),
        sendEmail: (to, subject, body) => execute(gmailApi.sendEmail, to, subject, body),
        starEmail: (messageId, star) => execute(gmailApi.starEmail, messageId, star),
        trashEmail: (messageId) => execute(gmailApi.trashEmail, messageId),
        deleteEmail: (messageId) => execute(gmailApi.deleteEmail, messageId),
    };
};

export default useGmailApi;
