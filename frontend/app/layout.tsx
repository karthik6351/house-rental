import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Easy Rent - Find Your Perfect Home',
    description: 'Commercial house rental platform connecting property owners with tenants',
    manifest: '/manifest.json',
    themeColor: '#2563eb',
    viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: 'Easy Rent',
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
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}
