const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Get AI suggestion for a thought
 * @param {string} content - The thought content
 * @returns {string} - AI suggestion
 */
const getAISuggestion = async (content) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `As a mental health AI assistant, provide a supportive and helpful suggestion for this thought: "${content}"

and you have to give answer not just in one go. You have to give answer in a way such that you thinking it and than giving response

Response:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();

  } catch (error) {
    console.error('AI suggestion error:', error);
    return "I'm here to support you. Consider talking to a mental health professional for personalized guidance.";
  }
};

/**
 * Analyze mood from thought content
 * @param {string} content - The thought content
 * @returns {object} - Mood analysis with mood and confidence
 */
const getMoodAnalysis = async (content) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Analyze the mood expressed in this thought: "${content}"

Please respond with ONLY a JSON object in this exact format:
{
  "mood": "happy|sad|anxious|angry|neutral|excited|worried|calm|frustrated|grateful",
  "confidence": 0.85,
  "keywords": ["keyword1", "keyword2", "keyword3"]
}

Choose the most appropriate mood from the list above. Confidence should be between 0 and 1. Keywords should be 2-4 relevant emotional words.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    // Try to parse JSON response
    try {
      return JSON.parse(text);
    } catch (parseError) {
      // Fallback if JSON parsing fails
      return {
        mood: "neutral",
        confidence: 0.5,
        keywords: ["neutral"]
      };
    }

  } catch (error) {
    console.error('Mood analysis error:', error);
    return {
      mood: "neutral",
      confidence: 0.5,
      keywords: ["neutral"]
    };
  }
};

module.exports = {
  getAISuggestion,
  getMoodAnalysis
};

