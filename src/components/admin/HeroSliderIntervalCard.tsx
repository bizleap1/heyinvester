'use client';

import { useState, useEffect } from "react";
import { getHeroSliderInterval, updateHeroSliderInterval } from "@/actions/hero";
import { Timer, Check, Save, RotateCcw, Sparkles, Zap, Clock } from "lucide-react";
import Toast, { ToastData } from "@/components/admin/Toast";

const PRESETS = [
    { label: "1.5s", ms: 1500, desc: "Fast" },
    { label: "2.0s", ms: 2000, desc: "Snappy" },
    { label: "2.5s", ms: 2500, desc: "Default" },
    { label: "3.0s", ms: 3000, desc: "Balanced" },
    { label: "4.0s", ms: 4000, desc: "Gentle" },
    { label: "5.0s", ms: 5000, desc: "Slow" },
];

export default function HeroSliderIntervalCard({ onUpdated }: { onUpdated?: () => void }) {
    const [intervalMs, setIntervalMs] = useState<number>(2500);
    const [savedMs, setSavedMs] = useState<number>(2500);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [toast, setToast] = useState<ToastData | null>(null);
    const [previewKey, setPreviewKey] = useState<number>(0);

    useEffect(() => {
        const fetchInterval = async () => {
            try {
                setIsLoading(true);
                const current = await getHeroSliderInterval();
                setIntervalMs(current);
                setSavedMs(current);
            } catch (err) {
                console.error("Failed to fetch slider interval", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchInterval();
    }, []);

    // Reset preview animation ticker whenever intervalMs changes
    useEffect(() => {
        setPreviewKey(prev => prev + 1);
    }, [intervalMs]);

    const handleSave = async (targetMs?: number) => {
        const toSave = targetMs !== undefined ? targetMs : intervalMs;
        if (toSave < 500 || toSave > 60000) {
            setToast({
                type: 'error',
                title: 'Invalid Interval',
                message: 'Interval must be between 0.5s (500ms) and 60s (60000ms).'
            });
            return;
        }

        setIsSaving(true);
        try {
            await updateHeroSliderInterval(toSave);
            setSavedMs(toSave);
            setIntervalMs(toSave);
            setToast({
                type: 'success',
                title: 'Interval Updated',
                message: `Slider interval successfully set to ${(toSave / 1000).toFixed(1)}s.`
            });
            onUpdated?.();
        } catch (err: any) {
            setToast({
                type: 'error',
                title: 'Update Failed',
                message: err.message || 'Failed to update slider interval.'
            });
        } finally {
            setIsSaving(false);
        }
    };

    const hasChanges = intervalMs !== savedMs;
    const seconds = (intervalMs / 1000).toFixed(1);

    if (isLoading) {
        return (
            <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs animate-pulse">
                <div className="h-6 w-48 bg-gray-200 rounded mb-2" />
                <div className="h-4 w-72 bg-gray-100 rounded" />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden transition-all">
            <Toast toast={toast} onClose={() => setToast(null)} />

            {/* Header banner */}
            <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-emerald-50/60 via-white to-gray-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#139D46] text-white flex items-center justify-center shadow-xs">
                        <Timer className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-sm sm:text-base font-bold text-gray-900">
                                Slider Autoplay Interval
                            </h2>
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200/80">
                                <Zap className="w-3 h-3 text-[#139D46]" /> Live Setting
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Controls how long each slide displays before rotating on the homepage.
                        </p>
                    </div>
                </div>

                {/* Current Active Badge */}
                <div className="flex items-center gap-2 self-start sm:self-auto bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200 text-xs">
                    <Clock className="w-3.5 h-3.5 text-gray-500" />
                    <span className="text-gray-500 font-medium">Currently active:</span>
                    <span className="font-extrabold text-[#139D46]">
                        {(savedMs / 1000).toFixed(1)}s
                    </span>
                    <span className="text-[10px] text-gray-400">({savedMs}ms)</span>
                </div>
            </div>

            {/* Controls body */}
            <div className="p-5 sm:p-6 space-y-5">
                {/* Presets Row */}
                <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Quick Presets
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {PRESETS.map((preset) => {
                            const isSelected = intervalMs === preset.ms;
                            const isCurrentSaved = savedMs === preset.ms;
                            return (
                                <button
                                    key={preset.ms}
                                    type="button"
                                    onClick={() => setIntervalMs(preset.ms)}
                                    className={`relative px-3 py-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 border cursor-pointer ${
                                        isSelected
                                            ? 'bg-emerald-50 text-[#139D46] border-[#139D46] shadow-xs ring-2 ring-emerald-500/20'
                                            : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="flex items-center gap-1">
                                        <span className="text-sm font-extrabold">{preset.label}</span>
                                        {isCurrentSaved && (
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#139D46]" title="Currently saved in DB" />
                                        )}
                                    </div>
                                    <span className={`text-[10px] font-medium ${isSelected ? 'text-emerald-700' : 'text-gray-400'}`}>
                                        {preset.desc}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Slider & Input Row */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-gray-50/70 p-4 rounded-xl border border-gray-200/80">
                    {/* Range slider */}
                    <div className="md:col-span-7 space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                            <span className="font-semibold text-gray-700">Custom Duration</span>
                            <span className="text-gray-500 text-[11px]">Range: 1.0s – 10.0s</span>
                        </div>
                        <input
                            type="range"
                            min="1000"
                            max="10000"
                            step="250"
                            value={intervalMs}
                            onChange={(e) => setIntervalMs(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#139D46]"
                        />
                        <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                            <span>1.0s</span>
                            <span>2.5s (Default)</span>
                            <span>5.0s</span>
                            <span>10.0s</span>
                        </div>
                    </div>

                    {/* Direct numeric input */}
                    <div className="md:col-span-5 flex items-center gap-3">
                        <div className="relative flex-1">
                            <input
                                type="number"
                                min="0.5"
                                max="60"
                                step="0.1"
                                value={seconds}
                                onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    if (!isNaN(val)) {
                                        setIntervalMs(Math.round(val * 1000));
                                    }
                                }}
                                className="w-full pl-3 pr-12 py-2 bg-white rounded-xl border border-gray-200 text-sm font-extrabold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#139D46] focus:border-transparent text-right"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 pointer-events-none">
                                sec
                            </span>
                        </div>

                        {/* Reset to 2.5s default if different */}
                        {intervalMs !== 2500 && (
                            <button
                                type="button"
                                onClick={() => setIntervalMs(2500)}
                                title="Reset to 2.5s default"
                                className="p-2 text-gray-500 hover:text-gray-800 bg-white border border-gray-200 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer shrink-0"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Real-time Ticker preview bar */}
                <div className="bg-emerald-950/5 border border-emerald-900/10 rounded-xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-[#139D46]" />
                            <span className="font-semibold text-gray-800">
                                Live Speed Simulation ({seconds}s per slide)
                            </span>
                        </div>
                        <span className="text-[11px] text-gray-500 font-mono">
                            {intervalMs} ms
                        </span>
                    </div>

                    {/* Progress track */}
                    <div className="w-full h-2 bg-gray-200/90 rounded-full overflow-hidden">
                        <div
                            key={previewKey}
                            className="h-full bg-gradient-to-r from-[#139D46] to-emerald-400 rounded-full"
                            style={{
                                animation: `sliderProgress ${intervalMs}ms linear infinite`,
                            }}
                        />
                    </div>
                    <style jsx>{`
                        @keyframes sliderProgress {
                            0% { width: 0%; opacity: 0.8; }
                            90% { width: 100%; opacity: 1; }
                            100% { width: 100%; opacity: 0; }
                        }
                    `}</style>
                </div>

                {/* Footer action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <div className="text-xs text-gray-500">
                        {hasChanges ? (
                            <span className="text-amber-600 font-semibold flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                Unsaved changes: {seconds}s (Current in DB is {(savedMs / 1000).toFixed(1)}s)
                            </span>
                        ) : (
                            <span className="text-emerald-700 font-medium flex items-center gap-1.5">
                                <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                                Speed is saved and active on website
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {hasChanges && (
                            <button
                                type="button"
                                onClick={() => setIntervalMs(savedMs)}
                                className="px-3.5 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => handleSave()}
                            disabled={isSaving || !hasChanges}
                            className={`inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer ${
                                hasChanges
                                    ? 'bg-[#139D46] hover:bg-[#0f823a] text-white shadow-emerald-600/20 hover:shadow-md'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200/60'
                            }`}
                        >
                            <Save className="w-3.5 h-3.5" />
                            <span>{isSaving ? 'Saving...' : 'Save Interval'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
