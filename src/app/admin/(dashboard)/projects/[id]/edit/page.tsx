import ProjectForm from "@/components/admin/ProjectForm";
import { db } from "@/db";
import { projects, projectPlotSizes, projectAmenities, projectLocationAdvantages, projectImages, projectDocuments } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { notFound } from "next/navigation";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    
    if (!project) {
        notFound();
    }

    const plotSizes = await db.select().from(projectPlotSizes).where(eq(projectPlotSizes.projectId, id)).orderBy(asc(projectPlotSizes.sortOrder));
    const amenities = await db.select().from(projectAmenities).where(eq(projectAmenities.projectId, id)).orderBy(asc(projectAmenities.sortOrder));
    const locationAdvantages = await db.select().from(projectLocationAdvantages).where(eq(projectLocationAdvantages.projectId, id)).orderBy(asc(projectLocationAdvantages.sortOrder));
    const galleryImages = await db.select().from(projectImages).where(eq(projectImages.projectId, id)).orderBy(asc(projectImages.sortOrder));
    const documents = await db.select().from(projectDocuments).where(eq(projectDocuments.projectId, id)).orderBy(asc(projectDocuments.sortOrder));

    const initialData = {
        ...project,
        plotSizes,
        amenities,
        locationAdvantages,
        galleryImages,
        documents
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-20">
            <h1 className="text-2xl font-bold text-[#111714]">Edit Project: {project.name}</h1>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <ProjectForm initialData={initialData} isEditing={true} />
            </div>
        </div>
    );
}
