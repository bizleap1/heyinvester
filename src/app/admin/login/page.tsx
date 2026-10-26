'use client';

import { useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const { data, error } = await authClient.signIn.email({
            email,
            password
        });
        if (error) {
            setError(error.message || 'Login failed');
            setLoading(false);
        } else {
            router.push('/admin');
            router.refresh();
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] px-4">
            <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
                <div className="flex flex-col items-center mb-6">
                    <Link href="/" className="inline-block transition-transform hover:scale-105 mb-4">
                        <Image 
                            src="/logo (1).png" 
                            alt="Hey Investor" 
                            width={220} 
                            height={70} 
                            priority 
                            className="h-12 w-auto object-contain"
                        />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
                    <p className="text-sm text-gray-500 mt-1">Sign in to manage Hey Investor portal</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input 
                            type="email" 
                            required 
                            placeholder="admin@heyinvestor.in"
                            className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg shadow-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#139D46] focus:border-transparent transition-all"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input 
                            type="password" 
                            required 
                            placeholder="••••••••"
                            className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg shadow-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#139D46] focus:border-transparent transition-all"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-[#139D46] hover:bg-[#0f823a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#139D46] transition-colors disabled:opacity-60 cursor-pointer"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link href="/" className="text-xs font-medium text-gray-500 hover:text-[#139D46] transition-colors">
                        ← Back to Website
                    </Link>
                </div>
            </div>
        </div>
    );
}
