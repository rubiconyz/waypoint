// Date utility functions used across the application

/**
 * Get date string in local timezone (YYYY-MM-DD)
 */
export const getLocalDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Parse local date string 'YYYY-MM-DD' to Date object at local midnight
 */
export const parseLocalDate = (dateStr: string): Date => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
};

/**
 * Get ISO week key for a date (YYYY-Wnn)
 */
export const getWeekKey = (date: Date): string => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${d.getFullYear()}-W${weekNo}`;
};

/**
 * Get array of last N days as date strings
 */
export const getLastNDays = (n: number): string[] => {
    const dates: string[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < n; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        dates.push(getLocalDateString(d));
    }
    return dates;
};
