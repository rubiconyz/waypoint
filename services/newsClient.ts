import { NewsArticle } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

export const fetchNewsHeadlines = async (languageCode: string): Promise<NewsArticle[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/news?lang=${languageCode}`);
        if (!response.ok) {
            throw new Error('Failed to fetch news');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching news:', error);
        return [];
    }
};
