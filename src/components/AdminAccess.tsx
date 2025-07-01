"use client"

import { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminAccess() {
  const [showAdminLink, setShowAdminLink] = useState(false);
  const adminToken = process.env.NEXT_PUBLIC_ADMIN_TOKEN;

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Hiện link admin khi nhấn Ctrl + Alt + A
      if (event.ctrlKey && event.altKey && event.key === 'a') {
        setShowAdminLink(true);
        // Tự động ẩn sau 5 giây
        setTimeout(() => setShowAdminLink(false), 5000);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (!showAdminLink) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Link 
        href={`/auth?admin_token=${adminToken}`}
        className="bg-black text-white px-4 py-2 rounded-md opacity-50 hover:opacity-100 transition-opacity"
      >
        Admin Access
      </Link>
    </div>
  );
} 