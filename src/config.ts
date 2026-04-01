// In production (Vercel), API calls go directly to the Google Cloud backend.
// In development, Vite proxies /api to localhost:3000.
export const API_URL = import.meta.env.VITE_API_URL || '';

export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
