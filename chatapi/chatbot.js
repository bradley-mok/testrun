import { GoogleGenerativeAI } from '@google/generative-ai';
import { EXPO_PUBLIC_GEMINI_API_KEY } from '@env';

// Initialize the Gemini AI
const genAI = new GoogleGenerativeAI(EXPO_PUBLIC_GEMINI_API_KEY);

console.log('Gemini API Key loaded:', EXPO_PUBLIC_GEMINI_API_KEY ? 'Yes' : 'No');

export const sendMessageToChatGPT = async (message, context = '') => {
  try {
    const systemMessage = context 
      ? `You are an agricultural expert specializing in ${context}. Provide helpful, accurate farming advice in short, practical responses. Be specific and actionable. Keep responses under 300 words.`
      : 'You are an agricultural expert. Provide helpful, accurate farming advice in short, practical responses. Be specific and actionable. Keep responses under 300 words.';

    const prompt = `${systemMessage}\n\nUser question: ${message}`;

    // Get the generative model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7,
      }
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return response.text();

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    
    // Handle specific Gemini errors
    if (error.message?.includes('API_KEY') || error.message?.includes('API key')) {
      throw new Error('API key invalid or missing. Please check your configuration.');
    } else if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
      throw new Error('API quota exceeded. Please try again later.');
    } else if (error.message?.includes('PERMISSION_DENIED')) {
      throw new Error('Access denied. Please check your API permissions.');
    } else {
      throw new Error('AI service temporarily unavailable. Please try again later.');
    }
  }
};

export const analyzeCropImage = async (base64Image, context = '') => {
  try {
    // Use Gemini Vision for real image analysis
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp", // This model supports vision
      generationConfig: {
        maxOutputTokens: 800,
        temperature: 0.7,
      }
    });

    const prompt = `You are an agricultural expert. Analyze this crop/plant image and provide:

1. CROP IDENTIFICATION: What specific crop or plant is this? If unsure, suggest possibilities.
2. HEALTH ASSESSMENT: What visible problems, diseases, pests, or nutrient deficiencies do you see?
3. SYMPTOMS: Describe the specific visual symptoms supporting your diagnosis.
4. SOLUTIONS: Provide immediate and long-term solutions.
5. PREVENTION: How to prevent these issues in future.

${context ? `Context: The user thinks this might be related to ${context}.` : ''}

Be very specific, practical, and focus on what's actually visible in the image.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Image
        }
      }
    ]);

    const response = await result.response;
    return `🔍 **AI Crop Analysis**\n\n${response.text()}`;

  } catch (error) {
    console.error('Error analyzing crop image with Gemini Vision:', error);
    
    // Fallback to text-only analysis if vision fails
    return await analyzeCropImageFallback(context);
  }
};

// Fallback function for image analysis
const analyzeCropImageFallback = async (context = '') => {
  try {
    const prompt = `As an agricultural expert, provide comprehensive crop health advice for ${context || 'common crops'} including:
    - Common problems and diseases
    - Typical symptoms to look for
    - Practical solutions and treatments
    - Prevention tips
    Be specific and actionable.`;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7,
      }
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return `🌱 **Crop Health Advice**\n\n${response.text()}\n\n*For accurate analysis, please try the image scan again or describe what you see.*`;

  } catch (error) {
    console.error('Error in fallback analysis:', error);
    throw new Error('Image analysis unavailable. Please describe the issue in chat for help.');
  }
};