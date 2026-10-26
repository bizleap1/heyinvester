import { db } from "@/db";
import { projects } from "@/db/schema";
import { desc } from "drizzle-orm";
import ProjectsManager from "@/components/admin/ProjectsManager";

export default async function ProjectsAdminPage() {
    const allProjects = await db
        .select()
        .from(projects)
        .orderBy(desc(projects.displayOrder), desc(projects.createdAt));

    return <ProjectsManager projects={allProjects} />;
}

