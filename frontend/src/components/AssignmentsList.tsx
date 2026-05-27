'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, MoreVertical, Trash2, Eye } from 'lucide-react';
import { deleteAssignment } from '@/lib/api';
import { Assignment } from '@/types';

export default function AssignmentsList({
    initialAssignments,
    onDelete,
}: {
    initialAssignments: Assignment[];
    onDelete: (id: string) => void;
}) {
    const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);
    const [search, setSearch] = useState('');
    const [openMenu, setOpenMenu] = useState<string | null>(null);

    // sync if parent re-fetches
    useEffect(() => {
        setAssignments(initialAssignments);
    }, [initialAssignments]);

    const handleDelete = async (id: string) => {
        await deleteAssignment(id);
        onDelete(id);
        setOpenMenu(null);
    };

    const filtered = assignments.filter((a) =>
        a.title.toLowerCase().includes(search.toLowerCase())
    );

    const statusColor = (status: Assignment['status']) => {
        if (status === 'completed') return 'bg-green-100 text-green-700';
        if (status === 'processing') return 'bg-yellow-100 text-yellow-700';
        if (status === 'failed') return 'bg-red-100 text-red-700';
        return 'bg-gray-100 text-gray-600';
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-xl font-semibold text-gray-900">Assignments</h1>
                <p className="text-sm text-gray-500">
                    Manage and create assignments for your classes
                </p>
            </div>

            {assignments.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                        <FileIcon />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">No assignments yet</h2>
                    <p className="text-sm text-gray-500 text-center max-w-sm">
                        Create your first assignment to start collecting and grading student
                        submissions.
                    </p>
                    <Link
                        href="/assignments/create"
                        className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-full text-sm font-medium hover:bg-gray-700 transition-colors"
                    >
                        <Plus size={16} />
                        Create Your First Assignment
                    </Link>
                </div>
            ) : (
                <>
                    <div className="flex items-center gap-3 mb-5">
                        <div className="relative flex-1 max-w-sm">
                            <Search
                                size={15}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                                type="text"
                                placeholder="Search Assignment"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map((assignment) => (
                            <div
                                key={assignment._id}
                                className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow"
                            >
                                {/* Card header — title + menu in same row */}
                                <div className="flex items-start justify-between mb-3">
                                    <h3 className="font-medium text-gray-900 text-sm leading-snug pr-2">
                                        {assignment.title}
                                    </h3>

                                    {/* Menu wrapper — relative here so dropdown is positioned correctly */}
                                    <div className="relative shrink-0">
                                        <button
                                            onClick={() =>
                                                setOpenMenu(
                                                    openMenu === assignment._id ? null : assignment._id
                                                )
                                            }
                                            className="text-gray-400 hover:text-gray-600 p-0.5"
                                        >
                                            <MoreVertical size={16} />
                                        </button>

                                        {openMenu === assignment._id && (
                                            <div className="absolute right-0 top-7 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden w-44">
                                                <Link
                                                    href={`/papers/${assignment._id}`}
                                                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 w-full"
                                                    onClick={() => setOpenMenu(null)}
                                                >
                                                    <Eye size={14} />
                                                    View Assignment
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(assignment._id)}
                                                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full"
                                                >
                                                    <Trash2 size={14} />
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Status badge */}
                                <span
                                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(assignment.status)}`}
                                >
                                    {assignment.status}
                                </span>

                                {/* Footer */}
                                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                                    <span>
                                        Assigned on:{' '}
                                        {new Date(assignment.createdAt)
                                            .toLocaleDateString('en-GB')
                                            .replace(/\//g, '-')}
                                    </span>
                                    <span>
                                        Due:{' '}
                                        {new Date(assignment.dueDate)
                                            .toLocaleDateString('en-GB')
                                            .replace(/\//g, '-')}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="fixed bottom-6 left-1/2 -translate-x-1/2">
                        <Link
                            href="/assignments/create"
                            className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-full text-sm font-medium shadow-lg hover:bg-gray-700 transition-colors"
                        >
                            <Plus size={16} />
                            Create Assignment
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
}

const FileIcon = () => (
    <svg
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#9ca3af"
        strokeWidth="1.5"
    >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
    </svg>
);