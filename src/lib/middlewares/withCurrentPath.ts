import {NextFetchEvent, NextRequest} from 'next/server';
import {NextResponse} from 'next/server';
import {isSellerPath} from '@/lib/utils/helper';
import {ChainableMiddleware} from "@/lib/utils/chain";
import {LOGOUT} from "@/lib/constants/routes";

export function withCurrentPath(middleware: ChainableMiddleware) {
    return async (req: NextRequest, event: NextFetchEvent, res: NextResponse) => {
        const response = res || NextResponse.next();
        const {pathname} = req.nextUrl;

        if (!pathname.startsWith(LOGOUT)) {
            response.cookies.set('currentClientPath', pathname, {
                path: '/',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24,
            });

            const isSellerPage = isSellerPath(pathname);
            const prevMode = req.cookies.get('mode')?.value;
            const shouldBeSeller =
                isSellerPage || (pathname.startsWith('/orders') && prevMode === 'seller');

            response?.cookies.set('mode', shouldBeSeller ? 'seller' : 'buyer', {
                path: '/',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24,
            });
        }

        return middleware(req, event, response);
    };
}