// Export helper functions for vocabulary
export const exportVocabularyAsCSV = (words: any[]) => {
    const csvHeader = 'Word,Translation,Context,Status,Added At\n';
    const csvRows = words.map(w =>
        `"${w.word}","${w.translation}","${w.context.replace(/"/g, '""')}","${w.status}","${new Date(w.addedAt).toLocaleString()}"`
    ).join('\n');

    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `waypoint-vocabulary-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
};

export const exportVocabularyAsJSON = (words: any[]) => {
    const json = JSON.stringify(words, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `waypoint-vocabulary-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
};
