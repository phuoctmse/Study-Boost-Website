"use client"
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { account } from '@/lib/appwrite';

export default function VerifyPage() {
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verifying your email...');

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                const userId = searchParams.get('userId');
                const secret = searchParams.get('secret');



                if (!userId || !secret) {
                    setStatus('error');
                    setMessage('Invalid verification link');
                    return;
                }

                // Gọi API để verify email
                await account.updateVerification(userId, secret);
                
                setStatus('success');
                setMessage('Email verified successfully! You can now close this window and login.');

                // Tự động chuyển về trang login sau 3 giây
                setTimeout(() => {
                    window.location.href = '/auth';
                }, 3000);

            } catch (error: any) {
                console.error('Verification error:', error);
                setStatus('error');
                setMessage(error.message || 'Verification failed. Please try again.');
            }
        };

        verifyEmail();
    }, [searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
                <div className="text-center">
                    {status === 'loading' && (
                        <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
                            <h2 className="text-2xl font-semibold text-gray-900">Verifying Email</h2>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="flex flex-col items-center">
                            <div className="rounded-full bg-green-100 p-3 mb-4">
                                <svg 
                                    className="h-8 w-8 text-green-500" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth="2" 
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Email Verified!</h2>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="flex flex-col items-center">
                            <div className="rounded-full bg-red-100 p-3 mb-4">
                                <svg 
                                    className="h-8 w-8 text-red-500" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth="2" 
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Verification Failed</h2>
                        </div>
                    )}

                    <p className="mt-2 text-gray-600">{message}</p>

                    {status === 'error' && (
                        <div className="mt-6">
                            <button
                                onClick={() => window.location.href = '/auth'}
                                className="text-primary hover:text-primary-accent"
                            >
                                Return to Login
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 