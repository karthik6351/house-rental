/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['localhost'],
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '5000',
                pathname: '/uploads/**',
            },
            // Allow images from the configured API URL (Render backend)
            ...(process.env.NEXT_PUBLIC_API_URL ? [{
                protocol: 'https',
                hostname: new URL(process.env.NEXT_PUBLIC_API_URL).hostname,
                port: '',
                pathname: '/uploads/**',
            }] : []),
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
        NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000',
        NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    },
};

module.exports = nextConfig;
