"use client";
import { useState, useEffect, useCallback } from 'react';

interface User {
    email: string;
}

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = useCallback(async () => {
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                setUser(null);
                setLoading(false);
                return null;
            }

            // Decode JWT payload
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.exp && payload.exp * 1000 < Date.now()) {
                // Token expired
                localStorage.removeItem('auth_token');
                setUser(null);
                return null;
            }

            setUser({ email: payload.email });
            return { email: payload.email };
        } catch (error) {
            console.error('Auth check error:', error);
            setUser(null);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const logout = () => {
        localStorage.removeItem('auth_token');
        setUser(null);
    };

    return { user, loading, logout, checkAuth };
}