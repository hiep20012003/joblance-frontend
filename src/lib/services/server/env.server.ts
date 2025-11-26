'use server'

export  const getConfig = async () => {
    return {
        BASE_URL: process.env.BASE_URL,
        SOCKET_URL: process.env.SOCKET_URL,
        STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
    }
};