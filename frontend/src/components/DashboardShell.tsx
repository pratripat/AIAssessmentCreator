'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { Menu } from 'lucide-react';

export default function DashboardShell({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <>
            {/* Main Outer Canvas Container */}
            <div className="flex h-screen w-screen overflow-hidden bg-[#FAFAFA] dark:bg-[#0F0F0F] transition-colors duration-200">

                {/* Sidebar Component */}
                <Sidebar
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                />

                {/* Inner Application Content Card Area */}
                <div className="flex flex-1 flex-col min-w-0 h-full bg-white dark:bg-[#141414] md:rounded-l-3xl md:border-l md:border-[#ECECEC] md:dark:border-[#2a2a2a] md:my-2 md:mr-2 shadow-sm overflow-hidden transition-colors duration-200">

                    {/* Mobile Header Bar */}
                    <header className="flex h-16 shrink-0 items-center border-b border-[#ECECEC] dark:border-[#2a2a2a] bg-[#FAFAFA] dark:bg-[#141414] px-4 md:hidden">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 -ml-2 rounded-lg text-[#7B7B7B] hover:bg-gray-100 dark:hover:bg-[#1f1f1f]"
                        >
                            <Menu size={22} />
                        </button>

                        <div className="ml-3 flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#F97316] to-[#EA580C] shadow-sm">
                                <span className="text-xs font-bold text-white">V</span>
                            </div>

                            <span className="text-[18px] font-semibold tracking-[-0.02em] text-[#181818] dark:text-white">
                                VedaAI
                            </span>
                        </div>
                    </header>

                    {/* Content Body Viewport Canvas */}
                    <main className="flex-1 overflow-y-auto bg-white dark:bg-[#141414] p-4 md:p-8">
                        {children}
                    </main>
                </div>
            </div>
        </>
    );
}