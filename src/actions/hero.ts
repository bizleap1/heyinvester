'use server';

import { db } from "@/db";
import { heroSlides, siteSettings } from "@/db/schema";
import { heroSlideSchema } from "@/schemas/hero";
import { eq, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";

async function requireAdmin() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
        throw new Error("Unauthorized");
    }
}

export async function createHeroSlide(data: any) {
    await requireAdmin();
    const validatedData = heroSlideSchema.parse(data);

    let desktopImageUrl = data.desktopImageUrl || null;
    let desktopImagePublicId = data.desktopImagePublicId || null;

    if (validatedData.desktopImageBase64) {
        const upload = await uploadToCloudinary(validatedData.desktopImageBase64, 'hey-investor/hero-slider/desktop');
        desktopImageUrl = upload.url;
        desktopImagePublicId = upload.public_id;
    }

    if (!desktopImageUrl) {
        throw new Error("Desktop image is required");
    }

    let mobileImageUrl = data.mobileImageUrl || null;
    let mobileImagePublicId = data.mobileImagePublicId || null;

    if (validatedData.mobileImageBase64) {
        const upload = await uploadToCloudinary(validatedData.mobileImageBase64, 'hey-investor/hero-slider/mobile');
        mobileImageUrl = upload.url;
        mobileImagePublicId = upload.public_id;
    }

    if (!mobileImageUrl) {
        mobileImageUrl = desktopImageUrl;
        mobileImagePublicId = desktopImagePublicId;
    }

    await db.insert(heroSlides).values({
        heading: validatedData.heading,
        subheading: validatedData.subheading,
        ctaLabel: validatedData.ctaLabel,
        ctaUrl: validatedData.ctaUrl,
        active: validatedData.active,
        sortOrder: validatedData.sortOrder,
        desktopImageUrl,
        desktopImagePublicId,
        mobileImageUrl,
        mobileImagePublicId,
    });

    revalidatePath("/admin/hero-slider");
    revalidatePath("/");
}

export async function updateHeroSlide(id: string, data: any) {
    await requireAdmin();
    const validatedData = heroSlideSchema.parse(data);

    const [existingSlide] = await db.select().from(heroSlides).where(eq(heroSlides.id, id));
    if (!existingSlide) throw new Error("Slide not found");

    let desktopImageUrl = data.desktopImageUrl || existingSlide.desktopImageUrl;
    let desktopImagePublicId = data.desktopImagePublicId || existingSlide.desktopImagePublicId;

    if (validatedData.desktopImageBase64) {
        const upload = await uploadToCloudinary(validatedData.desktopImageBase64, 'hey-investor/hero-slider/desktop');
        desktopImageUrl = upload.url;
        desktopImagePublicId = upload.public_id;

        if (existingSlide.desktopImagePublicId) {
            await deleteFromCloudinary(existingSlide.desktopImagePublicId);
        }
    }

    if (!desktopImageUrl) {
        throw new Error("Desktop image is required");
    }

    let mobileImageUrl = data.mobileImageUrl || existingSlide.mobileImageUrl;
    let mobileImagePublicId = data.mobileImagePublicId || existingSlide.mobileImagePublicId;

    if (validatedData.mobileImageBase64) {
        const upload = await uploadToCloudinary(validatedData.mobileImageBase64, 'hey-investor/hero-slider/mobile');
        mobileImageUrl = upload.url;
        mobileImagePublicId = upload.public_id;

        if (existingSlide.mobileImagePublicId) {
            await deleteFromCloudinary(existingSlide.mobileImagePublicId);
        }
    }

    if (!mobileImageUrl) {
        mobileImageUrl = desktopImageUrl;
        mobileImagePublicId = desktopImagePublicId;
    }

    await db.update(heroSlides).set({
        heading: validatedData.heading,
        subheading: validatedData.subheading,
        ctaLabel: validatedData.ctaLabel,
        ctaUrl: validatedData.ctaUrl,
        active: validatedData.active,
        sortOrder: validatedData.sortOrder,
        desktopImageUrl,
        desktopImagePublicId,
        mobileImageUrl,
        mobileImagePublicId,
    }).where(eq(heroSlides.id, id));

    revalidatePath("/admin/hero-slider");
    revalidatePath("/");
}

export async function getHeroSlides() {
    return await db.select().from(heroSlides).orderBy(asc(heroSlides.sortOrder));
}



export async function deleteHeroSlide(id: string) {
    await requireAdmin();
    
    const [slide] = await db.select().from(heroSlides).where(eq(heroSlides.id, id));
    if (!slide) throw new Error("Slide not found");

    if (slide.desktopImagePublicId) {
        await deleteFromCloudinary(slide.desktopImagePublicId);
    }
    if (slide.mobileImagePublicId) {
        await deleteFromCloudinary(slide.mobileImagePublicId);
    }

    await db.delete(heroSlides).where(eq(heroSlides.id, id));
    
    revalidatePath("/admin/hero-slider");
    revalidatePath("/");
}

export async function toggleHeroSlideStatus(id: string, active: boolean) {
    await requireAdmin();
    await db.update(heroSlides).set({ active }).where(eq(heroSlides.id, id));
    revalidatePath("/admin/hero-slider");
    revalidatePath("/");
}

export async function getHeroSliderInterval(): Promise<number> {
    try {
        const [existing] = await db.select({ heroSliderInterval: siteSettings.heroSliderInterval })
            .from(siteSettings)
            .where(eq(siteSettings.id, "global"));
        return existing?.heroSliderInterval ?? 2500;
    } catch (err) {
        console.error("Failed to get slider interval", err);
        return 2500;
    }
}

export async function updateHeroSliderInterval(intervalMs: number) {
    await requireAdmin();
    const interval = Math.max(500, Math.min(60000, Math.round(Number(intervalMs)) || 2500));

    const [existing] = await db.select().from(siteSettings).where(eq(siteSettings.id, "global"));
    if (existing) {
        await db.update(siteSettings)
            .set({ heroSliderInterval: interval, updatedAt: new Date() })
            .where(eq(siteSettings.id, "global"));
    } else {
        await db.insert(siteSettings).values({
            id: "global",
            heroSliderInterval: interval,
        });
    }

    revalidatePath("/admin/hero-slider");
    revalidatePath("/admin/settings");
    revalidatePath("/");
    revalidatePath("/", "layout");
    return { success: true, interval };
}
