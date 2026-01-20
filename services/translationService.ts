
const API_URL = 'https://api.mymemory.translated.net/get';

interface TranslationResponse {
    responseData: {
        translatedText: string;
        match: number;
    };
    responseStatus: number;
}

export const translateWord = async (
    text: string,
    sourceLang: string,
    targetLang: string
): Promise<string | null> => {
    try {
        // 1. Try Local Leo Proxy (Best for German)
        if (sourceLang === 'de' || targetLang === 'de') {
            try {
                // Determine pair (e.g. 'ende', 'frde')
                const otherLang = sourceLang === 'de' ? targetLang : sourceLang;
                // Leo pairs usually sorted roughly, mostly 'ende', 'frde', 'esde'.
                // 'ende' means En<->De.
                const langPair = `${otherLang}de`; // e.g. 'ende'

                const res = await fetch(`http://localhost:3001/api/translate/leo?word=${encodeURIComponent(text)}&lang=${langPair}`);
                const data = await res.json();
                if (data && data.translation) {
                    return data.translation;
                }
            } catch (e) {
                console.warn("Leo Proxy unavailable, falling back...", e);
            }
        }

        // 2. Fallback to MyMemory
        const langPair = `${sourceLang}|${targetLang}`;
        const url = `${API_URL}?q=${encodeURIComponent(text)}&langpair=${langPair}`;

        const response = await fetch(url);
        const data: TranslationResponse = await response.json();

        if (data.responseStatus === 200 && data.responseData.translatedText) {
            return data.responseData.translatedText;
        }
        return null;
    } catch (error) {
        console.error("Translation Error:", error);
        return null;
    }
};
