'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { 
    LayoutDashboard, 
    Building2, 
    Image as ImageIcon, 
    Settings, 
    ExternalLink, 
    LogOut,
    PlusCircle,
    X,
    Globe
} from 'lucide-react';

interface AdminSidebarProps {
    user: {
        name: string;
        email: string;
    };
    isOpen?: boolean;
    onClose?: () => void;
}

export default function AdminSidebar({ user, isOpen = false, onClose }: AdminSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

    const handleSignOut = async () => {
        if (!confirm('Are you sure you want to log out?')) return;
        try {
            await authClient.signOut();
            router.push('/admin/login');
            router.refresh();
        } catch (err) {
            console.error('Signout failed', err);
            router.push('/admin/login');
        }
    };

    const navItems = [
        {
            name: 'Dashboard',
            href: '/admin',
            icon: LayoutDashboard,
            exact: true,
        },
        {
            name: 'Projects & Plots',
            href: '/admin/projects',
            icon: Building2,
            exact: false,
        },
        {
            name: 'Hero Slider',
            href: '/admin/hero-slider',
            icon: ImageIcon,
            exact: false,
        },
        {
            name: 'Website Settings',
            href: '/admin/settings',
            icon: Settings,
            exact: false,
        },
    ];

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div 
                    onClick={onClose}
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-xs transition-opacity"
                    aria-hidden="true"
                />
            )}

            {/* Sidebar Container */}
            <aside className={`
                fixed md:static inset-y-0 left-0 z-50
                w-64 bg-white border-r border-gray-200 
                flex flex-col justify-between
                transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                shadow-xl md:shadow-none select-none
            `}>
                <div>
                    {/* Brand Logo & Close button for mobile */}
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                        <Link 
                            href="/admin" 
                            className="flex flex-col gap-1.5 transition-opacity hover:opacity-90"
                            onClick={onClose}
                        >
                            <Image 
                                src="/logo (1).png" 
                                alt="Hey Investor" 
                                width={180} 
                                height={55} 
                                priority
                                className="h-9 w-auto object-contain" 
                            />
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                                    Admin Panel
                                </span>
                            </div>
                        </Link>
                        {onClose && (
                            <button 
                                onClick={onClose} 
                                className="md:hidden p-2 text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-100 cursor-pointer"
                                aria-label="Close menu"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    {/* Quick Add Button */}
                    <div className="p-3.5">
                        <Link 
                            href="/admin/projects/new"
                            onClick={onClose}
                            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[#139D46] hover:bg-[#0f823a] text-white rounded-xl font-bold text-sm shadow-sm transition-all hover:shadow hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                        >
                            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
                            <span>Add New Project</span>
                        </Link>
                    </div>

                    {/* Navigation Menu */}
                    <nav className="px-3 py-1 space-y-1">
                        <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                            Main Menu
                        </div>
                        {navItems.map((item) => {
                            const isActive = item.exact 
                                ? pathname === item.href 
                                : pathname === item.href || (pathname.startsWith(item.href + '/') && item.href !== '/admin');
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={onClose}
                                    className={`
                                        group flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all text-sm font-semibold
                                        ${isActive 
                                            ? 'bg-[#139D46] text-white shadow-sm shadow-[#139D46]/20' 
                                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                        }
                                    `}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                                        <span>{item.name}</span>
                                    </div>
                                    {isActive && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Live Site Shortcut */}
                    <div className="px-3 mt-4">
                        <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                            Live Site
                        </div>
                        <Link 
                            href="/" 
                            target="_blank"
                            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-emerald-50 hover:text-[#139D46] border border-transparent hover:border-emerald-200 transition-all group"
                        >
                            <span className="flex items-center gap-3">
                                <Globe className="w-5 h-5 text-gray-500 group-hover:text-[#139D46]" />
                                <span>View Website</span>
                            </span>
                            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-[#139D46]" />
                        </Link>
                    </div>
                </div>

                {/* Bottom User Profile & Logout */}
                <div className="p-3.5 border-t border-gray-100 bg-gray-50/70">
                    <div className="flex items-center justify-between gap-3 p-2 bg-white rounded-xl border border-gray-200/80 shadow-xs">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs shadow-xs">
                                {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-xs font-bold text-gray-900 truncate">
                                    {user.name || 'Admin'}
                                </p>
                                <p className="text-[10px] text-gray-500 truncate" title={user.email}>
                                    {user.email}
                                </p>
                            </div>
                        </div>

                        <button 
                            onClick={handleSignOut}
                            title="Log Out"
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0 cursor-pointer"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
