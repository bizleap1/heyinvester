'use client';

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createProject, updateProject } from "@/actions/projects";
import Toast, { ToastData } from "@/components/admin/Toast";
import { 
    Plus, 
    Trash2, 
    Sparkles, 
    MapPin, 
    CheckCircle2, 
    Image as ImageIcon,
    Building2,
    DollarSign,
    ShieldCheck,
    Layers,
    X,
    Crop,
    Camera,
    Upload
} from "lucide-react";
import ImageCropModal from "@/components/admin/ImageCropModal";

// Helper Section component
const Section = ({ title, desc, children }: { title: string, desc?: string, children: React.ReactNode }) => (
    <div className="mb-8 p-6 sm:p-7 bg-white rounded-2xl border border-gray-200/80 shadow-2xs">
        <div className="mb-5 pb-3 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-900">{title}</h2>
            {desc && <p className="text-xs text-gray-500 mt-0.5">{desc}</p>}
        </div>
        <div className="space-y-4">{children}</div>
    </div>
);

// Client-side image compression to guarantee smooth, fast uploads under size limits
async function compressImage(file: File, maxDimension = 1600, quality = 0.82): Promise<string> {
    return new Promise((resolve) => {
        if (!file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
            return;
        }

        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
        img.src = objectUrl;

        img.onload = () => {
            URL.revokeObjectURL(objectUrl);
            let { width, height } = img;

            if (width > maxDimension || height > maxDimension) {
                if (width > height) {
                    height = Math.round((height * maxDimension) / width);
                    width = maxDimension;
                } else {
                    width = Math.round((width * maxDimension) / height);
                    height = maxDimension;
                }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(file);
                return;
            }

            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', quality);
            resolve(compressed);
        };

        img.onerror = () => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
        };
    });
}

export default function ProjectForm({ initialData = null, isEditing = false }: { initialData?: any, isEditing?: boolean }) {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [isOptimizingImage, setIsOptimizingImage] = useState(false);
    const [toast, setToast] = useState<ToastData | null>(null);
    
    // State
    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        slug: initialData?.slug || "",
        shortDescription: initialData?.shortDescription || "",
        description: initialData?.description || "",
        location: initialData?.location || "",
        corridor: initialData?.corridor || "",
        projectType: initialData?.projectType || "residential",
        pricePerSqft: initialData?.pricePerSqft || "",
        startingPrice: initialData?.startingPrice || "",
        loanPercentage: initialData?.loanPercentage || "",
        reraNumber: initialData?.reraNumber || "",
        nmrdaApproved: initialData?.nmrdaApproved || false,
        rlApproved: initialData?.rlApproved || false,
        titleClear: initialData?.titleClear || false,
        status: initialData?.status || "available",
        published: initialData?.published || false,
        isFeatured: initialData?.isFeatured || false,
        displayOrder: initialData?.displayOrder || 0,
    });

    const [coverImage, setCoverImage] = useState(initialData?.coverImageUrl ? { url: initialData.coverImageUrl, publicId: initialData.coverImagePublicId } : null);
    const [coverImageBase64, setCoverImageBase64] = useState<string | null>(null);
    
    // Arrays
    const [plotSizes, setPlotSizes] = useState<{sizeSqFt: string}[]>(
        initialData?.plotSizes?.map((p: any) => ({ sizeSqFt: String(p.sizeSqFt || "") })) || []
    );
    
    const [amenities, setAmenities] = useState<{name: string}[]>(
        initialData?.amenities?.map((a: any) => ({ name: a.name || "" })) || []
    );

    // Location Advantages / Key Highlights / More Info
    const [locationAdvantages, setLocationAdvantages] = useState<{landmark: string, distance: string}[]>(
        initialData?.locationAdvantages?.map((l: any) => ({
            landmark: l.landmark || "",
            distance: l.distance || ""
        })) || []
    );

    const [galleryImages, setGalleryImages] = useState<{url: string, publicId: string}[]>(
        initialData?.galleryImages?.map((img: any) => ({
            url: img.url || img.imageUrl,
            publicId: img.publicId || img.cloudinaryPublicId
        })) || []
    );
    const [galleryImagesBase64, setGalleryImagesBase64] = useState<string[]>([]);

    // Plot Size Handlers
    const addPlotSize = () => setPlotSizes([...plotSizes, { sizeSqFt: "" }]);
    const removePlotSize = (index: number) => setPlotSizes(plotSizes.filter((_, i) => i !== index));
    const updatePlotSize = (index: number, val: string) => {
        const newSizes = [...plotSizes];
        newSizes[index].sizeSqFt = val;
        setPlotSizes(newSizes);
    };

    // Amenities Handlers
    const addAmenity = () => setAmenities([...amenities, { name: "" }]);
    const removeAmenity = (index: number) => setAmenities(amenities.filter((_, i) => i !== index));
    const updateAmenity = (index: number, val: string) => {
        const next = [...amenities];
        next[index].name = val;
        setAmenities(next);
    };

    // Location Advantages / More Info Handlers
    const addLocationAdvantage = () => {
        setLocationAdvantages(prev => [...prev, { landmark: "", distance: "" }]);
    };
    const removeLocationAdvantage = (index: number) => {
        setLocationAdvantages(prev => prev.filter((_, i) => i !== index));
    };
    const updateLocationAdvantage = (index: number, field: 'landmark' | 'distance', value: string) => {
        setLocationAdvantages(prev => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value };
            return next;
        });
    };
    
    // Image Crop Modal state & file refs
    const [cropModal, setCropModal] = useState<{
        isOpen: boolean;
        imageSrc: string;
        target: 
            | { type: 'cover' }
            | { type: 'addNewGallery' }
            | { type: 'newGallery'; index: number }
            | { type: 'existingGallery'; index: number };
        initialMode?: 'desktop' | 'mobile';
    } | null>(null);

    const coverFileInputRef = useRef<HTMLInputElement>(null);
    const galleryMultiFileInputRef = useRef<HTMLInputElement>(null);
    const galleryCropFileInputRef = useRef<HTMLInputElement>(null);

    // Save Cropped Result
    const handleCropSave = (croppedBase64: string) => {
        if (!cropModal) return;
        const { target } = cropModal;
        
        if (target.type === 'cover') {
            setCoverImageBase64(croppedBase64);
            setCoverImage(null);
        } else if (target.type === 'addNewGallery') {
            setGalleryImagesBase64(prev => [...prev, croppedBase64]);
        } else if (target.type === 'newGallery') {
            setGalleryImagesBase64(prev => {
                const next = [...prev];
                next[target.index] = croppedBase64;
                return next;
            });
        } else if (target.type === 'existingGallery') {
            setGalleryImages(prev => prev.filter((_, i) => i !== target.index));
            setGalleryImagesBase64(prev => [...prev, croppedBase64]);
        }
        setCropModal(null);
    };

    // Trigger cropping directly on cover image
    const handleAdjustCover = () => {
        const src = coverImageBase64 || coverImage?.url;
        if (!src) return;
        setCropModal({
            isOpen: true,
            imageSrc: src,
            target: { type: 'cover' },
            initialMode: 'desktop'
        });
    };

    // Native File Upload Handlers (with automatic fast compression)
    const handleCoverFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsOptimizingImage(true);
        try {
            const optimizedBase64 = await compressImage(file);
            setCoverImageBase64(optimizedBase64);
        } catch (err) {
            console.error('Failed to process cover image:', err);
        } finally {
            setIsOptimizingImage(false);
            if (e.target) e.target.value = '';
        }
    };

    // Multi-file gallery picker handler (+ Add More Images)
    const handleGalleryFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        setIsOptimizingImage(true);
        try {
            const base64s = await Promise.all(files.map(file => compressImage(file)));
            setGalleryImagesBase64(prev => [...prev, ...base64s]);
        } catch (err) {
            console.error('Failed to process gallery images:', err);
        } finally {
            setIsOptimizingImage(false);
            if (e.target) e.target.value = '';
        }
    };

    // Single-file with immediate crop handler (+ Add with Crop)
    const handleGalleryCropFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            setCropModal({
                isOpen: true,
                imageSrc: reader.result as string,
                target: { type: 'addNewGallery' },
                initialMode: 'desktop'
            });
        };
        reader.readAsDataURL(file);
        if (e.target) e.target.value = '';
    };

    // Trigger cropping for any gallery image card
    const handleCropGalleryThumb = (
        src: string, 
        target: { type: 'newGallery'; index: number } | { type: 'existingGallery'; index: number }
    ) => {
        setCropModal({
            isOpen: true,
            imageSrc: src,
            target,
            initialMode: 'desktop'
        });
    };

    const handleRemoveGalleryImage = (index: number) => {
        setGalleryImages(prev => prev.filter((_, i) => i !== index));
    };
    
    const handleRemoveNewGalleryImage = (index: number) => {
        setGalleryImagesBase64(prev => prev.filter((_, i) => i !== index));
    };

    const [hasManuallyEditedSlug, setHasManuallyEditedSlug] = useState(Boolean(initialData?.slug));

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setFormData(prev => {
            const next = { ...prev, name: val };
            if (!hasManuallyEditedSlug && !isEditing) {
                next.slug = val
                    .toLowerCase()
                    .trim()
                    .replace(/[^a-z0-9\s-]/g, '')
                    .replace(/\s+/g, '-');
            }
            return next;
        });
    };

    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setHasManuallyEditedSlug(true);
        const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
        setFormData(prev => ({ ...prev, slug: val }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent, publishStatus: boolean) => {
        e.preventDefault();
        setIsSaving(true);
        
        try {
            const payload = {
                ...formData,
                published: publishStatus,
                coverImageUrl: coverImage?.url || null,
                coverImagePublicId: coverImage?.publicId || null,
                coverImageBase64: coverImageBase64 || null,
                plotSizes: plotSizes
                    .map((p: any) => ({
                        sizeSqFt: String(p.sizeSqFt || "").trim(),
                        label: null,
                    }))
                    .filter((p: any) => p.sizeSqFt.length > 0),
                amenities: amenities
                    .map((a: any) => ({
                        name: (a.name || "").trim(),
                    }))
                    .filter((a: any) => a.name.length > 0),
                locationAdvantages: locationAdvantages
                    .map((l: any) => ({
                        landmark: (l.landmark || "").trim(),
                        distance: (l.distance || "").trim(),
                    }))
                    .filter((l: any) => l.landmark.length > 0 && l.distance.length > 0),
                galleryImages,
                galleryImagesBase64,
            };

            if (isEditing) {
                await updateProject(initialData.id, payload);
                setToast({
                    type: 'success',
                    title: 'Project Saved Successfully!',
                    message: publishStatus 
                        ? 'Project is now live on the website.' 
                        : 'Saved as draft. Hidden from website visitors.'
                });
            } else {
                await createProject(payload);
                setToast({
                    type: 'success',
                    title: 'New Project Created!',
                    message: publishStatus 
                        ? 'New property has been published live.' 
                        : 'Saved as draft.'
                });
            }

            // Smooth redirect after toast is shown
            setTimeout(() => {
                router.push("/admin/projects");
                router.refresh();
            }, 1400);
        } catch (err: any) {
            let msg = err.message || "Failed to save project";
            if (msg.includes("Failed to fetch") || msg.includes("fetch")) {
                msg = "Network connection interrupted or request timed out. We've auto-compressed the photo, please click Save again.";
            } else {
                try {
                    const parsed = JSON.parse(msg);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        msg = parsed.map((item: any) => `${item.path?.join(' > ') || 'Field'}: ${item.message}`).join('\n');
                    }
                } catch (_) {}
            }
            
            setToast({
                type: 'error',
                title: 'Unable to Save Project',
                message: msg,
                duration: 6000
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            {/* Premium Toast Notification System */}
            <Toast toast={toast} onClose={() => setToast(null)} />

            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                
                {/* 1. Basic Information */}
                <Section title="1. Basic Information" desc="Name, slug, and core location details">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                Project Name *
                            </label>
                            <input 
                                required 
                                type="text" 
                                name="name" 
                                value={formData.name} 
                                onChange={handleNameChange} 
                                placeholder="e.g. Nagpur Marina"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#139D46] transition-all font-medium text-gray-900" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                URL Slug *
                            </label>
                            <input 
                                required 
                                type="text" 
                                name="slug" 
                                value={formData.slug} 
                                onChange={handleSlugChange} 
                                placeholder="e.g. nagpur-marina"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#139D46] transition-all font-mono text-gray-900" 
                            />
                            <p className="text-[11px] text-gray-400 mt-1">
                                Unique URL identifier: <span className="font-mono text-gray-600">/projects/{formData.slug || 'your-slug'}</span>
                            </p>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                Location Area *
                            </label>
                            <input 
                                required 
                                type="text" 
                                name="location" 
                                value={formData.location} 
                                onChange={handleChange} 
                                placeholder="e.g. Mouza-Lava, Nagpur"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#139D46] transition-all font-medium text-gray-900" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                Growth Corridor / Highway
                            </label>
                            <input 
                                type="text" 
                                name="corridor" 
                                value={formData.corridor} 
                                onChange={handleChange} 
                                placeholder="e.g. Amravati Road / Wardha Road"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#139D46] transition-all text-gray-900" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                Property Type
                            </label>
                            <select 
                                name="projectType" 
                                value={formData.projectType} 
                                onChange={handleChange} 
                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#139D46] transition-all bg-white font-medium text-gray-900"
                            >
                                <option value="residential">Residential Plots</option>
                                <option value="commercial">Commercial Plots</option>
                                <option value="residential_commercial">Residential + Commercial</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                Bank Loan Assistance
                            </label>
                            <input 
                                type="text" 
                                name="loanPercentage" 
                                value={formData.loanPercentage} 
                                onChange={handleChange} 
                                placeholder="e.g. 80" 
                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#139D46] transition-all text-gray-900" 
                            />
                            <p className="text-[11px] text-gray-400 mt-1">Leave empty or enter percentage (e.g. 80% Bank Loan Available)</p>
                        </div>
                    </div>

                    <div className="pt-2">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                            Short Summary (Shown on Cards) *
                        </label>
                        <input 
                            required 
                            type="text" 
                            name="shortDescription" 
                            value={formData.shortDescription} 
                            onChange={handleChange} 
                            placeholder="e.g. Premium plotted development on Amravati Road corridor."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#139D46] transition-all text-gray-900" 
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                            Detailed Description *
                        </label>
                        <textarea 
                            required 
                            name="description" 
                            rows={4} 
                            value={formData.description} 
                            onChange={handleChange} 
                            placeholder="Complete details of the plotted layout, approvals, and legal aspects..."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#139D46] transition-all text-gray-900" 
                        />
                    </div>
                </Section>

                {/* 2. Pricing & Status */}
                <Section title="2. Pricing & Availability" desc="Set plot rate and current launch status">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                Price Per Sq.Ft *
                            </label>
                            <input 
                                required
                                type="text" 
                                name="pricePerSqft" 
                                value={formData.pricePerSqft} 
                                onChange={handleChange} 
                                placeholder="e.g. ₹5,400" 
                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#139D46] transition-all font-semibold text-gray-900" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                Starting Plot Price
                            </label>
                            <input 
                                type="text" 
                                name="startingPrice" 
                                value={formData.startingPrice} 
                                onChange={handleChange} 
                                placeholder="e.g. From ₹22.5 Lakh" 
                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#139D46] transition-all text-gray-900" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                Project Status
                            </label>
                            <select 
                                name="status" 
                                value={formData.status} 
                                onChange={handleChange} 
                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#139D46] transition-all bg-white font-semibold text-gray-900"
                            >
                                <option value="available">🟢 Available</option>
                                <option value="coming_soon">⏳ Coming Soon</option>
                                <option value="pre_launch">🚀 Pre Launch</option>
                                <option value="sold_out">🔴 Sold Out</option>
                                <option value="inactive">⚪ Inactive / Hidden</option>
                            </select>
                        </div>
                    </div>
                </Section>

                {/* 3. Plot Sizes & Legal Approvals */}
                <Section title="3. Plot Sizes & Approvals" desc="Plot dimensions, MahaRERA and government certifications">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                Available Plot Sizes (sq.ft)
                            </label>
                            <div className="space-y-2">
                                {plotSizes.map((plot, index) => (
                                    <div key={index} className="flex gap-2 items-center">
                                        <input 
                                            type="text" 
                                            value={plot.sizeSqFt} 
                                            onChange={(e) => updatePlotSize(index, e.target.value)} 
                                            className="flex-1 px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#139D46] transition-all font-mono" 
                                            placeholder="e.g. 1200 or 1500" 
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => removePlotSize(index)} 
                                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                            title="Remove"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                <button 
                                    type="button" 
                                    onClick={addPlotSize} 
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#139D46] hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Add Plot Size</span>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-200">
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-xs font-bold text-emerald-950 uppercase tracking-wider">
                                        🛡️ MahaRERA Registration Number
                                    </label>
                                    <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                                        Primary Highlight
                                    </span>
                                </div>
                                <input 
                                    type="text" 
                                    name="reraNumber" 
                                    value={formData.reraNumber} 
                                    onChange={handleChange} 
                                    placeholder="e.g. P50500056182"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#139D46] font-mono font-bold text-gray-900" 
                                />
                                <p className="text-[11px] text-emerald-800 mt-1 font-medium">
                                    ⭐ Featured prominently as the main trust badge on project cards, hero banners, and listings.
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                    Display Priority Order
                                </label>
                                <input 
                                    type="number" 
                                    name="displayOrder" 
                                    value={formData.displayOrder} 
                                    onChange={handleChange} 
                                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#139D46] font-mono text-gray-900" 
                                />
                                <p className="text-[11px] text-gray-400 mt-1">Higher number shows higher on the list (1, 2, 3...)</p>
                            </div>

                            <div className="pt-2">
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                    Certifications & Flags
                                </label>
                                <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-gray-700">
                                    <label className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer">
                                        <input type="checkbox" name="nmrdaApproved" checked={formData.nmrdaApproved} onChange={handleChange} className="w-4 h-4 text-[#139D46] rounded focus:ring-[#139D46]" />
                                        <span>NMRDA Sanctioned</span>
                                    </label>
                                    <label className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer">
                                        <input type="checkbox" name="rlApproved" checked={formData.rlApproved} onChange={handleChange} className="w-4 h-4 text-[#139D46] rounded focus:ring-[#139D46]" />
                                        <span>RL Approved</span>
                                    </label>
                                    <label className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer">
                                        <input type="checkbox" name="titleClear" checked={formData.titleClear} onChange={handleChange} className="w-4 h-4 text-[#139D46] rounded focus:ring-[#139D46]" />
                                        <span>Clear Title</span>
                                    </label>
                                    <label className="flex items-center gap-2 p-2.5 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-50 text-amber-900 cursor-pointer">
                                        <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500" />
                                        <span>★ Feature on Home</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </Section>

                {/* 4. Amenities & Infrastructure */}
                <Section title="4. Amenities & Civil Development" desc="Features like Cement Roads, Water Line, Garden, Underground Electrification">
                    <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {amenities.map((item, index) => (
                                <div key={index} className="flex gap-2 items-center p-2 rounded-xl border border-gray-200 bg-gray-50/50">
                                    <input 
                                        type="text" 
                                        value={item.name} 
                                        onChange={(e) => updateAmenity(index, e.target.value)} 
                                        placeholder="e.g. 100% Cement Concrete Roads"
                                        className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#139D46]" 
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => removeAmenity(index)} 
                                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-md transition-colors cursor-pointer"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button 
                            type="button" 
                            onClick={addAmenity} 
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#139D46] hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Amenity / Feature</span>
                        </button>
                    </div>
                </Section>

                {/* 5. More Info / Key Highlights & Vicinity */}
                <Section title="5. Additional Details & Vicinity (More Info)" desc="Nearby anchors, schools, metros, highway connectivity, or bank finance details">
                    <div className="space-y-3">
                        <p className="text-xs text-gray-500 leading-relaxed">
                            These appear as distinct key highlight cards on the property page under <em>Vicinity & Connectivity</em>.
                        </p>

                        <div className="space-y-3">
                            {locationAdvantages.map((item, index) => (
                                <div key={index} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3.5 bg-gray-50/70 rounded-xl border border-gray-200">
                                    <div className="flex-1">
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                                            Highlight Title / Landmark
                                        </label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. Metro Station / Podar International School / Highway Frontage" 
                                            value={item.landmark} 
                                            onChange={(e) => updateLocationAdvantage(index, 'landmark', e.target.value)} 
                                            className="w-full px-3.5 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#139D46] transition-all"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                                            Value / Distance / Info
                                        </label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. 1.2 km / 500 meters / 150 ft Road Touch / 80% Finance" 
                                            value={item.distance} 
                                            onChange={(e) => updateLocationAdvantage(index, 'distance', e.target.value)} 
                                            className="w-full px-3.5 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#139D46] transition-all"
                                        />
                                    </div>
                                    <div className="sm:self-end pb-0.5">
                                        <button 
                                            type="button" 
                                            onClick={() => removeLocationAdvantage(index)} 
                                            className="w-full sm:w-auto px-3 py-2 rounded-lg text-xs font-semibold text-red-600 hover:text-white bg-red-50 hover:bg-red-600 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                                            title="Remove"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            <span className="sm:hidden">Delete</span>
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {locationAdvantages.length === 0 && (
                                <div className="p-6 text-center bg-gray-50/50 rounded-xl border border-dashed border-gray-300">
                                    <p className="text-xs text-gray-500 mb-2">No additional highlights or distances added yet.</p>
                                    <button 
                                        type="button" 
                                        onClick={addLocationAdvantage} 
                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-50 text-[#139D46] hover:bg-[#139D46] hover:text-white text-xs font-bold transition-colors cursor-pointer"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Add First Highlight / Landmark</span>
                                    </button>
                                </div>
                            )}

                            {locationAdvantages.length > 0 && (
                                <button 
                                    type="button" 
                                    onClick={addLocationAdvantage} 
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#139D46] hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Add More Info / Distance Anchor</span>
                                </button>
                            )}
                        </div>
                    </div>
                </Section>

                {/* 6. Media & Photos */}
                <Section title="6. Photos & Gallery" desc="Main project cover photo and additional image gallery showcase">
                    <div className="space-y-7">
                        {/* Cover Image */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Main Cover Photo *
                                </label>
                                {(coverImageBase64 || coverImage) && (
                                    <button 
                                        type="button" 
                                        onClick={handleAdjustCover}
                                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-[#139D46] rounded-lg text-xs font-bold transition-all cursor-pointer border border-emerald-200"
                                    >
                                        <Crop className="w-3.5 h-3.5" />
                                        <span>Crop & Frame Cover</span>
                                    </button>
                                )}
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-4">
                                {(coverImageBase64 || coverImage) ? (
                                    <div className="relative group rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50">
                                        <img 
                                            src={coverImageBase64 || coverImage?.url} 
                                            alt="Cover" 
                                            className="h-32 w-52 object-cover" 
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <button 
                                                type="button"
                                                onClick={handleAdjustCover}
                                                className="px-2.5 py-1.5 bg-white/95 text-gray-900 rounded-lg text-[11px] font-bold shadow-md hover:bg-white flex items-center gap-1 cursor-pointer transition-transform transform hover:scale-105"
                                            >
                                                <Crop className="w-3.5 h-3.5 text-[#139D46]" />
                                                <span>Crop</span>
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    setCoverImage(null);
                                                    setCoverImageBase64(null);
                                                }} 
                                                className="px-2.5 py-1.5 bg-red-600/95 text-white rounded-lg text-[11px] font-bold shadow-md hover:bg-red-600 flex items-center gap-1 cursor-pointer transition-transform transform hover:scale-105"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                <span>Remove</span>
                                            </button>
                                        </div>
                                    </div>
                                ) : null}

                                <div className="space-y-2">
                                    <input 
                                        type="file" 
                                        ref={coverFileInputRef}
                                        accept="image/*" 
                                        onChange={handleCoverFileInput}
                                        className="text-xs text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-[#139D46] hover:file:bg-emerald-100 cursor-pointer"
                                    />
                                    {isOptimizingImage && (
                                        <span className="block text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full font-medium animate-pulse">
                                            ⚡ Processing & optimizing image...
                                        </span>
                                    )}
                                    <p className="text-[11px] text-gray-400">
                                        Recommended 16:9 ratio. Click &apos;Crop &amp; Frame&apos; to adjust zoom, positioning, and mobile crop.
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Gallery Images (Slider & Detail Page Showcase) */}
                        <div className="border-t border-gray-100 pt-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Additional Gallery Images
                                        </label>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                            {galleryImages.length + galleryImagesBase64.length} Added
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-gray-500 mt-0.5">
                                        These photos appear immediately below the hero header on the property page for visitors to explore.
                                    </p>
                                </div>

                                {/* Upload Action Buttons */}
                                <div className="flex flex-wrap items-center gap-2">
                                    <input 
                                        type="file" 
                                        ref={galleryMultiFileInputRef}
                                        accept="image/*" 
                                        multiple 
                                        onChange={handleGalleryFileInput}
                                        className="hidden" 
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => galleryMultiFileInputRef.current?.click()}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#139D46] hover:bg-[#0f823a] text-white rounded-xl text-xs font-bold shadow-sm hover:shadow transition-all cursor-pointer"
                                    >
                                        <Plus className="w-4 h-4 stroke-[2.5]" />
                                        <span>Add More Images</span>
                                    </button>

                                    <input 
                                        type="file" 
                                        ref={galleryCropFileInputRef}
                                        accept="image/*" 
                                        onChange={handleGalleryCropFileInput}
                                        className="hidden" 
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => galleryCropFileInputRef.current?.click()}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-[#139D46] border border-emerald-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                                        title="Pick a photo and crop/frame it before adding"
                                    >
                                        <Crop className="w-3.5 h-3.5" />
                                        <span>Add with Crop</span>
                                    </button>
                                </div>
                            </div>

                            {/* Gallery Image Grid */}
                            {galleryImages.length === 0 && galleryImagesBase64.length === 0 ? (
                                <div 
                                    onClick={() => galleryMultiFileInputRef.current?.click()}
                                    className="p-8 text-center bg-gray-50/70 hover:bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 hover:border-emerald-400 transition-colors cursor-pointer group"
                                >
                                    <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 group-hover:bg-emerald-100 text-[#139D46] flex items-center justify-center mb-3 transition-colors">
                                        <Camera className="w-6 h-6" />
                                    </div>
                                    <p className="text-xs font-bold text-gray-700 mb-1">
                                        No additional gallery photos added yet
                                    </p>
                                    <p className="text-[11px] text-gray-400 max-w-sm mx-auto mb-3">
                                        Click here or click &quot;+ Add More Images&quot; to upload multiple site layout, elevation, and ground photos at once.
                                    </p>
                                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#139D46]">
                                        <Upload className="w-3.5 h-3.5" />
                                        <span>Select Images from Computer</span>
                                    </span>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
                                    {galleryImages.map((img, index) => (
                                        <div key={`old-${index}`} className="group relative rounded-xl overflow-hidden border border-gray-200 bg-gray-100 shadow-2xs aspect-[4/3]">
                                            <img 
                                                src={img.url} 
                                                alt={`Gallery ${index}`} 
                                                className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                                            />
                                            {/* Action bar over image */}
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-sm bg-black/60 text-white">
                                                        #{index + 1}
                                                    </span>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => handleRemoveGalleryImage(index)} 
                                                        className="p-1 bg-red-600 hover:bg-red-700 text-white rounded-md shadow-xs transition-colors cursor-pointer"
                                                        title="Delete image"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                                <button 
                                                    type="button" 
                                                    onClick={() => handleCropGalleryThumb(img.url, { type: 'existingGallery', index })}
                                                    className="w-full py-1 px-2 bg-white/95 hover:bg-white text-gray-900 rounded-lg text-[10px] font-bold shadow-xs flex items-center justify-center gap-1 cursor-pointer transition-transform transform active:scale-95"
                                                >
                                                    <Crop className="w-3 h-3 text-[#139D46]" />
                                                    <span>Crop / Frame</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    {galleryImagesBase64.map((base64, index) => (
                                        <div key={`new-${index}`} className="group relative rounded-xl overflow-hidden border-2 border-emerald-400 bg-emerald-50 shadow-2xs aspect-[4/3]">
                                            <img 
                                                src={base64} 
                                                alt={`New Gallery ${index}`} 
                                                className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                                            />
                                            {/* Tag */}
                                            <span className="absolute top-1.5 left-1.5 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-emerald-600 text-white shadow-xs">
                                                New
                                            </span>
                                            {/* Action bar over image */}
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                                                <div className="flex justify-end">
                                                    <button 
                                                        type="button" 
                                                        onClick={() => handleRemoveNewGalleryImage(index)} 
                                                        className="p-1 bg-red-600 hover:bg-red-700 text-white rounded-md shadow-xs transition-colors cursor-pointer"
                                                        title="Delete image"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                                <button 
                                                    type="button" 
                                                    onClick={() => handleCropGalleryThumb(base64, { type: 'newGallery', index })}
                                                    className="w-full py-1 px-2 bg-white/95 hover:bg-white text-gray-900 rounded-lg text-[10px] font-bold shadow-xs flex items-center justify-center gap-1 cursor-pointer transition-transform transform active:scale-95"
                                                >
                                                    <Crop className="w-3 h-3 text-[#139D46]" />
                                                    <span>Crop / Frame</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Quick "+ Add More" tile inside the grid */}
                                    <button 
                                        type="button"
                                        onClick={() => galleryMultiFileInputRef.current?.click()}
                                        className="rounded-xl border-2 border-dashed border-gray-300 hover:border-emerald-400 bg-gray-50/70 hover:bg-emerald-50/50 flex flex-col items-center justify-center gap-1.5 text-gray-500 hover:text-[#139D46] transition-all aspect-[4/3] cursor-pointer"
                                    >
                                        <Plus className="w-5 h-5" />
                                        <span className="text-[11px] font-bold">+ Add More</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </Section>

                {/* Bottom Action Buttons */}
                <div className="flex flex-wrap items-center justify-end gap-3 mt-8 border-t border-gray-200 pt-6">
                    <button 
                        type="button" 
                        onClick={() => router.back()} 
                        className="px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button 
                        type="button" 
                        onClick={(e) => handleSubmit(e, false)} 
                        disabled={isSaving || isOptimizingImage} 
                        className="px-5 py-2.5 rounded-xl border border-[#139D46] text-sm font-bold text-[#139D46] hover:bg-emerald-50 transition-colors disabled:opacity-60 cursor-pointer"
                    >
                        {isSaving ? 'Saving...' : 'Save as Draft'}
                    </button>
                    <button 
                        type="button" 
                        onClick={(e) => handleSubmit(e, true)} 
                        disabled={isSaving || isOptimizingImage} 
                        className="px-6 py-2.5 rounded-xl bg-[#139D46] hover:bg-[#0f823a] text-sm font-bold text-white shadow-sm hover:shadow transition-all disabled:opacity-60 cursor-pointer"
                    >
                        {isSaving ? 'Saving & Publishing...' : '✓ Publish to Live Website'}
                    </button>
                </div>

                {/* Interactive Crop & Framing Modal */}
                {cropModal?.isOpen && (
                    <ImageCropModal 
                        imageSrc={cropModal.imageSrc} 
                        initialMode={cropModal.initialMode || 'desktop'} 
                        allowModeSwitch={true} 
                        onSave={handleCropSave} 
                        onClose={() => setCropModal(null)} 
                    />
                )}
            </form>
        </>
    );
}
