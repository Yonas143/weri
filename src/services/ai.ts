import { GoogleGenAI, Type } from "@google/genai";

// The platform automatically injects process.env.GEMINI_API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const MODEL = "gemini-3-flash-preview";

/**
 * Converts a Blob to a base64 string
 */
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(",")[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Specialized Ad-Intelligence Analysis (Frontend)
 */
export async function analyzeCommercialsFrontend(audioUrl: string) {
  try {
    const response = await fetch(audioUrl);
    const blob = await response.blob();
    const base64Audio = await blobToBase64(blob);

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
      5. Transcription: A high-fidelity, word-for-word transcription of the ENTIRE recording. Do not summarize or skip segments. Include markers for [MUSIC], [CHEERING], [APPLAUSE] where they occur.
      
      Focus on Amharic/Amhinglish linguistic nuances. Ensure all names and brands are captured in both Amharic and English scripts.
    `;

    const result = await ai.models.generateContent({
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

    return JSON.parse(result.text || "{}");
  } catch (error: any) {
    console.error("Frontend AI Analysis Error:", error);
    throw error;
  }
}

/**
 * Language & Linguistic Detector (Frontend)
 */
export async function detectLanguageFrontend(audioUrl: string) {
  try {
    const response = await fetch(audioUrl);
    const blob = await response.blob();
    const base64Audio = await blobToBase64(blob);

    const prompt = `
      Analyze the linguistic properties of this audio.
      Identify:
      1. Primary Language (e.g., Amharic, Oromiffa, English).
      2. Dialect/Accent details.
      3. Code-switching frequency (Amhinglish).
      4. Formality level (Formal vs. Colloquial).
    `;

    const result = await ai.models.generateContent({
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

    return JSON.parse(result.text || "{}");
  } catch (error: any) {
    console.error("Frontend Language Detection Error:", error);
    throw error;
  }
}

/**
 * Generate Embeddings (Frontend)
 */
export async function generateEmbeddingsFrontend(text: string) {
  try {
    const result = await ai.models.embedContent({
      model: "gemini-embedding-2-preview",
      contents: [text],
    });
    return result.embeddings[0].values;
  } catch (error: any) {
    console.error("Frontend Embedding Error:", error);
    throw error;
  }
}
