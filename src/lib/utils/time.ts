import {
    vi,
    enUS,
    fr,
    ja,
    ko,
    zhCN,
    de,
    es,
    it,
    ru,
    Locale,
} from 'date-fns/locale';

const localeMap: Record<string, Locale> = {
    vi,
    en: enUS,
    fr,
    ja,
    ko,
    zh: zhCN,
    de,
    es,
    it,
    ru,
};

/**
 * Automatically detects the user's locale.
 * - Prioritizes navigator.language (frontend)
 * - Falls back to system locale (backend)
 * - Supports multiple languages
 */
export function detectLocale(): Locale {
    let langCode = 'en';

    // Frontend
    if (typeof navigator !== 'undefined' && navigator.language) {
        langCode = navigator.language.split('-')[0].toLowerCase();
    }
    // Backend
    else if (typeof Intl !== 'undefined') {
        langCode = Intl.DateTimeFormat()
            .resolvedOptions()
            .locale.split('-')[0]
            .toLowerCase();
    }

    return localeMap[langCode] || enUS;
}

import {format, formatDistanceToNow, parseISO} from 'date-fns';

export type DateFormatType =
    | 'datetime'
    | 'date'
    | 'time'
    | 'short'
    | 'long'
    | 'relative'
    | 'custom'
    | 'month_day_year'
    | 'month_day_time_ampm';

interface FormatOptions {
    locale?: string | 'auto';
    customFormat?: string;
}

/**
 * Formats an ISO date string or Date object into a localized, human-readable format.
 * @param dateInput - ISO date string (e.g. "2023-01-20T15:30:00Z") or a Date object
 * @param type - The desired output type
 * @param options - Optional locale or custom format
 */
export function formatISOTime(
    dateInput: string | Date,
    type: DateFormatType = 'datetime',
    options: FormatOptions = {locale: 'auto'}
): string {
    if (!dateInput) return '';

    const date = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
    const locale =
        options.locale === 'auto'
            ? detectLocale()
            : detectLocaleFromCode(options.locale || 'en');

    switch (type) {
        case 'date':
            return format(date, 'dd/MM/yyyy', {locale});
        case 'time':
            return format(date, 'HH:mm:ss', {locale});
        case 'datetime':
            return format(date, 'dd/MM/yyyy HH:mm', {locale});
        case 'short':
            return format(date, 'dd/MM HH:mm', {locale});
        case 'long':
            return format(date, "EEEE, dd MMMM yyyy 'at' HH:mm", {locale});
        case 'month_day_year':
            return format(date, 'MMMM dd, yyyy', {locale}); // e.g. January 20, 2023
        case 'month_day_time_ampm':
            return format(date, 'MMM dd, h:mm a', {locale}); // e.g. Oct 09, 4:53 PM
        case 'relative':
            return formatDistanceToNow(date, {addSuffix: true, locale});
        case 'custom':
            return format(date, options.customFormat || 'yyyy-MM-dd HH:mm:ss', {
                locale,
            });
        default:
            return format(date, 'dd/MM/yyyy HH:mm:ss', {locale});
    }
}

/**
 * Detects a locale object from a given language code.
 * @param code - Language code (e.g. 'fr', 'de', 'ja', 'ko', 'vi', 'zh')
 */
function detectLocaleFromCode(code: string): Locale {
    const locales: Record<string, Locale> = {
        vi,
        en: enUS,
        fr,
        ja,
        ko,
        zh: zhCN,
        de,
        es,
        it,
        ru,
    };
    return locales[code.toLowerCase()] || enUS;
}
