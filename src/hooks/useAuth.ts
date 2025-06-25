"use client";
import { useState, useEffect, useCallback } from 'react';
import { account } from '@/lib/appwrite';
import { Models } from 'appwrite';

// Cache để tránh gọi API liên tục
let authCache: {
    user: Models.User<Models.Preferences> | null;
    timestamp: number;
} | null = null;

const CACHE_DURATION = 5 * 60 * 1000; // 5 phút

export function useAuth() {
    const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = useCallback(async (): Promise<Models.User<Models.Preferences> | null> => {
        try {
            // Kiểm tra cache trước
            if (authCache && (Date.now() - authCache.timestamp) < CACHE_DURATION) {
                setUser(authCache.user);
                setLoading(false);
                return authCache.user;
            }

            const cookieFallback = localStorage.getItem('cookieFallback');
            if (!cookieFallback || cookieFallback === '[]') {
                setUser(null);
                authCache = { user: null, timestamp: Date.now() };
                setLoading(false);
                return null;
            }

            const currentUser = await account.get();
            authCache = {
                user: currentUser,
                timestamp: Date.now()
            };
            setUser(currentUser);
            return currentUser;
        } catch (error) {
            console.error('Auth check error:', error);
            setUser(null);
            authCache = { user: null, timestamp: Date.now() };
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const logout = async () => {
        try {
            await account.deleteSession('current');
            localStorage.removeItem('cookieFallback');
            setUser(null);
            authCache = null;
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return { user, loading, logout, checkAuth };
}