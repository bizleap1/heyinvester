import { db } from "@/db";
import { projects, heroSlides, siteSettings } from "@/db/schema";
import { count, eq, desc, inArray } from "drizzle-orm";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { getSiteSettings } from "@/actions/settings";
import { 
    Plus, 
    Building2, 
    FileImage, 
    Settings, 
    ExternalLink, 
    Eye, 
    Pencil, 
    Sparkles, 
    CheckCircle2, 
    Clock, 
    Star, 
    Phone, 
    ShieldCheck, 
    ArrowRight,
    HelpCircle,
    LayoutDashboard
} from "lucide-react";
import { DeleteProjectButton } from "./projects/DeleteProjectButton";

export default async function AdminDashboard() {
    // Fetch stats
    const [totalProjectsResult] = await db.select({ count: count() }).from(projects);
    const [publishedProjectsResult] = await db.select({ count: count() }).from(projects).where(eq(projects.published, true));
    const [featuredProjectsResult] = await db.select({ count: count() }).from(projects).where(eq(projects.isFeatured, true));
    
    // Combining coming_soon and pre_launch
    const comingSoonProjectsCount = await db.select({ count: count() }).from(projects).where(eq(projects.status, "coming_soon"));
    const preLaunchProjectsCount = await db.select({ count: count() }).from(projects).where(eq(projects.status, "pre_launch"));
    const comingSoonTotal = (comingSoonProjectsCount[0]?.count || 0) + (preLaunchProjectsCount[0]?.count || 0);

    const [totalHeroSlides] = await db.select({ count: count() }).from(heroSlides);
    const [activeHeroSlides] = await db.select({ count: count() }).from(heroSlides).where(eq(heroSlides.active, true));

    // Fetch coming soon / pre-launch project name
    const [comingSoonProject] = await db.select().from(projects).where(inArray(projects.status, ["coming_soon", "pre_launch"])).orderBy(desc(projects.updatedAt)).limit(1);

    // Fetch recent
    const recentProjectsList = await db.select().from(projects).orderBy(desc(projects.updatedAt)).limit(6);

    // Fetch settings for overview
    const settings = await getSiteSettings();

    return (
        <div className="space-y-6 sm:space-y-8 pb-12">
            
            {/* 1. Welcome Greeting Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-emerald-800 via-[#139D46] to-teal-700 rounded-2xl p-6 sm:p-8 text-white shadow-md">
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="max-w-2xl space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold tracking-wide border border-white/20">
                            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                            <span>Hey Investor Portal Management</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                            Welcome Back, Admin! 👋
                        </h1>
                        <p className="text-sm sm:text-base text-emerald-50 leading-relaxed">
                            Easily manage your properties, hero slider banners, and contact information. Click any of the quick action buttons below to make instant updates to your website.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                        <Link 
                            href="/admin/projects/new"
                            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-[#139D46] font-bold text-sm shadow-md hover:bg-emerald-50 hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                        >
                            <Plus className="w-4 h-4 stroke-[3]" />
                            <span>Add New Project</span>
                        </Link>
                        <Link 
                            href="/"
                            target="_blank"
                            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-black/20 hover:bg-black/30 text-white font-medium text-sm backdrop-blur-sm border border-white/20 transition-all"
                        >
                            <Eye className="w-4 h-4" />
                            <span>View Live Website</span>
                            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                        </Link>
                    </div>
                </div>

                {/* Decorative background shapes */}
                <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                <div className="absolute right-40 -top-10 w-48 h-48 rounded-full bg-yellow-400/10 blur-2xl pointer-events-none" />
            </div>

            {/* 2. Visual Stat Cards */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                        <span>Website Overview</span>
                        <span className="text-xs font-normal text-gray-500">(Live figures from your portal)</span>
                    </h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                    {/* Total Projects */}
                    <Link href="/admin/projects" className="group bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-2xs hover:shadow-md hover:border-[#139D46]/40 transition-all">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-gray-500">Total Projects</span>
                            <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-[#139D46]/10 text-gray-600 group-hover:text-[#139D46] flex items-center justify-center transition-colors">
                                <Building2 className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">{totalProjectsResult.count}</div>
                        <p className="text-[11px] text-gray-500 mt-1">All listed properties</p>
                    </Link>

                    {/* Published */}
                    <Link href="/admin/projects" className="group bg-white p-4 sm:p-5 rounded-2xl border border-emerald-100 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-emerald-700">Live on Site</span>
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-extrabold text-[#139D46]">{publishedProjectsResult.count}</div>
                        <p className="text-[11px] text-emerald-600 mt-1">Visible to visitors</p>
                    </Link>

                    {/* Featured */}
                    <Link href="/admin/projects" className="group bg-white p-4 sm:p-5 rounded-2xl border border-amber-100 shadow-2xs hover:shadow-md hover:border-amber-300 transition-all">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-amber-700">Featured</span>
                            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                                <Star className="w-4 h-4 fill-amber-500" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-extrabold text-amber-600">{featuredProjectsResult.count}</div>
                        <p className="text-[11px] text-amber-600 mt-1">Highlighted on home</p>
                    </Link>

                    {/* Coming Soon */}
                    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-2xs">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-gray-500">Coming Soon</span>
                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                <Clock className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">{comingSoonTotal}</div>
                        <p className="text-[11px] text-gray-500 mt-1">Upcoming launches</p>
                    </div>

                    {/* Hero Slides */}
                    <Link href="/admin/hero-slider" className="group bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-2xs hover:shadow-md hover:border-purple-300 transition-all">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-gray-500">Hero Slides</span>
                            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                                <FileImage className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">{totalHeroSlides.count}</div>
                        <p className="text-[11px] text-gray-500 mt-1">Total banners</p>
                    </Link>

                    {/* Active Slides */}
                    <Link href="/admin/hero-slider" className="group bg-white p-4 sm:p-5 rounded-2xl border border-emerald-100 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-emerald-700">Active Slides</span>
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <Sparkles className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-extrabold text-[#139D46]">{activeHeroSlides.count}</div>
                        <p className="text-[11px] text-emerald-600 mt-1">Currently displaying</p>
                    </Link>
                </div>
            </div>

            {/* 3. Super Simple Quick Actions Grid */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                        <span>Quick Actions</span>
                        <span className="text-xs font-normal text-gray-500">(What would you like to do?)</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Action 1: Add Project */}
                    <Link 
                        href="/admin/projects/new"
                        className="group relative p-5 bg-gradient-to-br from-white to-emerald-50/40 rounded-2xl border border-emerald-200/80 shadow-2xs hover:shadow-md hover:border-[#139D46] transition-all flex flex-col justify-between"
                    >
                        <div>
                            <div className="w-12 h-12 rounded-xl bg-[#139D46] text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform mb-3">
                                <Plus className="w-6 h-6 stroke-[2.5]" />
                            </div>
                            <h3 className="text-base font-bold text-gray-900 group-hover:text-[#139D46] transition-colors">
                                Add New Project
                            </h3>
                            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                                Upload a new residential or commercial property with photos, pricing, and MahaRERA details.
                            </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-emerald-100 flex items-center justify-between text-xs font-semibold text-[#139D46]">
                            <span>Get Started</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </Link>

                    {/* Action 2: Manage Projects */}
                    <Link 
                        href="/admin/projects"
                        className="group relative p-5 bg-white rounded-2xl border border-gray-200/80 shadow-2xs hover:shadow-md hover:border-gray-300 transition-all flex flex-col justify-between"
                    >
                        <div>
                            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform mb-3">
                                <Building2 className="w-6 h-6" />
                            </div>
                            <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                View All Projects
                            </h3>
                            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                                Browse all listed plots, edit details, update prices, or mark properties as Available or Sold Out.
                            </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-blue-600">
                            <span>Open Listings</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </Link>

                    {/* Action 3: Hero Slider */}
                    <Link 
                        href="/admin/hero-slider"
                        className="group relative p-5 bg-white rounded-2xl border border-gray-200/80 shadow-2xs hover:shadow-md hover:border-gray-300 transition-all flex flex-col justify-between"
                    >
                        <div>
                            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform mb-3">
                                <FileImage className="w-6 h-6" />
                            </div>
                            <h3 className="text-base font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                                Homepage Slider Banners
                            </h3>
                            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                                Update the top sliding banners on the homepage, including promotional images and headlines.
                            </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-purple-600">
                            <span>Manage Banners</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </Link>

                    {/* Action 4: Settings */}
                    <Link 
                        href="/admin/settings"
                        className="group relative p-5 bg-white rounded-2xl border border-gray-200/80 shadow-2xs hover:shadow-md hover:border-gray-300 transition-all flex flex-col justify-between"
                    >
                        <div>
                            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform mb-3">
                                <Settings className="w-6 h-6" />
                            </div>
                            <h3 className="text-base font-bold text-gray-900 group-hover:text-amber-600 transition-colors">
                                Contact & RERA Settings
                            </h3>
                            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                                Update the official calling number, WhatsApp enquiry line, office address, and MahaRERA number.
                            </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-amber-600">
                            <span>Edit Settings</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </Link>
                </div>
            </div>

            {/* 4. Main Two Column Section: Projects Table + Quick Details Card */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* Left 2 Cols: Recent Projects Table */}
                <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 bg-gray-50/50">
                        <div>
                            <h2 className="text-base font-bold text-gray-900">
                                Recent Projects
                            </h2>
                            <p className="text-xs text-gray-500">
                                Latest property listings added to your portal
                            </p>
                        </div>
                        <Link 
                            href="/admin/projects" 
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#139D46] hover:text-[#0f823a] bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 transition-colors"
                        >
                            <span>View All ({totalProjectsResult.count})</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-left">
                            <thead className="bg-gray-50 text-gray-500 text-[11px] uppercase tracking-wider font-semibold">
                                <tr>
                                    <th className="px-5 py-3">Photo</th>
                                    <th className="px-5 py-3">Project Name</th>
                                    <th className="px-5 py-3">Status</th>
                                    <th className="px-5 py-3 text-center">Featured</th>
                                    <th className="px-5 py-3 text-center">Live?</th>
                                    <th className="px-5 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white text-sm">
                                {recentProjectsList.map((p) => (
                                    <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                                        {/* Cover Image */}
                                        <td className="px-5 py-3.5 whitespace-nowrap">
                                            <div className="w-12 h-12 relative rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shadow-2xs">
                                                <Image 
                                                    src={p.coverImageUrl || '/placeholder.jpg'} 
                                                    alt={p.name} 
                                                    fill 
                                                    className="object-cover" 
                                                    sizes="48px" 
                                                />
                                            </div>
                                        </td>

                                        {/* Project Name & Location */}
                                        <td className="px-5 py-3.5 whitespace-nowrap">
                                            <div className="font-bold text-gray-900">{p.name}</div>
                                            <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                                                <span>📍 {p.location || 'Nagpur'}</span>
                                                {p.pricePerSqft && (
                                                    <span className="text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
                                                        {p.pricePerSqft}/sq.ft
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="px-5 py-3.5 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                p.status === 'available' 
                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                                    : p.status === 'sold_out' 
                                                    ? 'bg-red-50 text-red-700 border border-red-200' 
                                                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                                            }`}>
                                                {p.status === 'available' ? '🟢 Available' : p.status === 'sold_out' ? '🔴 Sold Out' : '⏳ Coming Soon'}
                                            </span>
                                        </td>

                                        {/* Featured */}
                                        <td className="px-5 py-3.5 whitespace-nowrap text-center">
                                            {p.isFeatured ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                                    ★ YES
                                                </span>
                                            ) : (
                                                <span className="text-xs text-gray-400">—</span>
                                            )}
                                        </td>

                                        {/* Published */}
                                        <td className="px-5 py-3.5 whitespace-nowrap text-center">
                                            {p.published ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    ✓ Live
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-600">
                                                    Draft
                                                </span>
                                            )}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-5 py-3.5 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link 
                                                    href={`/admin/projects/${p.id}/edit`} 
                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-[#139D46] hover:text-white transition-colors"
                                                    title="Edit Property"
                                                >
                                                    <Pencil className="w-3.5 h-3.5" />
                                                    <span>Edit</span>
                                                </Link>

                                                {p.published && (
                                                    <Link 
                                                        href={`/projects/${p.slug}`} 
                                                        target="_blank" 
                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                                                        title="View on Live Website"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                        <span>View</span>
                                                    </Link>
                                                )}

                                                <DeleteProjectButton id={p.id} name={p.name} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {recentProjectsList.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center">
                                            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                            <p className="text-sm font-semibold text-gray-700">No projects added yet</p>
                                            <p className="text-xs text-gray-500 mt-1 mb-4">Add your first property to show it on the website</p>
                                            <Link 
                                                href="/admin/projects/new"
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-[#139D46] text-white text-xs font-bold rounded-lg shadow-sm hover:bg-[#0f823a]"
                                            >
                                                <Plus className="w-4 h-4" />
                                                <span>Add First Project</span>
                                            </Link>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right 1 Col: Quick Website Information & 3-Step Guide */}
                <div className="space-y-6">
                    {/* Live Contact & RERA Card */}
                    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs p-6 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <h2 className="text-base font-bold text-gray-900">
                                Live Contact & RERA
                            </h2>
                            <Link 
                                href="/admin/settings"
                                className="text-xs font-semibold text-[#139D46] hover:underline"
                            >
                                Edit Settings
                            </Link>
                        </div>

                        <div className="space-y-3.5 text-xs">
                            <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
                                <span className="text-gray-500 font-medium block text-[10px] uppercase tracking-wider">
                                    WhatsApp Enquiry Number
                                </span>
                                <div className="flex items-center justify-between mt-1">
                                    <span className="font-bold text-sm text-[#139D46]">
                                        {settings?.whatsapp || '+91 93256 50256'}
                                    </span>
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                </div>
                            </div>

                            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                                <span className="text-gray-500 font-medium block text-[10px] uppercase tracking-wider">
                                    MahaRERA Registration No.
                                </span>
                                <span className="font-bold text-sm text-gray-900 block mt-1">
                                    {settings?.mahaReraNumber || 'A50500037507'}
                                </span>
                            </div>

                            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                                <span className="text-gray-500 font-medium block text-[10px] uppercase tracking-wider">
                                    Call Phone Number
                                </span>
                                <span className="font-bold text-sm text-gray-900 block mt-1">
                                    {settings?.phone || '+91 93256 50256'}
                                </span>
                            </div>
                        </div>

                        <Link 
                            href="/admin/settings"
                            className="block w-full py-2.5 bg-gray-100 hover:bg-[#139D46] hover:text-white text-gray-700 font-bold text-xs text-center rounded-xl transition-colors"
                        >
                            ⚙️ Manage All Contact Settings
                        </Link>
                    </div>

                    {/* Super Easy 3-Step Guide */}
                    <div className="bg-gradient-to-br from-amber-50/80 via-white to-amber-50/30 rounded-2xl border border-amber-200/80 p-5 shadow-2xs">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-xs">
                                💡
                            </div>
                            <h3 className="text-sm font-bold text-gray-900">
                                Simple 3-Step Guide
                            </h3>
                        </div>

                        <ol className="space-y-3 text-xs text-gray-700">
                            <li className="flex items-start gap-2.5">
                                <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center shrink-0 text-[11px]">
                                    1
                                </span>
                                <span>
                                    <strong>Add Property:</strong> Click <em>"Add New Project"</em> above and enter the title, photos, and price.
                                </span>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center shrink-0 text-[11px]">
                                    2
                                </span>
                                <span>
                                    <strong>Make It Live:</strong> Set the <em>"Published"</em> toggle to YES in the form.
                                </span>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center shrink-0 text-[11px]">
                                    3
                                </span>
                                <span>
                                    <strong>Save & Done:</strong> Your property will instantly appear live on the Hey Investor website!
                                </span>
                            </li>
                        </ol>
                    </div>

                </div>

            </div>

        </div>
    );
}
