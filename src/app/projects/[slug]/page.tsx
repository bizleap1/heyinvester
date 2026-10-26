import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { db } from '@/db';
import { projects as projectsTable } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import ProjectDetailClient from './ProjectDetailClient';

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const projects = await db.query.projects.findMany({
      where: eq(projectsTable.published, true),
      columns: { slug: true }
  });
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await db.query.projects.findFirst({
      where: and(eq(projectsTable.slug, slug), eq(projectsTable.published, true))
  });

  if (!project) {
    return {
      title: 'Project Not Found | Hey Investor',
    };
  }

  return {
    title: `${project.name} — Plots in ${project.location} | Hey Investor`,
    description: project.shortDescription || `${project.name} in ${project.location}.`,
    openGraph: {
      title: `${project.name} | Hey Investor Nagpur`,
      description: project.description,
      images: [
        {
          url: project.coverImageUrl || '',
          width: 1200,
          height: 630,
          alt: project.name,
        },
      ],
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await db.query.projects.findFirst({
      where: and(eq(projectsTable.slug, slug), eq(projectsTable.published, true)),
      with: {
          plotSizes: true,
          images: true,
          amenities: true,
          locationAdvantages: true,
          documents: true
      }
  });

  if (!project) {
    notFound();
  }

  const approvals = [];
  if (project.nmrdaApproved) approvals.push('NMRDA');
  if (project.rlApproved) approvals.push('RL');
  if (project.titleClear) approvals.push('Title Clear');

  const formattedProject = {
      ...project,
      image: project.coverImageUrl || '/placeholder.jpg',
      area: project.location,
      approvals: approvals,
      plotSizes: project.plotSizes?.map(s => s.sizeSqFt) || [],
      loanEligible: project.loanPercentage ? (() => {
        const num = project.loanPercentage.replace(/(%?\s*loan\s*available)+/gi, '').replace(/%/g, '').trim();
        return num ? `${num}% Loan Available` : 'Bank Loan Available';
      })() : false,
      type: project.projectType,
      longDescription: project.description, // using description
      gallery: (project.images || []).map(i => i.imageUrl).filter(Boolean),
      features: project.amenities?.map(a => a.name) || [],
      additionalDetails: project.locationAdvantages?.map(adv => ({ label: adv.landmark, value: adv.distance })) || []
  };

  return <ProjectDetailClient project={formattedProject as any} />;
}
