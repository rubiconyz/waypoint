import { GoogleGenAI } from "@google/genai";
import { ImageSize, AspectRatio, AIStudioWindow, TranscriptSegment } from "../types";

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
      model: 'gemini-2.5-flash',
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
      model: 'gemini-2.5-flash',
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

export const translateSentence = async (
  sentence: string,
  targetLanguage: string,
  nativeLanguage: string
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

    const prompt = `
      Translate the following ${targetLanguage} sentence to ${nativeLanguage}:
      "${sentence}"
      
      Return ONLY the translation.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: prompt }] }
    });

    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
      return response.candidates[0].content.parts[0].text?.trim() || '';
    }
    return '';
  } catch (error) {
    console.error("Gemini Sentence Translation Error:", error);
    throw error;
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
      model: 'gemini-2.5-flash',
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

/**
 * AI Grammar Coach - Get contextual grammar explanations for words
 */
export const getGrammarExplanation = async (
  word: string,
  context: string,
  targetLanguage: string,
  nativeLanguage: string
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

    // Use fallback context if empty
    const safeContext = context || `a sentence containing the word ${word}`;

    const prompt = `
      Explain the grammar of the ${targetLanguage} word "${word}" as used in: "${safeContext}"
      
      Respond in ${nativeLanguage} with this EXACT format (include the emojis):
      
      📝 Form: [grammatical form, e.g. dative plural, past participle]
      🔗 Why: [one sentence why this form is used]
      💡 Tip: [one short memory trick]
      
      Keep each line under 15 words. No markdown or asterisks.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: prompt }] }
    });

    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
      const text = response.candidates[0].content.parts[0].text?.trim();
      if (text && text.length > 10) {
        return text;
      }
    }
    return '';
  } catch (error) {
    console.error("Grammar explanation error:", error);
    throw error; // Throw so the UI shows the actual error
  }
};

/**
 * Dictionary Definitions - Get multiple dictionary-style definitions for a word
 */
export const getDictionaryDefinitions = async (
  word: string,
  targetLanguage: string,
  nativeLanguage: string
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

    const prompt = `
      Give a quick dictionary entry for "${word}" (${targetLanguage}).
      
      Format EXACTLY like this:
      
      📖 [word] • [part of speech]
      
      1️⃣ [first meaning]
         → [very short example]
      
      2️⃣ [second meaning if exists]
         → [very short example]
      
      Rules:
      - Use the emoji numbers shown
      - Max 2-3 meanings
      - Examples under 5 words each
      - Write in ${nativeLanguage}
      - No asterisks or markdown
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: prompt }] }
    });

    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
      return response.candidates[0].content.parts[0].text?.trim() || '';
    }
    return '';
  } catch (error) {
    console.error("Dictionary definitions error:", error);
    return '';
  }
};

/**
 * Elaborate Definition - Get an in-depth explanation of a word for language learners
 */
export const getElaborateDefinition = async (
  word: string,
  context: string,
  targetLanguage: string,
  nativeLanguage: string
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

    // Use fallback context if empty
    const safeContext = context || `a sentence with the word ${word}`;

    const prompt = `
      Give a quick tip about the ${targetLanguage} word "${word}" used in: "${safeContext}"
      
      Respond in ${nativeLanguage} with this EXACT format (include the emojis):
      
      🎯 Meaning: [what it means in this context]
      🔄 Also: [another common meaning or usage]
      ⚡ Remember: [a catchy memory trick or common phrase]
      
      Keep each line under 12 words. No markdown or asterisks.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: prompt }] }
    });

    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
      const text = response.candidates[0].content.parts[0].text?.trim();
      if (text && text.length > 10) {
        return text;
      }
    }
    return '';
  } catch (error) {
    console.error("Elaborate definition error:", error);
    throw error; // Throw so the UI shows the actual error
  }
};

/**
 * Refine Transcript Segments - Adds full sentence context to fragmented subtitles
 */
export const refineTranscriptSegments = async (
  segments: TranscriptSegment[],
  language: string
): Promise<TranscriptSegment[]> => {
  const CHUNK_SIZE = 50;
  const refinedSegments: TranscriptSegment[] = [];
  let lastSpeaker = "Speaker 1"; // Track speaker across chunks

  try {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

    // Process in chunks to avoid context limits and reliability issues
    for (let i = 0; i < segments.length; i += CHUNK_SIZE) {
      const chunk = segments.slice(i, i + CHUNK_SIZE);
      const combinedText = chunk.map(s => s.text).join(' ');

      console.log(`Refining chunk ${i / CHUNK_SIZE + 1} of ${Math.ceil(segments.length / CHUNK_SIZE)}...`);

      const prompt = `
        You are analyzing a ${language} video transcript to detect different speakers.
        
        Raw text: "${combinedText}"
        
        IMPORTANT: This is likely a DIALOGUE between multiple people. Be AGGRESSIVE about detecting speaker changes!
        
        Signs of speaker change:
        - Question followed by answer
        - Direct address ("you", "sir", names)
        - Topic or perspective shift
        - Greeting or response patterns
        - Different opinion or agreement/disagreement
        - Interruptions or new statements
        
        The last speaker was: "${lastSpeaker}".
        
        Return a JSON array with EXACTLY ${chunk.length} objects:
        [{ "fullSentence": "...", "speaker": "Speaker 1" }, ...]
        
        Example for dialogue:
        Text: "How are you today? I'm doing great thanks. What about the project?"
        Output: [
          { "fullSentence": "How are you today?", "speaker": "Speaker 1" },
          { "fullSentence": "I'm doing great, thanks.", "speaker": "Speaker 2" },
          { "fullSentence": "What about the project?", "speaker": "Speaker 1" }
        ]
        
        Rules:
        - Use "Speaker 1", "Speaker 2", "Speaker 3", etc.
        - When in doubt, ASSUME speaker change after questions
        - Array length MUST be exactly ${chunk.length}
        
        Return ONLY the JSON array.
      `;


      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: { parts: [{ text: prompt }] }
        });

        if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
          const text = response.candidates[0].content.parts[0].text || "[]";
          const cleanText = text.replace(/```json\n|\n```/g, '').replace(/```/g, '').trim();

          let refinedData: { fullSentence: string; speaker: string }[] = [];
          try {
            const jsonMatch = cleanText.match(/\[[\s\S]*\]/);
            const textToParse = jsonMatch ? jsonMatch[0] : cleanText;
            refinedData = JSON.parse(textToParse);
          } catch (e) {
            console.warn(`JSON Parse failed for chunk ${i}, falling back.`, e);
          }

          if (Array.isArray(refinedData) && refinedData.length === chunk.length) {
            const refinedChunk = chunk.map((seg, idx) => ({
              ...seg,
              fullSentence: refinedData[idx]?.fullSentence || seg.text,
              speaker: refinedData[idx]?.speaker || lastSpeaker
            }));
            // Update last speaker for next chunk
            lastSpeaker = refinedChunk[refinedChunk.length - 1].speaker || lastSpeaker;
            refinedSegments.push(...refinedChunk);
          } else {
            console.warn(`Mismatch in chunk length. Falling back.`);
            refinedSegments.push(...chunk.map(seg => ({ ...seg, speaker: lastSpeaker })));
          }
        } else {
          refinedSegments.push(...chunk.map(seg => ({ ...seg, speaker: lastSpeaker })));
        }
      } catch (chunkError) {
        console.error(`Error refining chunk starting at index ${i}:`, chunkError);
        refinedSegments.push(...chunk.map(seg => ({ ...seg, speaker: lastSpeaker })));
      }
    }

    return refinedSegments;

  } catch (error) {
    console.error("Critical transcript refinement error:", error);
    return segments;
  }
};

/**
 * CEFR Rewriting - Rewrites text to a specific CEFR level
 */
export const rewriteArticleForCEFR = async (
  originalText: string,
  targetLevel: 'A2' | 'B1' | 'B2',
  language: string,
  topic: string
): Promise<string> => {
  try {
    await ensureApiKeySelected();
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

    const prompt = `
      You are a professional language teacher rewriting news content for students.
      
      Task: Rewrite the following short text to be suitable for a ${targetLevel} level student of ${language}.
      Topic: ${topic}
      
      Guidelines:
      - Use vocabulary and grammar appropriate for ${targetLevel} (CEFR standard).
      - Keep the tone journalistic but accessible.
      - Maintain the core meaning and facts.
      - Format with clear paragraphs.
      - Length: approx 150-200 words.
      
      Original Text:
      "${originalText}"
      
      Output ONLY the rewritten text.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: prompt }] }
    });

    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
      return response.candidates[0].content.parts[0].text?.trim() || originalText;
    }
    return originalText;
  } catch (error) {
    console.error("Error rewriting article:", error);
    return originalText;
  }
};

/**
 * Vocabulary Extraction - Extract key words
 */
export const extractVocabulary = async (
  text: string,
  targetLanguage: string,
  nativeLanguage: string,
  limit: number = 8
): Promise<Array<{ word: string; translation: string; level: string }>> => {
  try {
    await ensureApiKeySelected();
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

    const prompt = `
      Extract ${limit} key vocabulary words from this text that are useful for a language learner.
      Target Language: ${targetLanguage}
      Learner's Native Language: ${nativeLanguage}
      
      Text:
      "${text}"
      
      Return a JSON array of objects with these fields:
      - word (the word or short phrase in ${targetLanguage})
      - translation (in ${nativeLanguage})
      - level (CEFR level estimate: A1, A2, B1, B2, C1)
      
      Example: [{"word": "Haus", "translation": "house", "level": "A1"}]
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: prompt }] }
    });

    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
      const text = response.candidates[0].content.parts[0].text || "[]";
      // Clean markdown code blocks if present
      const cleanText = text.replace(/```json\n|\n```/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanText);
    }
    return [];
  } catch (error) {
    console.error("Error extracting vocabulary:", error);
    return [];
  }
};

/**
 * Comprehension Questions - Generate quiz
 */
export const generateComprehensionQuestions = async (
  text: string,
  language: string,
  nativeLanguage: string,
  count: number = 3
): Promise<Array<{ question: string; answer: string }>> => {
  try {
    await ensureApiKeySelected();
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

    const prompt = `
      Generate ${count} comprehension questions for this text.
      Reading Text Language: ${language}
      Question Language: ${language} (Target Language)
      
      Text:
      "${text}"
      
      Return a JSON array of objects:
      - question (simple question in ${language})
      - answer (short answer in ${language})
      
      Example: [{"question": "Who is going?", "answer": "The man."}]
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: prompt }] }
    });

    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
      const text = response.candidates[0].content.parts[0].text || "[]";
      // Clean markdown code blocks if present
      const cleanText = text.replace(/```json\n|\n```/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanText);
    }
    return [];
  } catch (error) {
    console.error("Error generating questions:", error);
    return [];
  }
};