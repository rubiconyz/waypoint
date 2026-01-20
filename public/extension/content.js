console.log("HabitVision Extension Bridge Loaded");

// Notify web app that extension is present
window.postMessage({ source: 'HABIT_VISION_EXT', type: 'EXTENSION_READY' }, '*');

// CHECK FOR PENDING IMPORT (LingQ Sytle)
chrome.storage.local.get(['PENDING_IMPORT', 'IMMERSION_LOGS'], (result) => {
    // 1. Pending Transcript Import
    if (result.PENDING_IMPORT) {
        console.log("Found pending import from extension!", result.PENDING_IMPORT);
        setTimeout(() => {
            window.postMessage({
                source: 'HABIT_VISION_EXT',
                type: 'EXTENSION_IMPORT_DATA',
                payload: result.PENDING_IMPORT
            }, '*');
            chrome.storage.local.remove('PENDING_IMPORT');
        }, 1000);
    }

    // 2. Sync Immersion Time Logs
    if (result.IMMERSION_LOGS) {
        console.log("Syncing immersion logs from extension", result.IMMERSION_LOGS);
        setTimeout(() => {
            window.postMessage({
                source: 'HABIT_VISION_EXT',
                type: 'SYNC_IMMERSION_LOGS',
                payload: result.IMMERSION_LOGS
            }, '*');
        }, 1500);
    }
});

// Listen for messages from the Web App
window.addEventListener('message', (event) => {
    // Only accept messages from the same window
    if (event.source !== window) return;

    if (event.data.type && event.data.type === 'FETCH_TRANSCRIPT') {
        const { videoId, lang } = event.data;
        console.log(`Extension received request: ${videoId}`);

        // Forward to background script
        chrome.runtime.sendMessage(
            { type: 'FETCH_TRANSCRIPT', videoId, lang },
            (response) => {
                if (response && response.success) {
                    window.postMessage({
                        source: 'HABIT_VISION_EXT',
                        type: 'TRANSCRIPT_RESULT',
                        payload: response.data
                    }, '*');
                } else {
                    window.postMessage({
                        source: 'HABIT_VISION_EXT',
                        type: 'TRANSCRIPT_ERROR',
                        error: response?.error || 'Unknown extension error'
                    }, '*');
                }
            }
        );
    }
});
