const API_URL = 'http://localhost:3001';

export const fetchTranscript = async (videoId: string, languageCode: string): Promise<string> => {
    try {
        const response = await fetch(`${API_URL}/api/transcript?videoId=${videoId}&lang=${languageCode}`);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch transcript');
        }

        const data = await response.json();
        return data.rawText;
    } catch (error) {
        console.error('Error fetching transcript:', error);

        // Friendly error messages
        if (error instanceof Error) {
            if (error.message.includes('fetch')) {
                throw new Error('Cannot connect to transcript server. Make sure the backend is running on port 3001.');
            }
            throw error;
        }

        throw new Error('Unknown error occurred while fetching transcript');
    }
};
