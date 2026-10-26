import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const run = async () => {
    try {
        console.log("Starting hero slides seed...");
        const { db } = await import('@/db');
        const { heroSlides } = await import('@/db/schema');

        const defaultImages = [
            '/hero_slider/slider1-v2.jpg',
            '/hero_slider/slider2-v2.jpg',
            '/hero_slider/slider3.jpg',
            '/hero_slider/slider4.jpg',
            '/hero_slider/slider5.jpg'
        ];

        // Clear existing slides just in case
        await db.delete(heroSlides);

        // Insert new slides
        const slidesToInsert = defaultImages.map((src, index) => ({
            desktopImageUrl: src,
            desktopImagePublicId: 'local',
            mobileImageUrl: src,
            mobileImagePublicId: 'local',
            heading: '',
            subheading: '',
            ctaLabel: '',
            ctaUrl: '',
            active: true,
            sortOrder: index + 1
        }));

        await db.insert(heroSlides).values(slidesToInsert);

        console.log("✅ Successfully seeded 5 hero slides.");
    } catch (e) {
        console.error("Error during execution:", e);
    }
    process.exit(0);
};

run();
