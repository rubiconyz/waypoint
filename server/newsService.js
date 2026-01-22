import Parser from 'rss-parser';
import NodeCache from 'node-cache';


const parser = new Parser();
const newsCache = new NodeCache({ stdTTL: 3600 }); // 1 hour text cache

// RSS Feeds Configuration
const NEWS_SOURCES = {
    de: [
        { name: 'Deutsche Welle', url: 'https://rss.dw.com/rdf/rss-de-all' },
        { name: 'Tagesschau', url: 'https://www.tagesschau.de/xml/rss2/' }
    ],
    es: [
        { name: 'BBC Mundo', url: 'https://feeds.bbci.co.uk/mundo/rss.xml' },
        { name: 'El País', url: 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada' }
    ],
    fr: [
        { name: 'France 24', url: 'https://www.france24.com/fr/rss' },
        { name: 'Le Monde', url: 'https://www.lemonde.fr/rss/une.xml' }
    ],
    it: [
        { name: 'ANSA', url: 'https://www.ansa.it/sito/ansait_rss.xml' },
        { name: 'Corriere della Sera', url: 'https://xml2.corriereobjects.it/rss/primapagina.xml' }
    ],
    pt: [
        { name: 'RTP', url: 'https://www.rtp.pt/noticias/rss' },
        { name: 'Público', url: 'https://feeds.feedburner.com/PublicoRSS' }
    ],
    ru: [
        { name: 'BBC Russian', url: 'https://feeds.bbci.co.uk/russian/rss.xml' },
        { name: 'Meduza', url: 'https://meduza.io/rss/all' }
    ],
    nl: [
        { name: 'NOS', url: 'https://feeds.nos.nl/nosnieuwsalgemeen' },
        { name: 'NU.nl', url: 'https://www.nu.nl/rss/Algemeen' }
    ],
    ja: [
        { name: 'NHK', url: 'https://www.nhk.or.jp/rss/news/cat0.xml' },
        { name: 'Asahi', url: 'https://www.asahi.com/rss/asahi/newsheadlines.rdf' }
    ],
    ko: [
        { name: 'Yonhap', url: 'https://www.yonhapnewstv.co.kr/browse/feed/0301000000.xml' },
        { name: 'KBS', url: 'http://news.kbs.co.kr/rss/rss.xml' }
    ],
    zh: [
        { name: 'BBC Chinese', url: 'https://feeds.bbci.co.uk/zhongwen/simp/rss.xml' }
    ]
};

// Helper: Clean text (remove HTML tags, limit length)
const cleanText = (text, limit = 200) => {
    if (!text) return '';
    const cleaned = text.replace(/<[^>]+>/g, '').trim();
    // or use stripHtml if the regex isn't enough, but usually for RSS excerpts regex is fine
    // Let's stick to simple regex for now to avoid extra dependency 'string-strip-html' 
    // unless strictly needed. Wait, I imported it but didn't install it. 
    // I should probably remove the import and just use regex or install it. 
    // Let's use regex for simplicity as RSS excerpts are usually simple.

    return cleaned.length > limit ? cleaned.substring(0, limit) + '...' : cleaned;
};

export const fetchNews = async (lang) => {
    if (!NEWS_SOURCES[lang]) {
        return [];
    }

    const cacheKey = `news_${lang}`;
    const cached = newsCache.get(cacheKey);
    if (cached) {
        console.log(`Returning cached news for ${lang}`);
        return cached;
    }

    console.log(`Fetching news for ${lang}...`);
    let allArticles = [];

    // Fetch from all sources for this language in parallel
    const promises = NEWS_SOURCES[lang].map(async (source) => {
        try {
            const feed = await parser.parseURL(source.url);
            return feed.items.map(item => ({
                id: item.guid || item.link,
                title: item.title,
                excerpt: cleanText(item.contentSnippet || item.content),
                source: source.name,
                url: item.link,
                publishedAt: item.isoDate || item.pubDate,
                language: lang
            })).slice(0, 5); // Take top 5 from each source
        } catch (error) {
            console.error(`Error fetching RSS from ${source.name}:`, error.message);
            return [];
        }
    });

    const results = await Promise.all(promises);
    allArticles = results.flat().sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

    newsCache.set(cacheKey, allArticles);
    return allArticles;
};
