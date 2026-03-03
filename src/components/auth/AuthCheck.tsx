'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export function AuthCheck({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const checkAuth = () => {
            const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
            setIsAuthenticated(loggedIn);

            if (!loggedIn && pathname.startsWith('/admin')) {
                router.replace('/login');
            }
        };

        checkAuth();
    }, [pathname, router]);

    // Prevent flash of content
    if (isAuthenticated === null && pathname.startsWith('/admin')) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900">
                <div className="w-8 h-8 border-4 border-zinc-900 dark:border-white border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return <>{children}</>;
}
