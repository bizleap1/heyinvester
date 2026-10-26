import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../src/db/schema';
import * as dotenv from 'dotenv';
import { eq } from 'drizzle-orm';

dotenv.config({ path: '.env' });

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not found');
    return;
  }
  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql, { schema });

  const projectList = await db.select().from(schema.projects).where(eq(schema.projects.slug, 'koradi-lakeview-enclave'));
  if (projectList.length === 0) {
    console.log('Project koradi-lakeview-enclave not found in database.');
    return;
  }

  for (const p of projectList) {
    console.log(`Deleting project: ${p.name} (id: ${p.id})`);
    await db.delete(schema.projectPlotSizes).where(eq(schema.projectPlotSizes.projectId, p.id));
    await db.delete(schema.projectAmenities).where(eq(schema.projectAmenities.projectId, p.id));
    await db.delete(schema.projectLocationAdvantages).where(eq(schema.projectLocationAdvantages.projectId, p.id));
    await db.delete(schema.projectImages).where(eq(schema.projectImages.projectId, p.id));
    await db.delete(schema.projects).where(eq(schema.projects.id, p.id));
    console.log(`Successfully deleted project ${p.name} and all related records.`);
  }
}

main().catch(console.error);
