"use client"
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { account } from '@/lib/appwrite';

export default function Dashboard() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const cookieFallback = localStorage.getItem('cookieFallback');
                if (!cookieFallback || cookieFallback === '[]') {
                    router.push('/auth');
                    return;
                }

                const currentUser = await account.get();
                const user = {
                    name: currentUser.name,
                    email: currentUser.email,
                    id: currentUser.$id,
                }
                setUser(user);
                setLoading(false);
            } catch (error) {
                console.error('Auth check error:', error);
                router.push('/auth');
            }
        };

        checkAuth();
    }, []);

    const handleLogout = async () => {
        try {
            await account.deleteSession('current');
            localStorage.removeItem('cookieFallback');
            router.push('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <>
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-semibold">Dashboard</h1>
                        </div>
                        <div className="flex items-center">
                            <div className="mr-4">
                                <p className="text-sm text-gray-600">Welcome,</p>
                                <p className="font-medium">{user.name || user.email}</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-4">
                        <h2 className="text-2xl font-bold mb-4">User Information</h2>
                        <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
                            {JSON.stringify(user, null, 2)}
                        </pre>
                    </div>
                </div>
            </main>
        </>
    );
} 