'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
    Plus, 
    Search, 
    Pencil, 
    Eye, 
    Building2, 
    X
} from 'lucide-react';
import { DeleteProjectButton } from '@/app/admin/(dashboard)/projects/DeleteProjectButton';

interface ProjectItem {
    id: string;
    name: string;
    slug: string;
    location: string | null;
    pricePerSqft: string | null;
    status: string;
    isFeatured: boolean | null;
    published: boolean | null;
    displayOrder: number | null;
    coverImageUrl: string | null;
    reraNumber: string | null;
}

export default function ProjectsManager({ projects }: { projects: ProjectItem[] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'published' | 'draft' | 'featured' | 'available'>('all');

    const filteredProjects = useMemo(() => {
        return projects.filter((p) => {
            // Tab filter
            if (activeTab === 'published' && !p.published) return false;
            if (activeTab === 'draft' && p.published) return false;
            if (activeTab === 'featured' && !p.isFeatured) return false;
            if (activeTab === 'available' && p.status !== 'available') return false;

            // Search query filter
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                const matchName = p.name.toLowerCase().includes(query);
                const matchLoc = p.location?.toLowerCase().includes(query);
                const matchRera = p.reraNumber?.toLowerCase().includes(query);
                return matchName || matchLoc || matchRera;
            }

            return true;
        });
    }, [projects, searchQuery, activeTab]);

    return (
        <div className="space-y-6">
            {/* Header: Title & Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                        Properties & Projects
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                        Manage all plotted developments, pricing, and live website visibility.
                    </p>
                </div>

                <Link 
                    href="/admin/projects/new" 
                    className="inline-flex items-center justify-center gap-2 bg-[#139D46] hover:bg-[#0f823a] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:shadow transition-all shrink-0"
                >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Add New Project</span>
                </Link>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs space-y-3">
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                    {/* Search Input */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input 
                            type="text" 
                            placeholder="Search by project name, location or RERA..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-9 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#139D46] focus:border-transparent transition-all"
                        />
                        {searchQuery && (
                            <button 
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs font-semibold">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                                activeTab === 'all' 
                                    ? 'bg-gray-900 text-white' 
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            All ({projects.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('published')}
                            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                                activeTab === 'published' 
                                    ? 'bg-[#139D46] text-white' 
                                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                            }`}
                        >
                            🟢 Live on Website ({projects.filter(p => p.published).length})
                        </button>
                        <button
                            onClick={() => setActiveTab('featured')}
                            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                                activeTab === 'featured' 
                                    ? 'bg-amber-600 text-white' 
                                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                            }`}
                        >
                            ⭐ Featured ({projects.filter(p => p.isFeatured).length})
                        </button>
                        <button
                            onClick={() => setActiveTab('draft')}
                            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                                activeTab === 'draft' 
                                    ? 'bg-gray-700 text-white' 
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            📝 Drafts ({projects.filter(p => !p.published).length})
                        </button>
                    </div>
                </div>
            </div>

            {/* Projects Table */}
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-left">
                        <thead className="bg-gray-50 text-gray-500 text-[11px] uppercase tracking-wider font-semibold">
                            <tr>
                                <th className="px-5 py-3.5">Cover</th>
                                <th className="px-5 py-3.5">Project Details</th>
                                <th className="px-5 py-3.5">Status</th>
                                <th className="px-5 py-3.5 text-center">Featured</th>
                                <th className="px-5 py-3.5 text-center">Live on Website?</th>
                                <th className="px-5 py-3.5 text-center">Sort Order</th>
                                <th className="px-5 py-3.5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white text-sm">
                            {filteredProjects.map((p) => (
                                <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                                    {/* Cover */}
                                    <td className="px-5 py-4 whitespace-nowrap">
                                        <div className="w-16 h-12 relative rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shadow-2xs">
                                            {p.coverImageUrl ? (
                                                <Image 
                                                    src={p.coverImageUrl} 
                                                    alt={p.name} 
                                                    fill 
                                                    className="object-cover" 
                                                    sizes="64px" 
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 font-medium">
                                                    No Photo
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    {/* Name & Info */}
                                    <td className="px-5 py-4 whitespace-nowrap">
                                        <div className="font-bold text-gray-900 text-base">{p.name}</div>
                                        <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                                            <span>📍 {p.location || 'Nagpur'}</span>
                                            {p.pricePerSqft && (
                                                <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                                                    {p.pricePerSqft}/sq.ft
                                                </span>
                                            )}
                                        </div>
                                        {/* Prominent RERA Highlight in Admin Table */}
                                        <div className="mt-1.5">
                                            {p.reraNumber ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                                                    🛡️ RERA: {p.reraNumber}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                                                    ⚠️ RERA Missing
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    {/* Status Badge */}
                                    <td className="px-5 py-4 whitespace-nowrap">
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
                                    <td className="px-5 py-4 whitespace-nowrap text-center">
                                        {p.isFeatured ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                                ★ YES
                                            </span>
                                        ) : (
                                            <span className="text-xs text-gray-400">—</span>
                                        )}
                                    </td>

                                    {/* Published */}
                                    <td className="px-5 py-4 whitespace-nowrap text-center">
                                        {p.published ? (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                ✓ Published (Live)
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                                                Hidden (Draft)
                                            </span>
                                        )}
                                    </td>

                                    {/* Display Order */}
                                    <td className="px-5 py-4 whitespace-nowrap text-center text-xs font-mono text-gray-500">
                                        #{p.displayOrder ?? 0}
                                    </td>

                                    {/* Actions */}
                                    <td className="px-5 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link 
                                                href={`/admin/projects/${p.id}/edit`} 
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-800 bg-gray-100 hover:bg-[#139D46] hover:text-white transition-colors"
                                                title="Edit Listing"
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                                <span>Edit</span>
                                            </Link>

                                            {p.published && (
                                                <Link 
                                                    href={`/projects/${p.slug}`} 
                                                    target="_blank" 
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
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

                            {filteredProjects.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-sm font-semibold text-gray-700">No projects found</p>
                                        <p className="text-xs text-gray-500 mt-1 mb-4">
                                            {searchQuery ? 'No listings matched your search query.' : 'There are currently no property listings.'}
                                        </p>
                                        {searchQuery && (
                                            <button 
                                                onClick={() => { setSearchQuery(''); setActiveTab('all'); }}
                                                className="px-3.5 py-1.5 text-xs font-bold text-[#139D46] bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                                            >
                                                Reset Filters
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
