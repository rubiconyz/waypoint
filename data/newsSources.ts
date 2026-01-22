
export interface NewsSource {
    name: string;
    language: string;
    feedUrl: string;
    category?: string;
}

export const NEWS_SOURCES: NewsSource[] = [
    // ENGLISH 🇬🇧
    { name: 'BBC News', language: 'en', feedUrl: 'http://feeds.bbci.co.uk/news/rss.xml' },
    { name: 'The Guardian', language: 'en', feedUrl: 'https://www.theguardian.com/world/rss' },
    { name: 'CNN', language: 'en', feedUrl: 'http://rss.cnn.com/rss/edition.rss' },

    // GERMAN 🇩🇪
    { name: 'Deutsche Welle', language: 'de', feedUrl: 'https://rss.dw.com/rdf/rss-de-all' },
    { name: 'Tagesschau', language: 'de', feedUrl: 'https://www.tagesschau.de/xml/rss2/' },
    { name: 'Der Spiegel', language: 'de', feedUrl: 'https://www.spiegel.de/schlagzeilen/index.rss' },

    // SPANISH 🇪🇸
    { name: 'BBC Mundo', language: 'es', feedUrl: 'https://feeds.bbci.co.uk/mundo/rss.xml' },
    { name: 'El País', language: 'es', feedUrl: 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada' },
    { name: 'CNN Español', language: 'es', feedUrl: 'https://cnnespanol.cnn.com/feed/' },

    // FRENCH 🇫🇷
    { name: 'France 24', language: 'fr', feedUrl: 'https://www.france24.com/fr/rss' },
    { name: 'Le Monde', language: 'fr', feedUrl: 'https://www.lemonde.fr/rss/une.xml' },
    { name: 'Le Figaro', language: 'fr', feedUrl: 'https://www.lefigaro.fr/rss/figaro_actualites.xml' },

    // ITALIAN 🇮🇹
    { name: 'ANSA', language: 'it', feedUrl: 'https://www.ansa.it/sito/ansait_rss.xml' },
    { name: 'Corriere della Sera', language: 'it', feedUrl: 'https://xml2.corriereobjects.it/rss/primapagina.xml' },
    { name: 'Rai News', language: 'it', feedUrl: 'https://www.rainews.it/rss/tutti' },

    // PORTUGUESE 🇵🇹
    { name: 'RTP', language: 'pt', feedUrl: 'https://www.rtp.pt/noticias/rss' },
    { name: 'Público', language: 'pt', feedUrl: 'https://feeds.feedburner.com/PublicoRSS' },
    { name: 'Jornal de Notícias', language: 'pt', feedUrl: 'https://www.jn.pt/rss/ultima-hora.xml' },

    // RUSSIAN 🇷🇺
    { name: 'BBC Russian', language: 'ru', feedUrl: 'https://feeds.bbci.co.uk/russian/rss.xml' },
    { name: 'Meduza', language: 'ru', feedUrl: 'https://meduza.io/rss/all' },
    { name: 'RT Russian', language: 'ru', feedUrl: 'https://russian.rt.com/rss' },

    // DUTCH 🇳🇱
    { name: 'NOS', language: 'nl', feedUrl: 'https://feeds.nos.nl/nosnieuwsalgemeen' },
    { name: 'NU.nl', language: 'nl', feedUrl: 'https://www.nu.nl/rss/Algemeen' },
    { name: 'Telegraaf', language: 'nl', feedUrl: 'https://www.telegraaf.nl/rss' },

    // JAPANESE 🇯🇵
    { name: 'NHK', language: 'ja', feedUrl: 'https://www.nhk.or.jp/rss/news/cat0.xml' },
    { name: 'Cnet Japan', language: 'ja', feedUrl: 'http://feeds.japan.cnet.com/rss/cnet/all' },

    // KOREAN 🇰🇷
    { name: 'Yonhap', language: 'ko', feedUrl: 'https://www.yonhapnewstv.co.kr/browse/feed/0301000000.xml' },
    { name: 'KBS', language: 'ko', feedUrl: 'http://news.kbs.co.kr/rss/rss.xml' },

    // CHINESE 🇨🇳
    { name: 'BBC Chinese', language: 'zh', feedUrl: 'https://feeds.bbci.co.uk/zhongwen/simp/rss.xml' },
];

export const getSourcesForLanguage = (langCode: string): NewsSource[] => {
    return NEWS_SOURCES.filter(s => s.language === langCode);
};
