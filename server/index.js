import express from 'express';
import cors from 'cors';
import puppeteer from 'puppeteer';
import { AssemblyAI } from 'assemblyai';
import { GoogleGenAI } from '@google/genai';
import ytdl from '@distube/ytdl-core';
import dotenv from 'dotenv';
dotenv.config(); // Load variables from .env file

const app = express();
const PORT = 3001;

// Enable CORS for frontend
app.use(cors());
app.use(express.json());

import { fetchNews } from './newsService.js';

// News Endpoint
app.get('/api/news', async (req, res) => {
    const { lang = 'de' } = req.query;
    try {
        const news = await fetchNews(lang);
        res.json(news);
    } catch (error) {
        console.error('News API Error:', error);
        res.status(500).json({ error: 'Failed to fetch news' });
    }
});

// Gemini Proxy Endpoint
app.post('/api/gemini', async (req, res) => {
    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: 'GEMINI_API_KEY not configured on server' });
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const result = await ai.models.generateContent(req.body);
        res.json(result);
    } catch (error) {
        console.error('Gemini Proxy Error:', error);
        res.status(500).json({ error: 'Gemini request failed', details: error.message });
    }
});

// AssemblyAI Client
const client = new AssemblyAI({
    apiKey: process.env.ASSEMBLYAI_API_KEY || 'YOUR_API_KEY_HERE'
});

// Helper to unescape XML entities
const unescapeXml = (str) => {
    return str.replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
};

// Puppeteer Scraper Function
async function scrapeTranscript(videoId, lang = 'en') {
    console.log(`Launching Puppeteer for ${videoId} (${lang})...`);
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox'] // Required for some environments
        });
        const page = await browser.newPage();

        // Use a real user agent
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        console.log('Navigating to video page...');
        await page.goto(`https://www.youtube.com/watch?v=${videoId}`, { waitUntil: 'domcontentloaded' });

        // Extract player response from page global variable
        console.log('Extracting player response...');
        const playerResponse = await page.evaluate(() => {
            // YouTube stores data in ytInitialPlayerResponse
            if (window.ytInitialPlayerResponse) return window.ytInitialPlayerResponse;
            return null;
        });

        if (!playerResponse || !playerResponse.captions) {
            console.log('No global player response, trying to find script tag data...');
            // Fallback: Try regex on page content if global var isn't ready
            // But actually, Puppeteer ensures scripts run.
            throw new Error('No captions found in player response. Video might be restricted.');
        }

        const captionTracks = playerResponse.captions.playerCaptionsTracklistRenderer?.captionTracks;
        if (!captionTracks || captionTracks.length === 0) {
            throw new Error('No caption tracks found.');
        }

        console.log(`Found ${captionTracks.length} caption tracks.`);

        // Find correct language
        let track = captionTracks.find(t => t.languageCode === lang);
        if (!track && lang === 'de') {
            track = captionTracks.find(t => t.languageCode.startsWith('de'));
        }
        if (!track) {
            console.log(`Language ${lang} not found, falling back to English/First available.`);
            track = captionTracks.find(t => t.languageCode === 'en') || captionTracks[0];
        }

        console.log(`Fetching captions from: ${track.baseUrl}`);

        // Fetch the XML using fetch inside Node (since we have the URL now)
        const transcriptResponse = await fetch(track.baseUrl);
        const transcriptXml = await transcriptResponse.text();

        // Parse XML
        const segments = [];
        const textRegex = /<text[^>]*>([^<]*)<\/text>/g;

        let match;
        while ((match = textRegex.exec(transcriptXml)) !== null) {
            const tag = match[0];
            const content = match[1];

            const startMatch = /start="([\d.]+)"/.exec(tag);
            const durMatch = /dur="([\d.]+)"/.exec(tag);

            if (content.trim()) {
                segments.push({
                    start: startMatch ? parseFloat(startMatch[1]) : 0,
                    duration: durMatch ? parseFloat(durMatch[1]) : 0,
                    text: unescapeXml(content)
                });
            }
        }

        return {
            segments,
            language: track.languageCode
        };

    } finally {
        if (browser) await browser.close();
    }
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Transcript server running (Puppeteer + AssemblyAI)' });
});

// Transcript fetching endpoint (Default Scraper)
app.get('/api/transcript', async (req, res) => {
    const { videoId, lang = 'en' } = req.query;

    if (!videoId) {
        return res.status(400).json({ error: 'videoId is required' });
    }

    try {
        const data = await scrapeTranscript(videoId, lang);

        const rawText = data.segments.map(s => s.text).join(' ');

        res.json({
            videoId,
            language: data.language,
            rawText,
            segments: data.segments,
            wordCount: rawText.split(' ').length
        });

    } catch (error) {
        console.error('Error fetching transcript:', error.message);

        // Fallback Demo
        if (error) {
            console.log('YouTube fetch/parse failed, using demo transcript...', error.message);
            const demoTranscript = `Hallo und herzlich willkommen zu unserem Video über die deutsche Sprache. Heute werden wir über die Grundlagen der Grammatik sprechen. Die deutsche Sprache hat vier Fälle der Nominativ der Akkusativ der Dativ und der Genitiv. Jeder Fall hat seine eigene Funktion im Satz. Der Nominativ wird für das Subjekt verwendet. Der Akkusativ zeigt das direkte Objekt. Der Dativ wird für das indirekte Objekt benutzt. Und der Genitiv zeigt Besitz oder Zugehörigkeit an. Dies sind die wichtigsten Konzepte die man am Anfang lernen sollte. Vielen Dank fürs Zuschauen und bis zum nächsten Mal`;

            return res.json({
                videoId,
                requestedLanguage: lang,
                actualLanguage: 'de',
                rawText: demoTranscript,
                segments: [{ text: demoTranscript, start: 0, duration: 60 }],
                wordCount: demoTranscript.split(' ').length,
                isDemo: true
            });
        }
    }
});


// Proxy for Leo.org Dictionary (Faster & Better for German)
app.get('/api/translate/leo', async (req, res) => {
    const { word, lang = 'ende' } = req.query; // 'ende' = German<->English

    if (!word) {
        return res.status(400).json({ error: 'Word is required' });
    }

    try {
        const url = `https://dict.leo.org/dictQuery/m-vocab/${lang}/query.xml?tolerMode=nof&lp=${lang}&lang=de&rmWords=off&rmSearch=on&search=${encodeURIComponent(word)}&searchLoc=0&resultOrder=basic&multiwordShowSingle=on`;

        console.log(`Fetching from Leo: ${url}`);
        const response = await fetch(url);
        const xml = await response.text();

        // 1. Extract first entry
        const entryMatch = /<entry[^>]*>(.*?)<\/entry>/s.exec(xml);
        if (entryMatch) {
            const entryContent = entryMatch[1];
            // 2. Extract English side (assuming 'en' is target)
            const sideMatch = /<side[^>]*lang="en"[^>]*>(.*?)<\/side>/s.exec(entryContent);
            if (sideMatch) {
                const sideContent = sideMatch[1];
                // 3. Extract the word inside <words>...<word>...</word>...
                const wordMatch = /<word[^>]*>(.*?)<\/word>/s.exec(sideContent);
                if (wordMatch) {
                    let translation = unescapeXml(wordMatch[1]);
                    translation = translation.replace(/<[^>]+>/g, '');
                    return res.json({ translation });
                }
            }
        }
        return res.json({ translation: null, message: "No direct match found" });

    } catch (error) {
        console.error("Leo Proxy Error:", error);
        res.status(500).json({ error: "Failed to fetch from Leo" });
    }
});


// AssemblyAI Transcription Endpoint
app.post('/api/assemblyai/transcribe', async (req, res) => {
    const { videoId, languageCode } = req.body;

    if (!videoId) {
        return res.status(400).json({ error: 'videoId is required' });
    }

    // Check API Key
    if (!process.env.ASSEMBLYAI_API_KEY) {
        return res.status(500).json({ error: 'ASSEMBLYAI_API_KEY not configured on server' });
    }

    const tempFilePath = `/tmp/audio_${videoId}_${Date.now()}.m4a`;

    try {
        console.log(`Starting AssemblyAI transcription for video: ${videoId}`);

        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

        // 1. Download audio using yt-dlp (more reliable than ytdl-core)
        console.log('Downloading audio from YouTube using yt-dlp...');

        const { unlinkSync, existsSync } = await import('fs');
        const { exec } = await import('child_process');
        const { promisify } = await import('util');
        const execAsync = promisify(exec);

        const ytdlpPath = './yt-dlp'; // Local yt-dlp binary

        try {
            const { stdout, stderr } = await execAsync(
                `${ytdlpPath} -f "bestaudio[ext=m4a]/bestaudio" -o "${tempFilePath}" --no-playlist "${videoUrl}"`,
                { timeout: 120000 } // 2 minute timeout
            );
            console.log('Audio downloaded successfully.');
            if (stderr) console.log('yt-dlp stderr:', stderr);
        } catch (ytdlpError) {
            console.error('yt-dlp failed:', ytdlpError.message);
            return res.status(500).json({ error: 'Failed to extract audio from YouTube. Video might be restricted.' });
        }

        // 2. Upload to AssemblyAI
        console.log('Uploading audio to AssemblyAI...');
        const uploadUrl = await client.files.upload(tempFilePath);
        console.log('Audio uploaded to AssemblyAI.');

        // 3. Submit for transcription
        const config = {
            audio_url: uploadUrl,
            speaker_labels: true,
            language_code: languageCode || undefined
        };

        const transcript = await client.transcripts.transcribe(config);

        // Clean up temp file
        if (existsSync(tempFilePath)) {
            unlinkSync(tempFilePath);
        }

        if (transcript.status === 'error') {
            throw new Error(transcript.error);
        }

        // 3. Process Result - Include word-level timestamps
        const segments = [];
        if (transcript.utterances) {
            for (const utterance of transcript.utterances) {
                // Get words for this utterance
                const utteranceWords = transcript.words
                    ? transcript.words.filter(w => w.start >= utterance.start && w.end <= utterance.end)
                    : [];

                segments.push({
                    text: utterance.text,
                    speaker: `Speaker ${utterance.speaker}`,
                    start: utterance.start / 1000, // Convert ms to seconds for frontend
                    duration: (utterance.end - utterance.start) / 1000,
                    fullSentence: utterance.text,
                    words: utteranceWords.map(w => ({
                        text: w.text,
                        start: w.start / 1000,
                        end: w.end / 1000
                    }))
                });
            }
        } else {
            // Fallback if no utterances (sometimes happens with short audio or no diarization)
            const allWords = transcript.words || [];
            segments.push({
                text: transcript.text,
                start: 0,
                duration: transcript.audio_duration || 0,
                speaker: 'Speaker A',
                words: allWords.map(w => ({
                    text: w.text,
                    start: w.start / 1000,
                    end: w.end / 1000
                }))
            });
        }

        console.log(`AssemblyAI success: ${segments.length} segments.`);
        res.json({ segments });

    } catch (error) {
        console.error('AssemblyAI Error:', error);
        res.status(500).json({ error: 'AssemblyAI transcription failed', details: error.message });
    }
});


app.listen(PORT, () => {
    console.log(`🚀 Transcript server running on http://localhost:${PORT}`);
    console.log(`📝 Default API: http://localhost:${PORT}/api/transcript?videoId=VIDEO_ID`);
    console.log(`🎙️ AssemblyAI API: POST http://localhost:${PORT}/api/assemblyai/transcribe`);
});
