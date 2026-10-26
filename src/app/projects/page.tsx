import { Metadata } from 'next';
import { Suspense } from 'react';
import ProjectsClient from './ProjectsClient';
import { db } from '@/db';
import { projects as projectsTable } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';

export const metadata: Metadata = {
  title: 'Curated Plotted Developments | Hey Investor Nagpur',
  description:
    'Explore verified residential and commercial plots for sale across Nagpur’s top infrastructure corridors: Wardha Road, Hingna, Amravati Road, and Koradi Road. NMRDA and RL sanctioned.',
};

export default async function ProjectsPage() {
  const dbProjects = await db.query.projects.findMany({
      where: eq(projectsTable.published, true),
      orderBy: [asc(projectsTable.displayOrder)],
      with: {
          plotSizes: true,
      }
  });

  const formattedProjects = dbProjects.map(p => {
      const approvals = [];
      if (p.nmrdaApproved) approvals.push('NMRDA');
      if (p.rlApproved) approvals.push('RL');
      
      return {
          slug: p.slug,
          name: p.name,
          image: p.coverImageUrl || '/placeholder.jpg',
          area: p.corridor || p.location,
          location: p.location,
          status: p.status === 'coming_soon' ? 'coming-soon' : (p.status === 'sold_out' ? 'sold' : 'available'),
          type: p.projectType === 'residential' ? 'residential' : 'mixed',
          pricePerSqft: p.pricePerSqft, // using the text directly or removing formatting, but let's just pass it
          description: p.shortDescription || p.description,
          plotSizes: p.plotSizes?.map(s => s.sizeSqFt) || [],
          approvals: approvals,
          rera: p.reraNumber,
      };
  });

  return (
    <Suspense fallback={<div className="pt-40 text-center text-[#141414]/65">Loading projects...</div>}>
      <ProjectsClient projects={formattedProjects as any} />
    </Suspense>
  );
}
