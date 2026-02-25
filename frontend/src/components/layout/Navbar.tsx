'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/contexts/SidebarContext';
import { LogOut, Bell, User as UserIcon, Wallet, Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
    const { user, logout } = useAuth();
    const { isOpen, toggle } = useSidebar();

    return (
        <nav
            className="sticky top-0 z-50 w-full h-16 border-b border-[#14532d] px-4 sm:px-5 flex items-center justify-between gap-3"
            style={{ background: 'linear-gradient(135deg, #000000 0%, #020c06 50%, #071a0d 100%)', backdropFilter: 'blur(12px)' }}
        >
            {/* Left: Hamburger + Brand */}
            <div className="flex items-center gap-3">
                {/* Hamburger — visible always, toggles mobile drawer on mobile / collapses on desktop */}
                <button
                    onClick={toggle}
                    className="p-2 border border-transparent hover:border-[#14532d] hover:bg-[#071a0d] transition-all group lg:hidden"
                    aria-label="Menu"
                >
                    {isOpen
                        ? <X className="w-5 h-5 text-[#f0fdf4]/60 group-hover:text-[#f0fdf4]/90 transition-colors" />
                        : <Menu className="w-5 h-5 text-[#f0fdf4]/60 group-hover:text-[#f0fdf4]/90 transition-colors" />
                    }
                </button>

                {/* Brand */}
                <div className="flex items-center gap-2.5">
                    <span className="text-xl leading-none select-none" aria-hidden="true">⚽</span>
                    <div className="leading-none">
                        <span className="text-[20px] sm:text-[22px] font-display font-black text-[#f0fdf4] tracking-tight">PALPITA</span>
                        <span className="text-[20px] sm:text-[22px] font-display font-black tracking-tight" style={{ color: '#22c55e' }}>
                            &nbsp;AÍ
                        </span>
                    </div>
                </div>
            </div>

            {/* Right: user actions */}
            {user ? (
                <div className="flex items-center gap-2">
                    {/* Balance badge — hidden on very small screens */}
                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 border border-[#14532d] bg-[#071a0d]">
                        <Wallet className="w-3.5 h-3.5 text-[#22c55e]" />
                        <span className="font-display font-bold text-[#22c55e] text-xs tabular-nums">
                            R$ {Number(user.wallet?.balance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                    </div>

                    {/* Bell */}
                    <button className="p-2 border border-transparent hover:border-[#14532d] hover:bg-[#071a0d] transition-all relative group">
                        <Bell className="w-4 h-4 text-[#f0fdf4]/40 group-hover:text-[#f0fdf4]/80" />
                        <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#22c55e]" />
                    </button>

                    {/* User chip */}
                    <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 border border-[#14532d] bg-[#071a0d] cursor-default">
                        <UserIcon className="w-3.5 h-3.5 text-[#22c55e]" />
                        <span className="text-xs font-medium text-[#f0fdf4]/80 tracking-tight hidden sm:block">
                            {(user.name || 'Usuário').split(' ')[0]}
                        </span>
                    </div>

                    {/* Logout */}
                    <button
                        onClick={logout}
                        className="p-2 border border-transparent hover:border-red-900/40 hover:bg-red-950/30 transition-all group"
                    >
                        <LogOut className="w-4 h-4 text-[#f0fdf4]/20 group-hover:text-red-400 transition-colors" />
                    </button>
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <button className="text-sm font-medium text-[#f0fdf4]/50 hover:text-[#f0fdf4] transition-colors px-3 py-2">Entrar</button>
                    <button className="btn-champion px-4 sm:px-6 py-2 text-xs">JOGAR</button>
                </div>
            )}
        </nav>
    );
};
