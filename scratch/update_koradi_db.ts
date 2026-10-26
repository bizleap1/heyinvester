import { db } from '../src/db';
import { projects, projectPlotSizes, projectAmenities, projectLocationAdvantages, projectImages } from '../src/db/schema';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
  console.log('Updating database for Koradi corridor & properties...');

  // 1. Update Saraswati Nagari 9 in database to reflect Koradi Road corridor
  await db.update(projects)
    .set({
      location: 'Godhani, Koradi Road, Nagpur',
      corridor: 'Koradi Road',
      nmrdaApproved: true,
      rlApproved: true,
      coverImageUrl: '/10.png',
    })
    .where(eq(projects.slug, 'saraswati-nagari-9'));
  console.log('Updated Saraswati Nagari 9 corridor to Koradi Road.');

  // 2. Check if koradi-lakeview-enclave exists, if not insert it
  const existing = await db.select().from(projects).where(eq(projects.slug, 'koradi-lakeview-enclave'));
  if (existing.length === 0) {
    const [inserted] = await db.insert(projects).values({
      name: 'Koradi Lakeview Enclave',
      slug: 'koradi-lakeview-enclave',
      shortDescription: 'NMRDA & RL sanctioned residential plotted layout on Koradi Road, Nagpur.',
      description: 'Prime NMRDA & RL approved residential plotted development on Koradi Road with wide cement roads, lakefront proximity, and lush green surroundings.',
      location: 'Koradi Road, Nagpur',
      corridor: 'Koradi Road',
      projectType: 'residential',
      status: 'available',
      pricePerSqft: '₹2,200',
      startingPrice: '₹22,00,000',
      reraNumber: 'P50500058291',
      loanPercentage: '80% Loan Available',
      nmrdaApproved: true,
      rlApproved: true,
      titleClear: true,
      published: true,
      isFeatured: true,
      displayOrder: 4,
      coverImageUrl: '/images/generated/koradi.jpg',
    }).returning();

    // Plot sizes
    await db.insert(projectPlotSizes).values([
      { projectId: inserted.id, sizeSqFt: '1000', sortOrder: 0 },
      { projectId: inserted.id, sizeSqFt: '1200', sortOrder: 1 },
      { projectId: inserted.id, sizeSqFt: '1500', sortOrder: 2 },
      { projectId: inserted.id, sizeSqFt: '2000', sortOrder: 3 },
    ]);

    // Amenities
    await db.insert(projectAmenities).values([
      { projectId: inserted.id, name: '100% Cement Concrete Roads', sortOrder: 0 },
      { projectId: inserted.id, name: 'Dedicated Water Supply Pipeline', sortOrder: 1 },
      { projectId: inserted.id, name: 'Underground Drainage & Sewage Lines', sortOrder: 2 },
      { projectId: inserted.id, name: 'Street Lights & Power Infrastructure', sortOrder: 3 },
      { projectId: inserted.id, name: 'Landscaped Garden & Tree Plantation', sortOrder: 4 },
      { projectId: inserted.id, name: 'Clear Title with NMRDA & RL Sanctions', sortOrder: 5 },
    ]);

    // Location advantages / more info
    await db.insert(projectLocationAdvantages).values([
      { projectId: inserted.id, landmark: 'Koradi Temple & Lake', distance: '1.2 km', sortOrder: 0 },
      { projectId: inserted.id, landmark: 'Outer Ring Road Interchange', distance: '800 meters', sortOrder: 1 },
      { projectId: inserted.id, landmark: 'Modern International School', distance: '1.5 km', sortOrder: 2 },
      { projectId: inserted.id, landmark: 'Nagpur Railway Station', distance: '12 km / 20 mins', sortOrder: 3 },
    ]);

    // Gallery images
    await db.insert(projectImages).values([
      { projectId: inserted.id, imageUrl: '/images/generated/koradi.jpg', cloudinaryPublicId: 'koradi_main', imageType: 'gallery', sortOrder: 0 },
      { projectId: inserted.id, imageUrl: '/10.png', cloudinaryPublicId: 'koradi_flyer', imageType: 'gallery', sortOrder: 1 },
      { projectId: inserted.id, imageUrl: '/images/generated/plot_1.jpg', cloudinaryPublicId: 'koradi_boulevard', imageType: 'gallery', sortOrder: 2 },
    ]);

    console.log('Inserted Koradi Lakeview Enclave into Postgres database!');
  } else {
    console.log('Koradi Lakeview Enclave already exists in database.');
  }

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
