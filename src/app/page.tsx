import HeroSection from '@/components/home/HeroSection';
import VideoIntroSection from '@/components/home/VideoIntroSection';
import AvailableProperties from '@/components/home/AvailableProperties';
import SavitriParkBanner from '@/components/home/SavitriParkBanner';
import ExploreCorridors from '@/components/home/ExploreCorridors';
import WhyHeyInvestor from '@/components/home/WhyHeyInvestor';
import AdvisoryTrustSection from '@/components/home/AdvisoryTrustSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import FinalCtaSection from '@/components/home/FinalCtaSection';
import { db } from "@/db";
import { heroSlides, projects as projectsTable } from "@/db/schema";
import { eq, asc, or, and } from "drizzle-orm";
import { getSiteSettings } from "@/actions/settings";

export default async function HomePage() {
  const slides = await db.query.heroSlides.findMany({
    where: eq(heroSlides.active, true),
    orderBy: [asc(heroSlides.sortOrder)]
  });

  const settings = await getSiteSettings();

  const comingSoonProject = await db.query.projects.findFirst({
    where: and(
      eq(projectsTable.published, true),
      or(eq(projectsTable.status, "coming_soon"), eq(projectsTable.status, "pre_launch"))
    ),
    orderBy: [asc(projectsTable.displayOrder)]
  });

  return (
    <>
      {/* 01 Full-Screen Cinematic Hero */}
      <HeroSection slides={slides} interval={settings.heroSliderInterval ?? 2500} />

      {/* NEW: SECTION - WHY CHOOSE US (VIDEO INTRO) */}
      <VideoIntroSection />

      {/* NEW: SECTION 1 — AVAILABLE PROPERTIES */}
      <AvailableProperties />

      {/* NEW: SECTION 2 — COMING SOON PROJECT (DYNAMIC) */}
      {comingSoonProject && <SavitriParkBanner project={comingSoonProject} />}

      {/* TESTIMONIALS SECTION (HORIZONTAL SCROLL GOOGLE REVIEWS) */}
      <TestimonialsSection />

      {/* NEW: SECTION 3 — EXPLORE BY CORRIDOR */}
      <ExploreCorridors />

      {/* 09 Leadership & Advisory Trust */}
      <AdvisoryTrustSection />

      {/* NEW: SECTION 4 — WHY HEY INVESTOR */}
      <WhyHeyInvestor />

      {/* 10 Final Luxury CTA */}
      <FinalCtaSection />
    </>
  );
}
