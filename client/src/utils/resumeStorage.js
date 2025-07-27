const RESUME_STORAGE_KEY = 'gmail_clone_resume_data';
const RESUME_HISTORY_KEY = 'gmail_clone_resume_history';

export const saveResumeData = (resumeData) => {
  try {
    const dataToSave = {
      ...resumeData,
      lastUpdated: new Date().toISOString(),
      id: Date.now(),
    };

    localStorage.setItem(RESUME_STORAGE_KEY, JSON.stringify(dataToSave));

    // Also save to history for version control
    const history = getResumeHistory();
    history.unshift(dataToSave);

    // Keep only last 10 versions
    const limitedHistory = history.slice(0, 10);
    localStorage.setItem(RESUME_HISTORY_KEY, JSON.stringify(limitedHistory));

    return dataToSave;
  } catch (error) {
    console.error('Error saving resume data:', error);
    return null;
  }
};

export const getResumeData = () => {
  try {
    const data = localStorage.getItem(RESUME_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading resume data:', error);
    return null;
  }
};

export const getResumeHistory = () => {
  try {
    const history = localStorage.getItem(RESUME_HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error loading resume history:', error);
    return [];
  }
};

export const exportResumeData = () => {
  const data = getResumeData();
  if (data) {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `resume_data_${
      new Date().toISOString().split('T')[0]
    }.json`;
    link.click();

    URL.revokeObjectURL(url);
  }
};
