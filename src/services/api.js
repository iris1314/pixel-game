const API_URL = import.meta.env.VITE_GOOGLE_APP_SCRIPT_URL;

export const quizService = {
  fetchQuestions: async (count) => {
    try {
      const response = await fetch(`${API_URL}?count=${count}`);
      if (!response.ok) throw new Error('Failed to fetch questions');
      return await response.json();
    } catch (error) {
      console.error('Error fetching questions:', error);
      throw error;
    }
  },

  submitAnswers: async (userId, answers, totalQuestions, passThreshold) => {
    try {
      const payload = JSON.stringify({
        userId,
        answers,
        totalQuestions,
        passThreshold
      });
      const response = await fetch(`${API_URL}?action=submit&data=${encodeURIComponent(payload)}`);
      if (!response.ok) throw new Error('Failed to submit answers');
      return await response.json();
    } catch (error) {
      console.error('Error submitting answers:', error);
      throw error;
    }
  },

  getDiceBearUrl: (seed) => {
    return `https://api.dicebear.com/7.x/pixel-art/svg?seed=${seed}&backgroundColor=bada55,ffdfbf,ffd5dc,ffeb33`;
  }
};
