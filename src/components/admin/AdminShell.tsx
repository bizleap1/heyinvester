'use client';

import { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

interface AdminShellProps {
    children: React.ReactNode;
    user: {
        name: string;
        email: string;
    };
}

export default function AdminShell({ children, user }: AdminShellProps) {
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex">
            {/* Sidebar (Desktop static, Mobile drawer) */}
            <AdminSidebar 
                user={user} 
                isOpen={mobileSidebarOpen} 
                onClose={() => setMobileSidebarOpen(false)} 
            />

            {/* Main Area */}
            <div className="flex-1 flex flex-col min-w-0">
                <AdminHeader 
                    user={user} 
                    onOpenMobileSidebar={() => setMobileSidebarOpen(true)} 
                />

                <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
