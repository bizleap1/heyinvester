import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

import { env } from '@/lib/env'; // enforce validation
import * as fs from 'fs';
import * as path from 'path';

// Load cloudinary dynamically to avoid early init errors
const initCloudinary = async () => {
    const { uploadToCloudinary } = await import('@/lib/cloudinary');
    return uploadToCloudinary;
};

const run = async () => {
    try {
        console.log("Starting image upload for seeded projects...");
        const uploadToCloudinary = await initCloudinary();
        const { db } = await import('@/db');
        const { projects } = await import('@/db/schema');
        const { eq } = await import('drizzle-orm');

        const allProjects = await db.select().from(projects);
        
        if (allProjects.length === 0) {
            console.log("No projects found to update.");
            return;
        }

        const imagesToMap = [
            'public/images/generated/plot_1.jpg',
            'public/images/generated/plot_2.jpg',
            'public/images/generated/plot_3.jpg'
        ];

        let i = 0;
        for (const p of allProjects) {
            const localPath = `/images/generated/plot_${(i % 3) + 1}.jpg`;
            
            console.log(`Assigning local image for project: ${p.name}`);
            
            await db.update(projects).set({
                coverImageUrl: localPath,
                coverImagePublicId: null
            }).where(eq(projects.id, p.id));
            
            console.log(`✅ Successfully updated ${p.name} with image: ${localPath}`);
            i++;
        }
        console.log("Finished updating projects with images.");
    } catch (e) {
        console.error("Error during execution:", e);
    }
    process.exit(0);
};

run();
