import { TranscriptSegment } from '../types';

/**
 * AssemblyAI Service (Frontend)
 * Delegates complex processing to the backend API to keep secrets safe and handle audio extraction.
 */

const normalizeBase = (base: string) => base.replace(/\/+$/, '');
const resolveApiBaseUrl = () => {
    const envBase = import.meta.env.VITE_API_BASE_URL as string | undefined;
    if (envBase) return normalizeBase(envBase);
    if (import.meta.env.DEV) return 'http://localhost:3001';
    if (typeof window !== 'undefined') return window.location.origin;
    return '';
};

const API_BASE_URL = (() => {
    const base = resolveApiBaseUrl();
    if (!base) return '/api';
    return base.endsWith('/api') ? base : `${base}/api`;
})();

/**
 * Request audio-based speaker diarization for a YouTube video
 * @param videoId - YouTube Video ID
 * @param languageCode - Optional language code (e.g., 'de', 'fr', 'es')
 */
export const transcribeYouTubeVideo = async (
    videoId: string,
    languageCode?: string
): Promise<TranscriptSegment[]> => {
    console.log(`Requesting AssemblyAI transcription for ${videoId}...`);

    try {
        const response = await fetch(`${API_BASE_URL}/assemblyai/transcribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                videoId,
                languageCode
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Backend transcription failed');
        }

        const data = await response.json();

        // Backend returns "segments" in the correct format mostly, but let's ensure it matches Frontend Types
        return data.segments.map((s: any) => ({
            text: s.text,
            start: s.start,
            duration: s.duration,
            fullSentence: s.fullSentence || s.text,
            speaker: s.speaker
        }));

    } catch (error: any) {
        console.error('Frontend AssemblyAI Error:', error);
        throw error;
    }
};
