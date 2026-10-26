'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  CheckCircle2, 
  ShieldCheck, 
  Landmark, 
  Users, 
  ArrowRight,
  Calendar,
  MapPin,
  TrendingUp,
  MessageCircle
} from 'lucide-react';
import { COMPANY_INFO } from '@/lib/company-data';
import TextReveal from '@/components/ui/TextReveal';

const defaultImages = [
  '/hero_slider/slider1-v2.jpg',
  '/hero_slider/slider2-v2.jpg',
  '/hero_slider/slider3.jpg',
  '/hero_slider/slider4.jpg',
  '/hero_slider/slider5.jpg'
];

export default function HeroSection({ 
  slides, 
  interval = 2500 
}: { 
  slides?: any[]; 
  interval?: number; 
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const displaySlides = slides?.length 
    ? slides 
    : defaultImages.map(src => ({ desktopImageUrl: src, mobileImageUrl: src, heading: '', subheading: '', ctaLabel: '', ctaUrl: '' }));

  const activeInterval = interval && interval >= 500 ? interval : 2500;

  useEffect(() => {
    if (isPaused || displaySlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % displaySlides.length);
    }, activeInterval); 
    return () => clearInterval(timer);
  }, [displaySlides.length, isPaused, activeInterval]);

  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;
    if (distance > minSwipeDistance) {
      setCurrentImageIndex((prev) => (prev + 1) % displaySlides.length);
    } else if (distance < -minSwipeDistance) {
      setCurrentImageIndex((prev) => (prev - 1 + displaySlides.length) % displaySlides.length);
    }
    setTouchStart(0);
    setTouchEnd(0);
  };

  return (
    <section className="relative w-full min-h-screen lg:h-[100svh] bg-[#FAF9F6] pt-[74px] flex flex-col lg:flex-row overflow-hidden">
      
      {/* Left Content Column */}
      <div className="w-full lg:w-[45%] xl:w-[45%] order-2 lg:order-1 flex flex-col justify-center px-6 lg:pl-8 xl:pl-12 lg:pr-10 py-12 lg:py-0 z-10">
        <div className="max-w-[700px] w-full">
          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-4">
            <div className="h-[2px] w-8 bg-[#139D46]"></div>
            <span className="text-[#111714] text-[11px] md:text-[12px] font-bold font-sans uppercase tracking-[0.16em]">
              NAGPUR & VIDARBHA'S TRUSTED PLOT SPECIALIST
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-[42px] sm:text-[48px] md:text-[56px] lg:text-[60px] xl:text-[68px] leading-[0.98] mb-4">
            <span className="shine-text-black block font-medium">Lands You Can Trust.</span>
            <span className="shine-text-green block font-medium">Growth You Can See.</span>
          </h1>

          {/* Supporting Text */}
          <TextReveal 
            text="NMRDA and RL-approved residential and commercial plots in Nagpur's fastest growing corridors — Wardha Road, Hingna, Amravati Road and Koradi Road."
            className="font-sans text-[15px] md:text-[16px] xl:text-[18px] text-[#56605A] leading-relaxed max-w-[600px] mb-6"
            delay={0.2}
          />

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
            <Link 
              href="/projects"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#139D46] text-white px-8 h-[56px] rounded-[10px] font-sans font-semibold text-[16px] hover:bg-[#10853B] transition-colors shimmer-btn"
            >
              View Properties <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Trust Row */}
          <div className="flex flex-wrap md:flex-nowrap items-center gap-y-6 md:gap-y-0 text-[#111714] mb-8">
            <div className="flex items-center gap-3 w-1/2 md:w-auto md:pr-6 md:border-r border-[#E7E3DA]">
              <CheckCircle2 className="w-5 h-5 text-[#139D46] shrink-0" strokeWidth={1.5} />
              <span className="font-sans text-[13px] xl:text-[14px] leading-tight text-[#56605A]"><span className="font-semibold text-[#111714]">NMRDA</span><br/>Approved</span>
            </div>
            <div className="flex items-center gap-3 w-1/2 md:w-auto md:px-6 md:border-r border-[#E7E3DA]">
              <ShieldCheck className="w-5 h-5 text-[#139D46] shrink-0" strokeWidth={1.5} />
              <span className="font-sans text-[13px] xl:text-[14px] leading-tight text-[#56605A]"><span className="font-semibold text-[#111714]">RL</span><br/>Approved</span>
            </div>
            <div className="flex items-center gap-3 w-1/2 md:w-auto md:px-6 md:border-r border-[#E7E3DA]">
              <Landmark className="w-5 h-5 text-[#139D46] shrink-0" strokeWidth={1.5} />
              <span className="font-sans text-[13px] xl:text-[14px] leading-tight text-[#56605A]"><span className="font-semibold text-[#111714]">90%</span><br/>Loan Available</span>
            </div>
            <div className="flex items-center gap-3 w-1/2 md:w-auto md:pl-6">
              <Users className="w-5 h-5 text-[#139D46] shrink-0" strokeWidth={1.5} />
              <span className="font-sans text-[13px] xl:text-[14px] leading-tight text-[#56605A]"><span className="font-semibold text-[#111714]">1000+</span><br/>Happy Clients</span>
            </div>
          </div>



        </div>
      </div>

      {/* Right Image Column (Clean Full Frame, No Diagonal Cut) */}
      <div 
        className="w-full lg:w-[55%] order-1 lg:order-2 lg:absolute lg:top-0 lg:right-0 lg:bottom-0 lg:h-full relative min-h-[400px] sm:min-h-[500px] lg:min-h-0 bg-[#1F1F1F] overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {displaySlides.map((slide, index) => {
          const desktopPos = (slide.desktopImageUrl.includes('slider1') || slide.desktopImageUrl.includes('slider2') || slide.desktopImageUrl.includes('slider4') || slide.desktopImageUrl.includes('slider5'))
            ? 'object-[85%_center] sm:object-right'
            : 'object-center';
          const mobilePos = (slide.mobileImageUrl || slide.desktopImageUrl).includes('slider3')
            ? 'object-center'
            : 'object-[85%_center]';

          return (
            <div key={slide.desktopImageUrl + index} className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === currentImageIndex ? 'opacity-100 z-0' : 'opacity-0 -z-10'}`}>
              <Image
                src={slide.desktopImageUrl}
                alt={slide.heading || `Nagpur Aerial Plotted Development ${index + 1}`}
                fill
                priority={index === 0}
                quality={90}
                className={`object-cover hidden sm:block ${desktopPos}`}
              />
              <Image
                src={slide.mobileImageUrl || slide.desktopImageUrl}
                alt={slide.heading || `Nagpur Aerial Plotted Development ${index + 1}`}
                fill
                priority={index === 0}
                quality={90}
                className={`object-cover block sm:hidden ${mobilePos}`}
              />
            </div>
          );
        })}

        {/* Subtle overlay */}
        <div className="absolute inset-0 bg-black/10 z-10 pointer-events-none" />

        {/* Carousel Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
          {displaySlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`h-1.5 transition-all duration-300 rounded-full ${
                index === currentImageIndex 
                  ? 'w-8 bg-[#139D46]' 
                  : 'w-2 bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>





      </div>

    </section>
  );
}
