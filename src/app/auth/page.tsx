"use client"
import { useState, useEffect } from 'react';
import { account, config, databases } from '@/lib/appwrite';
import { useRouter } from 'next/navigation';
import { ID } from 'appwrite';
import { useAuth } from '@/hooks/useAuth';

export default function AuthPage() {
    const router = useRouter();
    const { checkAuth } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        username: ''
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const cookieFallback = localStorage.getItem('cookieFallback');
                if (cookieFallback && cookieFallback !== '[]') {
                    // Kiểm tra xem session có hợp lệ không
                    const currentUser = await account.get();
                    if (currentUser) {
                        router.push('/dashboard');
                    }
                }
            } catch (error) {
                console.error('Auth check error:', error);
            }
        };

        checkAuth();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (isLogin) {
                // Check for admin credentials
                if (formData.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL && formData.password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
                    // Login
                    const session = await account.createEmailPasswordSession(formData.email, formData.password);
                    console.log('session', session)
                    if (session.$id) {
                        // Kiểm tra cookieFallback sau khi login
                        const cookieFallback = localStorage.getItem('cookieFallback');
                        if (cookieFallback && cookieFallback !== '[]') {
                            router.push('/dashboard');
                        }
                    }
                } else {
                    setError("You don't have permission to access this area.");
                    setLoading(false);
                    return;
                }
            } else {
                // Validate password match
                if (formData.password !== formData.confirmPassword) {
                    setError("Passwords don't match");
                    setLoading(false);
                    return;
                }

                // Create user account
                const user = await account.create(
                    ID.unique(),
                    formData.email,
                    formData.password,
                    formData.username
                );

                // Create user document in database
                await databases.createDocument(
                    config.databaseId,
                    config.collections.users,
                    user.$id,
                    {
                        username: formData.username,
                        email: formData.email
                    }
                );

                // Send verification email
                await account.createVerification(process.env.NEXT_PUBLIC_APPWRITE_VERIFICATION_URL as string);

                // Login after registration
                const session = await account.createEmailPasswordSession(formData.email, formData.password);
                if (session.$id) {
                    // Kiểm tra cookieFallback sau khi register và login
                    const cookieFallback = localStorage.getItem('cookieFallback');
                    if (cookieFallback && cookieFallback !== '[]') {
                        router.push('/dashboard');
                    }
                }
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-hero-background px-4">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900">
                        {isLogin ? 'Sign in to your account' : 'Create new account'}
                    </h2>
                    {/* <p className="mt-2 text-sm text-gray-600">
                        {isLogin ? (
                            <>
                                Or{' '}
                                <button
                                    type="button"
                                    className="text-primary hover:text-primary-accent"
                                    onClick={() => setIsLogin(false)}
                                >
                                    create a new account
                                </button>
                            </>
                        ) : (
                            <>
                                Already have an account?{' '}
                                <button
                                    type="button"
                                    className="text-primary hover:text-primary-accent"
                                    onClick={() => setIsLogin(true)}
                                >
                                    Sign in
                                </button>
                            </>
                        )}
                    </p> */}
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div className="space-y-4">
                        {!isLogin && (
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                    Username
                                </label>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required={!isLogin}
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                                />
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                            />
                        </div>

                        {!isLogin && (
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                    Confirm Password
                                </label>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required={!isLogin}
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                                />
                            </div>
                        )}
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </span>
                            ) : (
                                isLogin ? 'Sign in' : 'Create account'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}