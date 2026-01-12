
import { GoogleGenAI } from "@google/genai";

// According to guidance: "Generate images using gemini-2.5-flash-image by default"
const MODEL_NAME = 'gemini-2.5-flash-image'; 

export const generateImageFromPrompt = async (
  prompt: string, 
  sketchBase64?: string, 
  referenceBase64?: string,
  useReference?: boolean
): Promise<string | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const parts: any[] = [{ text: prompt }];

    // 1. Handle Reference Image (if provided and enabled)
    if (referenceBase64 && useReference) {
      const refData = referenceBase64.split(',')[1] || referenceBase64;
      parts.push({
        inlineData: {
          mimeType: 'image/png',
          data: refData
        }
      });
      // Adjust prompt to acknowledge the reference
      parts[0].text = `Use the provided reference image for style, color palette, and character details. ${parts[0].text}`;
    }

    // 2. Handle Sketch (if provided)
    if (sketchBase64) {
      const sketchData = sketchBase64.split(',')[1] || sketchBase64;
      parts.push({
        inlineData: {
          mimeType: 'image/png',
          data: sketchData
        }
      });
      // Enhance prompt for sketch transformation
      parts[0].text = `Act as an AI Sketch Assistant. Transform this rough hand-drawn sketch into a high-quality, polished render while strictly following the original composition and layout. ${parts[0].text}`;
    }

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: parts
      },
    });

    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    
    return null;

  } catch (error) {
    console.error("Gemini Image Generation Error:", error);
    throw error;
  }
};
