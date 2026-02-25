'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    BarChart2, Trophy, Wallet, History,
    LifeBuoy, Activity, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useSidebar } from '@/contexts/SidebarContext';
import { AnimatePresence, motion } from 'framer-motion';

const menuItems = [
    { icon: Activity, label: 'Dashboard', sub: 'Visão geral', href: '/dashboard' },
    { icon: Trophy, label: 'Concursos', sub: 'Jogos ativos', href: '/rounds' },
    { icon: BarChart2, label: 'Meus Palpites', sub: 'Histórico', href: '/bets' },
    { icon: Wallet, label: 'Carteira', sub: 'Saldo', href: '/wallet' },
    { icon: History, label: 'Extrato', sub: 'Transações', href: '/history' },
];

const EXPANDED_W = 'w-64';
const COLLAPSED_W = 'w-16';

/* ── Shared nav item ──────────────────────────── */
function NavItem({ item, collapsed, onClick }: { item: typeof menuItems[0]; collapsed: boolean; onClick?: () => void }) {
    const pathname = usePathname();
    const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

    return (
        <Link
            href={item.href}
            onClick={onClick}
            className={`flex items-center gap-3 px-3 py-3 transition-all duration-150 group relative ${active ? 'nav-active' : 'nav-inactive'}`}
            title={collapsed ? item.label : undefined}
        >
            <item.icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-[#22c55e]' : 'text-[#f0fdf4]/25 group-hover:text-[#f0fdf4]/70'}`} />
            {!collapsed && (
                <div className="min-w-0 overflow-hidden">
                    <p className="font-display font-bold text-sm tracking-tight leading-none truncate">{item.label}</p>
                    <p className="text-[10px] text-[#f0fdf4]/25 mt-0.5 truncate">{item.sub}</p>
                </div>
            )}
            {/* Tooltip when collapsed */}
            {collapsed && (
                <span className="absolute left-full ml-2 px-2.5 py-1 bg-[#0d2718] border border-[#14532d] text-xs font-bold text-[#f0fdf4]/80 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    {item.label}
                </span>
            )}
        </Link>
    );
}

/* ── Desktop Sidebar ──────────────────────────── */
function DesktopSidebar() {
    const { isCollapsed, toggleCollapse } = useSidebar();

    return (
        <aside
            className={`${isCollapsed ? COLLAPSED_W : EXPANDED_W} h-[calc(100vh-64px)] fixed left-0 top-16 border-r border-[#14532d] hidden lg:flex flex-col transition-[width] duration-300 ease-in-out overflow-hidden z-40`}
            style={{ background: 'linear-gradient(135deg, #000000 0%, #020c06 45%, #071a0d 100%)' }}
        >
            <div className="absolute inset-0 bg-gradient-to-b from-[#020c06] via-[#020c06]/95 to-[#020c06] pointer-events-none z-0" />

            <div className="relative z-10 flex flex-col h-full py-4">
                {/* Live badge */}
                {!isCollapsed && (
                    <div className="flex items-center gap-2 mb-6 mx-3 px-3 py-2 border border-[#22c55e]/20 bg-[#22c55e]/5">
                        <span className="w-2 h-2 flex-shrink-0 bg-[#22c55e] animate-pulse" />
                        <span className="score-label text-[#22c55e]">ARENA AO VIVO</span>
                    </div>
                )}
                {isCollapsed && <div className="mb-6 mt-1 flex justify-center"><span className="w-2 h-2 bg-[#22c55e] animate-pulse" /></div>}

                {/* Nav items */}
                <div className="space-y-0.5 flex-1 px-1">
                    {!isCollapsed && <p className="score-label px-3 mb-3">CAMPO</p>}
                    {menuItems.map(item => (
                        <NavItem key={item.href} item={item} collapsed={isCollapsed} />
                    ))}
                </div>

                {/* Footer */}
                <div className="border-t border-[#14532d] px-1 pt-3 space-y-1">
                    <Link
                        href="/support"
                        className="flex items-center gap-3 px-3 py-2 text-[#f0fdf4]/30 hover:text-[#f0fdf4]/70 hover:bg-[#071a0d] transition-all group"
                        title={isCollapsed ? 'Suporte' : undefined}
                    >
                        <LifeBuoy className="w-4 h-4 flex-shrink-0 group-hover:text-[#22c55e] transition-colors" />
                        {!isCollapsed && <span className="font-medium text-xs tracking-wide">Suporte</span>}
                    </Link>

                    {/* Collapse toggle */}
                    <button
                        onClick={toggleCollapse}
                        className="w-full flex items-center gap-3 px-3 py-2 text-[#f0fdf4]/20 hover:text-[#f0fdf4]/60 hover:bg-[#071a0d] transition-all group"
                        title={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
                    >
                        {isCollapsed
                            ? <ChevronRight className="w-4 h-4 flex-shrink-0" />
                            : <ChevronLeft className="w-4 h-4 flex-shrink-0" />
                        }
                        {!isCollapsed && <span className="font-medium text-[10px] tracking-widest uppercase">Recolher menu</span>}
                    </button>
                </div>
            </div>
        </aside>
    );
}

/* ── Mobile Drawer Sidebar ────────────────────── */
function MobileSidebar() {
    const { isOpen, close } = useSidebar();

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                        onClick={close}
                    />
                    {/* Drawer */}
                    <motion.aside
                        key="drawer"
                        initial={{ x: -280 }}
                        animate={{ x: 0 }}
                        exit={{ x: -280 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 35 }}
                        className="fixed left-0 top-0 bottom-0 w-64 z-50 lg:hidden flex flex-col border-r border-[#14532d]"
                        style={{ background: 'linear-gradient(135deg, #000000 0%, #020c06 45%, #071a0d 100%)' }}
                    >
                        {/* Drawer header */}
                        <div className="h-16 flex items-center px-5 border-b border-[#14532d] gap-3">
                            <span className="text-xl leading-none">⚽</span>
                            <span className="text-[20px] font-display font-black text-[#f0fdf4]">PALPITA</span>
                            <span className="text-[20px] font-display font-black" style={{ color: '#22c55e' }}> AÍ</span>
                        </div>

                        <div className="flex flex-col flex-1 p-4 overflow-y-auto">
                            {/* Live badge */}
                            <div className="flex items-center gap-2 mb-6 px-3 py-2 border border-[#22c55e]/20 bg-[#22c55e]/5">
                                <span className="w-2 h-2 bg-[#22c55e] animate-pulse" />
                                <span className="score-label text-[#22c55e]">ARENA AO VIVO</span>
                            </div>

                            {/* Nav items */}
                            <div className="space-y-0.5 flex-1">
                                <p className="score-label px-3 mb-3">CAMPO</p>
                                {menuItems.map(item => (
                                    <NavItem key={item.href} item={item} collapsed={false} onClick={close} />
                                ))}
                            </div>

                            {/* Footer */}
                            <div className="border-t border-[#14532d] pt-4 mt-4">
                                <Link
                                    href="/support"
                                    onClick={close}
                                    className="flex items-center gap-3 px-3 py-2 text-[#f0fdf4]/30 hover:text-[#f0fdf4]/70 hover:bg-[#071a0d] transition-all group"
                                >
                                    <LifeBuoy className="w-4 h-4 group-hover:text-[#22c55e] transition-colors" />
                                    <span className="font-medium text-xs tracking-wide">Suporte</span>
                                </Link>
                            </div>
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}

/* ── Export ───────────────────────────────────── */
export const Sidebar: React.FC = () => (
    <>
        <DesktopSidebar />
        <MobileSidebar />
    </>
);
