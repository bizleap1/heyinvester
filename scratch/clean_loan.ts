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

  await db.update(schema.projects)
    .set({ loanPercentage: null })
    .where(eq(schema.projects.slug, 'koradi-lakeview-enclave'));
  console.log('Set loanPercentage to null for koradi-lakeview-enclave');
}

main().catch(console.error);
