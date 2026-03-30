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
    login: (phone: string, email?: string) => Promise<UserProfile | null>;
    loginAsGuest: () => Promise<UserProfile | null>;
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
                    const userData = data.data?.user || data.user;
                    if (userData) {
                        setIsLoggedIn(true);
                        setUser(userData);
                        setIsGuest(!!userData.isGuest);
                    }
                }
            } catch (err) {
                console.error("Auth check failed:", err);
            } finally {
                setIsLoadingAuth(false);
            }
        };
        checkAuth();
    }, []);

    const login = React.useCallback(async (phone: string) => {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone }),
            });
            if (res.ok) {
                const data = await res.json();
                const userData = data.data?.user || data.user;
                if (userData) {
                    setIsLoggedIn(true);
                    setUser(userData);
                    setIsGuest(!!userData.isGuest);
                    return userData;
                }
            }
        } catch (err) {
            console.error("Login failed:", err);
        }
        return null;
    }, []);

    const loginAsGuest = React.useCallback(async () => {
        try {
            const res = await fetch('/api/auth/guest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            if (res.ok) {
                const data = await res.json();
                const userData = data.data?.user || data.user;
                if (userData) {
                    setIsLoggedIn(true);
                    setIsGuest(true);
                    setUser(userData);
                    return userData;
                }
            }
        } catch (err) {
            console.error("Guest login failed:", err);
        }
        return null;
    }, []);

    const logout = React.useCallback(async (redirectTo?: string) => {
        const destination = redirectTo || '/customer';
        try {
            const res = await fetch('/api/auth/logout', { method: 'POST' });
            if (res.ok) {
                const data = await res.json();
                const userData = data.data?.user || data.user;
                if (userData) {
                    setIsLoggedIn(true);
                    setIsGuest(true);
                    setUser(userData);
                }
            } else {
                setIsLoggedIn(false);
                setIsGuest(false);
                setUser(null);
            }
        } catch (err) {
            console.error("Logout failed:", err);
        } finally {
            window.location.href = destination;
        }
    }, []);

    const updateUser = React.useCallback(async (newData: Partial<UserProfile>) => {
        try {
            const res = await fetch('/api/auth/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newData),
            });
            if (res.ok) {
                const data = await res.json();
                const userData = data.data?.user || data.user;
                if (userData) {
                    setUser(userData);
                }
            }
        } catch (err) {
            console.error("Update profile failed:", err);
        }
    }, []);

    const authValue = React.useMemo(() => ({
        isLoggedIn, isGuest, user, isLoadingAuth, login, loginAsGuest, logout, updateUser
    }), [isLoggedIn, isGuest, user, isLoadingAuth, login, loginAsGuest, logout, updateUser]);

    return (
        <AuthContext.Provider value={authValue}>
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
