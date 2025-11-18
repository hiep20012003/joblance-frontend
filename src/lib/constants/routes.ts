export const LOGIN = '/login';
export const LOGOUT = '/logout';
export const ROOT = '/';

export const PUBLIC_ROUTES = [
    '/login',
    '/logout',
    '/signup',
    '/categories',
    '/search',
]

export const PROTECTED_ROUTES = [
    '/checkout',
    '/sellers',
    '/users',
    '/orders',
    '/inbox'
]


export const SELLER_ROUTES_REGEX = [
    /^\/users\/(?<username>[a-zA-Z0-9._+-]+)\/manage_gigs(\?.*)?$/,
    /^\/users\/(?<username>[a-zA-Z0-9._+-]+)\/manage_orders(\?.*)?$/,
    /^\/users\/(?<username>[a-zA-Z0-9._+-]+)\/seller_dashboard(\?.*)?$/,
    /^\/sellers\/(?<username>[a-zA-Z0-9._+-]+)\/edit(\?.*)?$/
];


export const ORDER_ROUTES_REGEX = [
    /^\/users\/(?<username>[a-zA-Z0-9._+-]+)\/orders(?:\/(?<orderId>[a-zA-Z0-9._+-]+))?(?:\/.*)?$/i,
    /^\/orders(?:\/(?<orderId>[a-zA-Z0-9._+-]+))?(?:\/.*)?$/i,
];
