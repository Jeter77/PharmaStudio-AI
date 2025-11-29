import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ImageStyle } from "../types";

const apiKey = process.env.API_KEY || '';

// We use a factory function to ensure we get a fresh instance with the key if needed,
// though mostly we just instantiate once if the key is static in env.
const getAI = () => new GoogleGenAI({ apiKey });

export const generateMedicineImage = async (medicineName: string, style: ImageStyle): Promise<string> => {
  const ai = getAI();
  
  let promptStyle = "";
  switch (style) {
    case ImageStyle.RUSTIC:
      promptStyle = "Dark wooden background, moody cinematic lighting, rustic pharmaceutical aesthetic, high contrast, elegant glass bottles, dried herbs in background, 4k resolution, photorealistic.";
      break;
    case ImageStyle.MODERN:
      promptStyle = "Bright clinical studio lighting, pure white background, clean minimalist design, modern packaging, sterile environment, sharp focus, 4k resolution, high key photography.";
      break;
    case ImageStyle.SOCIAL:
      promptStyle = "Top-down flat lay view, colorful pop pastel background, instagram aesthetic, trendy composition, soft shadows, balanced props, high quality marketing asset.";
      break;
  }

  const prompt = `A professional pharmaceutical product photography of ${medicineName}. ${promptStyle} The image should look like a high-end commercial shot.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          { text: prompt }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: "1K" // Defaulting to 1K for speed/reliability in this demo context, could be 2K/4K
        }
      }
    });

    // Extract image
    // The response structure for image generation usually puts the image in the parts
    for (const candidate of response.candidates || []) {
      for (const part of candidate.content?.parts || []) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    
    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Gemini Image Gen Error:", error);
    throw error;
  }
};

export const chatWithPharmacist = async (history: {role: string, parts: {text: string}[]}[], message: string): Promise<string> => {
  const ai = getAI();
  
  try {
    const chat = ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: "Você é um assistente farmacêutico virtual altamente qualificado e prestativo. Seu objetivo é ajudar farmacêuticos e pacientes com informações sobre medicamentos, interações medicamentosas, posologia, categorias terapêuticas e conselhos gerais de saúde. Seja profissional, preciso e empático. Se não souber uma informação crítica ou se houver risco grave, recomende consultar um médico especialista.",
        temperature: 0.7,
      },
      history: history
    });

    const result: GenerateContentResponse = await chat.sendMessage({ message });
    return result.text || "Desculpe, não consegui processar sua resposta.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    throw error;
  }
};
