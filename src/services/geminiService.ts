import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function enhanceImage(imageData: string, prompt: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: imageData.split(',')[1],
            mimeType: 'image/png',
          },
        },
        {
          text: `Nâng cấp bức tranh này thành một tác phẩm nghệ thuật đẹp mắt dựa trên yêu cầu sau: ${prompt}`,
        },
      ],
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("Không thể nâng cấp bức tranh.");
}
