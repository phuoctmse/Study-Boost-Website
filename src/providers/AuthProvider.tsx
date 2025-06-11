"use client"
import { createContext, useContext, useState, useEffect } from 'react';
import { account } from '@/lib/appwrite';
import { Models } from 'appwrite';

interface AuthContextType {
    user: Models.User<Models.Preferences> | null;
    loading: boolean;
    checkAuth: () => Promise<boolean>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        try {
            const cookieFallback = localStorage.getItem('cookieFallback');
            if (!cookieFallback || cookieFallback === '[]') {
                setUser(null);
                setLoading(false);
                return false;
            }

            const currentUser = await account.get();
            setUser(currentUser);
            setLoading(false);
            return true;
        } catch (error) {
            console.error('Auth check error:', error);
            setUser(null);
            setLoading(false);
            return false;
        }
    };

    const logout = async () => {
        try {
            await account.deleteSession('current');
            localStorage.removeItem('cookieFallback');
            setUser(null);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, checkAuth, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}