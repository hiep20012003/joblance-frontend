import {parse, stringify} from "uuid";
import baseX from "base-x";

const BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const base58 = baseX(BASE58);

export function encodeUUID(uuid: string): string {
    try {
        const bytes = parse(uuid);
        return base58.encode(Buffer.from(bytes));
    } catch {
        return uuid;
    }
}

export function decodeUUID(encoded: string): string {
    try {
        const bytes = base58.decode(encoded);
        return stringify(bytes);
    } catch {
        return encoded;
    }
}
