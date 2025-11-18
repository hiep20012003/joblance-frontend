const isBrowser = typeof window !== 'undefined';

export const isDebug =
    process.env.NODE_ENV !== 'production' ||
    (isBrowser && window.localStorage?.getItem('DEBUG_APP') === 'true');

let allowedNamespaces: Set<string> = new Set();

function loadAllowedNamespaces() {
    if (isBrowser) {
        const stored = window.localStorage.getItem('DEBUG_NS');
        if (stored) {
            allowedNamespaces = new Set(
                stored.split(',').map(s => s.trim()).filter(Boolean)
            );
        }
    }
}

export function setAllowedNamespaces(list: string[]) {
    allowedNamespaces = new Set(list);
    if (isBrowser) {
        window.localStorage.setItem('DEBUG_NS', list.join(','));
    }
}

function shouldLog(ns: string): boolean {
    // Nếu chưa có filter, log tất cả khi debug bật
    if (!isDebug) return false;
    if (allowedNamespaces.size === 0) return true;
    return allowedNamespaces.has(ns);
}

function getCircularReplacer() {
    const seen = new WeakSet();
    return function (key: string, value: any) {
        if (typeof value === "object" && value !== null) {
            if (seen.has(value)) return "[Circular]";
            seen.add(value);
        }
        return value;
    };
}

export function logWithTrace(ns: string, label: string, data?: any) {
    if (!shouldLog(ns)) return;

    const time = new Date().toLocaleTimeString();
    const nsColor = getNamespaceColor(ns);

    console.groupCollapsed(
        `%c🧭 [${time}] %c${ns}%c → ${label}`,
        'color: gray',
        `color: ${nsColor}; font-weight: bold`,
        'color: inherit'
    );
    console.trace();
    if (data !== undefined) console.log('Payload:', data);
    console.groupEnd();
}

export function logInfo(ns: string, message: string, data?: any) {
    if (!shouldLog(ns)) return;

    const nsColor = getNamespaceColor(ns);
    const time = new Date().toLocaleTimeString();
    console.log(`%cℹ️ [${time}] %c${ns}:`, 'color: gray', `color: ${nsColor}`, message, data || '');
}

export function logError(ns: string, message: string, error?: any) {
    if (!shouldLog(ns)) return;

    const nsColor = getNamespaceColor(ns);

    const safeError = (() => {
        if (!error) return "";
        try {
            if (error instanceof Error) {
                return error.stack || error.message;
            }

            return JSON.stringify(error, getCircularReplacer(), 2);
        } catch {
            try {
                return String(error);
            } catch {
                return "[Unserializable Error]";
            }
        }
    })();

    console.error(
        `%c❌ [${new Date().toLocaleTimeString()}] %c${ns}:`,
        "color: gray",
        `color: ${nsColor}`,
        message,
        safeError
    );
}

function getNamespaceColor(ns: string): string {
    const colors = {
        Zustand: '#4CAF50',
        Presence: '#00C853',
        Socket: '#2196F3',
        API: '#9C27B0',
        UI: '#FF9800',
        System: '#607D8B'
    } as Record<string, string>;
    return colors[ns] || '#999';
}

loadAllowedNamespaces();
