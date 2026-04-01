import fs from "fs";
import { genAI } from "./config.js";
import { recordUsage, recordError } from "./usage.js";
import { Type } from "@google/genai";

const MODEL = "gemini-3-flash-preview";

/**
 * Core Ad-Intelligence Analysis
 * Detects, transcribes, and categorizes advertisements.
 */
export async function analyzeCommercials(filePath: string) {
  const audioData = fs.readFileSync(filePath);
  const base64Audio = audioData.toString("base64");

  const prompt = `
    You are the "Amharic Ad-Intelligence Agent."
    Analyze this radio broadcast and extract:
    1. Advertisements: Brand (Amharic/English), Campaign, Industry, Hook, and Call to Action.
    2. Music & Non-Speech: Detect music, cheering (jubilation), applause, or background noise. 
       For music, provide a deep analysis:
       - Genre & Sub-genre (e.g., Ethio-Jazz, Traditional Tizita, Modern Afrobeats).
       - Mood & Energy level (e.g., Melancholic, High-energy, Relaxed).
       - Instruments detected (e.g., Masenqo, Krar, Saxophone, Synthesizer).
       - Tempo (BPM estimate or description like Slow, Moderate, Fast).
       - Vocal presence (Instrumental, Male/Female vocals, Choir).
       - Artist/Song identification if possible.
       For "jubel" (cheering/applause), describe the intensity, duration, and likely context.
    3. People & Organizations: Extract names of people (hosts, guests, celebrities) and organizations mentioned.
       Provide names in both Amharic and English.
       Include the specific context or reason they were mentioned.
    4. Summary: A brief overview of the content.
    5. Transcription: A high-fidelity, word-for-word transcription of the most important segments. 
       Include markers for [MUSIC], [CHEERING], [APPLAUSE] where they occur.
    
    Focus on Amharic/Amhinglish linguistic nuances. Ensure all names and brands are captured in both Amharic and English scripts.
  `;

  try {
    console.log(`Starting AI analysis for: ${filePath}`);
    const response = await genAI.models.generateContent({
      model: MODEL,
      contents: [
        { text: prompt },
        { inlineData: { mimeType: "audio/mpeg", data: base64Audio } },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            transcription: { type: Type.STRING },
            ads: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  start: { type: Type.STRING },
                  end: { type: Type.STRING },
                  duration_seconds: { type: Type.NUMBER },
                  brandAmharic: { type: Type.STRING },
                  brandEnglish: { type: Type.STRING },
                  campaign: { type: Type.STRING },
                  industry: { type: Type.STRING },
                  hook: { type: Type.STRING },
                  contact: { type: Type.STRING },
                  isLiveRead: { type: Type.BOOLEAN },
                  content: { type: Type.STRING }
                }
              }
            },
            music_and_non_speech: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, description: "music, cheering, applause, background_noise" },
                  start: { type: Type.STRING },
                  end: { type: Type.STRING },
                  description: { type: Type.STRING },
                  genre: { type: Type.STRING },
                  mood: { type: Type.STRING },
                  instruments: { type: Type.ARRAY, items: { type: Type.STRING } },
                  tempo: { type: Type.STRING },
                  vocals: { type: Type.STRING },
                  artist: { type: Type.STRING }
                }
              }
            },
            entities: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  nameAmharic: { type: Type.STRING },
                  nameEnglish: { type: Type.STRING },
                  type: { type: Type.STRING, description: "person, organization, place" },
                  context: { type: Type.STRING }
                }
              }
            }
          }
        }
      },
    });

    console.log("AI Response received successfully");
    recordUsage(response.usageMetadata);
    const result = JSON.parse(response.text || "{}");
    console.log(`Analysis result: ${JSON.stringify(result).substring(0, 100)}...`);
    return result;
  } catch (error: any) {
    console.error("AI Analysis Error:", error.message);
    recordError(error.message);
    throw error;
  }
}

/**
 * Language & Linguistic Detector
 * Identifies languages, dialects, and code-switching (Amhinglish).
 */
export async function detectLanguage(filePath: string) {
  const audioData = fs.readFileSync(filePath);
  const base64Audio = audioData.toString("base64");

  const prompt = `
    Analyze the linguistic properties of this audio.
    Identify:
    1. Primary Language (e.g., Amharic, Oromiffa, English).
    2. Dialect/Accent details.
    3. Code-switching frequency (Amhinglish).
    4. Formality level (Formal vs. Colloquial).
  `;

  try {
    const response = await genAI.models.generateContent({
      model: MODEL,
      contents: [
        { text: prompt },
        { inlineData: { mimeType: "audio/mpeg", data: base64Audio } },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            primaryLanguage: { type: Type.STRING },
            languagesDetected: { type: Type.ARRAY, items: { type: Type.STRING } },
            codeSwitchingScore: { type: Type.NUMBER, description: "0-10 scale" },
            formality: { type: Type.STRING },
            linguisticNotes: { type: Type.STRING }
          }
        }
      },
    });

    recordUsage(response.usageMetadata);
    return JSON.parse(response.text || "{}");
  } catch (error: any) {
    recordError(error.message);
    throw error;
  }
}

/**
 * AI-Powered Semantic Search
 * Uses AI to find relevant content based on a natural language query.
 */
export async function aiSearch(query: string, context: string) {
  const prompt = `
    Natural Language Query: "${query}"
    Context Data: ${context}

    Task: Find the most relevant records from the context that match the query.
    Explain why they match.
  `;

  try {
    const response = await genAI.models.generateContent({
      model: MODEL,
      contents: [{ text: prompt }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matches: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  recordId: { type: Type.STRING },
                  relevanceScore: { type: Type.NUMBER },
                  reason: { type: Type.STRING }
                }
              }
            }
          }
        }
      },
    });

    recordUsage(response.usageMetadata);
    return JSON.parse(response.text || "{}");
  } catch (error: any) {
    recordError(error.message);
    throw error;
  }
}

/**
 * Structured Data Extraction (File to Database/JSON)
 * Converts raw audio content into a strictly typed JSON structure.
 */
export async function extractToStructuredData(filePath: string) {
  const audioData = fs.readFileSync(filePath);
  const base64Audio = audioData.toString("base64");

  const prompt = `
    Extract all structured data from this radio broadcast.
    Identify:
    1. Programs/Segments.
    2. Music tracks (Title, Artist, Genre).
    3. Key Topics discussed.
    4. Named Entities (People, Places, Organizations).
  `;

  try {
    const response = await genAI.models.generateContent({
      model: MODEL,
      contents: [
        { text: prompt },
        { inlineData: { mimeType: "audio/mpeg", data: base64Audio } },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            segments: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  type: { type: Type.STRING },
                  summary: { type: Type.STRING }
                }
              }
            },
            music: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  artist: { type: Type.STRING },
                  genre: { type: Type.STRING }
                }
              }
            },
            entities: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  type: { type: Type.STRING }
                }
              }
            }
          }
        }
      },
    });

    recordUsage(response.usageMetadata);
    return JSON.parse(response.text || "{}");
  } catch (error: any) {
    recordError(error.message);
    throw error;
  }
}

/**
 * Generate Embeddings for Vector Search
 */
export async function generateEmbeddings(text: string) {
  try {
    const result = await genAI.models.embedContent({
      model: "gemini-embedding-2-preview",
      contents: [text],
    });
    return result.embeddings[0].values;
  } catch (error: any) {
    console.error("Embedding Generation Error:", error.message);
    throw error;
  }
}
