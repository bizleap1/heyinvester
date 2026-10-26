'use client';

import { useState } from "react";
import { deleteProject } from "@/actions/projects";
import { Trash2, AlertTriangle, X } from "lucide-react";
import Toast, { ToastData } from "@/components/admin/Toast";

export function DeleteProjectButton({ id, name }: { id: string, name: string }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [toast, setToast] = useState<ToastData | null>(null);

    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            await deleteProject(id);
            setToast({
                type: 'success',
                title: 'Project Deleted',
                message: `"${name}" has been removed permanently.`
            });
            setShowConfirm(false);
            setTimeout(() => {
                window.location.reload();
            }, 900);
        } catch (error: any) {
            console.error(error);
            setToast({
                type: 'error',
                title: 'Delete Failed',
                message: error.message || 'Could not delete project'
            });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <Toast toast={toast} onClose={() => setToast(null)} />

            <button 
                type="button"
                onClick={() => setShowConfirm(true)}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50"
                title="Delete Listing"
            >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
            </button>

            {/* Premium Confirmation Dialog */}
            {showConfirm && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 whitespace-normal text-left"
                    onClick={() => setShowConfirm(false)}
                >
                    <div 
                        className="relative w-full max-w-md bg-white rounded-2xl p-6 sm:p-7 shadow-2xl border border-gray-100 text-left whitespace-normal break-words animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Icon Button */}
                        <button
                            type="button"
                            onClick={() => setShowConfirm(false)}
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
                                    Delete Project?
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    This action cannot be undone
                                </p>
                            </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-6 leading-relaxed whitespace-normal break-words">
                            Are you sure you want to delete <span className="font-bold text-gray-900">"{name}"</span>? All associated project images, plot sizes, and details will be permanently erased.
                        </p>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowConfirm(false)}
                                disabled={isDeleting}
                                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
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
        </>
    );
}

