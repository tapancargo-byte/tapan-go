import { GoogleGenAI, Type } from "@google/genai";
import { TrackingResult, QuoteResult, QuoteRequest } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const modelId = "gemini-2.5-flash";

export const trackShipment = async (awb: string): Promise<TrackingResult> => {
  const prompt = `
    Generate a realistic shipment tracking history for AWB number "${awb}".
    Assume the shipment is going between a major city in Northeast India and Delhi.
    The current date is today.
    
    If the AWB starts with 'ERR', generate an exception status.
    Otherwise, generate a happy path 'In Transit' or 'Delivered' status.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            awb: { type: Type.STRING },
            currentStatus: { type: Type.STRING, enum: ['Delivered', 'In Transit', 'Out for Delivery', 'Pending', 'Exception'] },
            estimatedDelivery: { type: Type.STRING },
            origin: { type: Type.STRING },
            destination: { type: Type.STRING },
            history: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  timestamp: { type: Type.STRING },
                  location: { type: Type.STRING },
                  status: { type: Type.STRING },
                  description: { type: Type.STRING },
                }
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as TrackingResult;
  } catch (error) {
    console.error("Tracking error:", error);
    // Fallback mock data in case of error (though we expect Gemini to work)
    return {
      awb,
      currentStatus: 'In Transit',
      estimatedDelivery: '2 days',
      origin: 'Guwahati',
      destination: 'New Delhi',
      history: []
    };
  }
};

export const generateQuote = async (request: QuoteRequest): Promise<QuoteResult> => {
  const prompt = `
    Generate a shipping quote for a package:
    Origin: ${request.origin}
    Destination: ${request.destination}
    Weight: ${request.weight} kg
    Type: ${request.type}

    Provide a realistic price in INR (Indian Rupees), estimate delivery time, and a brief service description.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            price: { type: Type.STRING },
            serviceType: { type: Type.STRING },
            estimatedTime: { type: Type.STRING },
            details: { type: Type.STRING }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as QuoteResult;

  } catch (error) {
    console.error("Quote error:", error);
    return {
      price: "₹1,200",
      serviceType: "Standard Road",
      estimatedTime: "5-7 Business Days",
      details: "Error generating specific quote. Showing standard rates."
    };
  }
};
