"use client";

import { useEffect, useState } from "react";
import { account } from "@/lib/appwrite";
import Sidebar from "./Sidebar";

export default function DashboardClient({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const cookieFallback = localStorage.getItem("cookieFallback");
                if (!cookieFallback || cookieFallback === "[]") {
                    window.location.href = "/auth";
                    return;
                }

                const currentUser = await account.get();
                
                // Check if user is admin
                if (currentUser.email !== "admin@gmail.com") {
                    window.location.href = "/auth";
                    return;
                }

                setUser(currentUser);
            } catch (error) {
                console.error("Authentication error:", error);
                window.location.href = "/auth";
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const handleLogout = async () => {
        try {
            await account.deleteSession("current");
            window.location.href = "/auth";
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar onLogout={handleLogout} />
            <main className="flex-1 overflow-x-hidden overflow-y-auto">
                {children}
            </main>
        </div>
    );
} 