'use client';

import { useState } from "react";
import { createHeroSlide, updateHeroSlide } from "@/actions/hero";
import Toast, { ToastData } from "@/components/admin/Toast";
import ImageCropModal from "@/components/admin/ImageCropModal";
import { X, Crop, Upload, Sparkles, Check, Smartphone, Monitor } from "lucide-react";

export default function HeroSlideForm({ initialData = null, onClose }: { initialData?: any, onClose: () => void }) {
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState<ToastData | null>(null);
    const [formData, setFormData] = useState({
        heading: initialData?.heading || "",
        subheading: initialData?.subheading || "",
        ctaLabel: initialData?.ctaLabel || "",
        ctaUrl: initialData?.ctaUrl || "",
        active: initialData?.active !== false,
        sortOrder: initialData?.sortOrder || 0,
    });

    const [desktopImage, setDesktopImage] = useState(initialData?.desktopImageUrl ? { url: initialData.desktopImageUrl, publicId: initialData.desktopImagePublicId } : null);
    const [desktopBase64, setDesktopBase64] = useState<string | null>(null);

    const [mobileImage, setMobileImage] = useState(initialData?.mobileImageUrl ? { url: initialData.mobileImageUrl, publicId: initialData.mobileImagePublicId } : null);
    const [mobileBase64, setMobileBase64] = useState<string | null>(null);

    // Active crop modal state
    const [cropModal, setCropModal] = useState<{
        imageSrc: string;
        initialMode: 'desktop' | 'mobile';
    } | null>(null);

    // Desktop banner file input -> immediately opens crop & adjust modal in desktop mode
    const handleDesktopFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const rawUrl = reader.result as string;
            setCropModal({
                imageSrc: rawUrl,
                initialMode: 'desktop',
            });
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    // Mobile banner file input -> immediately opens crop & adjust modal in mobile mode
    const handleMobileFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const rawUrl = reader.result as string;
            setCropModal({
                imageSrc: rawUrl,
                initialMode: 'mobile',
            });
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    // One-click helper: crop mobile version from the desktop image
    const handleCropMobileFromDesktop = () => {
        const src = desktopBase64 || desktopImage?.url;
        if (!src) {
            setToast({
                type: 'error',
                title: 'No Desktop Image',
                message: 'Please upload a desktop banner first to crop for mobile.'
            });
            return;
        }
        setCropModal({
            imageSrc: src,
            initialMode: 'mobile',
        });
    };

    const handleCropSave = (croppedBase64: string, mode: 'desktop' | 'mobile') => {
        if (mode === 'desktop') {
            setDesktopBase64(croppedBase64);
            setToast({
                type: 'info',
                title: 'Desktop Banner Ready',
                message: 'Desktop (16:9) frame fitted and ready.'
            });
        } else {
            setMobileBase64(croppedBase64);
            setToast({
                type: 'info',
                title: 'Mobile Banner Ready',
                message: 'Mobile (9:16) portrait banner fitted and ready.'
            });
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!desktopImage && !desktopBase64) {
            setToast({
                type: 'error',
                title: 'Image Required',
                message: 'Desktop 16:9 image is required for hero slide.'
            });
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                ...formData,
                desktopImageUrl: desktopImage?.url || null,
                desktopImagePublicId: desktopImage?.publicId || null,
                desktopImageBase64: desktopBase64 || undefined,
                mobileImageUrl: mobileImage?.url || null,
                mobileImagePublicId: mobileImage?.publicId || null,
                mobileImageBase64: mobileBase64 || undefined,
            };

            if (initialData) {
                await updateHeroSlide(initialData.id, payload);
            } else {
                await createHeroSlide(payload);
            }
            onClose();
        } catch (err: any) {
            setToast({
                type: 'error',
                title: 'Save Failed',
                message: err.message || 'Failed to save slide'
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <Toast toast={toast} onClose={() => setToast(null)} />

            {/* Interactive Crop & Position Modal */}
            {cropModal && (
                <ImageCropModal
                    imageSrc={cropModal.imageSrc}
                    initialMode={cropModal.initialMode}
                    allowModeSwitch={true}
                    onSave={handleCropSave}
                    onClose={() => setCropModal(null)}
                />
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Media Upload & Adjustment Box */}
                    <div className="space-y-6 p-5 bg-gray-50/70 rounded-2xl border border-gray-200/80">
                        <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                            <div>
                                <h3 className="text-sm font-bold text-gray-900">Banner Photos & Framing</h3>
                                <p className="text-[11px] text-gray-500 mt-0.5">Upload and adjust your images to fit homepage frames</p>
                            </div>
                        </div>
                        
                        {/* 1. Desktop Image (16:9) */}
                        <div className="space-y-2.5">
                            <div className="flex flex-wrap items-center justify-between gap-1">
                                <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
                                    Desktop Banner *
                                </label>
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                                    📐 16:9 Frame (1920 × 1080)
                                </span>
                            </div>

                            {(desktopBase64 || desktopImage) ? (
                                <div className="space-y-2">
                                    <div className="relative group rounded-xl overflow-hidden border-2 border-emerald-500/80 shadow-sm aspect-video bg-black">
                                        <img 
                                            src={desktopBase64 || desktopImage?.url} 
                                            alt="Desktop Banner Preview" 
                                            className="w-full h-full object-cover" 
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => { setDesktopImage(null); setDesktopBase64(null); }} 
                                            className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-md hover:bg-red-700 transition-colors cursor-pointer"
                                            title="Remove image"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                        <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded">
                                            16:9 Fitted
                                        </div>
                                    </div>

                                    {/* Action buttons when image exists */}
                                    <div className="flex flex-wrap items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const src = desktopBase64 || desktopImage?.url;
                                                if (src) setCropModal({ imageSrc: src, initialMode: 'desktop' });
                                            }}
                                            className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                                        >
                                            <Crop className="w-3.5 h-3.5" />
                                            <span>Adjust (16:9)</span>
                                        </button>

                                        {/* Direct button to crop mobile from this desktop photo */}
                                        <button
                                            type="button"
                                            onClick={handleCropMobileFromDesktop}
                                            className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors cursor-pointer"
                                            title="Crop this desktop image for mobile view (9:16)"
                                        >
                                            <Smartphone className="w-3.5 h-3.5 text-purple-700" />
                                            <span>Crop for Mobile</span>
                                        </button>

                                        <label className="inline-flex items-center justify-center px-3 py-2 rounded-xl text-xs font-bold text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 transition-colors cursor-pointer">
                                            <span>Replace</span>
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                onChange={handleDesktopFileInput}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 hover:border-[#139D46] bg-white rounded-2xl cursor-pointer transition-all hover:bg-emerald-50/40 group">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#139D46] group-hover:scale-110 flex items-center justify-center transition-transform mb-2">
                                        <Upload className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs font-bold text-gray-800">
                                        Upload Desktop Banner Image
                                    </span>
                                    <span className="text-[11px] text-gray-500 mt-0.5">
                                        Crop & adjust window will open automatically
                                    </span>
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={handleDesktopFileInput}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>

                        {/* 2. Mobile Image (9:16) */}
                        <div className="pt-4 border-t border-gray-200 space-y-2.5">
                            <div className="flex flex-wrap items-center justify-between gap-1">
                                <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
                                    Mobile Banner (Optional)
                                </label>
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-800 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full">
                                    📱 9:16 Frame (1080 × 1920)
                                </span>
                            </div>

                            {(mobileBase64 || mobileImage) ? (
                                <div className="space-y-2">
                                    <div className="relative group rounded-xl overflow-hidden border-2 border-purple-400 shadow-sm w-28 aspect-[9/16] bg-black">
                                        <img 
                                            src={mobileBase64 || mobileImage?.url} 
                                            alt="Mobile Banner Preview" 
                                            className="w-full h-full object-cover" 
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => { setMobileImage(null); setMobileBase64(null); }} 
                                            className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-md hover:bg-red-700 transition-colors cursor-pointer"
                                            title="Remove image"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                        <div className="absolute bottom-1.5 left-1.5 bg-black/70 backdrop-blur-xs text-white text-[9px] font-mono px-1.5 py-0.5 rounded">
                                            9:16 Fitted
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex flex-wrap items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const src = mobileBase64 || mobileImage?.url || desktopBase64 || desktopImage?.url;
                                                if (src) setCropModal({ imageSrc: src, initialMode: 'mobile' });
                                            }}
                                            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors cursor-pointer"
                                        >
                                            <Crop className="w-3.5 h-3.5" />
                                            <span>Adjust Crop (9:16)</span>
                                        </button>

                                        {(desktopBase64 || desktopImage) && (
                                            <button
                                                type="button"
                                                onClick={handleCropMobileFromDesktop}
                                                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 transition-colors cursor-pointer"
                                                title="Re-crop using desktop image"
                                            >
                                                <Smartphone className="w-3.5 h-3.5 text-purple-600" />
                                                <span>Re-crop Desktop</span>
                                            </button>
                                        )}

                                        <label className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 transition-colors cursor-pointer">
                                            <Upload className="w-3.5 h-3.5" />
                                            <span>Add Different Image</span>
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                onChange={handleMobileFileInput}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                </div>
                            ) : (desktopBase64 || desktopImage) ? (
                                /* When desktop image is uploaded, offer instant crop for mobile button */
                                <div className="p-3.5 bg-gradient-to-r from-purple-50 to-indigo-50/60 border border-purple-200/90 rounded-2xl space-y-2.5">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0">
                                                <Smartphone className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-900">Crop from Desktop Photo</p>
                                                <p className="text-[10px] text-gray-500">Auto-frame your photo for vertical mobile screens (9:16)</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleCropMobileFromDesktop}
                                            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                                        >
                                            <Crop className="w-3.5 h-3.5" />
                                            <span>Crop for Mobile</span>
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between pt-2 border-t border-purple-100/90">
                                        <span className="text-[11px] text-gray-500">Or for mobile:</span>
                                        <label className="text-xs font-bold text-purple-700 hover:underline cursor-pointer inline-flex items-center gap-1">
                                            <Upload className="w-3.5 h-3.5" />
                                            <span>Add Different Image</span>
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                onChange={handleMobileFileInput}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                </div>
                            ) : (
                                <label className="flex items-center justify-between p-3.5 border border-dashed border-gray-300 hover:border-purple-500 bg-white rounded-xl cursor-pointer transition-all hover:bg-purple-50/30 group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                                            <Upload className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-800">Add Mobile Banner</p>
                                            <p className="text-[10px] text-gray-400">Upload separate file, or upload desktop banner first to crop</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-purple-700 group-hover:underline">
                                        Choose File
                                    </span>
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={handleMobileFileInput}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Slide Content */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-900 pb-2 border-b border-gray-100">Slide Text & Action</h3>
                        
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                Main Heading
                            </label>
                            <input 
                                type="text" 
                                name="heading" 
                                value={formData.heading} 
                                onChange={handleChange} 
                                placeholder="e.g. Invest in Nagpur's Growth"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#139D46] transition-all font-medium text-gray-900" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                Subheading
                            </label>
                            <input 
                                type="text" 
                                name="subheading" 
                                value={formData.subheading} 
                                onChange={handleChange} 
                                placeholder="e.g. NMRDA & RL Approved Residential & Commercial Plots"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#139D46] transition-all font-medium text-gray-900" 
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                    Button Label
                                </label>
                                <input 
                                    type="text" 
                                    name="ctaLabel" 
                                    value={formData.ctaLabel} 
                                    onChange={handleChange} 
                                    placeholder="e.g. Explore Plots"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#139D46] transition-all font-medium text-gray-900" 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                    Button Link URL
                                </label>
                                <input 
                                    type="text" 
                                    name="ctaUrl" 
                                    value={formData.ctaUrl} 
                                    onChange={handleChange} 
                                    placeholder="e.g. /properties"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#139D46] transition-all font-medium text-gray-900" 
                                />
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-6 pt-3 border-t border-gray-100">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                    Display Order
                                </label>
                                <input 
                                    type="number" 
                                    name="sortOrder" 
                                    value={formData.sortOrder} 
                                    onChange={handleChange} 
                                    className="w-24 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#139D46] font-mono" 
                                />
                            </div>
                            <div className="flex items-center gap-2.5 mt-5">
                                <input 
                                    type="checkbox" 
                                    id="active" 
                                    name="active" 
                                    checked={formData.active} 
                                    onChange={handleChange} 
                                    className="w-4 h-4 text-[#139D46] rounded focus:ring-[#139D46] accent-[#139D46] cursor-pointer" 
                                />
                                <label htmlFor="active" className="text-xs font-bold text-gray-700 cursor-pointer">
                                    Slide Active (Visible on Live Website)
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        disabled={isSaving} 
                        className="px-6 py-2.5 bg-[#139D46] hover:bg-[#0f823a] text-white rounded-xl text-sm font-bold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                    >
                        {isSaving ? 'Saving...' : initialData ? 'Update Slide' : 'Add Slide'}
                    </button>
                </div>
            </form>
        </>
    );
}
