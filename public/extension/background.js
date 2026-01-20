// Helper to unescape XML entities
const unescapeXml = (str) => {
    return str.replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'FETCH_TRANSCRIPT') {
        fetchTranscript(request.videoId, request.lang)
            .then(data => sendResponse({ success: true, data }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true; // Keep channel open for async response
    }
});

async function fetchTranscript(videoId, lang = 'en') {
    // 1. Fetch Video Page
    const pageResponse = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
    const html = await pageResponse.text();

    // 2. Extract Caption Tracks
    const captionMatch = html.match(/"captionTracks":(\[.*?\])/);
    if (!captionMatch) {
        // Try ytInitialPlayerResponse
        const playerResponseMatch = html.match(/var ytInitialPlayerResponse = ({.*?});/);
        if (playerResponseMatch) {
            const playerResponse = JSON.parse(playerResponseMatch[1]);
            const tracks = playerResponse.captions?.playerCaptionsTracklistRenderer?.captionTracks;
            if (tracks) {
                return parseTracks(tracks, lang);
            }
        }
        throw new Error('No captions found in this video.');
    }

    const captionTracks = JSON.parse(captionMatch[1]);
    return parseTracks(captionTracks, lang);
}

async function parseTracks(captionTracks, lang) {
    // 3. Find correct language
    let track = captionTracks.find(t => t.languageCode === lang);
    if (!track && lang === 'de') {
        track = captionTracks.find(t => t.languageCode.startsWith('de'));
    }
    if (!track) {
        track = captionTracks.find(t => t.languageCode === 'en') || captionTracks[0];
    }

    if (!track) throw new Error('No compatible track found');

    // 4. Fetch Transcript XML
    const transcriptResponse = await fetch(track.baseUrl);
    const transcriptXml = await transcriptResponse.text();

    // 5. Parse XML
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
        language: track.languageCode,
        rawText: segments.map(s => s.text).join(' ')
    };
}

// === TIME TRACKING LOGIC ===
let activeTabId = null;
let activeDomain = null;
let startTime = Date.now();
const TRACKED_DOMAINS = ['youtube.com', 'duolingo.com', 'dw.com', 'leo.org'];

// 1. Detect active tab change
chrome.tabs.onActivated.addListener(activeInfo => {
    updateTimeLog();
    activeTabId = activeInfo.tabId;
    checkTabDomain(activeTabId);
});

// 2. Detect URL change
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tabId === activeTabId && changeInfo.url) {
        updateTimeLog();
        checkTabDomain(tabId);
    }
});

// 3. Detect window focus change
chrome.windows.onFocusChanged.addListener(windowId => {
    updateTimeLog();
    if (windowId === chrome.windows.WINDOW_ID_NONE) {
        activeDomain = null; // No focus
    } else {
        chrome.tabs.query({ active: true, windowId }, tabs => {
            if (tabs.length) {
                activeTabId = tabs[0].id;
                checkTabDomain(activeTabId);
            }
        });
    }
});

function checkTabDomain(tabId) {
    chrome.tabs.get(tabId, tab => {
        if (chrome.runtime.lastError || !tab || !tab.url) {
            activeDomain = null;
            return;
        }

        try {
            const url = new URL(tab.url);
            const domain = TRACKED_DOMAINS.find(d => url.hostname.includes(d));
            if (domain) {
                activeDomain = domain;
                startTime = Date.now();
            } else {
                activeDomain = null;
            }
        } catch (e) {
            activeDomain = null;
        }
    });
}

function updateTimeLog() {
    if (activeDomain) {
        const now = Date.now();
        const durationSec = Math.round((now - startTime) / 1000);
        if (durationSec > 0) {
            const dateStr = new Date().toISOString().split('T')[0];

            chrome.storage.local.get(['IMMERSION_LOGS'], (result) => {
                const logs = result.IMMERSION_LOGS || {};
                logs[dateStr] = (logs[dateStr] || 0) + durationSec;
                chrome.storage.local.set({ IMMERSION_LOGS: logs });
                console.log(`Logged ${durationSec}s for ${activeDomain} on ${dateStr}`);
            });
        }
    }
    startTime = Date.now();
}

// Periodically save (every 60s) to prevet data loss on crash
setInterval(updateTimeLog, 60000);
