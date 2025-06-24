"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { 
    HomeIcon, 
    UsersIcon, 
    CreditCardIcon, 
    ArrowLeftOnRectangleIcon,
    ChartBarIcon
} from "@heroicons/react/24/outline";

const menuItems = [
    {
        title: "Dashboard",
        path: "/dashboard",
        icon: HomeIcon
    },
    {
        title: "Users",
        path: "/dashboard/users",
        icon: UsersIcon
    },
    {
        title: "Payments",
        path: "/dashboard/payments",
        icon: CreditCardIcon
    },
    {
        title: "Transactions",
        path: "/dashboard/transactions",
        icon: ChartBarIcon
    }
];

interface SidebarProps {
    onLogout: () => void;
}

export default function Sidebar({ onLogout }: SidebarProps) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className={`bg-white border-r border-gray-200 h-screen transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
            <div className="flex flex-col h-full">
                {/* Logo */}
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-center">
                        <Image
                            src="/images/logo.png"
                            alt="StudyBoost Logo"
                            width={isCollapsed ? 40 : 150}
                            height={40}
                            className="transition-all duration-300"
                        />
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4">
                    <ul className="space-y-2">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.path;

                            return (
                                <li key={item.path}>
                                    <Link
                                        href={item.path}
                                        className={`flex items-center p-3 rounded-lg transition-all duration-200
                                            ${isActive 
                                                ? 'bg-blue-50 text-blue-600' 
                                                : 'text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        <Icon className="w-6 h-6" />
                                        {!isCollapsed && (
                                            <span className="ml-3">{item.title}</span>
                                        )}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Collapse Button */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-4 border-t border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                    <ArrowLeftOnRectangleIcon 
                        className={`w-6 h-6 mx-auto transition-transform duration-300 
                            ${isCollapsed ? 'rotate-180' : ''}`}
                    />
                </button>

                {/* Logout Button */}
                <div className="p-4 border-t">
                    <button
                        onClick={onLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50"
                    >
                        <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-3" />
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
} 