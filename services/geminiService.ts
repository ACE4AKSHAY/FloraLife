
import { GoogleGenAI, Type } from "@google/genai";
import { ScanResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzePlantImage(base64Image: string): Promise<ScanResult> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image,
            },
          },
          {
            text: `Analyze this plant image. Identify if the plant is healthy or diseased and its current growth stage.
            Return a JSON object with the following structure:
            {
              "status": "Healthy" | "Diseased",
              "diseaseName": "Common name of the plant or disease",
              "confidence": 0-100,
              "description": "A positive affirmation or short clinical description",
              "growthStage": "Seedling" | "Vegetative" | "Flowering" | "Fruiting",
              "growthStageDescription": "A short sentence about the detected stage",
              "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"]
            }`
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING },
            diseaseName: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            description: { type: Type.STRING },
            growthStage: { type: Type.STRING },
            growthStageDescription: { type: Type.STRING },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["status", "diseaseName", "confidence", "description", "growthStage", "growthStageDescription", "recommendations"]
        }
      }
    });

    const result = JSON.parse(response.text);
    return {
      ...result,
      imageUrl: `data:image/jpeg;base64,${base64Image}`,
      timestamp: Date.now()
    };
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
}

export async function generateSpeciesInfo(plantName: string): Promise<any> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a plant profile for "${plantName}". Include scientific name, difficulty (easy/medium/hard), estimated duration in days, and growth stages (Seed, Germination, Seedling, Vegetative, Flowering, Fruiting, Harvest) with day ranges and instructions. Return JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          scientificName: { type: Type.STRING },
          difficulty: { type: Type.STRING },
          durationDays: { type: Type.NUMBER },
          description: { type: Type.STRING },
          stages: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                stage: { type: Type.STRING },
                days: { type: Type.STRING },
                instruction: { type: Type.STRING }
              }
            }
          }
        }
      }
    }
  });
  return JSON.parse(response.text);
}
