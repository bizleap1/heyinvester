'use client';

import { useState, useEffect } from "react";
import { getSiteSettings, updateSettings } from "@/actions/settings";
import { 
    Phone, 
    MapPin, 
    ShieldCheck, 
    Share2, 
    Save, 
    CheckCircle2, 
    AlertCircle,
    Sparkles,
    Timer
} from "lucide-react";

export default function SettingsPage() {
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState({ text: '', type: '' });
    
    const [formData, setFormData] = useState({
        phone: '',
        whatsapp: '',
        email: '',
        address: '',
        mahaReraNumber: '',
        instagramUrl: '',
        facebookUrl: '',
        youtubeUrl: '',
        linkedinUrl: '',
        heroSliderInterval: 2500
    });

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const data = await getSiteSettings();
                setFormData(data);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        loadSettings();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage({ text: 'Saving changes...', type: 'info' });
        
        try {
            await updateSettings(formData);
            setMessage({ text: '✓ All website settings saved successfully!', type: 'success' });
            setTimeout(() => setMessage({ text: '', type: '' }), 4000);
        } catch (err: any) {
            setMessage({ text: err.message || 'Failed to save settings. Please try again.', type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="p-12 text-center text-gray-500 text-sm">
                Loading settings...
            </div>
        );
    }

    return (
        <div className="max-w-4xl space-y-6 pb-12">
            <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Website Settings
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                    Manage global contact information, WhatsApp enquiry number, office address, and MahaRERA details.
                </p>
            </div>

            {message.text && (
                <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium transition-all ${
                    message.type === 'error' 
                        ? 'bg-red-50 text-red-800 border border-red-200' 
                        : message.type === 'success' 
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs' 
                        : 'bg-blue-50 text-blue-800 border border-blue-200'
                }`}>
                    {message.type === 'success' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    ) : message.type === 'error' ? (
                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                    ) : (
                        <Sparkles className="w-5 h-5 text-blue-600 shrink-0" />
                    )}
                    <span>{message.text}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* 1. Contact Information */}
                <div className="bg-white p-6 sm:p-7 rounded-2xl border border-gray-200/80 shadow-2xs">
                    <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-gray-100">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#139D46] flex items-center justify-center">
                            <Phone className="w-4 h-4" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-gray-900">1. Contact & WhatsApp Numbers</h2>
                            <p className="text-xs text-gray-500">Channels through which visitors contact your team</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                WhatsApp Enquiry Number
                            </label>
                            <input 
                                type="text" 
                                name="whatsapp" 
                                value={formData.whatsapp} 
                                onChange={handleChange} 
                                placeholder="+91 93256 50256" 
                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#139D46] transition-all font-medium text-gray-900" 
                            />
                            <p className="text-[11px] text-emerald-600 mt-1">
                                ✓ All WhatsApp buttons across the website will start chat with this number.
                            </p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                Calling Phone Number
                            </label>
                            <input 
                                type="text" 
                                name="phone" 
                                value={formData.phone} 
                                onChange={handleChange} 
                                placeholder="+91 93256 50256" 
                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#139D46] transition-all font-medium text-gray-900" 
                            />
                            <p className="text-[11px] text-gray-500 mt-1">
                                Displayed in header and footer for direct phone calls.
                            </p>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                Official Email Address
                            </label>
                            <input 
                                type="email" 
                                name="email" 
                                value={formData.email} 
                                onChange={handleChange} 
                                placeholder="info@heyinvestor.in" 
                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#139D46] transition-all font-medium text-gray-900" 
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Business Address */}
                <div className="bg-white p-6 sm:p-7 rounded-2xl border border-gray-200/80 shadow-2xs">
                    <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-gray-100">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                            <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-gray-900">2. Office Address</h2>
                            <p className="text-xs text-gray-500">Displayed in the footer and Contact page</p>
                        </div>
                    </div>

                    <div>
                        <textarea 
                            name="address" 
                            rows={3} 
                            value={formData.address} 
                            onChange={handleChange} 
                            placeholder="103 Ghatate Building, WHC Road, Nr. Law College Sq., Nagpur"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#139D46] transition-all font-medium text-gray-900" 
                        />
                    </div>
                </div>

                {/* 3. Regulatory Information */}
                <div className="bg-white p-6 sm:p-7 rounded-2xl border border-gray-200/80 shadow-2xs">
                    <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-gray-100">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                            <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-gray-900">3. MahaRERA Registration</h2>
                            <p className="text-xs text-gray-500">Government compliance registration code</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                            MahaRERA Registration Number
                        </label>
                        <input 
                            type="text" 
                            name="mahaReraNumber" 
                            value={formData.mahaReraNumber} 
                            onChange={handleChange} 
                            placeholder="A50500037507" 
                            className="w-full max-w-md px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#139D46] transition-all font-mono font-bold text-gray-900" 
                        />
                        <p className="text-[11px] text-gray-500 mt-1">
                            Shown in the header QR code popup and footer compliance disclosures.
                        </p>
                    </div>
                </div>

                {/* 4. Social Media Links */}
                <div className="bg-white p-6 sm:p-7 rounded-2xl border border-gray-200/80 shadow-2xs">
                    <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-gray-100">
                        <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                            <Share2 className="w-4 h-4" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-gray-900">4. Social Media Links</h2>
                            <p className="text-xs text-gray-500">Footer social media profile links</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Instagram URL</label>
                            <input type="url" name="instagramUrl" value={formData.instagramUrl} onChange={handleChange} placeholder="https://instagram.com/heyinvestor" className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#139D46] transition-all" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Facebook URL</label>
                            <input type="url" name="facebookUrl" value={formData.facebookUrl} onChange={handleChange} placeholder="https://facebook.com/heyinvestor" className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#139D46] transition-all" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">YouTube URL</label>
                            <input type="url" name="youtubeUrl" value={formData.youtubeUrl} onChange={handleChange} placeholder="https://youtube.com/..." className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#139D46] transition-all" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">LinkedIn URL</label>
                            <input type="url" name="linkedinUrl" value={formData.linkedinUrl} onChange={handleChange} placeholder="https://linkedin.com/..." className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#139D46] transition-all" />
                        </div>
                    </div>
                </div>

                {/* 5. Hero Slider Settings */}
                <div className="bg-white p-6 sm:p-7 rounded-2xl border border-gray-200/80 shadow-2xs">
                    <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-gray-100">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#139D46] flex items-center justify-center">
                            <Timer className="w-4 h-4" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-gray-900">5. Homepage Hero Slider Speed</h2>
                            <p className="text-xs text-gray-500">Configure autoplay rotation interval for homepage banners</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                Slide Rotation Interval (Seconds)
                            </label>
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="relative w-40">
                                    <input 
                                        type="number" 
                                        name="heroSliderInterval" 
                                        min="0.5"
                                        max="60"
                                        step="0.1"
                                        value={((formData.heroSliderInterval || 2500) / 1000).toFixed(1)} 
                                        onChange={(e) => {
                                            const val = parseFloat(e.target.value);
                                            if (!isNaN(val)) {
                                                setFormData(prev => ({ ...prev, heroSliderInterval: Math.round(val * 1000) }));
                                            }
                                        }} 
                                        className="w-full pl-3.5 pr-12 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#139D46] transition-all font-mono font-bold text-gray-900 text-right" 
                                    />
                                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 pointer-events-none">
                                        sec
                                    </span>
                                </div>

                                {/* Preset chips */}
                                <div className="flex flex-wrap items-center gap-2">
                                    {[
                                        { label: '1.5s', ms: 1500 },
                                        { label: '2.0s', ms: 2000 },
                                        { label: '2.5s (Default)', ms: 2500 },
                                        { label: '3.0s', ms: 3000 },
                                        { label: '4.0s', ms: 4000 },
                                        { label: '5.0s', ms: 5000 },
                                    ].map((preset) => (
                                        <button
                                            key={preset.ms}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, heroSliderInterval: preset.ms }))}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                                                formData.heroSliderInterval === preset.ms
                                                    ? 'bg-emerald-50 text-[#139D46] border-[#139D46]'
                                                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                                            }`}
                                        >
                                            {preset.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <p className="text-[11px] text-gray-500 mt-2">
                                Currently set to <span className="font-bold text-[#139D46]">{((formData.heroSliderInterval || 2500) / 1000).toFixed(1)} seconds</span> ({formData.heroSliderInterval || 2500} ms). The hero slider automatically advances to the next banner after this interval.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Submit Save Button */}
                <div className="flex items-center justify-end gap-3 pt-2">
                    <button 
                        type="submit" 
                        disabled={isSaving} 
                        className="inline-flex items-center gap-2 bg-[#139D46] hover:bg-[#0f823a] text-white px-8 py-3 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-60 cursor-pointer"
                    >
                        <Save className="w-4 h-4" />
                        <span>{isSaving ? 'Saving Changes...' : 'Save Settings'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
