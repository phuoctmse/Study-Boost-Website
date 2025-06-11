"use client"
import { Inter } from "next/font/google";
import "../globals.css";
import { useEffect, useState } from 'react';
import { account } from '@/lib/appwrite';
import Link from 'next/link';
import CustomFingerprint from '@/components/CustomFingerprint';

const inter = Inter({ subsets: ["latin"] });

export default function Dashboard() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const cookieFallback = localStorage.getItem('cookieFallback');
                if (!cookieFallback || cookieFallback === '[]') {
                    window.location.href = '/auth';
                    return;
                }

                const currentUser = await account.get();
                setUser(currentUser);
                setLoading(false);
            } catch (error) {
                console.error('Auth check error:', error);
                window.location.href = '/auth';
            }
        };

        checkAuth();
    }, []);

    const handleLogout = async () => {
        try {
            await account.deleteSession('current');
            localStorage.removeItem('cookieFallback');
            window.location.href = '/auth';
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    if (loading) {
        return (
            <html lang="en">
                <body className={inter.className}>
                    <div className="min-h-screen flex items-center justify-center">
                        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
                    </div>
                </body>
            </html>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <html lang="en">
            <body className={inter.className}>
                <div className="min-h-screen flex">
                    {/* Sidebar */}
                    <div className="w-64 bg-gray-800 text-white">
                        <div className="p-4">
                            <h1 className="text-2xl font-bold">StudyBoost</h1>
                        </div>
                        <nav className="mt-8">
                            <Link
                                href="/dashboard"
                                className={`flex items-center px-6 py-3 ${activeTab === 'dashboard' ? 'bg-gray-900' : 'hover:bg-gray-700'}`}
                                onClick={() => setActiveTab('dashboard')}
                            >
                                <span>Dashboard</span>
                            </Link>
                            <Link
                                href="/dashboard/profile"
                                className={`flex items-center px-6 py-3 ${activeTab === 'profile' ? 'bg-gray-900' : 'hover:bg-gray-700'}`}
                                onClick={() => setActiveTab('profile')}
                            >
                                <span>Profile</span>
                            </Link>
                            <Link
                                href="/dashboard/settings"
                                className={`flex items-center px-6 py-3 ${activeTab === 'settings' ? 'bg-gray-900' : 'hover:bg-gray-700'}`}
                                onClick={() => setActiveTab('settings')}
                            >
                                <span>Settings</span>
                            </Link>
                        </nav>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col">
                        {/* Top Navigation */}
                        <header className="bg-white shadow">
                            <div className="flex justify-between items-center px-8 py-4">
                                <h2 className="text-2xl font-semibold text-gray-800">Dashboard</h2>
                                <div className="flex items-center space-x-4">
                                    <CustomFingerprint src="/path/to/your/image.png" alt="Fingerprint" className="mr-4" />
                                    <div className="text-right">
                                        <p className="text-sm text-gray-600">Welcome back,</p>
                                        <p className="text-sm font-medium text-gray-900">{user.name || user.email}</p>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </header>

                        {/* Main Content Area */}
                        <main className="flex-1 p-8">
                            <div className="max-w-7xl mx-auto">
                                <div className="bg-white rounded-lg shadow p-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">User Information</h3>
                                    <pre className="bg-gray-50 p-4 rounded-md overflow-auto">
                                        {JSON.stringify(user, null, 2)}
                                    </pre>
                                </div>

                                <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                    <div className="bg-white overflow-hidden shadow rounded-lg">
                                        <div className="p-5">
                                            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                                            <p className="mt-2 text-gray-600">No recent activity</p>
                                        </div>
                                    </div>

                                    <div className="bg-white overflow-hidden shadow rounded-lg">
                                        <div className="p-5">
                                            <h3 className="text-lg font-medium text-gray-900">Statistics</h3>
                                            <p className="mt-2 text-gray-600">Coming soon</p>
                                        </div>
                                    </div>

                                    <div className="bg-white overflow-hidden shadow rounded-lg">
                                        <div className="p-5">
                                            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
                                            <p className="mt-2 text-gray-600">Available soon</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            </body>
        </html>
    );
} 