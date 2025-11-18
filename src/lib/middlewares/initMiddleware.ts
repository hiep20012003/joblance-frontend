import {NextFetchEvent, NextRequest} from 'next/server';
import {NextResponse} from 'next/server';
import {ChainableMiddleware} from "@/lib/utils/chain";

export function initMiddleware(middleware: ChainableMiddleware) {
    return async (req: NextRequest, event: NextFetchEvent) => {
        const response = NextResponse.next();

        return middleware(req, event, response);
    };
}