'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
    ShieldCheck, Trophy, BarChart2, LogOut, Menu, X,
    TrendingUp, Users, Zap, Settings2
} from 'lucide-react';

const NAV_ITEMS = [
    { icon: BarChart2, label: 'Dashboard', href: '/admin' },
    { icon: Trophy, label: 'Concursos', href: '/admin/rounds' },
    { icon: Users, label: 'Usuários', href: '/admin/users' },
    { icon: Zap, label: 'Saques', href: '/admin/withdrawals' },
    { icon: TrendingUp, label: 'Relatórios', href: '/admin/stats' },
    { icon: Settings2, label: 'Gateways', href: '/admin/gateways' },
];

function AdminSidebar({ mobile = false, onClose }: { mobile?: boolean; onClose?: () => void }) {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem('@PalpitaAi:token');
        localStorage.removeItem('@PalpitaAi:user');
        router.replace('/admin/login');
    };

    return (
        <aside className={`flex flex-col h-full ${mobile ? 'w-full' : 'w-64'}`}
            style={{ background: 'linear-gradient(180deg, #070700 0%, #0a0f05 60%, #000 100%)', borderRight: '1px solid rgba(245,158,11,0.1)' }}>
            {/* Logo */}
            <div className="p-5 border-b" style={{ borderColor: 'rgba(245,158,11,0.1)' }}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2" style={{ background: '#f59e0b14', border: '1px solid rgba(245,158,11,0.25)' }}>
                            <ShieldCheck className="w-5 h-5 text-[#f59e0b]" />
                        </div>
                        <div>
                            <p className="font-display font-black text-sm text-[#f0fdf4] leading-none">PALPITA AÍ</p>
                            <p className="text-[9px] font-bold tracking-[0.2em] text-[#f59e0b] mt-0.5">ADMIN PANEL</p>
                        </div>
                    </div>
                    {mobile && onClose && (
                        <button onClick={onClose} className="text-[#f0fdf4]/30 hover:text-[#f0fdf4]">
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
                <p className="text-[9px] font-bold tracking-[0.2em] text-[#f0fdf4]/20 px-3 py-2 mt-2">NAVEGAÇÃO</p>
                {NAV_ITEMS.map(item => {
                    const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                    return (
                        <Link key={item.href} href={item.href}
                            onClick={onClose}
                            className={`flex items-center gap-3 px-3 py-2.5 transition-all duration-150 group ${active
                                ? 'text-[#f59e0b]'
                                : 'text-[#f0fdf4]/30 hover:text-[#f0fdf4]/70'
                                }`}
                            style={active ? { background: 'rgba(245,158,11,0.08)', borderLeft: '2px solid #f59e0b' } : { borderLeft: '2px solid transparent' }}>
                            <item.icon className="w-4 h-4 shrink-0" />
                            <span className="font-display font-bold text-sm tracking-tight">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-3 border-t" style={{ borderColor: 'rgba(245,158,11,0.1)' }}>
                <Link href="/" className="flex items-center gap-2.5 px-3 py-2 text-xs text-[#f0fdf4]/20 hover:text-[#f0fdf4]/50 transition-colors mb-1">
                    <Zap className="w-3.5 h-3.5" />
                    <span className="font-medium">Ver site (usuários)</span>
                </Link>
                <button onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-400/50 hover:text-red-400 hover:bg-red-900/10 transition-all">
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="font-bold tracking-wide">SAIR DO PAINEL</span>
                </button>
            </div>
        </aside>
    );
}

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);
    const [mobileOpen, setMobileOpen] = useState(false);

    // Skip auth check on the login page itself
    const isLoginPage = pathname === '/admin/login';

    useEffect(() => {
        if (isLoginPage) return;

        const token = localStorage.getItem('@PalpitaAi:token');
        const storedUser = localStorage.getItem('@PalpitaAi:user');

        if (!token || !storedUser) {
            router.replace('/admin/login');
            return;
        }
        try {
            const parsed = JSON.parse(storedUser);
            if (parsed.role !== 'ADMIN') {
                router.replace('/admin/login');
                return;
            }
            setUser(parsed);
        } catch {
            router.replace('/admin/login');
        }
    }, [pathname, isLoginPage, router]);

    // Login page: render without admin chrome
    if (isLoginPage) {
        return <>{children}</>;
    }

    // Loading guard
    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center"
                style={{ background: '#000' }}>
                <div className="w-8 h-8 border-2 border-[#f59e0b]/20 border-t-[#f59e0b] animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex" style={{ background: '#050505', color: '#f0fdf4' }}>
            {/* Desktop sidebar */}
            <div className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-64 z-30">
                <AdminSidebar />
            </div>

            {/* Mobile sidebar overlay */}
            {mobileOpen && (
                <div className="lg:hidden fixed inset-0 z-50 flex">
                    <div className="fixed inset-0 bg-black/70" onClick={() => setMobileOpen(false)} />
                    <div className="relative w-64 h-full z-10">
                        <AdminSidebar mobile onClose={() => setMobileOpen(false)} />
                    </div>
                </div>
            )}

            {/* Main area */}
            <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
                {/* Top bar */}
                <header className="sticky top-0 z-20 flex items-center justify-between px-5 py-3 border-b"
                    style={{ background: 'rgba(5,5,5,0.95)', borderColor: 'rgba(245,158,11,0.1)', backdropFilter: 'blur(8px)' }}>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setMobileOpen(true)} className="lg:hidden text-[#f0fdf4]/40 hover:text-[#f0fdf4]">
                            <Menu className="w-5 h-5" />
                        </button>
                        <div className="hidden lg:flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] animate-pulse" />
                            <span className="text-[10px] font-bold tracking-[0.15em] text-[#f59e0b]/70 uppercase">Sistema ao vivo</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-[10px] font-bold tracking-widest text-[#f0fdf4]/25 uppercase">Logado como</p>
                            <p className="text-xs font-display font-bold text-[#f59e0b]">{user.name}</p>
                        </div>
                        <div className="w-8 h-8 flex items-center justify-center border border-[#f59e0b]/25"
                            style={{ background: '#f59e0b12' }}>
                            <ShieldCheck className="w-4 h-4 text-[#f59e0b]" />
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 p-5 sm:p-7 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
