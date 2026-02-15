import { GoogleGenAI } from "@google/genai";
import { ImageSize, AspectRatio, AIStudioWindow, TranscriptSegment, Habit, SavedWord, RecentVideo, HabitDNAArchetype, HabitDNAMetrics } from "../types";
import { getLocalDateString } from "../utils/dateUtils";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_KEY;
const GEMINI_PROXY_URL = import.meta.env.VITE_GEMINI_PROXY_URL as string | undefined;

type GeminiClient = {
  models: {
    generateContent: (params: any) => Promise<any>;
  };
};

const getGeminiClient = (): GeminiClient => {
  if (GEMINI_PROXY_URL) {
    return {
      models: {
        generateContent: async (params: any) => {
          const response = await fetch(GEMINI_PROXY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params)
          });
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gemini proxy error (${response.status}): ${errorText}`);
          }
          return response.json();
        }
      }
    };
  }

  if (!GEMINI_API_KEY) {
    throw new Error('Missing Gemini API configuration. Set VITE_GEMINI_PROXY_URL or VITE_GEMINI_API_KEY.');
  }

  return new GoogleGenAI({ apiKey: GEMINI_API_KEY }) as unknown as GeminiClient;
};

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
    if (!GEMINI_PROXY_URL) {
      await ensureApiKeySelected();
    }

    const ai = getGeminiClient();

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

    const ai = getGeminiClient();

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
    const ai = getGeminiClient();

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
    const ai = getGeminiClient();

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
    const ai = getGeminiClient();

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
    const ai = getGeminiClient();

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
    const ai = getGeminiClient();

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
    const ai = getGeminiClient();

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
    const ai = getGeminiClient();

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
    const ai = getGeminiClient();

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
    const ai = getGeminiClient();

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

export const generateComprehensionQuestions = async (
  text: string,
  language: string,
  nativeLanguage: string,
  count: number = 3
): Promise<Array<{ question: string; answer: string }>> => {
  try {
    await ensureApiKeySelected();
    const ai = getGeminiClient();

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

/**
 * Weekly AI Summary - Generate personalized weekly insights for habits
 */
export interface WeeklySummary {
  headline: string;
  highlights: string[];
  struggles: string[];
  tipOfTheWeek: string;
}

export const getWeeklySummary = async (
  habits: Habit[]
): Promise<WeeklySummary | null> => {
  try {
    const ai = getGeminiClient();

    // Build habit summary data
    const habitData = habits.map(h => {
      const completedCount = Object.values(h.history).filter(s => s === 'completed').length;
      const last7Days = Object.entries(h.history)
        .filter(([date]) => {
          const d = new Date(date);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return d >= weekAgo;
        })
        .map(([, status]) => status);

      return {
        title: h.title,
        category: h.category,
        streak: h.streak,
        totalCompletions: completedCount,
        last7Days: last7Days.filter(s => s === 'completed').length,
        frequency: h.frequency.type
      };
    });

    const prompt = `
      Analyze this week's habit data and provide personalized insights.
      
      Habits: ${JSON.stringify(habitData)}
      
      Return ONLY valid JSON in this exact format:
      {
        "headline": "One engaging sentence summarizing the week (include % if relevant)",
        "highlights": ["Achievement 1", "Achievement 2"],
        "struggles": ["Area to improve 1"],
        "tipOfTheWeek": "One actionable, specific tip based on the data"
      }
      
      Rules:
      - Be encouraging but honest
      - Maximum 2-3 highlights, 1-2 struggles
      - Tip should be specific to user's actual habits
      - Keep all text concise (under 15 words per item)
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: prompt }] }
    });

    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
      const text = response.candidates[0].content.parts[0].text || "{}";
      const cleanText = text.replace(/```json\n|\n```/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanText);
    }
    return null;
  } catch (error) {
    console.error("Error generating weekly summary:", error);
    return null;
  }
};

/**
 * AI Habit Coach - Get personalized pattern insights and suggestions
 */
export interface HabitCoachInsights {
  patternInsights: string[];
  suggestions: string[];
  encouragement: string;
}

export const getHabitCoachInsights = async (
  habits: Habit[]
): Promise<HabitCoachInsights | null> => {
  try {
    const ai = getGeminiClient();

    // Build detailed habit data for analysis
    const habitData = habits.map(h => {
      const historyEntries = Object.entries(h.history);
      const byDayOfWeek: Record<number, { completed: number; total: number }> = {};

      historyEntries.forEach(([date, status]) => {
        const day = new Date(date).getDay();
        if (!byDayOfWeek[day]) byDayOfWeek[day] = { completed: 0, total: 0 };
        byDayOfWeek[day].total++;
        if (status === 'completed') byDayOfWeek[day].completed++;
      });

      return {
        title: h.title,
        category: h.category,
        streak: h.streak,
        frequency: h.frequency.type,
        dayPatterns: byDayOfWeek,
        totalHistory: historyEntries.length
      };
    });

    const prompt = `
      You are an AI habit coach. Analyze these habits and find actionable patterns.
      
      Habit Data: ${JSON.stringify(habitData)}
      
      Return ONLY valid JSON:
      {
        "patternInsights": [
          "Pattern 1 (specific observation about timing, consistency, etc.)",
          "Pattern 2"
        ],
        "suggestions": [
          "Actionable suggestion 1",
          "Actionable suggestion 2"
        ],
        "encouragement": "One personalized motivational message"
      }
      
      Rules:
      - Identify SPECIFIC patterns (e.g., "You complete workouts 80% more on mornings")
      - Suggestions should be concrete (include days, times, or specific actions)
      - Maximum 2-3 insights, 2 suggestions
      - Keep each item under 20 words
      - Reference actual habit names when relevant
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: prompt }] }
    });

    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
      const text = response.candidates[0].content.parts[0].text || "{}";
      const cleanText = text.replace(/```json\n|\n```/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanText);
    }
    return null;
  } catch (error) {
    console.error("Error generating habit coach insights:", error);
    return null;
  }
};

/**
 * Content Recommendations - Suggest videos based on vocabulary level
 */
export interface ContentRecommendation {
  title: string;
  reason: string;
  searchQuery: string;
  difficulty: 'easier' | 'right' | 'challenging';
}

export const getContentRecommendations = async (
  savedWords: SavedWord[],
  targetLanguage: string,
  recentVideos: RecentVideo[]
): Promise<ContentRecommendation[]> => {
  try {
    const ai = getGeminiClient();

    // Analyze vocabulary level
    const wordSample = savedWords.slice(0, 30).map(w => ({
      word: w.word,
      mastery: w.mastery,
      context: w.context?.slice(0, 50)
    }));

    const recentTopics = recentVideos.slice(0, 5).map(v => v.title);

    const prompt = `
      You are a language learning content curator.
      
      User's saved vocabulary (${targetLanguage}): ${JSON.stringify(wordSample)}
      Recently watched: ${JSON.stringify(recentTopics)}
      
      Suggest 4 YouTube videos that match their level. Return ONLY valid JSON:
      [
        {
          "title": "Suggested content title",
          "reason": "Why this matches their level",
          "searchQuery": "YouTube search query in ${targetLanguage}",
          "difficulty": "right"
        }
      ]
      
      Rules:
      - Mix difficulties: 1 easier (review), 2 right level, 1 challenging
      - Avoid topics they recently watched
      - searchQuery should find real content (news, vlogs, interviews)
      - Keep reasons under 10 words
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: prompt }] }
    });

    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
      const text = response.candidates[0].content.parts[0].text || "[]";
      const cleanText = text.replace(/```json\n|\n```/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanText);
    }
    return [];
  } catch (error) {
    console.error("Error generating content recommendations:", error);
    return [];
  }
};

// Chat message type for AI Coach
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}


// Coach Persona Types
export type CoachPersona = 'waypoint' | 'marcus' | 'goggins' | 'james' | 'ronaldo' | 'aristotle';

export const COACH_PERSONAS: Record<CoachPersona, { name: string; title: string; avatar: string; prompt: string; greeting: string }> = {
  waypoint: {
    name: 'Waypoint',
    title: 'Your AI Coach',
    avatar: '/assets/avatars/waypoint.png',
    prompt: `You are Waypoint, a sharp, energetic, and data-driven habit coach.
STYLE: Punchy, concise, supportive but honest. Use formatting (bold/italics). Use emojis 🚀 frequently to keep it engaging. No fluff.`,
    greeting: "System online. Let's optimize your routine."
  },
  marcus: {
    name: 'Marcus Aurelius',
    title: 'The Stoic Emperor',
    avatar: '/assets/avatars/marcus.png',
    prompt: `You are Marcus Aurelius, Roman Emperor and Stoic philosopher, author of Meditations.

KEY TEACHINGS FROM YOUR WORK:
- "You have power over your mind – not outside events. Realize this, and you will find strength."
- "The impediment to action advances action. What stands in the way becomes the way."
- "Waste no more time arguing about what a good man should be. Be one."
- "When you arise in the morning, think of what a precious privilege it is to be alive."
- "How much more grievous are the consequences of anger than the causes of it."
- Focus on what is within your control (your actions, thoughts) vs what is not (others, external events).

STYLE: Speak with ancient wisdom, dignity, and calm. Reference your Meditations naturally. Use phrases like "My dear friend" or address obstacles as opportunities.
Use occasional Stoic emojis 🏛️🌿⚔️ to fit the theme.`,
    greeting: "Greetings, friend. Let us focus on what is within our control."
  },
  goggins: {
    name: 'David Goggins',
    title: 'The Toughest Man',
    avatar: '/assets/avatars/goggins.png',
    prompt: `You are David Goggins, author of Can't Hurt Me.

KEY CONCEPTS FROM YOUR BOOK:
- THE COOKIE JAR: A mental inventory of past achievements and hard times you've overcome. When struggling, reach into your Cookie Jar for strength.
- THE 40% RULE: When your mind tells you you're done, you're really only 40% done. There's always more in the tank.
- CALLUSING THE MIND: Expose yourself to discomfort repeatedly to build mental toughness.
- THE ACCOUNTABILITY MIRROR: Look yourself in the eye and be brutally honest about your flaws and what needs to change.
- "Don't let your body tell your mind what to do. Let your mind tell your body what to do."
- "If you can get through doing things that you hate to do, on the other side is greatness."

STYLE: INTENSE. RAW. UNFILTERED. No excuses EVER. If they miss a habit, call them out for being soft. If they hit it, tell them to do more. Use caps for emphasis. 
Motto: "STAY HARD!"
Use strong emojis 💪🔥🏃‍♂️.`,
    greeting: "THEY DON'T KNOW ME SON. TIME TO PAY THE RENT. STAY HARD!"
  },
  james: {
    name: 'James Clear',
    title: 'Atomic Habits Author',
    avatar: '/assets/avatars/james.png',
    prompt: `You are James Clear, author of Atomic Habits.

KEY CONCEPTS FROM YOUR BOOK:
- "You do not rise to the level of your goals. You fall to the level of your systems."
- "Every action you take is a vote for the type of person you wish to become."
- "Habits are the compound interest of self-improvement."
- THE 1% RULE: Get 1% better every day. Small improvements compound into remarkable results.
- THE 4 LAWS OF BEHAVIOR CHANGE: Make it obvious, make it attractive, make it easy, make it satisfying.
- HABIT STACKING: "After [CURRENT HABIT], I will [NEW HABIT]."
- IDENTITY-BASED HABITS: Focus on who you wish to become, not what you want to achieve.
- "Time magnifies the margin between success and failure."

STYLE: Analytical, practical, systems-focused. Explain WHY habits work using these principles. Give specific, actionable advice.
Tone: Professional, clear, influential.
Use emojis 📚🌱📈 to illustrate growth.`,
    greeting: "Small changes, remarkable results. Let's review your systems."
  },
  ronaldo: {
    name: 'Cristiano Ronaldo',
    title: 'The GOAT',
    avatar: '/assets/avatars/ronaldo.png',
    prompt: `You are Cristiano Ronaldo.
STYLE: Elite, ultra-confident, hardworking, winner mentality. Use "SIUUU" for big celebrations. 
Focus on extreme dedication, training, diet, and being the best version of yourself.
Motto: "I don't mind people hating me, because it pushes me."
Use emojis ⚽🏆👑👀 liberally.`,
    greeting: "SIUUU! Dedication. Hard work. Let's become the best."
  },
  aristotle: {
    name: 'Aristotle',
    title: 'The First Teacher',
    avatar: '/assets/avatars/aristotle.png',
    prompt: `You are Aristotle, the Greek philosopher, author of Nicomachean Ethics.

KEY TEACHINGS FROM YOUR WORK:
- "We are what we repeatedly do. Excellence, then, is not an act, but a habit."
- "Knowing yourself is the beginning of all wisdom."
- THE GOLDEN MEAN: Virtue lies between excess and deficiency. Find balance in all things.
- EUDAIMONIA: The highest human good is flourishing – living well and doing well.
- "Happiness depends upon ourselves."
- "Pleasure in the job puts perfection in the work."
- "It is the mark of an educated mind to be able to entertain a thought without accepting it."
- "Quality is not an act, it is a habit."

STYLE: Intellectual, questioning (Socratic method), focused on virtue and flourishing. Ask probing questions to help users discover truth themselves.
Motto: "Knowing yourself is the beginning of all wisdom."
Use occasional classic emojis 📜🦉✨.`,
    greeting: "Excellence is not an act, but a habit. Shall we inquire into yours?"
  }
};

type CoachHabitDayStatus = 'completed' | 'partial' | 'skipped' | 'missed' | 'not_due';

const normalizeToDayStart = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const isHabitDueForDate = (habit: Habit, date: Date): boolean => {
  const checkDate = normalizeToDayStart(date);

  if (habit.createdAt) {
    const createdDate = normalizeToDayStart(new Date(habit.createdAt));
    if (checkDate < createdDate) return false;
  }

  if (habit.frequency.type === 'custom') {
    return habit.frequency.days.includes(checkDate.getDay());
  }

  return true;
};

const getHabitStatusForDate = (habit: Habit, date: Date): CoachHabitDayStatus => {
  if (!isHabitDueForDate(habit, date)) return 'not_due';

  const key = getLocalDateString(date);
  const status = habit.history[key];
  if (status === 'completed' || status === 'partial' || status === 'skipped') return status;
  return 'missed';
};

const countDayStatuses = (statuses: CoachHabitDayStatus[]) => ({
  dueHabits: statuses.filter(s => s !== 'not_due').length,
  completed: statuses.filter(s => s === 'completed').length,
  skipped: statuses.filter(s => s === 'skipped').length,
  partial: statuses.filter(s => s === 'partial').length,
  missed: statuses.filter(s => s === 'missed').length,
  notDue: statuses.filter(s => s === 'not_due').length
});

export interface DailyFocusStats {
  date: string;
  dueToday: number;
  completedToday: number;
  completionRateToday: number;
  weeklyAverageRate: number;
  weeklyBestRate: number;
  weeklyWorstRate: number;
  topMissedHabits: string[];
  bestHabits: string[];
}

export const generateAIQuote = async (
  stats: DailyFocusStats,
  previousQuotes: string[] = []
): Promise<{ quote: string; author: string }> => {
  const ai = getGeminiClient();

  const recentQuotes = previousQuotes.slice(-20);

  const prompt = `
You are a curator of powerful, real quotes from historical figures, athletes, philosophers, authors, and leaders.

Pick ONE real quote that matches the user's current performance context below.

USER PERFORMANCE:
${JSON.stringify(stats, null, 2)}

GUIDELINES FOR MATCHING:
- If completionRateToday >= 80%: Pick a quote about maintaining excellence, consistency, or finishing strong.
- If completionRateToday is 40-79%: Pick a quote about perseverance, pushing through, or discipline.
- If completionRateToday < 40%: Pick a quote about starting, resilience, or overcoming setbacks.
- If weeklyAverageRate > 70%: Lean toward quotes about momentum and mastery.
- If weeklyAverageRate < 40%: Lean toward quotes about new beginnings and grit.

PREVIOUSLY SHOWN QUOTES (DO NOT REPEAT ANY OF THESE):
${recentQuotes.length > 0 ? recentQuotes.map(q => `- "${q}"`).join('\n') : '(none yet)'}

RULES:
- Must be a REAL quote from a REAL person (no made-up quotes).
- Return ONLY valid JSON: { "quote": "...", "author": "..." }
- No markdown, code blocks, or extra text.
- The quote should be under 25 words.
- Do NOT repeat any quote from the previously shown list.
`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [{ text: prompt }] }
  });

  const text = response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) {
    throw new Error('Empty response from Gemini');
  }
  const cleanText = text.replace(/```json\n|```/g, '').trim();
  return JSON.parse(cleanText);
};

// AI Coach Chat Function
export const chatWithHabitCoach = async (
  userMessage: string,
  habits: Habit[],
  chatHistory: ChatMessage[],
  persona: CoachPersona = 'waypoint',
  memories: string[] = []
): Promise<string> => {
  try {
    const ai = getGeminiClient();
    const selectedPersona = COACH_PERSONAS[persona];

    const today = normalizeToDayStart(new Date());
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const todayKey = getLocalDateString(today);
    const yesterdayKey = getLocalDateString(yesterday);

    // Build habit context
    const habitContext = habits.map(h => {
      const completedCount = Object.values(h.history).filter(s => s === 'completed').length;
      const todayStatus = getHabitStatusForDate(h, today);
      const yesterdayStatus = getHabitStatusForDate(h, yesterday);

      const last7Statuses = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        return getHabitStatusForDate(h, d);
      });

      const last7Due = last7Statuses.filter(s => s !== 'not_due').length;
      const last7Completed = last7Statuses.filter(s => s === 'completed' || s === 'skipped').length;
      const last7Missed = last7Statuses.filter(s => s === 'missed').length;

      return {
        title: h.title,
        category: h.category,
        streak: h.streak,
        totalCompletions: completedCount,
        today: {
          due: todayStatus !== 'not_due',
          status: todayStatus
        },
        yesterday: {
          due: yesterdayStatus !== 'not_due',
          status: yesterdayStatus
        },
        last7Days: {
          due: last7Due,
          completedOrSkipped: last7Completed,
          missed: last7Missed
        }
      };
    });

    const todaySummary = countDayStatuses(habitContext.map(h => h.today.status));
    const yesterdaySummary = countDayStatuses(habitContext.map(h => h.yesterday.status));

    // Build conversation history for context
    const historyText = chatHistory.slice(-6).map(m =>
      `${m.role === 'user' ? 'User' : 'Coach'}: ${m.content}`
    ).join('\n');

    // Build memories context
    const memoriesText = memories.length > 0
      ? `\nTHINGS YOU REMEMBER ABOUT THIS USER:\n${memories.map(m => `- ${m}`).join('\n')}\n(Reference these naturally when relevant. Don't list them back unless specifically asked.)`
      : '';
    const isDayStatusQuestion = /(today|yesterday|daily update|on my plate|how did i do)/i.test(userMessage);
    const dayStatusGuard = isDayStatusQuestion
      ? `
DAY-STATUS FORMAT REQUIREMENT:
- Start with one factual line before advice:
  Yesterday: due <n>, completed/skipped <n>, missed <n>, not due <n>.
- If yesterday due is 0, explicitly say no tasks were due yesterday.
- Then continue in persona voice.`
      : '';

    const prompt = `
${selectedPersona.prompt}
${memoriesText}
${dayStatusGuard}

FACTUAL DAY SNAPSHOT (SOURCE OF TRUTH):
Today (${todayKey}):
${JSON.stringify(todaySummary, null, 2)}
Yesterday (${yesterdayKey}):
${JSON.stringify(yesterdaySummary, null, 2)}

USER'S HABITS DATA:
${JSON.stringify(habitContext, null, 2)}

CONVERSATION HISTORY:
${historyText}

USER'S NEW MESSAGE: ${userMessage}

RULES:
- Stay IN CHARACTER for your persona (${selectedPersona.name}) at all times.
- Reference their ACTUAL habit data when relevant.
- Treat "FACTUAL DAY SNAPSHOT" and each habit's today/yesterday status as strict truth.
- Never claim a habit was completed yesterday unless yesterday.status is "completed" or "skipped".
- If yesterday.dueHabits is 0, explicitly say no tasks were due yesterday.
- **IMPORTANT**: Speak NATURALLY. Do NOT speak like a database.
  - BAD: "You did not complete 'Gym' and 'Reading'."
  - GOOD: "Why did you skip the gym? And I noticed you didn't pick up that book either."
- **Do NOT use quotes** around habit names. Treat them as real-world activities.
- If the user has a "Streak", celebrate it. If they missed it, hold them accountable (based on your persona).
- Keep responses concise (2-4 sentences usually).

Respond as your persona:`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: prompt }] }
    });

    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
      return response.candidates[0].content.parts[0].text || "I'm here to help! Could you rephrase that?";
    }
    return "I'm having trouble thinking right now. Try again?";
  } catch (error) {
    console.error("Error in AI Coach chat:", error);
    return "Sorry, I couldn't connect. Please try again in a moment.";
  }
};

// Extract memories from user messages
export const extractMemoriesFromMessage = async (
  userMessage: string,
  existingMemories: string[]
): Promise<string[]> => {
  try {
    const ai = getGeminiClient();

    const prompt = `
Analyze this user message and extract any NEW personal facts worth remembering for future conversations.

EXISTING MEMORIES (don't duplicate these):
${existingMemories.map(m => `- ${m}`).join('\n') || '(none)'}

USER MESSAGE:
"${userMessage}"

Extract facts like:
- Personal goals ("training for a marathon")
- Physical limitations ("has bad knee")
- Life circumstances ("works night shifts", "has two kids")
- Preferences ("prefers morning workouts")

Rules:
- Only extract CONCRETE, SPECIFIC facts
- Ignore generic statements or questions
- Return empty array if nothing worth remembering
- Keep each fact under 10 words
- Don't duplicate existing memories

Return ONLY a JSON array of strings. Example: ["training for first marathon", "works from home"]
If nothing to extract, return: []`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: prompt }] }
    });

    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
      const text = response.candidates[0].content.parts[0].text || "[]";
      const cleanText = text.replace(/```json\n|\n```/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanText);
      return Array.isArray(parsed) ? parsed : [];
    }
    return [];
  } catch (error) {
    console.error("Error extracting memories:", error);
    return [];
  }
};

/**
 * Habit DNA — Generate AI-powered behavioral fingerprint
 */
export const generateHabitDNA = async (
  habits: Habit[]
): Promise<{ archetype: HabitDNAArchetype; metrics: HabitDNAMetrics } | null> => {
  try {
    const ai = getGeminiClient();

    const today = normalizeToDayStart(new Date());

    // Compute raw metrics locally for accuracy
    const allDatesSet = new Set<string>();
    const categoryCompletions: Record<string, number> = {};
    let totalCompletions = 0;
    let totalStreakSum = 0;

    habits.forEach(h => {
      Object.entries(h.history).forEach(([date, status]) => {
        if (status === 'completed') {
          allDatesSet.add(date);
          totalCompletions++;
          categoryCompletions[h.category] = (categoryCompletions[h.category] || 0) + 1;
        }
      });
      totalStreakSum += h.streak;
    });

    const activeDays = allDatesSet.size;
    const averageStreakLength = habits.length > 0 ? Math.round(totalStreakSum / habits.length) : 0;
    const dominantCategory = Object.entries(categoryCompletions).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

    // Consistency: % of last 30 days with at least one completion
    let consistentDays = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = getLocalDateString(d);
      if (allDatesSet.has(dateStr)) consistentDays++;
    }
    const consistencyRhythm = Math.round((consistentDays / 30) * 100);

    // Category balance: use coefficient of variation (lower CV = higher harmony)
    const catValues = Object.values(categoryCompletions);
    let categoryHarmony = 100;
    if (catValues.length > 1) {
      const mean = catValues.reduce((a, b) => a + b, 0) / catValues.length;
      const variance = catValues.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / catValues.length;
      const cv = mean > 0 ? Math.sqrt(variance) / mean : 1;
      categoryHarmony = Math.max(0, Math.round((1 - cv) * 100));
    }

    // Streak resilience: count recovery patterns (missed -> completed within 2 days)
    let recoveries = 0;
    let missedStreaks = 0;
    habits.forEach(h => {
      const sortedDates = Object.keys(h.history).sort();
      for (let i = 1; i < sortedDates.length; i++) {
        if (h.history[sortedDates[i - 1]] !== 'completed' && h.history[sortedDates[i]] === 'completed') {
          recoveries++;
        }
        if (h.history[sortedDates[i - 1]] === 'completed' && h.history[sortedDates[i]] !== 'completed') {
          missedStreaks++;
        }
      }
    });
    const streakResilience = missedStreaks > 0
      ? Math.min(100, Math.round((recoveries / missedStreaks) * 100))
      : Math.min(100, Math.round((activeDays / 14) * 100));

    // Growth velocity: compare last 2 weeks
    let recentWeekCompletions = 0;
    let previousWeekCompletions = 0;
    habits.forEach(h => {
      Object.entries(h.history).forEach(([date, status]) => {
        if (status !== 'completed') return;
        const d = new Date(date + 'T12:00:00');
        const daysDiff = Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff >= 0 && daysDiff < 7) recentWeekCompletions++;
        else if (daysDiff >= 7 && daysDiff < 14) previousWeekCompletions++;
      });
    });
    const growthVelocity = previousWeekCompletions > 0
      ? Math.min(100, Math.round(((recentWeekCompletions - previousWeekCompletions) / previousWeekCompletions + 1) * 50))
      : (recentWeekCompletions > 0
        ? Math.min(100, Math.round((recentWeekCompletions / Math.max(habits.length * 7, 1)) * 100))
        : 0);

    const metrics: HabitDNAMetrics = {
      consistencyRhythm,
      categoryHarmony,
      streakResilience,
      growthVelocity,
      totalCompletions,
      activeDays,
      dominantCategory,
      averageStreakLength
    };

    // ─── Deterministic Archetype System ──────────────────────────────────────
    // Class from dominant category, Tier from overall score. Same data = same character.

    const classMap: Record<string, { className: string; emoji: string }> = {
      'Fitness': { className: 'Warrior', emoji: '⚔️' },
      'Health': { className: 'Druid', emoji: '🌿' },
      'Reading': { className: 'Scholar', emoji: '📖' },
      'Meditation': { className: 'Monk', emoji: '🧘' },
      'Productivity': { className: 'Engineer', emoji: '⚙️' },
      'Creative': { className: 'Bard', emoji: '🎨' },
      'Social': { className: 'Paladin', emoji: '🛡️' },
      'Learning': { className: 'Sage', emoji: '🔮' },
      'Finance': { className: 'Merchant', emoji: '💰' },
      'Mindfulness': { className: 'Spirit Walker', emoji: '✨' },
    };

    const characterClass = classMap[dominantCategory] || { className: 'Adventurer', emoji: '🗡️' };

    // Overall power score = weighted average of all 4 metrics
    const overallScore = Math.round(
      consistencyRhythm * 0.35 +
      categoryHarmony * 0.2 +
      streakResilience * 0.25 +
      growthVelocity * 0.2
    );

    // Tier thresholds — each tier has a fixed name, color palette, and traits
    const tiers = [
      {
        maxScore: 15,
        tier: 'Novice',
        title: 'Just Starting Out',
        traits: ['Beginner', 'Untested', 'Potential'],
        colors: ['#6B7280', '#9CA3AF', '#4B5563', '#374151'], // grays
      },
      {
        maxScore: 30,
        tier: 'Apprentice',
        title: 'Learning the Ropes',
        traits: ['Growing', 'Curious', 'Unsteady'],
        colors: ['#92400E', '#B45309', '#78350F', '#A16207'], // bronze/brown
      },
      {
        maxScore: 50,
        tier: 'Adept',
        title: 'Finding Your Stride',
        traits: ['Capable', 'Building', 'Focused'],
        colors: ['#0891B2', '#0EA5E9', '#0369A1', '#06B6D4'], // blue/cyan
      },
      {
        maxScore: 70,
        tier: 'Champion',
        title: 'Proven & Strong',
        traits: ['Disciplined', 'Resilient', 'Driven'],
        colors: ['#7C3AED', '#8B5CF6', '#6D28D9', '#A78BFA'], // purple
      },
      {
        maxScore: 85,
        tier: 'Master',
        title: 'Elite Performer',
        traits: ['Relentless', 'Balanced', 'Unstoppable'],
        colors: ['#F59E0B', '#FBBF24', '#D97706', '#FCD34D'], // gold
      },
      {
        maxScore: 100,
        tier: 'Grandmaster',
        title: 'Legendary Status',
        traits: ['Legendary', 'Transcendent', 'Iconic'],
        colors: ['#EF4444', '#F97316', '#EC4899', '#8B5CF6'], // red/orange/pink — vibrant
      },
    ];

    const currentTier = tiers.find(t => overallScore <= t.maxScore) || tiers[tiers.length - 1];

    const archetypeName = `${currentTier.tier} ${characterClass.className}`;

    // Ask Gemini only for an honest, data-reflective narrative (no creative naming)
    let narrative = '';
    try {
      const prompt = `You are a blunt, honest habit coach. Based on this data, write exactly 2 sentences about this person's habits. Be HONEST — if they're slacking, say so directly. If they're doing well, acknowledge it. No sugar-coating, no motivational fluff.

METRICS (each out of 100):
- Consistency: ${consistencyRhythm}/100 (% of last 30 days with completions)
- Category Balance: ${categoryHarmony}/100
- Streak Resilience: ${streakResilience}/100 (ability to bounce back after missing)
- Growth Velocity: ${growthVelocity}/100 (recent progress trend)
- Total Completions: ${totalCompletions}
- Active Days: ${activeDays}
- Average Streak: ${averageStreakLength} days
- They have ${habits.length} habits tracked

Their character level is: "${archetypeName}" (overall score: ${overallScore}/100)

Rules:
- Write in second person ("You...")
- Be specific about numbers
- If metrics are LOW, be honest about it (e.g. "You've barely shown up" / "Your consistency is almost nonexistent")
- If metrics are HIGH, genuinely praise the effort
- Maximum 2 sentences, no filler
- Return ONLY the narrative text, nothing else`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [{ text: prompt }] }
      });

      if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
        narrative = response.candidates[0].content.parts[0].text.trim().replace(/^["']|["']$/g, '');
      }
    } catch (e) {
      // Fallback narrative if Gemini fails
      narrative = overallScore < 30
        ? `With only ${totalCompletions} completions across ${activeDays} active days, you're just getting started. Consistency is your biggest challenge right now.`
        : overallScore < 60
          ? `You've built some momentum with ${totalCompletions} completions, but your ${consistencyRhythm}% consistency shows there's room to grow. Keep pushing.`
          : `Strong performance with ${totalCompletions} completions and ${consistencyRhythm}% consistency. You've earned your ${currentTier.tier} rank.`;
    }

    const archetype: HabitDNAArchetype = {
      name: archetypeName,
      emoji: characterClass.emoji,
      title: currentTier.title,
      narrative,
      traits: currentTier.traits,
      colorPalette: currentTier.colors,
    };

    return { archetype, metrics };
  } catch (error) {
    console.error("Error generating Habit DNA:", error);
    return null;
  }
};

/**
 * Generate RPG character image from habit data using Gemini's native image generation
 */
export const generateCharacterImage = async (
  habits: Habit[],
  metrics: HabitDNAMetrics,
  archetype: HabitDNAArchetype
): Promise<string | null> => {
  try {
    const ai = getGeminiClient();

    // Map categories to RPG visual elements
    const categoryVisuals: Record<string, string> = {
      'Fitness': 'muscular warrior with battle gauntlets and armored boots',
      'Health': 'nature druid with glowing healing herbs and a verdant cloak',
      'Reading': 'arcane scholar with floating spell books and enchanted spectacles',
      'Meditation': 'zen monk with ethereal aura rings and prayer beads',
      'Productivity': 'clockwork engineer with mechanical gear accessories and brass goggles',
      'Creative': 'spellweaver bard with a luminous lyre and paint-splattered robes',
      'Social': 'charismatic paladin with a golden shield and banner cape',
      'Learning': 'sage wizard with ancient scrolls and a crystal staff',
      'Finance': 'merchant lord with coin-adorned armor and treasure map',
      'Mindfulness': 'spirit walker with translucent robes and floating crystals',
    };

    // Determine outfit elements from habit categories
    const categories = [...new Set(habits.map(h => h.category))];
    const outfitElements = categories
      .map(cat => categoryVisuals[cat] || `adventurer with ${cat.toLowerCase()}-themed gear`)
      .join(', blended with ');

    // Map consistency to posture/confidence
    const consistencyDesc = metrics.consistencyRhythm > 75
      ? 'standing tall with unwavering confidence, radiating power'
      : metrics.consistencyRhythm > 40
        ? 'in a ready battle stance, alert and determined'
        : 'crouching in the shadows, gathering strength';

    // Map streak resilience to armor
    const armorDesc = metrics.streakResilience > 75
      ? 'wearing legendary phoenix-forged armor that glows with inner fire, unbreakable'
      : metrics.streakResilience > 40
        ? 'clad in sturdy enchanted chainmail with battle scars showing experience'
        : 'wearing light leather armor, agile and adaptable';

    // Map growth velocity to energy effects
    const energyDesc = metrics.growthVelocity > 75
      ? 'with blazing energy wings erupting from their back, surrounded by ascending power particles'
      : metrics.growthVelocity > 40
        ? 'with a glowing aura halo and sparks of emerging power'
        : 'with subtle magical embers floating gently around them';

    // Map category harmony to symmetry
    const harmonyDesc = metrics.categoryHarmony > 75
      ? 'perfectly balanced elemental powers swirling in harmony around them'
      : metrics.categoryHarmony > 40
        ? 'a mix of elemental powers, some stronger than others'
        : 'one dominant element overpowering the others with raw intensity';

    // Map total completions to rank/tier
    const tierDesc = metrics.totalCompletions > 100
      ? 'LEGENDARY rank, diamond-tier, wreathed in celestial light'
      : metrics.totalCompletions > 50
        ? 'EPIC rank, gold-tier, with prestigious insignia'
        : metrics.totalCompletions > 20
          ? 'RARE rank, silver-tier, showing clear potential'
          : 'COMMON rank, bronze-tier, at the start of their journey';

    // Map average streak to companion
    const companionDesc = metrics.averageStreakLength > 14
      ? 'accompanied by a majestic phoenix familiar perched on their shoulder'
      : metrics.averageStreakLength > 7
        ? 'with a loyal wolf spirit companion at their side'
        : metrics.averageStreakLength > 3
          ? 'with a small glowing fairy companion orbiting them'
          : 'with a tiny spark of light following them';

    const prompt = `Create a single RPG character in a flat 2D illustrated style. Clean dark background. The character should be:

CORE IDENTITY: "${archetype.name}" — ${archetype.title}
PERSONALITY: ${archetype.traits.join(', ')}

APPEARANCE:
- ${outfitElements}
- ${consistencyDesc}
- ${armorDesc}
- ${energyDesc}
- ${harmonyDesc}
- ${tierDesc}
- ${companionDesc}

COLOR PALETTE: Use these exact colors as primary accents: ${archetype.colorPalette.join(', ')}

STYLE: Clean flat 2D vector-style illustration. Think modern mobile game character art — bold outlines, flat colors with minimal shading, simple geometric shapes. Full body character centered in frame. Solid dark background. NOT 3D, NOT photorealistic, NOT detailed painting. Simple, colorful, and charming like a character select screen in a mobile RPG.

IMPORTANT: Single character only. No text, no UI elements, no watermarks. Square aspect ratio.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: prompt,
      config: {
        responseModalities: ['Text', 'Image'],
      }
    });

    if (response.candidates && response.candidates[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          return part.inlineData.data; // base64 string
        }
      }
    }

    return null;
  } catch (error) {
    console.error("Error generating character image:", error);
    return null;
  }
};
