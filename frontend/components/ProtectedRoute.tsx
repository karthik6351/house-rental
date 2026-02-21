'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: 'owner' | 'tenant' | 'admin';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    React.useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
        if (!isLoading && user && requiredRole && user.role !== requiredRole && user.role !== 'admin') {
            router.push('/');
        }
    }, [user, isLoading, requiredRole, router]);

    if (isLoading || !user) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-4"
                >
                    <div className="relative w-16 h-16 mx-auto">
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 animate-pulse" />
                        <div className="absolute inset-1 rounded-[14px] bg-white dark:bg-[#131316] flex items-center justify-center">
                            <Image src="/logo.png" alt="EasyRent" width={32} height={32} className="rounded-lg" />
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 justify-center">
                        <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce [animation-delay:0ms]" />
                        <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce [animation-delay:150ms]" />
                        <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                    <p className="text-sm text-gray-400 font-medium">Loading...</p>
                </motion.div>
            </div>
        );
    }

    if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
        return null;
    }

    return <>{children}</>;
}
