'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import {
    Home, Users, FileText, Wrench, Library,
    Settings, Plus, X, Sun, Moon, Monitor
} from 'lucide-react';

const navItems = [
    { label: 'Home', href: '/assignments', icon: Home },
    { label: 'My Groups', href: '/groups', icon: Users },
    { label: 'Assignments', href: '/assignments', icon: FileText },
    { label: "AI Teacher's Toolkit", href: '/toolkit', icon: Wrench },
    { label: 'My Library', href: '/library', icon: Library },
];

export default function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
    const pathname = usePathname();
    // 1. Destructure theme (what user chose) and resolvedTheme (what the engine is actually forcing)
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch by only rendering the toggle controls on the client
    useEffect(() => setMounted(true), []);

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
                    onClick={onClose}
                />
            )}

            <aside className={`
        fixed top-0 bottom-0 left-0 z-50 md:sticky h-screen w-[250px] shrink-0
        border-r border-[#ECECEC] dark:border-[#2a2a2a]
        bg-[#FAFAFA] dark:bg-[#141414]
        flex flex-col font-['Inter'] transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>

                {/* Logo */}
                <div className="px-6 pt-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#F97316] to-[#EA580C] shadow-sm">
                            <span className="text-sm font-bold text-white">V</span>
                        </div>
                        <span className="text-[24px] font-semibold tracking-[-0.03em] text-[#181818] dark:text-white">
                            VedaAI
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2a2a] md:hidden text-[#7B7B7B]"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Create Button */}
                <div className="px-5 pt-7">
                    <Link
                        href="/assignments/create"
                        onClick={onClose}
                        className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[#111111] dark:bg-white dark:text-[#111111] px-4 text-[14px] font-medium text-white shadow-[0_6px_18px_rgba(0,0,0,0.12)] transition hover:scale-[1.01]"
                    >
                        <Plus size={17} />
                        Create Assignment
                    </Link>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-4 pt-8 space-y-1.5">
                    {navItems.map(({ label, href, icon: Icon }) => {
                        const active = pathname === href;
                        return (
                            <Link
                                key={href + label}
                                href={href}
                                onClick={onClose}
                                className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-[14px] font-medium transition-all ${active
                                    ? 'bg-white dark:bg-[#2a2a2a] text-[#111111] dark:text-white shadow-sm border border-[#ECECEC] dark:border-[#333]'
                                    : 'text-[#7B7B7B] dark:text-[#888] hover:bg-white dark:hover:bg-[#1f1f1f] hover:text-[#111111] dark:hover:text-white'
                                    }`}
                            >
                                <Icon
                                    size={18}
                                    className={active ? 'text-[#111111] dark:text-white' : 'text-[#8D8D8D] group-hover:text-[#111111] dark:group-hover:text-white'}
                                />
                                <span>{label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Theme Toggle Container */}
                <div className="px-4 pb-2">
                    <div className="flex items-center justify-between bg-gray-100 dark:bg-[#1f1f1f] rounded-full p-1 min-h-[36px]">
                        {[
                            { value: 'light', icon: Sun, label: 'Light' },
                            { value: 'system', icon: Monitor, label: 'System' },
                            { value: 'dark', icon: Moon, label: 'Dark' },
                        ].map(({ value, icon: Icon, label }) => {
                            // 2. Fixed check: use `theme === value` so the exact button clicked lights up manually
                            const isActive = mounted && theme === value;

                            return (
                                <button
                                    key={value}
                                    onClick={() => setTheme(value)}
                                    title={label}
                                    className={`flex-1 flex items-center justify-center py-1.5 rounded-full transition-all ${isActive
                                        ? 'bg-white dark:bg-[#333] text-gray-900 dark:text-white shadow-sm font-medium'
                                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                                        }`}
                                >
                                    <Icon size={14} />
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Bottom */}
                <div className="px-4 pb-5">
                    <Link
                        href="/settings"
                        onClick={onClose}
                        className="flex items-center gap-3 rounded-xl px-4 py-3 text-[14px] font-medium text-[#7B7B7B] dark:text-[#888] transition hover:bg-white dark:hover:bg-[#1f1f1f] hover:text-[#111111] dark:hover:text-white"
                    >
                        <Settings size={18} />
                        Settings
                    </Link>

                    <div className="mt-3 rounded-2xl bg-white dark:bg-[#1f1f1f] border border-[#ECECEC] dark:border-[#2a2a2a] p-3 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FFF1E8]">
                                <span className="text-sm font-bold text-[#EA580C]">D</span>
                            </div>
                            <div className="min-w-0">
                                <p className="truncate text-[14px] font-semibold text-[#1B1B1B] dark:text-white">
                                    Delhi Public School
                                </p>
                                <p className="truncate text-[12px] text-[#8A8A8A]">
                                    Bokaro Steel City
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}