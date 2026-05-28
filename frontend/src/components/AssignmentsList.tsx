'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    Plus,
    Search,
    MoreVertical,
    Trash2,
    Eye,
    SlidersHorizontal,
} from 'lucide-react';
import { deleteAssignment } from '@/lib/api';
import { Assignment } from '@/types';

export default function AssignmentsList({
    initialAssignments,
    onDelete,
}: {
    initialAssignments: Assignment[];
    onDelete: (id: string) => void;
}) {
    const [assignments, setAssignments] =
        useState<Assignment[]>(initialAssignments);

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

    return (
        <div className="min-h-screen bg-[#F7F7F8] dark:bg-[#0F0F0F] px-5 py-6 md:px-7 font-['Inter'] transition-colors duration-200">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-[#111111] dark:text-white">
                    Assignments
                </h1>

                <p className="mt-1 text-[14px] font-medium text-[#9A9A9A] dark:text-zinc-400">
                    Manage and create assignments for your classes
                </p>
            </div>

            {assignments.length === 0 ? (
                <div className="flex h-[70vh] items-center justify-center">
                    <div className="rounded-[32px] border border-[#ECECEC] dark:border-[#2a2a2a] bg-white dark:bg-[#141414] px-12 py-16 shadow-sm">
                        <div className="flex flex-col items-center">
                            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#F3F3F3] dark:bg-[#1f1f1f]">
                                <FileIcon />
                            </div>

                            <h2 className="text-[22px] font-semibold text-[#1A1A1A] dark:text-white">
                                No assignments yet
                            </h2>

                            <p className="mt-3 max-w-[340px] text-center text-sm leading-6 text-[#8A8A8A] dark:text-zinc-400">
                                Create your first assignment to start collecting
                                and grading student submissions.
                            </p>

                            <Link
                                href="/assignments/create"
                                className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#111111] dark:bg-white dark:text-[#111111] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
                            >
                                <Plus size={16} />
                                Create Your First Assignment
                            </Link>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {/* Search + Filter */}
                    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <button className="flex h-[46px] w-[130px] items-center justify-center gap-2 rounded-[16px] border border-[#E8E8E8] dark:border-[#2a2a2a] bg-white dark:bg-[#141414] text-[14px] font-medium text-[#4B4B4B] dark:text-[#aaa] shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                            <SlidersHorizontal size={16} />
                            Filter By
                        </button>

                        <div className="relative w-full sm:max-w-[340px]">
                            <Search
                                size={16}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A0A0A0] dark:text-zinc-500"
                            />

                            <input
                                type="text"
                                placeholder="Search Assignment"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-[48px] w-full rounded-full border border-[#E7E7E7] dark:border-[#2a2a2a] bg-white dark:bg-[#141414] pl-11 pr-4 text-[14px] font-medium text-black dark:text-white placeholder:text-[#A8A8A8] outline-none transition focus:border-[#D8D8D8] dark:focus:border-zinc-700"
                            />
                        </div>
                    </div>

                    {/* Cards */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-2">
                        {filtered.map((assignment) => (
                            <div
                                key={assignment._id}
                                className="group relative rounded-[24px] border border-[#ECECEC] dark:border-[#2a2a2a] bg-white dark:bg-[#141414] shadow-[0_2px_8px_rgba(0,0,0,0.03)] transition hover:shadow-[0_6px_18px_rgba(0,0,0,0.06)]"
                            >
                                {/* The Entire Main Card Clickable Link wrapper */}
                                <Link
                                    href={`/papers/${assignment._id}`}
                                    className="block px-5 py-5 w-full h-full"
                                >
                                    {/* Header Layout inside link */}
                                    <div className="flex items-start justify-between">
                                        <h3 className="pr-10 text-[22px] font-semibold tracking-[-0.02em] leading-snug text-[#202020] dark:text-white group-hover:text-[#EA580C] transition-colors">
                                            {assignment.title}
                                        </h3>
                                    </div>

                                    {/* Footer Layout inside link */}
                                    <div className="mt-10 flex items-center justify-between text-[13px] font-medium">
                                        <div className="text-[#777] dark:text-zinc-400">
                                            <span className="font-semibold text-black dark:text-white">
                                                Assigned on:
                                            </span>{' '}
                                            {new Date(assignment.createdAt)
                                                .toLocaleDateString('en-GB')
                                                .replace(/\//g, '-')}
                                        </div>

                                        <div className="text-[#777] dark:text-zinc-400">
                                            <span className="font-semibold text-black dark:text-white">
                                                Due:
                                            </span>{' '}
                                            {new Date(assignment.dueDate)
                                                .toLocaleDateString('en-GB')
                                                .replace(/\//g, '-')}
                                        </div>
                                    </div>
                                </Link>

                                {/* Action Dropdown Menu Container */}
                                <div className="absolute right-5 top-5 z-20 shrink-0">
                                    <button
                                        onClick={() =>
                                            setOpenMenu(
                                                openMenu === assignment._id
                                                    ? null
                                                    : assignment._id
                                            )
                                        }
                                        className="rounded-full p-1 text-[#7C7C7C] hover:bg-[#F5F5F5] dark:hover:bg-[#1f1f1f]"
                                    >
                                        <MoreVertical size={18} />
                                    </button>

                                    {openMenu === assignment._id && (
                                        <div className="absolute right-0 top-9 z-30 w-44 overflow-hidden rounded-2xl border border-[#ECECEC] dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a] shadow-xl">
                                            <Link
                                                href={`/papers/${assignment._id}`}
                                                className="flex items-center gap-2 px-4 py-3 text-sm text-[#333] dark:text-[#ccc] hover:bg-[#F7F7F7] dark:hover:bg-[#222]"
                                                onClick={() => setOpenMenu(null)}
                                            >
                                                <Eye size={15} />
                                                View Assignment
                                            </Link>

                                            <button
                                                onClick={() => handleDelete(assignment._id)}
                                                className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-[#E5484D] hover:bg-[#FFF3F3] dark:hover:bg-[#2a1515]"
                                            >
                                                <Trash2 size={15} />
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Floating button */}
                    <div className="fixed bottom-7 left-[calc(90px+50%)] z-40 -translate-x-1/3">
                        <Link
                            href="/assignments/create"
                            className="flex items-center gap-2 rounded-full bg-[#111111] dark:bg-white dark:text-[#111111] px-6 py-3 text-[14px] font-medium text-white shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition hover:scale-[1.02]"
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
        width="42"
        height="42"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#9CA3AF"
        strokeWidth="1.5"
    >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
    </svg>
);