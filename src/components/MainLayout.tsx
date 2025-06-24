"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { usePathname } from 'next/navigation';

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isDashboard = pathname?.startsWith('/dashboard');

    return (
        <>
            {!isDashboard && <Header />}
            {children}
            {!isDashboard && <Footer />}
        </>
    );
} 