"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Toaster } from "sonner";
import Sidebar from "./Sidebar";

export default function DashboardClient({ children }: { children: React.ReactNode }) {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!loading && !user && isClient) {
            router.replace("/auth");
        }
    }, [user, loading, router, isClient]);

    const handleLogout = async () => {
        try {
            await logout();
            router.replace("/auth");
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    // Hiển thị loading state khi đang kiểm tra auth
    if (loading || !isClient) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Không hiển thị gì khi chưa auth
    if (!user) {
        return null;
    }

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar onLogout={handleLogout} />
            <div className="flex-1 overflow-auto">
                <Toaster position="top-right" />
                {children}
            </div>
        </div>
    );
} 