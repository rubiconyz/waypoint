import { GoogleGenAI } from "@google/genai";
import { ImageSize, AspectRatio, AIStudioWindow } from "../types";

// Helper to handle the specific API key selection flow for Pro models
async function ensureApiKeySelected(): Promise<void> {
  const win = window as unknown as AIStudioWindow;
  if (win.aistudio) {
    const hasKey = await win.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await win.aistudio.openSelectKey();
    }
  }
}

export const generateVisionBoardImage = async (
  prompt: string,
  size: ImageSize,
  ratio: AspectRatio
): Promise<string> => {
  try {
    await ensureApiKeySelected();

    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

    // Using Nano Banana Pro / Gemini 3 Pro Image Preview as requested
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          { text: prompt }
        ]
      },
      config: {
        imageConfig: {
          imageSize: size,
          aspectRatio: ratio,
        }
      }
    });

    // Parse response for image data
    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error("No image data found in response");

  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};

export const refineTranscript = async (rawText: string, language: string): Promise<string> => {
  try {
    // await ensureApiKeySelected(); // Optional depending on env

    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

    const prompt = `
      You are an expert language tutor. I have a raw, auto-generated transcript of a video in ${language}. 
      It is messy, lacks punctuation, and has no speaker labels.
      
      Please REWRITE this transcript to be perfect for a language learner:
      1. Fix all grammar, punctuation, and capitalization errors.
      2. Guess where the speakers change and add labels like "**Speaker 1:**", "**Speaker 2:**" (bolded).
      3. If it's a monologue, break it into logical paragraphs.
      4. Keep the vocabulary authentic (don't simplify it), just clean up the structure.
      5. Return ONLY the refined text.

      Raw Text:
      "${rawText}"
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [{ text: prompt }]
      }
    });

    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
      return response.candidates[0].content.parts[0].text || "Failed to refine.";
    }

    throw new Error("No text found in response");
  } catch (error: any) {
    console.error("Error refining transcript:", error);
    if (error.message?.includes('404') || error.message?.includes('not found')) {
      console.warn("Model not found. Try 'gemini-pro' or check API key permissions.");
      // Fallback attempt?
      // return refineTranscriptWithFallback(rawText, language); 
    }
    return `[AI Error: ${error.message || 'Unknown'}] ${rawText}`;
  }
};

export const getWordTranslation = async (
  word: string,
  contextSentence: string,
  targetLanguage: string,
  nativeLanguage: string
): Promise<{ translation: string; definition: string; partOfSpeech: string } | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

    const prompt = `
        You are a helpful language tutor. 
        Translate the word "${word}" from ${targetLanguage} to ${nativeLanguage}.
        
        Context sentence: "${contextSentence}" (Use this to choose the correct meaning).
        
        Return ONLY valid JSON in this format:
        {
            "translation": "The translated word",
            "definition": "A brief, simple definition in ${nativeLanguage}",
            "partOfSpeech": "noun/verb/adj/etc"
        }
        `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [{ text: prompt }] }
    });

    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
      const text = response.candidates[0].content.parts[0].text || "{}";
      // Clean markdown code blocks if present
      const cleanText = text.replace(/```json\n|\n```/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanText);
    }
    return null;
  } catch (error) {
    console.error("Gemini Translation Error:", error);
    return null; // Return null on error so UI can show simple fallback
  }
};

export const getWordLemma = async (
  word: string,
  contextSentence: string,
  targetLanguage: string
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

    const prompt = `
        You are a linguistics expert.
        I have a word "${word}" found in this sentence: "${contextSentence}".
        The language is ${targetLanguage}.
        
        Please identify the LEMMA (base form) of this word.
        - If it is a verb, return the INFINITIVE.
        - If it is a noun, return the NOMINATIVE SINGULAR.
        - If it is an adjective, return the base uninflected form.
        
        Return ONLY the lemma word, nothing else. No punctuation, no explanation.
        `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [{ text: prompt }] }
    });

    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
      const text = response.candidates[0].content.parts[0].text || word;
      return text.trim().replace(/['"]/g, '');
    }
    return word;
  } catch (error) {
    console.error("Gemini Lemmatization Error:", error);
    return word; // Fallback to original if AI fails
  }
};