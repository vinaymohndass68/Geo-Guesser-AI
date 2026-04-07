import { GoogleGenAI, Type } from "@google/genai";

export interface LocationData {
  locationName: string;
  description: string;
  latitude: number | null;
  longitude: number | null;
  architecturalStyle?: string;
  historicalSignificance?: string;
  nearbyAttractions?: string[];
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

export interface AnalysisOptions {
  architecture: boolean;
  history: boolean;
  poi: boolean;
}

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        if (typeof reader.result === 'string') {
            resolve(reader.result.split(',')[1]);
        } else {
            reject(new Error('Failed to read file as base64 string'));
        }
    };
    reader.onerror = (error) => reject(error);
  });

export const identifyLocationFromImage = async (
  file: File, 
  localityHint: string,
  options: AnalysisOptions
): Promise<LocationData> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const base64Data = await fileToBase64(file);

  const imagePart = {
    inlineData: {
      mimeType: file.type,
      data: base64Data,
    },
  };

  let basePrompt = "Analyze this image and identify the specific location (building name, street, monument, park, etc.) and its locality (city, country). Provide a descriptive answer. Also, provide the geographical coordinates (latitude and longitude) for the identified location. If the location is not identifiable, state that clearly and return null for the latitude and longitude fields.";
  
  if (options.architecture) {
    basePrompt += " Additionally, identify and describe the architectural style of any buildings or structures visible.";
  }
  if (options.history) {
    basePrompt += " Provide information about the historical significance or background of this location.";
  }
  if (options.poi) {
    basePrompt += " List a few nearby points of interest or landmarks (within walking distance if possible).";
  }

  const hintText = localityHint 
    ? ` The user has provided a hint that the location may be in or near "${localityHint}". Please use this as a strong hint in your analysis.`
    : "";

  const textPart = {
    text: basePrompt + hintText,
  };
  
  const properties: any = {
    locationName: {
      type: Type.STRING,
      description: "The name of the identified location (e.g., Eiffel Tower, Times Square)."
    },
    description: {
      type: Type.STRING,
      description: "A detailed description of the location and its context based on the image."
    },
    latitude: {
      type: Type.NUMBER,
      description: "The latitude of the identified location. Null if not identifiable.",
    },
    longitude: {
      type: Type.NUMBER,
      description: "The longitude of the identified location. Null if not identifiable.",
    }
  };

  const required = ["locationName", "description", "latitude", "longitude"];

  if (options.architecture) {
    properties.architecturalStyle = {
      type: Type.STRING,
      description: "A description of the architectural style(s) present."
    };
  }
  if (options.history) {
    properties.historicalSignificance = {
      type: Type.STRING,
      description: "The historical context or importance of the site."
    };
  }
  if (options.poi) {
    properties.nearbyAttractions = {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of nearby landmarks or attractions."
    };
  }

  const responseSchema = {
    type: Type.OBJECT,
    properties,
    required
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });
    
    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr) as LocationData;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get response from Gemini API.");
  }
};

export const sendFollowUpMessage = async (
    location: LocationData, 
    newPrompt: string,
    chatHistory: ChatMessage[]
): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const historyText = chatHistory
      .map(entry => `${entry.role === 'user' ? 'Human' : 'AI'}: ${entry.text}`)
      .join('\n');

    const systemInstruction = `You are a helpful and knowledgeable tour guide assistant.
The user has uploaded an image which you have identified as "${location.locationName}" located at latitude ${location.latitude} and longitude ${location.longitude}.
Your initial analysis was: "${location.description}".
${location.architecturalStyle ? `Architecture: ${location.architecturalStyle}` : ''}
${location.historicalSignificance ? `History: ${location.historicalSignificance}` : ''}
You will now answer follow-up questions from the user based on this context. Keep your answers concise and relevant to the user's question.`;

    const fullPrompt = `The following is a conversation with the AI tour guide.\n${historyText}\nHuman: ${newPrompt}\nAI:`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
            config: {
                systemInstruction: systemInstruction,
            },
        });
        
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API for follow-up:", error);
        throw new Error("Failed to get follow-up response from Gemini API.");
    }
};