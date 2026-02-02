
import { GoogleGenAI, Type, GenerateContentParameters } from "@google/genai";
import { ScanResult, ShopProduct } from "../types";

/**
 * Model fallback chain following the latest Gemini model guidelines.
 */
const MODEL_FALLBACK_CHAIN = [
  'gemini-3-pro-preview',
  'gemini-3-flash-preview',
  'gemini-flash-lite-latest'
];

async function callGeminiWithFallback(params: Omit<GenerateContentParameters, 'model'>): Promise<any> {
  // Always use process.env.API_KEY directly for initialization as per guidelines.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  let lastError = null;

  for (const modelName of MODEL_FALLBACK_CHAIN) {
    try {
      const response = await ai.models.generateContent({
        ...params,
        model: modelName,
      });
      
      // Access the .text property directly. Do not use .text().
      if (!response || !response.text) {
        throw new Error("Empty response from model");
      }

      return response.text;
    } catch (error: any) {
      console.warn(`Model ${modelName} failed, trying next in chain...`, error);
      lastError = error;
      continue;
    }
  }
  throw lastError;
}

export async function getShopRecommendations(plantNames: string[]): Promise<ShopProduct[]> {
  try {
    const prompt = `Based on these plants in my garden: [${plantNames.join(', ')}], suggest 4 essential gardening products I should buy. 
    Include things like specific fertilizers (NPK ratios), soil types, or tools.
    For each, provide a name, a short helpful description, and a category (Seeds, Fertilizer, or Tools).
    Return a JSON array of objects.`;

    const jsonStr = await callGeminiWithFallback({
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              category: { type: Type.STRING },
            },
            required: ["name", "description", "category"]
          }
        }
      }
    });

    const rawProducts = JSON.parse(jsonStr);
    return rawProducts.map((p: any, i: number) => ({
      ...p,
      id: `ai-rec-${i}-${Date.now()}`,
      priceSymbol: '₹',
      amazonUrl: `https://www.amazon.in/s?k=${encodeURIComponent(p.name)}`,
      flipkartUrl: `https://www.flipkart.com/search?q=${encodeURIComponent(p.name)}`
    }));
  } catch (error) {
    console.error("AI Shop Rec Error:", error);
    return [];
  }
}

export async function analyzePlantImage(base64Image: string): Promise<ScanResult> {
  try {
    const promptText = `Analyze this plant image. Identify if the plant is healthy or diseased and its current growth stage.
    Return a JSON object with the following structure:
    {
      "status": "Healthy" | "Diseased",
      "diseaseName": "Common name of the plant or disease",
      "confidence": 0-100,
      "description": "A positive affirmation or short clinical description",
      "growthStage": "Seedling" | "Vegetative" | "Flowering" | "Fruiting",
      "growthStageDescription": "A short sentence about the detected stage",
      "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"]
    }`;

    const jsonResponseText = await callGeminiWithFallback({
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image,
            },
          },
          { text: promptText },
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

    const result = JSON.parse(jsonResponseText);
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
  try {
    const jsonResponseText = await callGeminiWithFallback({
      contents: {
        parts: [{ 
          text: `Generate a plant profile for "${plantName}". Include scientific name, difficulty (easy/medium/hard), estimated duration in days, and growth stages (Seed, Germination, Seedling, Vegetative, Flowering, Fruiting, Harvest) with day ranges and instructions. Return JSON.` 
        }]
      },
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
    return JSON.parse(jsonResponseText);
  } catch (error) {
    console.error("Species Generation Error:", error);
    throw error;
  }
}
