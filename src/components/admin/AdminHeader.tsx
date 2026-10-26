'use client';

import { usePathname } from 'next/navigation';
import { Menu, CheckCircle2 } from 'lucide-react';

interface AdminHeaderProps {
    onOpenMobileSidebar: () => void;
    user: {
        name: string;
        email: string;
    };
}

export default function AdminHeader({ onOpenMobileSidebar, user }: AdminHeaderProps) {
    const pathname = usePathname();

    const getPageTitle = () => {
        if (pathname === '/admin') return { title: 'Dashboard', desc: 'Summary of portal activity and properties' };
        if (pathname.startsWith('/admin/projects/new')) return { title: 'Add New Project', desc: 'Create and list a new property' };
        if (pathname.includes('/edit')) return { title: 'Edit Project', desc: 'Update property details, photos and pricing' };
        if (pathname.startsWith('/admin/projects')) return { title: 'Projects & Plots', desc: 'Manage and organize all property listings' };
        if (pathname.startsWith('/admin/hero-slider')) return { title: 'Hero Slider', desc: 'Manage homepage promotional banners' };
        if (pathname.startsWith('/admin/settings')) return { title: 'Website Settings', desc: 'Contact numbers, WhatsApp, and MahaRERA details' };
        return { title: 'Admin Panel', desc: 'Portal Management' };
    };

    const { title, desc } = getPageTitle();

    return (
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-3.5">
            <div className="flex items-center justify-between gap-4">
                {/* Left: Mobile Toggle & Page Title */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={onOpenMobileSidebar}
                        className="md:hidden p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        aria-label="Open navigation menu"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                                {title}
                            </h1>
                            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Live System</span>
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 hidden sm:block">
                            {desc}
                        </p>
                    </div>
                </div>
            </div>
        </header>
    );
}
