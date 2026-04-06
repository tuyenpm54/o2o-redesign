'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export function AuthCheck({ children }: { children: React.ReactNode }) {
    const { user, isGuest, isLoadingAuth } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoadingAuth) {
            const isProtected = pathname.startsWith('/admin') || pathname.startsWith('/hq');
            
            if (isProtected) {
                // Must be a registered user (not guest) and exist
                if (!user || isGuest) {
                    router.replace('/login');
                } else if (pathname.startsWith('/hq') && user.role !== 'CHAIN_MANAGER') {
                    // Redirect restaurant admins away from HQ
                    router.replace('/admin/dashboard');
                } else if (pathname.startsWith('/admin') && user.role === 'CHAIN_MANAGER') {
                    // Redirect HQ managers away from restaurant admin
                    router.replace('/hq/dashboard');
                }
            }
        }
    }, [pathname, router, user, isGuest, isLoadingAuth]);

    const isProtected = pathname.startsWith('/admin') || pathname.startsWith('/hq');
    
    // Prevent flash of content
    if (isProtected) {
        if (isLoadingAuth) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#050510]">
                    <div className="w-8 h-8 border-4 border-slate-900 dark:border-white border-t-transparent rounded-full animate-spin" />
                </div>
            );
        }
        if (!user || isGuest) {
            return null;
        }
        // Prevent layout from flashing the wrong UI before the route changes
        if (pathname.startsWith('/hq') && user.role !== 'CHAIN_MANAGER') {
            return null;
        }
        if (pathname.startsWith('/admin') && user.role === 'CHAIN_MANAGER') {
            return null;
        }
    }

    return <>{children}</>;
}
