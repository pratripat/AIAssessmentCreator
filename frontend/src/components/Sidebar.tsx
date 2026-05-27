'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home,
    Users,
    FileText,
    Wrench,
    Library,
    Settings,
    Plus,
} from 'lucide-react';

const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'My Groups', href: '/groups', icon: Users },
    { label: 'Assignments', href: '/assignments', icon: FileText },
    { label: "AI Teacher's Toolkit", href: '/toolkit', icon: Wrench },
    { label: 'My Library', href: '/library', icon: Library },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-56 h-screen bg-white border-r border-gray-200 flex flex-col shrink-0">
            {/* Logo */}
            <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs font-bold">V</span>
                    </div>
                    <span className="font-bold text-gray-900 text-lg">VedaAI</span>
                </div>
            </div>

            {/* Create Button */}
            <div className="p-3">
                <Link
                    href="/assignments/create"
                    className="flex items-center gap-2 w-full bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium px-3 py-2.5 rounded-full transition-colors"
                >
                    <Plus size={16} />
                    Create Assignment
                </Link>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-2 py-2 space-y-0.5">
                {navItems.map(({ label, href, icon: Icon }) => {
                    const active = pathname === href;
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${active
                                ? 'bg-gray-100 text-gray-900 font-medium'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <Icon size={17} />
                            {label}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom */}
            <div className="p-3 border-t border-gray-100 space-y-2">
                <Link
                    href="/settings"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                >
                    <Settings size={17} />
                    Settings
                </Link>
                <div className="flex items-center gap-3 px-3 py-2">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                        <span className="text-orange-600 text-xs font-bold">D</span>
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">Delhi Public School</p>
                        <p className="text-xs text-gray-500 truncate">Bokaro Steel City</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}