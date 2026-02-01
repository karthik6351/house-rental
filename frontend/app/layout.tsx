import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';

import LeafletSetup from '@/components/LeafletSetup';

const inter = Inter({ subsets: ['latin'] });

export const viewport = {
    themeColor: '#2563eb',
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export const metadata: Metadata = {
    title: 'Easy Rent - Find Your Perfect Home',
    description: 'Commercial house rental platform connecting property owners with tenants',
    manifest: '/manifest.json',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: 'Easy Rent',
    },
    other: {
        'mobile-web-app-capable': 'yes',
    },
};


export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <AuthProvider>
                    <LeafletSetup />
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}
