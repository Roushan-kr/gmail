import { useState } from 'react';

const useApi = (urlObject) => {
    const [response, setResponse] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const call = async (payload, type) => {
        console.warn('useApi is deprecated. Use Gmail API functions directly.');
        setResponse(null);
        setError('This API is deprecated. Please use Gmail API functions.');
        return null;
    };

    return { call, response, error, isLoading };
};
export default useApi;