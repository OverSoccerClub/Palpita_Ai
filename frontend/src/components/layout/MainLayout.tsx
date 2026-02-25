'use client';

import React from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';

function LayoutInner({ children }: { children: React.ReactNode }) {
    const { isCollapsed } = useSidebar();
    const sidebarW = isCollapsed ? 'lg:ml-16' : 'lg:ml-64';

    return (
        <div className="min-h-screen bg-[#020c06] stadium-light hex-pattern">
            {/* Background gradient overlay */}
            <div className="fixed inset-0 bg-gradient-to-b from-[#020c06]/60 via-[#020c06]/80 to-[#020c06] pointer-events-none z-0" />

            <div className="relative z-10">
                <Navbar />

                <div className="flex">
                    <Sidebar />

                    {/* Main content — shifts with sidebar, consistent padding */}
                    <main className={`flex-1 ${sidebarW} transition-[margin] duration-300 ease-in-out min-h-[calc(100vh-64px)] flex flex-col`}>
                        <div className="p-5 sm:p-7 lg:p-8 w-full flex-1">
                            {children}
                        </div>

                        {/* ── Footer ── */}
                        <footer className="border-t border-[#14532d]/30 px-5 sm:px-7 lg:px-8 py-3 flex items-center justify-between gap-4">
                            <p className="text-[9px] font-bold tracking-widest uppercase text-[#f0fdf4]/15">
                                VERSÃO&nbsp;
                                <span className="text-[#22c55e]/40">v0.1.0</span>
                                &nbsp;·&nbsp;© 2026 Palpita Aí
                            </p>

                            {/* Brand mark */}
                            <div className="flex items-center gap-1.5 select-none">
                                <span className="text-sm leading-none opacity-40">⚽</span>
                                <span className="font-display font-black text-[11px] tracking-tight text-[#f0fdf4]/20">
                                    PALPITA
                                </span>
                                <span className="font-display font-black text-[11px] tracking-tight" style={{ color: 'rgba(34,197,94,0.25)' }}>
                                    AÍ
                                </span>
                            </div>
                        </footer>
                    </main>
                </div>
            </div>
        </div>
    );
}

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <SidebarProvider>
        <LayoutInner>{children}</LayoutInner>
    </SidebarProvider>
);
