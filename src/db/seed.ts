import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import * as dotenv from 'dotenv';
import { eq } from 'drizzle-orm';

dotenv.config({ path: '.env' });

const runSeed = async () => {
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL is not defined');
    }

    const sql = neon(process.env.DATABASE_URL);
    const db = drizzle(sql, { schema });

    console.log('Seeding projects...');

    const projectsToSeed = [
        {
            name: "Nagpur Marina",
            slug: "nagpur-marina",
            shortDescription: "Premium plots in Nagpur.",
            description: "Premium residential plots in Nagpur.",
            location: "Nagpur",
            corridor: "Nagpur",
            projectType: "residential" as const,
            status: "available" as const,
            pricePerSqft: "₹5,400",
            reraNumber: "PP1190002502095",
            published: true,
            isFeatured: true,
            displayOrder: 1,
            plotSizes: ["1250", "1798"]
        },
        {
            name: "Saraswati Nagari 8",
            slug: "saraswati-nagari-8",
            shortDescription: "Residential plots in Mouza-Lava.",
            description: "NMRDA & RL Approved residential plots in Mouza-Lava.",
            location: "Mouza-Lava",
            corridor: "Mouza-Lava",
            projectType: "residential" as const,
            status: "available" as const,
            pricePerSqft: "₹2,000",
            reraNumber: "P50500056182",
            nmrdaApproved: true,
            rlApproved: true,
            published: true,
            isFeatured: true,
            displayOrder: 2,
            plotSizes: ["1000", "1200", "1500"]
        },
        {
            name: "Saraswati Nagari 9",
            slug: "saraswati-nagari-9",
            shortDescription: "Commercial + Residential plots in Godhani.",
            description: "Commercial and residential plots in Godhani.",
            location: "Godhani",
            corridor: "Godhani",
            projectType: "residential_commercial" as const,
            status: "available" as const,
            pricePerSqft: "₹2,250",
            reraNumber: "P50500056134",
            published: true,
            isFeatured: true,
            displayOrder: 3,
            plotSizes: ["1000", "1500", "2000"]
        }
    ];

    for (const p of projectsToSeed) {
        // check if exists
        const existing = await db.select().from(schema.projects).where(eq(schema.projects.slug, p.slug));
        if (existing.length === 0) {
            const [insertedProject] = await db.insert(schema.projects).values({
                name: p.name,
                slug: p.slug,
                shortDescription: p.shortDescription,
                description: p.description,
                location: p.location,
                corridor: p.corridor,
                projectType: p.projectType,
                status: p.status,
                pricePerSqft: p.pricePerSqft,
                reraNumber: p.reraNumber,
                nmrdaApproved: p.nmrdaApproved,
                rlApproved: p.rlApproved,
                published: p.published,
                isFeatured: p.isFeatured,
                displayOrder: p.displayOrder,
            }).returning();

            for (let i = 0; i < p.plotSizes.length; i++) {
                await db.insert(schema.projectPlotSizes).values({
                    projectId: insertedProject.id,
                    sizeSqFt: p.plotSizes[i],
                    sortOrder: i
                });
            }
            console.log(`Seeded: ${p.name}`);
        } else {
            console.log(`Already exists: ${p.name}`);
        }
    }

    // Seed global settings
    const existingSettings = await db.select().from(schema.siteSettings).where(eq(schema.siteSettings.id, "global"));
    if (existingSettings.length === 0) {
        await db.insert(schema.siteSettings).values({
            id: "global",
            phone: "+91 93256 50256",
            email: "info@heyinvestor.in",
            address: "103 Ghatate Building, WHC Road, Nr. Law College Sq., Nagpur",
            mahaReraNumber: "A50500037507"
        });
        console.log("Seeded global settings");
    }

    console.log('Seeding complete');
    process.exit(0);
};

runSeed().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
});
