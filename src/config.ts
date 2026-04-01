// API Configuration
// This will use the environment variable set in Vercel or default to localhost
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Gemini API Key for frontend AI analysis
export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
