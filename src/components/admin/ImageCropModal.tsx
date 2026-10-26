'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { 
    ZoomIn, ZoomOut, RotateCcw, Move, Check, X, Crop, 
    AlignCenter, ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
    Monitor, Smartphone, Sparkles, Upload, RefreshCw
} from 'lucide-react';

interface ImageCropModalProps {
    imageSrc: string;
    initialMode?: 'desktop' | 'mobile';
    allowModeSwitch?: boolean;
    onSave: (croppedBase64: string, mode: 'desktop' | 'mobile') => void;
    onClose: () => void;
}

export default function ImageCropModal({
    imageSrc,
    initialMode = 'desktop',
    allowModeSwitch = true,
    onSave,
    onClose,
}: ImageCropModalProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [mode, setMode] = useState<'desktop' | 'mobile'>(initialMode);
    
    // Active image source allows replacing with a different image in mobile mode
    const [activeImageSrc, setActiveImageSrc] = useState(imageSrc);
    const [isCustomImage, setIsCustomImage] = useState(false);

    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [cropBoxDim, setCropBoxDim] = useState({ width: 560, height: 315 });
    const [stepNotice, setStepNotice] = useState<string | null>(null);

    // Sync if initial imageSrc changes
    useEffect(() => {
        setActiveImageSrc(imageSrc);
        setIsCustomImage(false);
    }, [imageSrc]);

    // Load Image
    useEffect(() => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = activeImageSrc;
        img.onload = () => {
            setImage(img);
            setZoom(1);
            setPan({ x: 0, y: 0 });
        };
    }, [activeImageSrc]);

    // Compute Crop Box Dimensions based on Mode (Aspect Ratio) and container
    useEffect(() => {
        const updateBox = () => {
            if (!containerRef.current) return;
            const ratio = mode === 'desktop' ? (16 / 9) : (9 / 16);
            const maxWidth = Math.min(containerRef.current.clientWidth - 32, mode === 'desktop' ? 620 : 320);
            const maxHeight = Math.min(window.innerHeight * 0.48, 400);

            let w = maxWidth;
            let h = w / ratio;

            if (h > maxHeight) {
                h = maxHeight;
                w = h * ratio;
            }

            setCropBoxDim({ width: Math.round(w), height: Math.round(h) });
        };

        updateBox();
        window.addEventListener('resize', updateBox);
        return () => window.removeEventListener('resize', updateBox);
    }, [mode]);

    // Pan clamping helper
    const getClampedPan = useCallback((currentPan: { x: number, y: number }, currentZoom: number, boxWidth = cropBoxDim.width, boxHeight = cropBoxDim.height) => {
        if (!image) return currentPan;

        const baseScale = Math.max(boxWidth / image.naturalWidth, boxHeight / image.naturalHeight);
        const renderedWidth = image.naturalWidth * baseScale * currentZoom;
        const renderedHeight = image.naturalHeight * baseScale * currentZoom;

        const maxPanX = Math.max(0, (renderedWidth - boxWidth) / 2);
        const maxPanY = Math.max(0, (renderedHeight - boxHeight) / 2);

        return {
            x: Math.max(-maxPanX, Math.min(maxPanX, currentPan.x)),
            y: Math.max(-maxPanY, Math.min(maxPanY, currentPan.y)),
        };
    }, [image, cropBoxDim]);

    // Switch between desktop & mobile modes
    const handleSwitchMode = (newMode: 'desktop' | 'mobile') => {
        if (newMode === mode) return;
        setMode(newMode);
        setZoom(1);
        setPan({ x: 0, y: 0 });
        if (newMode === 'desktop') {
            setActiveImageSrc(imageSrc);
            setIsCustomImage(false);
            setStepNotice(null);
        }
    };

    // User chooses a different image (e.g. specially designed vertical graphic for mobile)
    const handleDifferentImageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const rawUrl = reader.result as string;
            setActiveImageSrc(rawUrl);
            setIsCustomImage(true);
            setStepNotice('Different image loaded for mobile! Adjust framing and click Apply.');
            setZoom(1);
            setPan({ x: 0, y: 0 });
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const handleRevertToOriginal = () => {
        setActiveImageSrc(imageSrc);
        setIsCustomImage(false);
        setStepNotice('Reverted back to desktop image. Adjust framing or add a different image.');
        setZoom(1);
        setPan({ x: 0, y: 0 });
    };

    // Mouse & Touch Drag Handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        const rawPan = {
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y,
        };
        setPan(getClampedPan(rawPan, zoom));
    };

    const handleMouseUp = () => setIsDragging(false);

    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length !== 1) return;
        setIsDragging(true);
        setDragStart({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y });
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging || e.touches.length !== 1) return;
        const rawPan = {
            x: e.touches[0].clientX - dragStart.x,
            y: e.touches[0].clientY - dragStart.y,
        };
        setPan(getClampedPan(rawPan, zoom));
    };

    const handleTouchEnd = () => setIsDragging(false);

    // Zoom Handlers
    const handleZoomChange = (newZoom: number) => {
        const clampedZoom = Math.max(1, Math.min(2.5, newZoom));
        setZoom(clampedZoom);
        setPan(prev => getClampedPan(prev, clampedZoom));
    };

    // Quick Presets
    const alignTop = () => {
        if (!image) return;
        const baseScale = Math.max(cropBoxDim.width / image.naturalWidth, cropBoxDim.height / image.naturalHeight);
        const renderedHeight = image.naturalHeight * baseScale * zoom;
        const maxPanY = Math.max(0, (renderedHeight - cropBoxDim.height) / 2);
        setPan(prev => ({ ...prev, y: maxPanY }));
    };

    const alignCenter = () => {
        setPan({ x: 0, y: 0 });
    };

    const alignBottom = () => {
        if (!image) return;
        const baseScale = Math.max(cropBoxDim.width / image.naturalWidth, cropBoxDim.height / image.naturalHeight);
        const renderedHeight = image.naturalHeight * baseScale * zoom;
        const maxPanY = Math.max(0, (renderedHeight - cropBoxDim.height) / 2);
        setPan(prev => ({ ...prev, y: -maxPanY }));
    };

    const alignLeft = () => {
        if (!image) return;
        const baseScale = Math.max(cropBoxDim.width / image.naturalWidth, cropBoxDim.height / image.naturalHeight);
        const renderedWidth = image.naturalWidth * baseScale * zoom;
        const maxPanX = Math.max(0, (renderedWidth - cropBoxDim.width) / 2);
        setPan(prev => ({ ...prev, x: maxPanX }));
    };

    const alignRight = () => {
        if (!image) return;
        const baseScale = Math.max(cropBoxDim.width / image.naturalWidth, cropBoxDim.height / image.naturalHeight);
        const renderedWidth = image.naturalWidth * baseScale * zoom;
        const maxPanX = Math.max(0, (renderedWidth - cropBoxDim.width) / 2);
        setPan(prev => ({ ...prev, x: -maxPanX }));
    };

    const resetTransform = () => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    };

    // Canvas Image Exporter
    const exportCropped = (targetMode: 'desktop' | 'mobile') => {
        if (!image) return null;

        const targetWidth = targetMode === 'desktop' ? 1920 : 1080;
        const targetHeight = targetMode === 'desktop' ? 1080 : 1920;

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        const baseScale = Math.max(cropBoxDim.width / image.naturalWidth, cropBoxDim.height / image.naturalHeight);
        const renderedWidth = image.naturalWidth * baseScale * zoom;
        const renderedHeight = image.naturalHeight * baseScale * zoom;

        const clampedPan = getClampedPan(pan, zoom);

        const targetScale = targetWidth / cropBoxDim.width;
        const finalWidth = renderedWidth * targetScale;
        const finalHeight = renderedHeight * targetScale;

        const finalX = (targetWidth - finalWidth) / 2 + (clampedPan.x * targetScale);
        const finalY = (targetHeight - finalHeight) / 2 + (clampedPan.y * targetScale);

        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, targetWidth, targetHeight);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(image, finalX, finalY, finalWidth, finalHeight);

        return canvas.toDataURL('image/jpeg', 0.88);
    };

    // Save single crop
    const handleSaveCurrent = () => {
        const cropped = exportCropped(mode);
        if (!cropped) return;
        onSave(cropped, mode);
        onClose();
    };

    // Save desktop crop and immediately switch to mobile crop mode
    const handleSaveDesktopAndNext = () => {
        const croppedDesktop = exportCropped('desktop');
        if (!croppedDesktop) return;
        onSave(croppedDesktop, 'desktop');

        // Switch to mobile mode
        setMode('mobile');
        setZoom(1);
        setPan({ x: 0, y: 0 });
        setStepNotice('Desktop banner applied! Adjust framing below, or add a different image for mobile.');
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div 
                className="relative w-full max-w-2xl bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-gray-100 flex flex-col max-h-[94vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header with Aspect Ratio Switcher */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 sm:pb-4 border-b border-gray-100 gap-3">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            mode === 'desktop' ? 'bg-emerald-50 text-[#139D46]' : 'bg-purple-50 text-purple-700'
                        }`}>
                            <Crop className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-gray-900">
                                Adjust Image to Frame
                            </h3>
                            <p className="text-xs text-gray-500 font-mono">
                                {mode === 'desktop' ? '📐 16:9 Widescreen (1920 × 1080 px)' : '📱 9:16 Mobile Portrait (1080 × 1920 px)'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                        {allowModeSwitch && (
                            <div className="flex items-center bg-gray-100/90 p-1 rounded-xl border border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => handleSwitchMode('desktop')}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                        mode === 'desktop' 
                                            ? 'bg-white text-emerald-800 shadow-xs' 
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    <Monitor className="w-3.5 h-3.5" />
                                    <span>Desktop (16:9)</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleSwitchMode('mobile')}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                        mode === 'mobile' 
                                            ? 'bg-white text-purple-800 shadow-xs' 
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    <Smartphone className="w-3.5 h-3.5" />
                                    <span>Mobile (9:16)</span>
                                </button>
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer ml-auto sm:ml-0"
                            title="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Banner Notice when in Mobile Mode */}
                {mode === 'mobile' && (
                    <div className="mt-3 px-3.5 py-2.5 bg-gradient-to-r from-purple-50 to-indigo-50/70 border border-purple-200/90 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs text-purple-950 animate-in fade-in duration-200">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                            <span className="font-medium">
                                {stepNotice || 'Adjust framing for Mobile (9:16), or add a different image for mobile.'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                            {isCustomImage && (
                                <button
                                    type="button"
                                    onClick={handleRevertToOriginal}
                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-600 hover:text-gray-900 underline cursor-pointer mr-1"
                                    title="Revert back to desktop photo"
                                >
                                    <RefreshCw className="w-3 h-3" />
                                    <span>Use Desktop Photo</span>
                                </button>
                            )}
                            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-purple-100 border border-purple-300 text-purple-900 text-xs font-bold rounded-xl cursor-pointer transition-all shadow-xs">
                                <Upload className="w-3.5 h-3.5 text-purple-700" />
                                <span>Add Different Image</span>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleDifferentImageInput} 
                                    className="hidden" 
                                />
                            </label>
                        </div>
                    </div>
                )}

                {/* Step Notice Banner if in desktop */}
                {mode === 'desktop' && stepNotice && (
                    <div className="mt-3 px-3.5 py-2 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-800 animate-in fade-in duration-200">
                        <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{stepNotice}</span>
                    </div>
                )}

                {/* Crop & Viewport Area */}
                <div 
                    ref={containerRef}
                    className="flex-1 py-4 sm:py-5 flex items-center justify-center bg-gray-950 rounded-2xl my-3 sm:my-4 overflow-hidden relative select-none min-h-[260px]"
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    {/* The Visual Crop Box */}
                    <div 
                        style={{ width: `${cropBoxDim.width}px`, height: `${cropBoxDim.height}px` }}
                        className={`relative overflow-hidden shadow-[0_0_0_9999px_rgba(0,0,0,0.68)] ${
                            mode === 'mobile' ? 'rounded-2xl border-2 border-purple-500' : 'rounded-xl border-2 border-[#139D46]'
                        } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                        onMouseDown={handleMouseDown}
                        onTouchStart={handleTouchStart}
                    >
                        {/* Rendered Image with Pan & Zoom */}
                        {image && (
                            <img
                                src={activeImageSrc}
                                alt="Crop Preview"
                                draggable={false}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                                    transformOrigin: 'center center',
                                    transition: isDragging ? 'none' : 'transform 0.05s ease-out',
                                }}
                                className="pointer-events-none select-none max-w-none"
                            />
                        )}

                        {/* Rule of Thirds Grid Overlay */}
                        <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-25">
                            <div className="border-r border-b border-white" />
                            <div className="border-r border-b border-white" />
                            <div className="border-b border-white" />
                            <div className="border-r border-b border-white" />
                            <div className="border-r border-b border-white" />
                            <div className="border-b border-white" />
                            <div className="border-r border-white" />
                            <div className="border-r border-white" />
                            <div />
                        </div>

                        {/* Frame Badge */}
                        <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded pointer-events-none flex items-center gap-1">
                            {mode === 'desktop' ? '🖥️ 16:9' : '📱 9:16'}
                            {isCustomImage && <span className="text-purple-300 font-bold">• Custom Mobile</span>}
                        </div>

                        {/* Hint Badge */}
                        <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded flex items-center gap-1 font-medium pointer-events-none">
                            <Move className="w-3 h-3" />
                            <span>Drag to reposition</span>
                        </div>
                    </div>
                </div>

                {/* Controls Bar */}
                <div className="space-y-3 pt-1">
                    {/* Zoom Slider & Alignment */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                        {/* Zoom control */}
                        <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
                            <ZoomOut className="w-4 h-4 text-gray-500 shrink-0" />
                            <input
                                type="range"
                                min="1"
                                max="2.5"
                                step="0.02"
                                value={zoom}
                                onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                                className={`w-full cursor-pointer h-2 bg-gray-200 rounded-lg ${
                                    mode === 'desktop' ? 'accent-[#139D46]' : 'accent-purple-600'
                                }`}
                            />
                            <ZoomIn className="w-4 h-4 text-gray-500 shrink-0" />
                            <span className="text-xs font-mono font-bold text-gray-700 w-11 text-right">
                                {Math.round(zoom * 100)}%
                            </span>
                        </div>

                        {/* Quick Presets */}
                        <div className="flex items-center gap-1 self-end sm:self-center">
                            <span className="text-[11px] text-gray-500 mr-1 hidden sm:inline">Align:</span>
                            <button
                                type="button"
                                onClick={alignLeft}
                                className="p-1.5 sm:px-2 text-xs font-bold text-gray-700 hover:text-gray-900 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-all cursor-pointer flex items-center gap-1"
                                title="Align to Left"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Left</span>
                            </button>
                            <button
                                type="button"
                                onClick={alignTop}
                                className="p-1.5 sm:px-2 text-xs font-bold text-gray-700 hover:text-gray-900 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-all cursor-pointer flex items-center gap-1"
                                title="Align to Top"
                            >
                                <ArrowUp className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Top</span>
                            </button>
                            <button
                                type="button"
                                onClick={alignCenter}
                                className="p-1.5 sm:px-2 text-xs font-bold text-gray-700 hover:text-gray-900 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-all cursor-pointer flex items-center gap-1"
                                title="Align to Center"
                            >
                                <AlignCenter className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Center</span>
                            </button>
                            <button
                                type="button"
                                onClick={alignBottom}
                                className="p-1.5 sm:px-2 text-xs font-bold text-gray-700 hover:text-gray-900 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-all cursor-pointer flex items-center gap-1"
                                title="Align to Bottom"
                            >
                                <ArrowDown className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Bottom</span>
                            </button>
                            <button
                                type="button"
                                onClick={alignRight}
                                className="p-1.5 sm:px-2 text-xs font-bold text-gray-700 hover:text-gray-900 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-all cursor-pointer flex items-center gap-1"
                                title="Align to Right"
                            >
                                <ArrowRight className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Right</span>
                            </button>
                            <button
                                type="button"
                                onClick={resetTransform}
                                className="p-1.5 text-xs font-bold text-gray-500 hover:text-red-600 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-all cursor-pointer ml-1"
                                title="Reset Position and Zoom"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl border border-gray-300 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer mr-auto"
                        >
                            Cancel
                        </button>

                        {mode === 'desktop' ? (
                            <>
                                <button
                                    type="button"
                                    onClick={handleSaveCurrent}
                                    className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                                >
                                    <Check className="w-4 h-4 text-emerald-600" />
                                    <span>Apply Desktop (16:9)</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSaveDesktopAndNext}
                                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-[#139D46] hover:from-emerald-700 hover:to-[#0f823a] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                                >
                                    <Smartphone className="w-4 h-4" />
                                    <span>Save & Crop for Mobile (9:16) →</span>
                                </button>
                            </>
                        ) : (
                            <>
                                {/* Add Different Image Button for Mobile */}
                                <label className="px-3.5 py-2 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs sm:text-sm font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs">
                                    <Upload className="w-3.5 h-3.5 text-purple-700" />
                                    <span>Add Different Image</span>
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={handleDifferentImageInput} 
                                        className="hidden" 
                                    />
                                </label>

                                {allowModeSwitch && (
                                    <button
                                        type="button"
                                        onClick={() => handleSwitchMode('desktop')}
                                        className="px-3.5 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs sm:text-sm font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                                    >
                                        <Monitor className="w-3.5 h-3.5" />
                                        <span>Back to Desktop</span>
                                    </button>
                                )}

                                <button
                                    type="button"
                                    onClick={handleSaveCurrent}
                                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                                >
                                    <Check className="w-4 h-4 stroke-[2.5]" />
                                    <span>Apply Mobile Crop (9:16)</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
