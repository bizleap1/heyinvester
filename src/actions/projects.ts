'use server';

import { db } from "@/db";
import { projects, projectPlotSizes, projectAmenities, projectLocationAdvantages, projectImages, projectDocuments } from "@/db/schema";
import { projectSchema } from "@/schemas/project";
import { eq, asc, and, ne } from "drizzle-orm";
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

export async function createProject(data: any) {
    await requireAdmin();
    const validatedData = projectSchema.parse(data);

    // 1. Pre-check for duplicate slug to give immediate, crystal-clear feedback
    const existing = await db
        .select({ id: projects.id, name: projects.name })
        .from(projects)
        .where(eq(projects.slug, validatedData.slug));
        
    if (existing.length > 0) {
        throw new Error(`The URL Slug "${validatedData.slug}" is already taken by project "${existing[0].name}". Please change the URL Slug in Section 1 (e.g. ${validatedData.slug}-new).`);
    }

    let coverImageUrl = validatedData.coverImageUrl || null;
    let coverImagePublicId = validatedData.coverImagePublicId || null;
    if (validatedData.coverImageBase64) {
        const upload = await uploadToCloudinary(validatedData.coverImageBase64, `hey-investor/projects/${validatedData.slug}/cover`);
        coverImageUrl = upload.url;
        coverImagePublicId = upload.public_id;
    }

    let layoutImageUrl = validatedData.layoutImageUrl || null;
    let layoutImagePublicId = validatedData.layoutImagePublicId || null;
    if (validatedData.layoutImageBase64) {
        const upload = await uploadToCloudinary(validatedData.layoutImageBase64, `hey-investor/projects/${validatedData.slug}/layout`);
        layoutImageUrl = upload.url;
        layoutImagePublicId = upload.public_id;
    }

    let newProject;
    try {
        const [inserted] = await db.insert(projects).values({
            name: validatedData.name,
            slug: validatedData.slug,
            shortDescription: validatedData.shortDescription,
            description: validatedData.description,
            location: validatedData.location,
            corridor: validatedData.corridor,
            projectType: validatedData.projectType,
            status: validatedData.status,
            pricePerSqft: validatedData.pricePerSqft,
            startingPrice: validatedData.startingPrice,
            reraNumber: validatedData.reraNumber,
            loanPercentage: validatedData.loanPercentage,
            nmrdaApproved: validatedData.nmrdaApproved,
            rlApproved: validatedData.rlApproved,
            titleClear: validatedData.titleClear,
            published: validatedData.published,
            isFeatured: validatedData.isFeatured,
            displayOrder: validatedData.displayOrder,
            latitude: validatedData.latitude,
            longitude: validatedData.longitude,
            coverImageUrl,
            coverImagePublicId,
            layoutImageUrl,
            layoutImagePublicId
        }).returning();
        newProject = inserted;
    } catch (dbError: any) {
        const cause = dbError.cause || dbError;
        if (
            cause.code === '23505' || 
            cause.constraint === 'projects_slug_unique' || 
            String(cause.detail).includes('slug') || 
            String(cause.message).includes('unique constraint') ||
            String(dbError.message).includes('projects_slug_unique')
        ) {
            throw new Error(`The URL Slug "${validatedData.slug}" is already in use. Please enter a different URL Slug.`);
        }
        const errorDetail = cause.detail || cause.message || "Failed to save project to database";
        if (typeof errorDetail === 'string' && errorDetail.startsWith("Failed query:")) {
            throw new Error("Database transaction could not be completed. Please check all required fields.");
        }
        throw new Error(errorDetail);
    }

    if (validatedData.plotSizes?.length) {
        await db.insert(projectPlotSizes).values(
            validatedData.plotSizes.map((size, index) => ({
                projectId: newProject.id,
                sizeSqFt: size.sizeSqFt,
                label: size.label,
                sortOrder: index
            }))
        );
    }

    if (validatedData.amenities?.length) {
        await db.insert(projectAmenities).values(
            validatedData.amenities.map((amenity, index) => ({
                projectId: newProject.id,
                name: amenity.name,
                icon: amenity.icon,
                sortOrder: index
            }))
        );
    }

    if (validatedData.locationAdvantages?.length) {
        await db.insert(projectLocationAdvantages).values(
            validatedData.locationAdvantages.map((adv, index) => ({
                projectId: newProject.id,
                landmark: adv.landmark,
                distance: adv.distance,
                travelTime: adv.travelTime,
                sortOrder: index
            }))
        );
    }
    
    const validGalleryImages = validatedData.galleryImages?.filter((img): img is { id?: string | null; url: string; publicId?: string | null } => Boolean(img.url)) || [];
    if (validGalleryImages.length) {
        await db.insert(projectImages).values(
            validGalleryImages.map((img, index) => ({
                projectId: newProject.id,
                imageUrl: img.url,
                cloudinaryPublicId: img.publicId || `img_${index}`,
                imageType: 'gallery' as const,
                sortOrder: index
            }))
        );
    }
    
    if (validatedData.galleryImagesBase64?.length) {
        const startIndex = validatedData.galleryImages?.length || 0;
        const uploadPromises = validatedData.galleryImagesBase64.map(async (base64, idx) => {
            const upload = await uploadToCloudinary(base64, `hey-investor/projects/${validatedData.slug}/gallery`);
            return {
                projectId: newProject.id,
                imageUrl: upload.url,
                cloudinaryPublicId: upload.public_id,
                imageType: 'gallery' as const,
                sortOrder: startIndex + idx
            };
        });
        
        const newImages = await Promise.all(uploadPromises);
        if (newImages.length) {
            await db.insert(projectImages).values(newImages);
        }
    }

    revalidatePath("/admin/projects");
    revalidatePath("/properties");
    revalidatePath("/projects");
    revalidatePath(`/projects/${validatedData.slug}`);
    revalidatePath("/");
    
    return newProject;
}

export async function deleteProject(id: string) {
    await requireAdmin();
    
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    if (!project) throw new Error("Project not found");

    if (project.coverImagePublicId) {
        await deleteFromCloudinary(project.coverImagePublicId);
    }
    if (project.layoutImagePublicId) {
        await deleteFromCloudinary(project.layoutImagePublicId);
    }

    const allImages = await db.select().from(projectImages).where(eq(projectImages.projectId, id));
    for (const image of allImages) {
        await deleteFromCloudinary(image.cloudinaryPublicId);
    }

    const allDocs = await db.select().from(projectDocuments).where(eq(projectDocuments.projectId, id));
    for (const doc of allDocs) {
        await deleteFromCloudinary(doc.cloudinaryPublicId);
    }

    await db.delete(projects).where(eq(projects.id, id));
    
    revalidatePath("/admin/projects");
    revalidatePath("/properties");
    revalidatePath("/");
}

export async function updateProject(id: string, data: any) {
    await requireAdmin();
    const validatedData = projectSchema.parse(data);
    
    const [existingProject] = await db.select().from(projects).where(eq(projects.id, id));
    if (!existingProject) throw new Error("Project not found");

    let coverImageUrl = validatedData.coverImageUrl !== undefined ? validatedData.coverImageUrl : existingProject.coverImageUrl;
    let coverImagePublicId = validatedData.coverImagePublicId !== undefined ? validatedData.coverImagePublicId : existingProject.coverImagePublicId;

    if (validatedData.coverImageBase64) {
        const upload = await uploadToCloudinary(validatedData.coverImageBase64, `hey-investor/projects/${validatedData.slug}/cover`);
        coverImageUrl = upload.url;
        coverImagePublicId = upload.public_id;
        
        if (existingProject.coverImagePublicId) {
            await deleteFromCloudinary(existingProject.coverImagePublicId);
        }
    }

    let layoutImageUrl = validatedData.layoutImageUrl !== undefined ? validatedData.layoutImageUrl : existingProject.layoutImageUrl;
    let layoutImagePublicId = validatedData.layoutImagePublicId !== undefined ? validatedData.layoutImagePublicId : existingProject.layoutImagePublicId;

    if (validatedData.layoutImageBase64) {
        const upload = await uploadToCloudinary(validatedData.layoutImageBase64, `hey-investor/projects/${validatedData.slug}/layout`);
        layoutImageUrl = upload.url;
        layoutImagePublicId = upload.public_id;
        
        if (existingProject.layoutImagePublicId) {
            await deleteFromCloudinary(existingProject.layoutImagePublicId);
        }
    }

    // Pre-check for duplicate slug when changing slug
    const existingWithSlug = await db
        .select({ id: projects.id, name: projects.name })
        .from(projects)
        .where(and(eq(projects.slug, validatedData.slug), ne(projects.id, id)));

    if (existingWithSlug.length > 0) {
        throw new Error(`The URL Slug "${validatedData.slug}" is already used by project "${existingWithSlug[0].name}". Please choose a different URL slug.`);
    }

    try {
        await db.update(projects).set({
            name: validatedData.name,
            slug: validatedData.slug,
            shortDescription: validatedData.shortDescription,
            description: validatedData.description,
            location: validatedData.location,
            corridor: validatedData.corridor,
            projectType: validatedData.projectType,
            status: validatedData.status,
            pricePerSqft: validatedData.pricePerSqft,
            startingPrice: validatedData.startingPrice,
            reraNumber: validatedData.reraNumber,
            loanPercentage: validatedData.loanPercentage,
            nmrdaApproved: validatedData.nmrdaApproved,
            rlApproved: validatedData.rlApproved,
            titleClear: validatedData.titleClear,
            published: validatedData.published,
            isFeatured: validatedData.isFeatured,
            displayOrder: validatedData.displayOrder,
            coverImageUrl,
            coverImagePublicId,
            layoutImageUrl,
            layoutImagePublicId
        }).where(eq(projects.id, id));
    } catch (dbError: any) {
        const cause = dbError.cause || dbError;
        if (
            cause.code === '23505' || 
            cause.constraint === 'projects_slug_unique' || 
            String(cause.detail).includes('slug') || 
            String(cause.message).includes('unique constraint') ||
            String(dbError.message).includes('projects_slug_unique')
        ) {
            throw new Error(`The URL Slug "${validatedData.slug}" is already in use. Please enter a different URL Slug.`);
        }
        const errorDetail = cause.detail || cause.message || "Failed to update project in database";
        if (typeof errorDetail === 'string' && errorDetail.startsWith("Failed query:")) {
            throw new Error("Database transaction could not be completed. Please check all fields.");
        }
        throw new Error(errorDetail);
    }

    // Update Plot Sizes
    await db.delete(projectPlotSizes).where(eq(projectPlotSizes.projectId, id));
    if (validatedData.plotSizes?.length) {
        await db.insert(projectPlotSizes).values(
            validatedData.plotSizes.map((size, index) => ({
                projectId: id,
                sizeSqFt: size.sizeSqFt,
                label: size.label,
                sortOrder: index
            }))
        );
    }

    // Update Amenities
    await db.delete(projectAmenities).where(eq(projectAmenities.projectId, id));
    if (validatedData.amenities?.length) {
        await db.insert(projectAmenities).values(
            validatedData.amenities.map((amenity, index) => ({
                projectId: id,
                name: amenity.name,
                icon: amenity.icon,
                sortOrder: index
            }))
        );
    }

    // Update Location Advantages
    await db.delete(projectLocationAdvantages).where(eq(projectLocationAdvantages.projectId, id));
    if (validatedData.locationAdvantages?.length) {
        await db.insert(projectLocationAdvantages).values(
            validatedData.locationAdvantages.map((adv, index) => ({
                projectId: id,
                landmark: adv.landmark,
                distance: adv.distance,
                travelTime: adv.travelTime,
                sortOrder: index
            }))
        );
    }
    
    // Update Gallery Images
    // We only touch 'gallery' image types
    await db.delete(projectImages).where(and(eq(projectImages.projectId, id), eq(projectImages.imageType, 'gallery')));
    const validExistingGallery = validatedData.galleryImages?.filter((img): img is { id?: string | null; url: string; publicId?: string | null } => Boolean(img.url)) || [];
    if (validExistingGallery.length) {
        await db.insert(projectImages).values(
            validExistingGallery.map((img, index) => ({
                projectId: id,
                imageUrl: img.url,
                cloudinaryPublicId: img.publicId || `img_${index}`,
                imageType: 'gallery' as const,
                sortOrder: index
            }))
        );
    }
    
    if (validatedData.galleryImagesBase64?.length) {
        const startIndex = validatedData.galleryImages?.length || 0;
        const uploadPromises = validatedData.galleryImagesBase64.map(async (base64, idx) => {
            const upload = await uploadToCloudinary(base64, `hey-investor/projects/${validatedData.slug}/gallery`);
            return {
                projectId: id,
                imageUrl: upload.url,
                cloudinaryPublicId: upload.public_id,
                imageType: 'gallery' as const,
                sortOrder: startIndex + idx
            };
        });
        
        const newImages = await Promise.all(uploadPromises);
        if (newImages.length) {
            await db.insert(projectImages).values(newImages);
        }
    }

    revalidatePath("/admin/projects");
    revalidatePath("/properties");
    revalidatePath("/projects");
    revalidatePath(`/projects/${validatedData.slug}`);
    revalidatePath("/");
}

// ... other actions for updates, images CRUD, etc.

export async function getProjectsList() {
    return await db.select({
        id: projects.id,
        slug: projects.slug,
        name: projects.name,
        location: projects.location,
        status: projects.status
    }).from(projects).orderBy(asc(projects.displayOrder));
}
