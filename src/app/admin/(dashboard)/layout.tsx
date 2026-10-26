import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth.api.getSession({ headers: await headers() });
    
    if (!session?.user) {
        redirect("/admin/login");
    }

    return (
        <AdminShell user={{ name: session.user.name || "Admin", email: session.user.email || "" }}>
            {children}
        </AdminShell>
    );
}

