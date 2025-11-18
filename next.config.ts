import type {NextConfig} from "next";

const nextConfig: NextConfig = {
    output: "standalone",
    reactStrictMode: false,
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "**", // chấp nhận tất cả hostname
            },
        ],
    },
};

export default nextConfig;
