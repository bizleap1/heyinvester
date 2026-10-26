import ProjectForm from "@/components/admin/ProjectForm";

export default function NewProjectPage() {
    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-20">
            <h1 className="text-2xl font-bold text-[#111714]">Add New Project</h1>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <ProjectForm />
            </div>
        </div>
    );
}
