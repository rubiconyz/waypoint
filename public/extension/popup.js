// Waypoint Importer 2.3 - With Timestamps for Sync

document.getElementById('importBtn').addEventListener('click', async () => {
    const status = document.getElementById('status');
    const btn = document.getElementById('importBtn');

    btn.disabled = true;
    btn.textContent = 'Importing...';
    status.textContent = 'Checking transcript panel...';

    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        if (!tab.url.includes('youtube.com/watch')) {
            throw new Error('Not a YouTube video page');
        }

        // Extract transcript from the page
        const [result] = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                const wait = (ms) => new Promise(r => setTimeout(r, ms));

                // Helper to parse "MM:SS" or "HH:MM:SS" to seconds
                const parseTime = (str) => {
                    const parts = str.trim().split(':').map(Number);
                    if (parts.length === 2) return parts[0] * 60 + parts[1];
                    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
                    return 0;
                };

                // Check if transcript panel is visible
                const panel = document.querySelector('ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-searchable-transcript"]');

                if (!panel || panel.getAttribute('visibility') !== 'ENGAGEMENT_PANEL_VISIBILITY_EXPANDED') {
                    return {
                        error: 'PANEL_NOT_OPEN',
                        message: 'Please open the transcript manually first:\n1. Click "...more" below the video\n2. Click "Show transcript"\n3. Then click Import again'
                    };
                }

                // Extract segments (timestamp + text)
                const rendererElements = panel.querySelectorAll('ytd-transcript-segment-renderer');

                if (rendererElements.length === 0) {
                    // Fallback check for raw text elements if renderers aren't found
                    const textOnly = panel.querySelectorAll('.segment-text');
                    if (textOnly.length > 0) {
                        // Fallback: No timestamps, just text
                        const texts = Array.from(textOnly).map(t => ({ text: t.textContent.trim(), start: 0 }));
                        return { rawText: texts.map(t => t.text).join(' '), segments: texts, count: texts.length };
                    }
                    return { error: 'NO_SEGMENTS', message: 'Transcript panel is open but contains no text segments.' };
                }

                const segments = [];
                for (const el of rendererElements) {
                    const timeEl = el.querySelector('.segment-timestamp');
                    const textEl = el.querySelector('.segment-text');

                    const timeStr = timeEl ? timeEl.textContent.trim() : "0:00";
                    const text = textEl ? textEl.textContent.trim() : "";

                    if (text && text.length > 0) {
                        segments.push({
                            text,
                            start: parseTime(timeStr),
                            // Duration will be calculated relative to next segment
                            duration: 0
                        });
                    }
                }

                // Calculate rough durations
                for (let i = 0; i < segments.length; i++) {
                    if (i < segments.length - 1) {
                        segments[i].duration = segments[i + 1].start - segments[i].start;
                    } else {
                        segments[i].duration = 5; // Default for last segment
                    }
                }

                if (segments.length === 0) {
                    return { error: 'NO_TEXT', message: 'Could not extract text from transcript segments.' };
                }

                return {
                    rawText: segments.map(s => s.text).join(' '), // Raw backup
                    segments,
                    count: segments.length
                };
            }
        });

        const data = result.result;

        if (data.error) {
            throw new Error(data.message || data.error);
        }

        if (data.segments.length === 0) {
            throw new Error('Extracted transcript was empty.');
        }

        status.textContent = `Found ${data.count} synced segments! Opening Waypoint...`;

        const videoId = new URL(tab.url).searchParams.get('v');
        const importData = {
            videoId,
            rawText: data.rawText,
            segments: data.segments,
            timestamp: Date.now()
        };

        await chrome.storage.local.set({ 'PENDING_IMPORT': importData });
        chrome.tabs.create({ url: 'http://localhost:3000/immersion' });
        window.close();

    } catch (e) {
        status.textContent = e.message;
        status.style.color = 'red';
        status.style.whiteSpace = 'pre-line';
        btn.disabled = false;
        btn.textContent = 'Try Again';
    }
});
