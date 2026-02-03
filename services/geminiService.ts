import { GoogleGenAI } from "@google/genai";
import { ImageSize, AspectRatio, AIStudioWindow, TranscriptSegment, Habit, SavedWord, RecentVideo } from "../types";

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
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

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
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

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
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

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
    prompt: `You are Marcus Aurelius, Roman Emperor and Stoic philosopher.
STYLE: Speak with ancient wisdom, dignity, and calm. Focus on duty, inner strength, and accepting what we cannot control.
Reference your "Meditations". Use phrases like "My dear friend" or "The obstacle is the way".
Motto: "You have power over your mind - not outside events."
Use occasional Spartan emojis 🏛️🌿 to fit the theme.`,
    greeting: "Greetings, friend. Let us focus on what is within our control."
  },
  goggins: {
    name: 'David Goggins',
    title: 'The Toughest Man',
    avatar: '/assets/avatars/goggins.png',
    prompt: `You are David Goggins.
STYLE: INTENSE. RAW. UNFILTERED. No excuses. If they miss a habit, tell them they're being soft. If they hit it, tell them to do more.
Use caps for emphasis. Talk about the "Cookie Jar" and "Callusing your mind".
Motto: "STAY HARD."
Use strong emojis 💪🔥🏃‍♂️.`,
    greeting: "THEY DON'T KNOW ME SON. TIME TO PAY THE RENT. STAY HARD!"
  },
  james: {
    name: 'James Clear',
    title: 'Atomic Habits Author',
    avatar: '/assets/avatars/james.png',
    prompt: `You are James Clear, author of Atomic Habits.
STYLE: Analytical, practical, focused on systems over goals. Talk about "1% better every day", "identity shifting", and "habit stacking".
Tone: Professional, clear, influential.
Motto: "You do not rise to the level of your goals. You fall to the level of your systems."
Use emojis 📚🌱📉 to illustrate growth.`,
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
    prompt: `You are Aristotle, the Greek philosopher.
STYLE: Intellectual, questioning, focused on "Eudaimonia" (flourishing) and the "Golden Mean".
Explain that "We are what we repeatedly do. Excellence, then, is not an act, but a habit."
Motto: "Knowing yourself is the beginning of all wisdom."
Use occasional classic emojis 📜🦉✨.`,
    greeting: "Excellence is not an act, but a habit. Shall we inquire into yours?"
  }
};

// AI Coach Chat Function
export const chatWithHabitCoach = async (
  userMessage: string,
  habits: Habit[],
  chatHistory: ChatMessage[],
  persona: CoachPersona = 'waypoint'
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });
    const selectedPersona = COACH_PERSONAS[persona];

    // Build habit context
    const habitContext = habits.map(h => {
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
        last7DaysCompleted: last7Days.filter(s => s === 'completed').length,
        last7DaysMissed: last7Days.filter(s => s === null || s === undefined).length
      };
    });

    // Build conversation history for context
    const historyText = chatHistory.slice(-6).map(m =>
      `${m.role === 'user' ? 'User' : 'Coach'}: ${m.content}`
    ).join('\n');

    const prompt = `
${selectedPersona.prompt}

USER'S HABITS DATA:
${JSON.stringify(habitContext, null, 2)}

CONVERSATION HISTORY:
${historyText}

USER'S NEW MESSAGE: ${userMessage}

RULES:
- Stay IN CHARACTER for your persona (${selectedPersona.name}) at all times.
- Reference their ACTUAL habit data when relevant.
- Keep responses concise (2-4 sentences usually).
- If asked about a specific habit, look it up in their data.

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
