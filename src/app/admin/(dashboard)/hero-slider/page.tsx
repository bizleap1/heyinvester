'use client';

import { useState, useEffect } from "react";
import HeroSlideForm from "@/components/admin/HeroSlideForm";
import { format } from "date-fns";

// Since we're in a client component, we'd normally fetch data via SWR or pass it from a Server Component.
// For simplicity in this massive admin panel, let's assume we can fetch via a server action.
import { getHeroSlides, deleteHeroSlide, toggleHeroSlideStatus } from "@/actions/hero";
import Toast, { ToastData } from "@/components/admin/Toast";
import { AlertTriangle, Trash2, X, Plus } from "lucide-react";
import HeroSliderIntervalCard from "@/components/admin/HeroSliderIntervalCard";

export default function HeroSliderPage() {
    const [slides, setSlides] = useState<any[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingSlide, setEditingSlide] = useState<any>(null);
    const [deletingSlide, setDeletingSlide] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [toast, setToast] = useState<ToastData | null>(null);

    const loadSlides = async () => {
        setIsLoading(true);
        try {
            const data = await getHeroSlides();
            setSlides(data);
        } catch (err) {
            console.error("Failed to load slides", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadSlides();
    }, []);

    const handleEdit = (slide: any) => {
        setEditingSlide(slide);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingSlide(null);
        loadSlides(); // Refresh list after edit/add
    };

    const confirmDelete = async () => {
        if (!deletingSlide) return;
        setIsDeleting(true);
        try {
            await deleteHeroSlide(deletingSlide.id);
            setToast({
                type: 'success',
                title: 'Slide Deleted',
                message: 'Hero slide removed successfully.'
            });
            setDeletingSlide(null);
            loadSlides();
        } catch (err: any) {
            setToast({
                type: 'error',
                title: 'Delete Failed',
                message: err.message || "Failed to delete slide"
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleToggleStatus = async (id: string, active: boolean) => {
        try {
            await toggleHeroSlideStatus(id, active);
            setToast({
                type: 'info',
                title: 'Status Updated',
                message: `Slide is now ${active ? 'Active' : 'Inactive'}.`
            });
            loadSlides();
        } catch (err: any) {
            setToast({
                type: 'error',
                title: 'Update Failed',
                message: err.message || "Failed to update status"
            });
        }
    };

    return (
        <div className="space-y-6">
            <Toast toast={toast} onClose={() => setToast(null)} />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Homepage Hero Slider</h1>
                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                        Manage the sliding banner images and promotional headlines displayed at the top of the homepage.
                    </p>
                </div>
                <button 
                    onClick={() => { setEditingSlide(null); setIsFormOpen(true); }}
                    className="inline-flex items-center justify-center gap-2 bg-[#139D46] hover:bg-[#0f823a] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:shadow transition-all shrink-0 cursor-pointer"
                >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Add New Banner</span>
                </button>
            </div>

            {isFormOpen && (
                <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200 mb-8 transition-all">
                    <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                        <h2 className="text-lg font-bold text-gray-900">
                            {editingSlide ? '✏️ Edit Slide' : '➕ Add New Banner'}
                        </h2>
                        <button 
                            onClick={handleCloseForm}
                            className="text-xs font-semibold text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                            Close
                        </button>
                    </div>
                    <HeroSlideForm initialData={editingSlide} onClose={handleCloseForm} />
                </div>
            )}

            {/* Slider Interval Speed Control */}
            <HeroSliderIntervalCard />

            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-sm sm:text-base font-bold text-gray-900">
                            Banner Slides ({slides.length})
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Active slides will rotate automatically according to the interval set above.
                        </p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-left">
                        <thead className="bg-gray-50 text-gray-500 text-[11px] uppercase tracking-wider font-semibold">
                            <tr>
                                <th className="px-5 py-3.5">Banner Photos (Desktop / Mobile)</th>
                                <th className="px-5 py-3.5">Heading & Text</th>
                                <th className="px-5 py-3.5">Live Status</th>
                                <th className="px-5 py-3.5 text-center">Display Order</th>
                                <th className="px-5 py-3.5">Last Updated</th>
                                <th className="px-5 py-3.5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white text-sm">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        Loading banner slides...
                                    </td>
                                </tr>
                            ) : slides.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center">
                                            <p className="text-sm font-semibold text-gray-700 mb-2">No hero slides added yet.</p>
                                            <button 
                                                onClick={() => setIsFormOpen(true)} 
                                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#139D46] text-white text-xs font-bold rounded-lg hover:bg-[#0f823a] transition-colors cursor-pointer"
                                            >
                                                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                                                <span>Add First Banner</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : slides.map((slide) => (
                                <tr key={slide.id} className="hover:bg-gray-50/80 transition-colors">
                                    <td className="px-5 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2.5">
                                            <div className="relative group">
                                                <img 
                                                    src={slide.desktopImageUrl} 
                                                    alt="Desktop" 
                                                    className="w-24 h-14 object-cover rounded-xl border border-gray-200 shadow-2xs" 
                                                    title="Desktop Banner View" 
                                                />
                                                <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] px-1.5 rounded font-mono">
                                                    PC
                                                </span>
                                            </div>
                                            {slide.mobileImageUrl && (
                                                <div className="relative group">
                                                    <img 
                                                        src={slide.mobileImageUrl} 
                                                        alt="Mobile" 
                                                        className="w-9 h-14 object-cover rounded-lg border border-gray-200 shadow-2xs" 
                                                        title="Mobile Banner View" 
                                                    />
                                                    <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[8px] px-1 rounded font-mono">
                                                        Ph
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="font-bold text-gray-900">{slide.heading || '(No Heading)'}</div>
                                        <div className="text-xs text-gray-500 line-clamp-1 mt-0.5">{slide.subheading || '—'}</div>
                                    </td>
                                    <td className="px-5 py-4 whitespace-nowrap">
                                        <button 
                                            onClick={() => handleToggleStatus(slide.id, !slide.active)}
                                            className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full border transition cursor-pointer ${
                                                slide.active 
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                                                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                                            }`}
                                            title="Click to toggle active status"
                                        >
                                            {slide.active ? '🟢 Active (Live)' : '⚪ Inactive'}
                                        </button>
                                    </td>
                                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-600 text-center font-mono font-bold">
                                        #{slide.sortOrder ?? 0}
                                    </td>
                                    <td className="px-5 py-4 whitespace-nowrap text-xs text-gray-500">
                                        {format(new Date(slide.updatedAt), 'MMM d, yyyy')}
                                    </td>
                                    <td className="px-5 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => handleEdit(slide)} 
                                                className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-gray-700 bg-gray-100 hover:bg-[#139D46] hover:text-white transition-colors cursor-pointer"
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                onClick={() => setDeletingSlide(slide)} 
                                                className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-red-600 bg-red-50 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Premium Delete Confirmation Dialog */}
            {deletingSlide && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 whitespace-normal text-left"
                    onClick={() => setDeletingSlide(null)}
                >
                    <div 
                        className="relative w-full max-w-md bg-white rounded-2xl p-6 sm:p-7 shadow-2xl border border-gray-100 text-left whitespace-normal break-words animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setDeletingSlide(null)}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 text-red-600 flex items-center justify-center shrink-0 shadow-2xs">
                                <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
                            </div>
                            <div className="pt-0.5">
                                <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                                    Delete Hero Slide?
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    This banner will be permanently removed
                                </p>
                            </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-6 leading-relaxed whitespace-normal break-words">
                            Are you sure you want to delete <span className="font-bold text-gray-900">"{deletingSlide.heading || 'this slide'}"</span>? The desktop and mobile slide images will be permanently erased from storage.
                        </p>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setDeletingSlide(null)}
                                disabled={isDeleting}
                                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmDelete}
                                disabled={isDeleting}
                                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                            >
                                {isDeleting ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Deleting...</span>
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-4 h-4" />
                                        <span>Yes, Delete</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
