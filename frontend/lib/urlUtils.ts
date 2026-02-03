/**
 * Utility to generate fully qualified image URLs
 * Handles local vs production environments and relative paths
 */

export const getImageUrl = (path: string | undefined | null): string => {
    if (!path) return '';

    // If it's already a full URL, return it
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    // Get the base backend URL
    // Priority: NEXT_PUBLIC_SOCKET_URL -> Extract from NEXT_PUBLIC_API_URL -> Hardcoded fallback
    let baseUrl = process.env.NEXT_PUBLIC_SOCKET_URL;

    if (!baseUrl && process.env.NEXT_PUBLIC_API_URL) {
        // Remove '/api' from the end if present
        baseUrl = process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, '');
    }

    if (!baseUrl) {
        baseUrl = 'https://house-rental-p61v.onrender.com';
    }

    // Ensure path starts with /
    const cleanPath = path.startsWith('/') ? path : `/${path}`;

    // Remove trailing slash from base and combine
    return `${baseUrl.replace(/\/$/, '')}${cleanPath}`;
};
