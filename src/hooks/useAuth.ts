import { useState, useEffect } from 'react';
import { account } from '@/lib/appwrite';
import { Models } from 'appwrite';

export function useAuth() {
    const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        try {
            // Kiểm tra cookieFallback trong localStorage
            const cookieFallback = localStorage.getItem('cookieFallback');
            if (!cookieFallback || cookieFallback === '[]') {
                setUser(null);
                setLoading(false);
                return false;
            }

            // Parse cookieFallback để lấy session token
            try {
                // cookieFallback có dạng JSON string
                const cookieObj = JSON.parse(cookieFallback);
                // Lấy key đầu tiên của object (session key)
                const sessionKey = Object.keys(cookieObj)[0];
                
                if (sessionKey) {
                    // Lấy thông tin user từ session hiện tại
                    const currentUser = await account.get();
                    setUser(currentUser);
                    setLoading(false);
                    return true;
                }
            } catch (error) {
                console.error('Error parsing cookieFallback:', error);
                setUser(null);
                setLoading(false);
                return false;
            }

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

    return { user, loading, logout, checkAuth };
}