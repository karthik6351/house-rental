'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: 'owner' | 'tenant';
    allowedRoles?: ('owner' | 'tenant')[];
}

export default function ProtectedRoute({ children, requiredRole, allowedRoles }: ProtectedRouteProps) {
    const router = useRouter();
    const { user, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.push('/login');
            } else {
                // Check requiredRole OR allowedRoles
                const hasAccess =
                    (!requiredRole && !allowedRoles) ||
                    (requiredRole && user.role === requiredRole) ||
                    (allowedRoles && allowedRoles.includes(user.role));

                if (!hasAccess) {
                    // Redirect to appropriate dashboard based on role
                    if (user.role === 'owner') {
                        router.push('/owner/dashboard');
                    } else {
                        router.push('/tenant/search');
                    }
                }
            }
        }
    }, [user, isLoading, requiredRole, allowedRoles, router]);

    // Show loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Show nothing while redirecting
    const hasAccess =
        (!requiredRole && !allowedRoles) ||
        (requiredRole && user?.role === requiredRole) ||
        (allowedRoles && user && allowedRoles.includes(user.role));

    if (!user || !hasAccess) {
        return null;
    }

    return <>{children}</>;
}
