'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
} from '@/components/ui/icons';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Camera,
  X,
  Images,
} from 'lucide-react';
import { Project } from '@/types';
import SiteVisitModal from '@/components/forms/SiteVisitModal';
import { useSiteSettings } from '@/components/layout/SiteSettingsProvider';

interface ProjectDetailClientProps {
  project: Project;
}

export default function ProjectDetailClient({ project }: ProjectDetailClientProps) {
  const [siteVisitOpen, setSiteVisitOpen] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const settings = useSiteSettings();

  // Combine cover image and all uploaded gallery images into one unified list
  const allPhotos: string[] = Array.from(
    new Set([project.image, ...(project.gallery || [])].filter(Boolean) as string[])
  );

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowRight') setLightboxIndex((prev) => (prev + 1) % allPhotos.length);
      if (e.key === 'ArrowLeft') setLightboxIndex((prev) => (prev - 1 + allPhotos.length) % allPhotos.length);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, allPhotos.length]);

  return (
    <div className="bg-[#FAF8F5] text-[#141414]">
      {/* 01 Hero Header */}
      <section className="relative min-h-[70vh] lg:min-h-[85vh] w-full flex flex-col justify-between pt-32 pb-12 overflow-hidden bg-[#141414] text-[#FAF8F5]">
        {/* Real project imagery */}
        <div className="absolute inset-0 z-0">
          <Image
            src={project.image}
            alt={project.name}
            fill
            priority
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/60 to-[#141414]/80" />
        </div>

        {/* Top Breadcrumb Nav */}
        <div className="relative z-10 max-w-[1520px] mx-auto px-6 md:px-12 w-full">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-[#FAF8F5]/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-[#6E745F]" />
            <span>Back to All Developments</span>
          </Link>
        </div>

        {/* Hero Narrative */}
        <div className="relative z-10 max-w-[1520px] mx-auto px-6 md:px-12 w-full my-auto py-8">
          <div className="max-w-4xl space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 text-[10px] uppercase tracking-widest font-semibold bg-[#FAF8F5] text-[#141414] border border-[#141414]/15 shadow-xs">
                {project.status === 'sold'
                  ? 'Sold Out'
                  : project.status === 'coming-soon'
                  ? 'Upcoming Phase'
                  : 'Available For Registry'}
              </span>

              <span className="px-3 py-1 text-[10px] uppercase tracking-widest font-medium bg-white/10 text-white border border-white/15">
                {project.area}
              </span>

              {project.rera && (
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider bg-black/90 text-white rounded-md shadow-md border border-white/25">
                  <ShieldCheck className="w-4 h-4 text-white" strokeWidth={2.5} />
                  <span>MahaRERA: <strong className="font-mono text-white tracking-widest font-extrabold">{project.rera}</strong></span>
                </span>
              )}
            </div>

            <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-semibold tracking-[-0.03em] leading-[0.96] text-[#FAF8F5] uppercase">
              {project.name}
            </h1>

            <p className="text-base sm:text-lg text-[#FAF8F5]/80 max-w-2xl font-light leading-relaxed">
              {project.location} · {project.approvals.join(', ') || 'RERA Registered'}
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => setSiteVisitOpen(true)}
                className="btn-primary-dark text-xs px-8 py-3.5 tracking-[0.12em] cursor-pointer"
              >
                Schedule Site Visit
              </button>

              <a
                href={`${settings.whatsappUrl}?text=${encodeURIComponent(`Hello, I would like to inquire about ${project.name} in ${project.location}.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline-paper text-xs px-8 py-3.5 tracking-[0.12em]"
              >
                Inquire on WhatsApp
              </a>

              {allPhotos.length > 1 && (
                <a
                  href="#project-photos"
                  className="inline-flex items-center gap-2 text-xs px-6 py-3.5 tracking-[0.12em] bg-white/10 hover:bg-white/20 text-white border border-white/25 backdrop-blur-xs transition-colors cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 text-white/90" />
                  <span>View All Photos ({allPhotos.length})</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Hero Bottom Spec Bar */}
        <div className="relative z-10 max-w-[1520px] mx-auto px-6 md:px-12 w-full pt-8 border-t border-[#FAF8F5]/10 grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-white/60 block">
              Benchmark Rate
            </span>
            <span className="text-sm sm:text-base font-display font-medium text-white mt-1 block">
              {project.pricePerSqft
                ? `₹${project.pricePerSqft.toLocaleString('en-IN')} / sq.ft.`
                : project.status === 'sold'
                ? 'Sold Out'
                : 'Price on Application'}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-white/60 block">
              Plot Configurations
            </span>
            <span className="text-sm sm:text-base font-display font-medium text-white mt-1 block">
              {project.plotSizes.join(' / ')} sq.ft.
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-white/60 block">
              Approvals
            </span>
            <span className="text-sm sm:text-base font-display font-medium text-white mt-1 block">
              {project.approvals.join(' & ') || 'Approved'}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-white/60 block">
              Financing
            </span>
            <span className="text-sm sm:text-base font-display font-medium text-white mt-1 block">
              {project.loanEligible === true
                ? 'Up to 90% Loan'
                : typeof project.loanEligible === 'string'
                ? project.loanEligible
                : 'Direct Consultation'}
            </span>
          </div>
        </div>
      </section>

      {/* 02 On-Location Property Photos & Gallery (IMMEDIATELY BELOW HERO HEADER) */}
      {allPhotos.length > 0 && (
        <section id="project-photos" className="py-12 md:py-18 bg-white border-b border-[#141414]/10">
          <div className="max-w-[1520px] mx-auto px-6 md:px-12 space-y-6">
            {/* Gallery Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#141414]/10">
              <div>
                <span className="editorial-label text-[#6E745F]">Visual Documentation</span>
                <h2 className="font-display font-medium text-2xl sm:text-3xl text-[#141414] tracking-[-0.03em] uppercase">
                  Property Imagery &amp; Real Site Photos
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider bg-[#FAF8F5] border border-[#141414]/15 text-[#141414] rounded-md">
                  {allPhotos.length} {allPhotos.length === 1 ? 'Photo' : 'Photos'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setLightboxIndex(activePhotoIndex);
                    setLightboxOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase tracking-wider bg-[#141414] text-white hover:bg-black transition-colors rounded-md cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Fullscreen View</span>
                </button>
              </div>
            </div>

            {/* Main Stage Image Viewer */}
            <div className="relative w-full aspect-[16/9] md:aspect-[21/9] max-h-[620px] bg-[#141414] overflow-hidden rounded-2xl border border-[#141414]/15 shadow-sm group">
              <Image
                src={allPhotos[activePhotoIndex]}
                alt={`${project.name} photo ${activePhotoIndex + 1}`}
                fill
                priority
                sizes="(max-width: 1520px) 100vw, 1520px"
                className="object-cover transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

              {/* Bottom Info Bar */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white pointer-events-auto">
                <span className="px-3 py-1.5 text-xs font-mono font-medium bg-black/75 backdrop-blur-md border border-white/20 rounded-lg">
                  Photo {activePhotoIndex + 1} of {allPhotos.length}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setLightboxIndex(activePhotoIndex);
                    setLightboxOpen(true);
                  }}
                  className="px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider bg-white/95 text-black hover:bg-white rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Enlarge</span>
                </button>
              </div>

              {/* Arrow Controls (for multiple photos) */}
              {allPhotos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setActivePhotoIndex((prev) => (prev > 0 ? prev - 1 : allPhotos.length - 1))}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all opacity-90 hover:opacity-100 cursor-pointer shadow-lg"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePhotoIndex((prev) => (prev < allPhotos.length - 1 ? prev + 1 : 0))}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all opacity-90 hover:opacity-100 cursor-pointer shadow-lg"
                    aria-label="Next photo"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {/* Interactive Thumbnail Carousel Strip */}
            {allPhotos.length > 1 && (
              <div className="space-y-2">
                <p className="text-xs text-[#141414]/60 font-medium">
                  Click any thumbnail to preview on the main stage:
                </p>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                  {allPhotos.map((photo, index) => {
                    const isActive = index === activePhotoIndex;
                    return (
                      <button
                        key={photo + index}
                        type="button"
                        onClick={() => setActivePhotoIndex(index)}
                        className={`relative shrink-0 w-28 sm:w-36 aspect-[16/10] rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                          isActive
                            ? 'border-[#141414] ring-2 ring-[#141414]/25 scale-102 shadow-sm'
                            : 'border-[#141414]/15 opacity-70 hover:opacity-100 hover:border-[#141414]/40'
                        }`}
                      >
                        <Image
                          src={photo}
                          alt={`Thumbnail ${index + 1}`}
                          fill
                          sizes="144px"
                          className="object-cover"
                        />
                        {isActive && (
                          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 text-[9px] font-mono font-bold bg-[#141414] text-white rounded-xs">
                            Active
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 03 Project Overview & Long Description */}
      <section className="py-20 md:py-32 max-w-[1520px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          <div className="lg:col-span-4 space-y-4">
            <span className="editorial-label">Overview & Thesis</span>
            <h2 className="font-display text-2xl sm:text-3xl font-medium tracking-tight text-[#141414] uppercase">
              Strategic Plotted <br />
              <span className="text-[#141414]/65">Development.</span>
            </h2>
            <div className="pt-4 border-t border-[#141414]/10 space-y-3 text-xs text-[#141414]/65">
              <div className="flex justify-between py-1 border-b border-[#141414]/5">
                <span>Promoted By</span>
                <span className="font-medium text-[#141414]">Hey Investor Pvt. Ltd.</span>
              </div>
              <div className="flex justify-between items-center py-2.5 px-3 bg-white border border-[#141414] rounded-lg shadow-2xs">
                <span className="font-bold text-[#141414] text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#141414]" strokeWidth={2.5} />
                  MahaRERA Reg.
                </span>
                <span className="font-mono font-extrabold text-[#141414] text-xs sm:text-sm tracking-wide">
                  {project.rera || settings.mahaReraNumber}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#141414]/5">
                <span>Classification</span>
                <span className="font-medium text-[#141414] capitalize">{project.type} Plotted Land</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-6 text-sm md:text-base text-[#141414]/65 font-light leading-relaxed">
            <p className="text-lg md:text-xl font-display font-medium text-[#141414] leading-snug tracking-tight">
              {project.description}
            </p>
            {project.longDescription && (
              <p>
                {project.longDescription}
              </p>
            )}
            <p>
              Hey Investor Pvt. Ltd. conducts verified due diligence on all statutory approvals. Purchasers receive complete documentation files including sanctioned layout plans, 7/12 land extract records, and bank NOC guidelines before final execution.
            </p>
          </div>
        </div>
      </section>

      {/* 04 Nearby Landmarks & Distance Matrix */}
      {project.additionalDetails && project.additionalDetails.length > 0 && (
        <section className="py-16 md:py-24 bg-[#FAF8F5] border-y border-[#141414]/10">
          <div className="max-w-[1520px] mx-auto px-6 md:px-12">
            <div className="max-w-2xl space-y-3 pb-12">
              <span className="editorial-label">Vicinity & Connectivity</span>
              <h2 className="font-display text-2xl sm:text-3xl font-medium tracking-tight text-[#141414] uppercase">
                Proximity to key anchors.
              </h2>
              <p className="text-xs text-[#141414]/65 uppercase tracking-wider font-mono">
                Verified ground distances from site entrance.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {project.additionalDetails.map((item) => (
                <div
                  key={item.label}
                  className="p-5 bg-white border border-[#141414]/15 space-y-2 shadow-2xs"
                >
                  <span className="text-[10px] uppercase font-mono tracking-wider text-[#141414]/60 block">
                    {item.label}
                  </span>
                  <strong className="font-display text-xl sm:text-2xl font-semibold text-[#141414] block">
                    {item.value}
                  </strong>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 05 Amenities & On-Site Civil Infrastructure */}
      {project.features && project.features.length > 0 && (
        <section className="py-20 md:py-32 max-w-[1520px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-4 space-y-4">
              <span className="editorial-label">Site Development</span>
              <h2 className="font-display text-2xl sm:text-3xl font-medium tracking-tight text-[#141414] uppercase">
                Infrastructure & <br />
                <span className="text-[#141414]/65">amenity standards.</span>
              </h2>
              <p className="text-xs text-[#141414]/65 font-light leading-relaxed">
                All physical development conforms to municipal engineering guidelines, ensuring durability and zero post-handover utility disruption.
              </p>
            </div>

            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {project.features.map((feature) => (
                <div
                  key={feature}
                  className="p-4 bg-white border border-[#141414]/15 flex items-center gap-3 shadow-2xs"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#6E745F] shrink-0" />
                  <span className="text-xs uppercase tracking-wider font-medium text-[#141414] font-mono">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Fullscreen Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Top Bar */}
          <div 
            className="absolute top-4 left-6 right-6 flex items-center justify-between text-white z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-xs font-mono font-bold tracking-wider px-3 py-1.5 rounded-md bg-white/10 backdrop-blur-md border border-white/20">
              Photo {lightboxIndex + 1} of {allPhotos.length}
            </span>
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Main Image */}
          <div 
            className="relative max-w-6xl max-h-[85vh] w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={allPhotos[lightboxIndex]}
              alt={`Photo ${lightboxIndex + 1}`}
              fill
              className="object-contain"
            />
          </div>

          {/* Lightbox Prev / Next Arrows */}
          {allPhotos.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => (prev > 0 ? prev - 1 : allPhotos.length - 1));
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer"
                title="Previous (Left Arrow)"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => (prev < allPhotos.length - 1 ? prev + 1 : 0));
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer"
                title="Next (Right Arrow)"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>
      )}

      {/* 06 Private Inspection CTA */}
      <section className="py-20 md:py-28 bg-[#141414] text-[#FAF8F5]">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <span className="editorial-label text-[#FAF8F5]/50">Site Inspection</span>
          <h2 className="font-display font-semibold text-3xl sm:text-4xl md:text-5xl text-[#FAF8F5] tracking-[-0.03em] uppercase">
            Inspect {project.name} in person.
          </h2>
          <p className="text-xs sm:text-sm text-[#FAF8F5]/70 max-w-xl mx-auto leading-relaxed font-light">
            We provide coordinated site transport, legal dossier access, and plot demarcation inspections for serious investors and families.
          </p>
          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <button
              type="button"
              onClick={() => setSiteVisitOpen(true)}
              className="btn-primary-dark text-xs px-8 py-3.5 tracking-[0.12em] cursor-pointer"
            >
              Book Private Inspection
            </button>
            <a
              href={`tel:${settings.phoneRaw}`}
              className="btn-outline-paper text-xs px-8 py-3.5 tracking-[0.12em]"
            >
              Call {settings.phone}
            </a>
          </div>
        </div>
      </section>

      {/* Site Visit Modal */}
      <SiteVisitModal
        isOpen={siteVisitOpen}
        onClose={() => setSiteVisitOpen(false)}
        defaultProjectSlug={project.slug}
      />
    </div>
  );
}

