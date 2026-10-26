'use server';

import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";

const settingsSchema = z.object({
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  mahaReraNumber: z.string().optional(),
  instagramUrl: z.string().optional(),
  facebookUrl: z.string().optional(),
  youtubeUrl: z.string().optional(),
  linkedinUrl: z.string().optional(),
  heroSliderInterval: z.coerce.number().min(500).max(60000).optional(),
});

async function requireAdmin() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
        throw new Error("Unauthorized");
    }
}

export async function updateSettings(data: any) {
    await requireAdmin();
    const validatedData = settingsSchema.parse(data);

    const [existing] = await db.select().from(siteSettings).where(eq(siteSettings.id, "global"));

    if (existing) {
        await db.update(siteSettings)
            .set({ ...validatedData, updatedAt: new Date() })
            .where(eq(siteSettings.id, "global"));
    } else {
        await db.insert(siteSettings).values({
            id: "global",
            ...validatedData,
        });
    }

    revalidatePath("/", "layout");
}

const defaultSettings = {
    phone: "+91 93256 50256",
    whatsapp: "+91 93256 50256",
    email: "info@heyinvestor.in",
    address: "103 Ghatate Building,\nWHC Road,\nNr. Law College Sq.,\nNagpur",
    mahaReraNumber: "A50500037507",
    instagramUrl: "",
    facebookUrl: "",
    youtubeUrl: "",
    linkedinUrl: "",
    heroSliderInterval: 2500
};

export async function getSiteSettings() {
    try {
        const [existing] = await db.select().from(siteSettings).where(eq(siteSettings.id, "global"));
        if (existing) {
            return {
                phone: existing.phone || defaultSettings.phone,
                whatsapp: existing.whatsapp || defaultSettings.whatsapp,
                email: existing.email || defaultSettings.email,
                address: existing.address || defaultSettings.address,
                mahaReraNumber: existing.mahaReraNumber || defaultSettings.mahaReraNumber,
                instagramUrl: existing.instagramUrl || defaultSettings.instagramUrl,
                facebookUrl: existing.facebookUrl || defaultSettings.facebookUrl,
                youtubeUrl: existing.youtubeUrl || defaultSettings.youtubeUrl,
                linkedinUrl: existing.linkedinUrl || defaultSettings.linkedinUrl,
                heroSliderInterval: existing.heroSliderInterval ?? defaultSettings.heroSliderInterval
            };
        }
    } catch (err) {
        console.error("Failed to fetch settings:", err);
    }
    return defaultSettings;
}
