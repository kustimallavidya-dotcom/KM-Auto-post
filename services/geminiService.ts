
import { GoogleGenAI, Type } from "@google/genai";
import { PostingData, GeneratedContent, Language } from "../types";

export const generateKushtiContent = async (data: PostingData): Promise<GeneratedContent> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `
    You are an expert social media manager for Indian Kushti (Wrestling).
    Your task is to generate platform-specific content for a video.
    Primary Keyword: ${data.primaryKeyword}
    Event: ${data.eventName || 'N/A'}
    Location: ${data.location || 'N/A'}
    Date: ${data.date || 'N/A'}
    Target Language: ${data.language}
    
    Guidelines:
    - YouTube Shorts: Title < 100 chars, SEO Desc, Tags (plain words, NO hashtags).
    - Facebook Reels: Caption (engaging, ${data.language}), Hashtags.
    - Instagram Reels: Caption (short, emotional, ${data.language}), up to 30 Hashtags.
    - WhatsApp: Status text (very short), Channel text (detailed + hashtags).
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate social media content for this Kushti video based on the provided details. Use ${data.language} as the primary storytelling language.`,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          youtube: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["title", "description", "tags"]
          },
          facebook: {
            type: Type.OBJECT,
            properties: {
              caption: { type: Type.STRING },
              hashtags: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["caption", "hashtags"]
          },
          instagram: {
            type: Type.OBJECT,
            properties: {
              caption: { type: Type.STRING },
              hashtags: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["caption", "hashtags"]
          },
          whatsapp: {
            type: Type.OBJECT,
            properties: {
              statusText: { type: Type.STRING },
              channelText: { type: Type.STRING }
            },
            required: ["statusText", "channelText"]
          }
        },
        required: ["youtube", "facebook", "instagram", "whatsapp"]
      }
    }
  });

  return JSON.parse(response.text);
};
