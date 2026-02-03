/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '5000',
                pathname: '/uploads/**',
            },
            {
                protocol: 'https',
                hostname: 'house-rental-p61v.onrender.com',
                pathname: '/uploads/**',
            },
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
    output: 'standalone',
};

module.exports = nextConfig;
