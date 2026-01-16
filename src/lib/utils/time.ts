import {format, formatDistanceToNow, parseISO} from 'date-fns';
import {toZonedTime} from 'date-fns-tz';
import {enUS, vi, fr, ja, ko, zhCN, de, es, it, ru, Locale} from 'date-fns/locale';

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

export function formatISOTime(
    dateInput: string | Date,
    type: string = 'datetime',
    options: {locale?: string | 'auto'; customFormat?: string} = {locale: 'auto'}
): string {
    if (!dateInput) return '';

    const date = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;

    const zonedDate = toZonedTime(date, 'Asia/Ho_Chi_Minh');

    const locale = enUS;

    switch (type) {
        case 'date':
            return format(zonedDate, 'dd/MM/yyyy', {locale});
        case 'time':
            return format(zonedDate, 'HH:mm:ss', {locale});
        case 'datetime':
            return format(zonedDate, 'dd/MM/yyyy HH:mm', {locale});
        case 'month_day_time_ampm':
            return format(zonedDate, 'MMM dd, h:mm a', {locale});
        case 'relative':
            return formatDistanceToNow(zonedDate, {addSuffix: true, locale});
        default:
            return format(zonedDate, 'dd/MM/yyyy HH:mm:ss', {locale});
    }
}
