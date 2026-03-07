'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UserProfile {
    id: string;
    name: string;
    phone: string;
    email?: string;
    points?: number;
    avatar?: string;
    tier?: string;
    preferences?: string[];
    isGuest?: boolean;
}

interface AuthContextType {
    isLoggedIn: boolean;
    isGuest: boolean;
    user: UserProfile | null;
    isLoadingAuth: boolean;
    login: (phone: string, email?: string) => void;
    loginAsGuest: () => void;
    logout: (redirectTo?: string) => void;
    updateUser: (newData: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isGuest, setIsGuest] = useState(false);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);

    // Initial Load - Check for existing session via cookie
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    setIsLoggedIn(true);
                    setUser(data.user);
                    setIsGuest(!!data.user.isGuest);
                }
            } catch (err) {
                console.error("Auth check failed:", err);
            } finally {
                setIsLoadingAuth(false);
            }
        };
        checkAuth();
    }, []);

    const login = async (phone: string) => {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone }),
            });
            if (res.ok) {
                const data = await res.json();
                setIsLoggedIn(true);
                setUser(data.user);
                setIsGuest(!!data.user.isGuest);
                // No reload needed — same session_id, live polling auto-updates
            }
        } catch (err) {
            console.error("Login failed:", err);
        }
    };

    const loginAsGuest = async () => {
        try {
            const res = await fetch('/api/auth/guest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            if (res.ok) {
                const data = await res.json();
                setIsLoggedIn(true);
                setIsGuest(true);
                setUser(data.user);
            }
        } catch (err) {
            console.error("Guest login failed:", err);
        }
    };

    const logout = async (redirectTo?: string) => {
        const destination = redirectTo || '/customer';
        try {
            // POST to /api/auth/logout — creates a new guest user
            // and UPDATEs the existing session (same session_id, same seat at table)
            const res = await fetch('/api/auth/logout', { method: 'POST' });
            if (res.ok) {
                const data = await res.json();
                setIsLoggedIn(true);
                setIsGuest(true);
                setUser(data.user);
            } else {
                setIsLoggedIn(false);
                setIsGuest(false);
                setUser(null);
            }
        } catch (err) {
            console.error("Logout failed:", err);
        } finally {
            // Navigate back to origin page (e.g. discovery with resid/tableid)
            window.location.href = destination;
        }
    };

    const updateUser = async (newData: Partial<UserProfile>) => {
        try {
            const res = await fetch('/api/auth/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newData),
            });
            if (res.ok) {
                const data = await res.json();
                if (data.user) {
                    setUser(data.user);
                }
            }
        } catch (err) {
            console.error("Update profile failed:", err);
        }
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, isGuest, user, isLoadingAuth, login, loginAsGuest, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
