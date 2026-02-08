/**
 * Utility to generate fully qualified image URLs from GridFS file IDs
 * Handles local vs production environments and constructs API endpoint URLs
 */

export const getImageUrl = (fileId: string | undefined | null): string => {
    if (!fileId) return '';

    // If it's already a full URL, return it
    if (fileId.startsWith('http://') || fileId.startsWith('https://')) {
        return fileId;
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

    // Construct GridFS image endpoint URL
    // fileId is a MongoDB ObjectId string stored in Property.images array
    return `${baseUrl.replace(/\/$/, '')}/api/images/${fileId}`;
};
