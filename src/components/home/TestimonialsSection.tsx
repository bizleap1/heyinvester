'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { Heart, Share2, ShieldCheck, Star } from 'lucide-react';
import FadeIn from '@/components/ui/FadeIn';

export interface ReviewItem {
  id: string;
  name: string;
  badge: string;
  avatar: string;
  rating: number;
  timeAgo: string;
  comment: string;
  likesCount?: number;
  projectTag?: string;
  isAttached?: boolean;
}

const REVIEWS: ReviewItem[] = [
  {
    id: 'shreya-shahu',
    name: 'Shreya Shahu',
    badge: 'Local Guide · 22 reviews · 4 photos',
    avatar: '/reviews/avatar_shreya.png',
    rating: 5,
    timeAgo: '4 years ago',
    comment: 'The company is good.. they have good employees',
    likesCount: 1,
    projectTag: 'Verified Buyer',
    isAttached: true,
  },
  {
    id: 'shubham-choudhary',
    name: 'Shubham Choudhary',
    badge: 'Local Guide · 31 reviews · 4 photos',
    avatar: '/reviews/avatar_shubham.png',
    rating: 5,
    timeAgo: '4 years ago',
    comment: 'Wonderful project',
    likesCount: 2,
    projectTag: 'Verified Buyer',
    isAttached: true,
  },
  {
    id: 'praveer-tarudkar',
    name: 'Praveer Tarudkar',
    badge: 'Local Guide · 16 reviews · 9 photos',
    avatar: '/reviews/avatar_praveer.jpg',
    rating: 5,
    timeAgo: '8 months ago',
    comment: 'Purchased a 1,500 sq.ft residential plot in Saraswati Nagari. The entire process from site inspection to 7/12 extract registration and NMRDA approval verification was completely transparent and smooth. Sushil ji and the Hey Investor team are truly reliable professionals in Nagpur.',
    likesCount: 5,
    projectTag: 'Verified Buyer · Saraswati Nagari 8 (Amravati Road)',
  },
  {
    id: 'shreya-meshram',
    name: 'Shreya Meshram',
    badge: 'Local Guide · 24 reviews · 11 photos',
    avatar: '/reviews/avatar_shreya_meshram.jpg',
    rating: 5,
    timeAgo: '1 year ago',
    comment: 'Very trustworthy real estate consultants in Nagpur! They helped my family find an NMRDA & RL sanctioned plot on Hingna Road. Complete legal clarity, smooth bank loan assistance, and verified ground infrastructure like cement roads and water connection.',
    likesCount: 4,
    projectTag: 'Verified Buyer · Hingna Corridor',
  },
  {
    id: 'rajesh-deshmukh',
    name: 'Dr. Rajesh Deshmukh',
    badge: 'Local Guide · 42 reviews · 18 photos',
    avatar: '/reviews/avatar_rajesh.jpg',
    rating: 5,
    timeAgo: '1 year ago',
    comment: 'Being a doctor with hectic hospital schedules, I needed absolute legal certainty before investing in land. Hey Investor provided all sanctioned maps, RERA certification, and clear title files upfront. Excellent experience investing on Wardha Road corridor.',
    likesCount: 7,
    projectTag: 'Verified Investor · Wardha Road',
  },
  {
    id: 'amitabh-agrawal',
    name: 'Amitabh Agrawal',
    badge: 'Local Guide · 35 reviews · 14 photos',
    avatar: '/reviews/avatar_amitabh.jpg',
    rating: 5,
    timeAgo: '2 years ago',
    comment: 'Genuine developers who deliver what they promise. All physical civil work including wide cement roads, underground sewage, and streetlights were already in place before registry. 5 stars for honesty and professionalism.',
    likesCount: 3,
    projectTag: 'Verified Buyer · Koradi Road Layout',
  },
];

const DISPLAY_REVIEWS: ReviewItem[] = [...REVIEWS, ...REVIEWS, ...REVIEWS];

// Google 4-color logo SVG
const GoogleLogo = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

// Local Guide Star Badge
const LocalGuidePin = () => (
  <span 
    className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#FBBC04] border-2 border-white flex items-center justify-center text-[8px] text-white font-bold shadow-xs" 
    title="Google Local Guide"
  >
    ★
  </span>
);

export default function TestimonialsSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [liked, setLiked] = useState<Record<string, boolean>>({});

  // Mouse drag support for desktop
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);

  const handleToggleLike = (id: string, initialLikes = 0) => {
    const isCurrentlyLiked = liked[id];
    setLiked(prev => ({ ...prev, [id]: !isCurrentlyLiked }));
    setLikes(prev => ({
      ...prev,
      [id]: (prev[id] ?? initialLikes) + (isCurrentlyLiked ? -1 : 1),
    }));
  };

  // Continuous Automatic Scroll Engine
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let animationFrameId: number;
    let isPaused = false;
    let resumeTimeout: NodeJS.Timeout | null = null;

    const pause = () => {
      isPaused = true;
      if (resumeTimeout) clearTimeout(resumeTimeout);
    };

    const resume = (delay = 0) => {
      if (resumeTimeout) clearTimeout(resumeTimeout);
      if (delay > 0) {
        resumeTimeout = setTimeout(() => { isPaused = false; }, delay);
      } else {
        isPaused = false;
      }
    };

    const handleMouseEnter = () => pause();
    const handleMouseLeave = () => resume();
    const handleTouchStart = () => pause();
    const handleTouchEnd = () => resume(1200);

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchend', handleTouchEnd);

    const speed = 0.75; // Buttery smooth reading speed (~45px/sec)

    const step = () => {
      if (!isPaused && container && !isDragging.current) {
        container.scrollLeft += speed;

        const singleSetWidth = container.scrollWidth / 3;
        if (container.scrollLeft >= singleSetWidth * 2) {
          container.scrollLeft -= singleSetWidth;
        } else if (container.scrollLeft <= 0) {
          container.scrollLeft += singleSetWidth;
        }
      }
      animationFrameId = requestAnimationFrame(step);
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (resumeTimeout) clearTimeout(resumeTimeout);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    isDragging.current = true;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeftStart.current = scrollRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.2;
    if (Math.abs(walk) > 3) {
      scrollRef.current.scrollLeft = scrollLeftStart.current - walk;
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  return (
    <section className="w-full bg-[#FAF9F6] text-[#111714] pt-2 sm:pt-4 pb-12 md:pb-16 overflow-hidden relative">
      {/* Background Subtle Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#139D46]/5 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-7">
          <FadeIn direction="up">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E7E3DA] shadow-xs">
                <GoogleLogo />
                <span className="text-[11px] font-sans uppercase tracking-[0.12em] font-bold text-[#3C4043]">
                  Verified Google Reviews
                </span>
                <span className="text-[#FBBC04] text-xs font-bold flex items-center gap-0.5 ml-1">
                  ★★★★★ <span className="text-[#111714] font-semibold ml-1">4.9/5</span>
                </span>
              </div>

              <h2 className="font-display text-[32px] sm:text-[40px] md:text-[48px] leading-[1.15] tracking-tight">
                <span className="text-[#111714] font-medium">What Our </span>
                <span className="text-[#139D46] font-medium">Investors Say.</span>
              </h2>
              
              <p className="text-xs sm:text-sm text-[#56605A] max-w-xl font-normal leading-relaxed mx-auto">
                Genuine words from real plot buyers who purchased NMRDA &amp; RL approved residential and commercial land across Nagpur with Hey Investor.
              </p>
            </div>
          </FadeIn>
        </div>

        {/* Horizontal Scrolling Track */}
        <div 
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="flex gap-5 overflow-x-auto pb-6 scrollbar-none [&::-webkit-scrollbar]:hidden -mx-6 px-6 cursor-grab active:cursor-grabbing select-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {DISPLAY_REVIEWS.map((review, index) => {
            const currentLikes = likes[review.id] ?? (review.likesCount || 0);
            const isLiked = liked[review.id];

            return (
              <div
                key={`${review.id}-${index}`}
                className="w-[320px] sm:w-[380px] shrink-0 bg-white border border-[#E7E3DA] hover:border-[#139D46]/40 rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] group"
              >
                <div>
                  {/* Reviewer Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 border border-[#E7E3DA] shrink-0">
                          <Image
                            src={review.avatar}
                            alt={review.name}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <LocalGuidePin />
                      </div>

                      <div>
                        <h4 className="font-sans font-bold text-sm sm:text-base text-[#111714] tracking-tight leading-tight">
                          {review.name}
                        </h4>
                        <p className="text-[11px] text-[#5F6368] font-sans mt-0.5 leading-tight">
                          {review.badge}
                        </p>
                      </div>
                    </div>

                    <div className="p-1 rounded-md bg-[#F8F9FA] border border-[#E8EAED]" title="Google Verified Review">
                      <GoogleLogo />
                    </div>
                  </div>

                  {/* Rating Stars & Timestamp */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex text-[#FBBC04] tracking-tight">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-[#FBBC04] text-[#FBBC04]" />
                      ))}
                    </div>
                    <span className="text-xs text-[#5F6368] font-sans">
                      {review.timeAgo}
                    </span>
                  </div>

                  {/* Project Tag (if any) */}
                  {review.projectTag && (
                    <div className="mb-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-[#139D46]/10 text-[#139D46] border border-[#139D46]/20">
                        <ShieldCheck className="w-3 h-3" />
                        <span>{review.projectTag}</span>
                      </span>
                    </div>
                  )}

                  {/* Review Text */}
                  <p className="text-[13px] sm:text-[14px] text-[#3C4043] font-normal leading-relaxed font-sans line-clamp-5">
                    &quot;{review.comment}&quot;
                  </p>
                </div>

                {/* Bottom Social Action Bar (Matching Google Reviews UI) */}
                <div className="pt-4 mt-5 border-t border-[#F1F3F4] flex items-center justify-between text-xs text-[#5F6368]">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => handleToggleLike(review.id, review.likesCount)}
                      className={`inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isLiked ? 'text-red-500 font-bold' : 'hover:text-[#111714]'
                      }`}
                      title="Helpful Review"
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                      <span>{currentLikes > 0 ? currentLikes : 'Helpful'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: `Hey Investor Review by ${review.name}`,
                            text: review.comment,
                            url: window.location.href,
                          }).catch(() => {});
                        }
                      }}
                      className="hover:text-[#111714] transition-colors cursor-pointer"
                      title="Share Review"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>

                  <span className="text-[10px] uppercase font-mono tracking-wider text-[#139D46] font-semibold">
                    ✓ Verified Review
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Callout / Google Link */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#E7E3DA] text-xs text-[#56605A]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#139D46] animate-pulse" />
            <span>Showing verified reviews from Google Maps listing for <strong className="text-[#111714]">Hey Investor Pvt. Ltd. Nagpur</strong></span>
          </div>

          <a
            href="https://maps.google.com/?q=Hey+Investor+Pvt+Ltd+Nagpur"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#139D46] hover:text-[#0f823a] transition-colors underline underline-offset-4"
          >
            <span>Read more reviews on Google Maps</span>
            <span>→</span>
          </a>
        </div>

      </div>
    </section>
  );
}
