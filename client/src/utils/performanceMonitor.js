export const trackPageLoad = () => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    window.addEventListener('load', () => {
      const perfData = performance.getEntriesByType('navigation')[0];
      console.log('Page Load Performance:', {
        domContentLoaded:
          perfData.domContentLoadedEventEnd -
          perfData.domContentLoadedEventStart,
        loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
        totalTime: perfData.loadEventEnd - perfData.fetchStart,
      });
    });
  }
};

export const trackApiCall = async (apiName, apiCall) => {
  const startTime = performance.now();
  try {
    const result = await apiCall();
    const endTime = performance.now();
    console.log(`API Call ${apiName}:`, {
      duration: `${(endTime - startTime).toFixed(2)}ms`,
      status: 'success',
    });
    return result;
  } catch (error) {
    const endTime = performance.now();
    console.error(`API Call ${apiName}:`, {
      duration: `${(endTime - startTime).toFixed(2)}ms`,
      status: 'error',
      error: error.message,
    });
    throw error;
  }
};

export const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    try {
      import('web-vitals')
        .then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
          getCLS(onPerfEntry);
          getFID(onPerfEntry);
          getFCP(onPerfEntry);
          getLCP(onPerfEntry);
          getTTFB(onPerfEntry);
        })
        .catch((error) => {
          console.warn('web-vitals package not available:', error.message);
        });
    } catch (error) {
      console.warn('Performance monitoring not available:', error.message);
    }
  }
};
