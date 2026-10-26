'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastData {
    id?: string;
    type: 'success' | 'error' | 'info';
    title: string;
    message?: string;
    duration?: number;
}

interface ToastProps {
    toast: ToastData | null;
    onClose: () => void;
}

export default function Toast({ toast, onClose }: ToastProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (!toast) {
            setIsVisible(false);
            return;
        }

        setIsVisible(true);
        const duration = toast.duration ?? 3500;
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // allow exit animation to finish
        }, duration);

        return () => clearTimeout(timer);
    }, [toast, onClose]);

    if (!toast) return null;

    const isSuccess = toast.type === 'success';
    const isError = toast.type === 'error';

    return (
        <div className="fixed top-5 right-5 z-50 max-w-md w-[calc(100vw-2.5rem)] pointer-events-none">
            <div
                className={`
                    pointer-events-auto
                    relative overflow-hidden
                    bg-white/95 backdrop-blur-md 
                    rounded-2xl p-4 sm:p-5
                    border shadow-2xl
                    transition-all duration-300 ease-out
                    ${isVisible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95'}
                    ${isSuccess 
                        ? 'border-emerald-200/80 shadow-emerald-950/10' 
                        : isError 
                        ? 'border-red-200/80 shadow-red-950/10' 
                        : 'border-blue-200/80 shadow-blue-950/10'
                    }
                `}
            >
                <div className="flex items-start gap-3.5">
                    {/* Icon with soft pulse */}
                    <div
                        className={`
                            w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs
                            ${isSuccess 
                                ? 'bg-emerald-50 text-emerald-600 ring-4 ring-emerald-50/50' 
                                : isError 
                                ? 'bg-red-50 text-red-600 ring-4 ring-red-50/50' 
                                : 'bg-blue-50 text-blue-600 ring-4 ring-blue-50/50'
                            }
                        `}
                    >
                        {isSuccess ? (
                            <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                        ) : isError ? (
                            <AlertCircle className="w-5 h-5 stroke-[2.5]" />
                        ) : (
                            <Info className="w-5 h-5 stroke-[2.5]" />
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pr-6 pt-0.5">
                        <h4 className="text-sm font-bold text-gray-900 leading-snug">
                            {toast.title}
                        </h4>
                        {toast.message && (
                            <p className="text-xs text-gray-600 mt-1 leading-relaxed whitespace-pre-line">
                                {toast.message}
                            </p>
                        )}
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={() => {
                            setIsVisible(false);
                            setTimeout(onClose, 250);
                        }}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        aria-label="Dismiss notification"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Bottom Countdown Progress Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100 overflow-hidden">
                    <div
                        className={`h-full transition-all duration-[3500ms] ease-linear w-full ${
                            isSuccess 
                                ? 'bg-[#139D46]' 
                                : isError 
                                ? 'bg-red-500' 
                                : 'bg-blue-500'
                        }`}
                        style={{
                            animation: isVisible ? 'toastProgress 3.5s linear forwards' : 'none'
                        }}
                    />
                </div>
            </div>

            <style jsx>{`
                @keyframes toastProgress {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            `}</style>
        </div>
    );
}
