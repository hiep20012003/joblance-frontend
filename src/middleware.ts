import {chainMiddleware} from "@/lib/utils/chain";
import {withCurrentPath} from "@/lib/middlewares/withCurrentPath";
import {withAuth} from "@/lib/middlewares/withAuth";
import {initMiddleware} from "@/lib/middlewares/initMiddleware";

export default chainMiddleware([
    initMiddleware,
    withCurrentPath,
    withAuth,
    // withLogout,
]);

// // // export const config = {
// // //     matcher: [
// // //         "/((_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg$).*)",
// // //     ],
// // // };
//
// import {NextRequest, NextResponse} from "next/server";
// import {PUBLIC_ROUTES, LOGIN, ROOT, PROTECTED_SUB_ROUTES} from "@/lib/routes";

// export async function middleware(request: NextRequest) {
//     const {nextUrl} = request;
//     const session = await auth();
//     const isAuthenticated = !!session?.user;
//
//     const isPublicRoute =
//         ((PUBLIC_ROUTES.find(route => nextUrl.pathname.startsWith(route))
//                 || nextUrl.pathname === ROOT)
//             && !PROTECTED_SUB_ROUTES.find(route => nextUrl.pathname.includes(route)));
//
//     if (!isAuthenticated && !isPublicRoute) {
//         console.log(isPublicRoute, nextUrl.pathname);
//         return NextResponse.redirect(new URL(LOGIN, nextUrl));
//     }
//
//     return NextResponse.next();
// }

// middleware.ts
export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|images|videos|favicon.ico|.well-known).*)',
    ],
};