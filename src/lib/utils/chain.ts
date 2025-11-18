import {NextFetchEvent, NextResponse} from "next/server";
import type {NextRequest} from "next/server";
import {NextMiddlewareResult} from "next/dist/server/web/types";

export type ChainableMiddleware = (req: NextRequest, event: NextFetchEvent, response: NextResponse) => Promise<NextMiddlewareResult> | NextMiddlewareResult;
export type MiddlewareFactory = (next: ChainableMiddleware) => ChainableMiddleware;

export function chainMiddleware(
    factories: MiddlewareFactory[], index = 0
): ChainableMiddleware {
    const current = factories[index];

    if (current) {
        const next = chainMiddleware(factories, index + 1);
        return current(next);
    }

    return (req: NextRequest, event: NextFetchEvent, res: NextResponse) => {
        return res;
    }
}
