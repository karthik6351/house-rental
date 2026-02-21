import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Toaster } from 'react-hot-toast';
import LeafletSetup from '@/components/LeafletSetup';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const outfit = Outfit({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700', '800', '900'],
    display: 'swap',
    variable: '--font-outfit',
});

export const viewport = {
    themeColor: '#4f46e5',
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: 'cover' as const,
};

export const metadata: Metadata = {
    title: 'EasyRent — Find Your Perfect Home',
    description: 'Premium house rental platform connecting property owners with tenants. Browse verified listings, chat in real-time, and secure your dream space.',
    manifest: '/manifest.json',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: 'EasyRent',
    },
    other: {
        'mobile-web-app-capable': 'yes',
    },
    icons: {
        icon: '/logo.png',
        shortcut: '/logo.png',
        apple: '/logo.png',
    },
    openGraph: {
        title: 'EasyRent — Find Your Perfect Home',
        description: 'Premium house rental platform connecting property owners with tenants.',
        type: 'website',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={outfit.variable}>
            <body className={outfit.className}>
                <ErrorBoundary>
                    <AuthProvider>
                        <LeafletSetup />
                        <div className="flex flex-col min-h-screen">
                            <Navbar />
                            <main className="flex-grow pt-16 md:pt-18">
                                {children}
                            </main>
                            <Footer />
                        </div>
                        <Toaster
                            position="top-center"
                            toastOptions={{
                                duration: 3500,
                                style: {
                                    background: '#131316',
                                    color: '#fff',
                                    borderRadius: '16px',
                                    padding: '14px 20px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    boxShadow: '0 20px 60px -12px rgba(0, 0, 0, 0.3)',
                                },
                                success: {
                                    iconTheme: {
                                        primary: '#10b981',
                                        secondary: '#fff',
                                    },
                                },
                                error: {
                                    iconTheme: {
                                        primary: '#ef4444',
                                        secondary: '#fff',
                                    },
                                },
                            }}
                        />
                    </AuthProvider>
                </ErrorBoundary>
            </body>
        </html>
    );
}
