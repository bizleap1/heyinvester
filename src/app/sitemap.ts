import { MetadataRoute } from 'next';
import { db } from '@/db';
import { projects as projectsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { INSIGHT_ARTICLES } from '@/lib/insights-data';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.heyinvestor.in';

  // Core static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/insights`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];

  // Dynamic projects routes
  const publishedProjects = await db.query.projects.findMany({
    where: eq(projectsTable.published, true)
  });
  
  const projectRoutes: MetadataRoute.Sitemap = publishedProjects.map((p) => ({
    url: `${baseUrl}/projects/${p.slug}`,
    lastModified: new Date(p.updatedAt),
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  // Dynamic insight routes
  const insightRoutes: MetadataRoute.Sitemap = INSIGHT_ARTICLES.map((a) => ({
    url: `${baseUrl}/insights/${a.slug}`,
    lastModified: new Date(a.publishedAt),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...projectRoutes, ...insightRoutes];
}
