import { GoogleGenAI, Modality } from "@google/genai";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

async function run() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-tts-preview",
    contents: [{ parts: [{ text: "Hello world" }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } }
      }
    }
  });

  const part = response.candidates?.[0]?.content?.parts?.[0];
  console.log("MimeType:", part?.inlineData?.mimeType);
  
  if (part?.inlineData?.data) {
    console.log("Data length:", part.inlineData.data.length);
  }
}
run().catch(console.error);
