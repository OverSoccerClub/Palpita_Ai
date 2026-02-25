'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';
import api from '@/services/api';
import { Trophy, Users, TrendingUp, Calendar, ArrowRight, Zap, Target, History, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function DashboardPage() {
    const { user, loading, refreshUser } = useAuth();
    const [activeRounds, setActiveRounds] = useState<any[]>([]);
    const [betsCount, setBetsCount] = useState(0);
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        if (!user) return;
        // Refresh global user state (balance, etc)
        refreshUser();

        Promise.all([
            api.get('/rounds/active'),
            api.get('/bets/history'),
            user.role === 'ADMIN' ? api.get('/admin/stats') : Promise.resolve({ data: null }),
        ]).then(([roundsRes, betsRes, statsRes]) => {
            setActiveRounds(roundsRes.data ?? []);
            setBetsCount((betsRes.data ?? []).length);
            setStats(statsRes.data);
        }).catch(() => { });
    }, [user]);

    if (loading || !user) {
        return (
            <div className="min-h-screen bg-[#020c06] flex items-center justify-center">
                <div className="text-center">
                    <div className="text-5xl mb-4 animate-bounce">⚽</div>
                    <p className="score-label text-[#22c55e]">CARREGANDO JOGO...</p>
                </div>
            </div>
        );
    }

    const balance = Number(user.wallet?.balance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });

    return (
        <MainLayout>
            <div className="space-y-10">

                {/* ── Welcome header ── */}
                <header>
                    <div className="flex items-end justify-between gap-4">
                        <div>
                            <p className="score-label text-[#22c55e] mb-1">BEM-VINDO DE VOLTA</p>
                            <h1 className="text-4xl md:text-5xl font-display font-black text-[#f0fdf4] tracking-tight leading-none">
                                {user.name.split(' ')[0].toUpperCase()}
                                <span className="text-[#22c55e]">.</span>
                            </h1>
                        </div>
                        <div className="hidden md:flex flex-col items-end gap-1 shrink-0">
                            <span className="score-label">SALDO ATUAL</span>
                            <span className="font-display font-black text-2xl text-[#f59e0b] tabular-nums">
                                R$ {balance}
                            </span>
                        </div>
                    </div>
                    <div className="pitch-divider mt-4" />
                </header>

                {/* ── Stat cards ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { icon: Target, label: 'Meus Palpites', value: String(betsCount), color: '#22c55e', href: '/bets' },
                        { icon: TrendingUp, label: 'Saldo', value: `R$ ${balance}`, color: '#f59e0b', href: '/wallet' },
                        ...(user.role === 'ADMIN' && stats ? [
                            { icon: Users, label: 'Usuários', value: String(stats.users), color: '#38bdf8', href: '/admin' },
                            { icon: Zap, label: 'Acumulado', value: `R$ ${Number(stats.reserveFund).toLocaleString('pt-BR')}`, color: '#22c55e', href: '/admin' },
                        ] : []),
                    ].map((card, idx) => (
                        <motion.div
                            key={card.label}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.08 }}
                        >
                            <Link href={card.href} className="stat-card p-5 block hover:scale-[1.02] transition-transform" style={{ borderLeftColor: card.color }}>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="p-2" style={{ background: `${card.color}14` }}>
                                        <card.icon className="w-4 h-4" style={{ color: card.color }} />
                                    </div>
                                    <ArrowRight className="w-3.5 h-3.5 text-[#f0fdf4]/15" />
                                </div>
                                <p className="score-label mb-1">{card.label}</p>
                                <p className="font-display font-black text-xl tabular-nums leading-tight" style={{ color: card.color }}>
                                    {card.value}
                                </p>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* ── Quick actions ── */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { icon: Target, label: 'Meus Palpites', sub: 'Ver histórico de apostas', href: '/bets', color: '#22c55e' },
                        { icon: Wallet, label: 'Carteira', sub: 'Depositar ou sacar', href: '/wallet', color: '#f59e0b' },
                        { icon: History, label: 'Extrato', sub: 'Movimentações financeiras', href: '/history', color: '#38bdf8' },
                    ].map((a, idx) => (
                        <motion.div key={a.href} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + idx * 0.08 }}>
                            <Link href={a.href}
                                className="flex items-center gap-4 p-4 border border-[#14532d] hover:border-[#22c55e]/40 hover:bg-[#071a0d] transition-all group"
                                style={{ background: 'linear-gradient(135deg, #000000 0%, #030d07 100%)' }}>
                                <div className="p-2.5 shrink-0" style={{ background: `${a.color}12`, border: `1px solid ${a.color}25` }}>
                                    <a.icon className="w-5 h-5" style={{ color: a.color }} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-display font-bold text-sm text-[#f0fdf4]/80 group-hover:text-[#f0fdf4] transition-colors">{a.label}</p>
                                    <p className="text-[11px] text-[#f0fdf4]/25">{a.sub}</p>
                                </div>
                                <ArrowRight className="w-4 h-4 text-[#f0fdf4]/15 group-hover:text-[#22c55e] group-hover:translate-x-1 transition-all" />
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* ── Active Rounds ── */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <p className="score-label text-[#22c55e] mb-1">AO VIVO</p>
                            <h2 className="text-2xl font-display font-black tracking-tight flex items-center gap-3">
                                <Calendar className="w-6 h-6 text-[#22c55e]" />
                                CONCURSOS ABERTOS
                            </h2>
                        </div>
                        <Link href="/rounds" className="flex items-center gap-2 text-[#22c55e] hover:text-[#f0fdf4] transition-colors group">
                            <span className="score-label">VER TODOS</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {activeRounds.length > 0 ? (
                            activeRounds.map((round, idx) => (
                                <motion.div
                                    key={round.id}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="match-card p-6 group"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                                                <p className="score-label text-[#22c55e]">AO VIVO</p>
                                            </div>
                                            <h3 className="text-lg font-display font-black tracking-tight text-[#f0fdf4] group-hover:text-[#22c55e] transition-colors truncate">
                                                {round.title}
                                            </h3>
                                        </div>
                                        <Trophy className="w-5 h-5 text-[#f59e0b] shrink-0 ml-2" />
                                    </div>

                                    <div className="space-y-2 mb-5 p-3 border border-[#14532d] bg-[#020c06]/60">
                                        <div className="flex justify-between items-center">
                                            <span className="score-label">PREMIAÇÃO</span>
                                            <span className="font-display font-black text-[#f59e0b] text-sm">
                                                {Number(round.poolAmount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="score-label">JOGOS</span>
                                            <span className="text-sm font-bold text-[#f0fdf4]/60">{round.matches?.length ?? 0}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="score-label">ENCERRA</span>
                                            <span className="text-sm font-medium text-[#f0fdf4]/60">
                                                {new Date(round.endTime).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>

                                    <Link href={`/rounds/${round.id}`} className="btn-champion block text-center py-3 text-xs">
                                        FAZER PALPITE
                                    </Link>
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-full p-16 border border-[#14532d] text-center" style={{ background: 'linear-gradient(135deg, #000000 0%, #030d07 100%)' }}>
                                <div className="text-4xl mb-4">🏟️</div>
                                <p className="score-label text-[#22c55e]/50">Nenhum concurso ativo no momento</p>
                                <p className="text-[#f0fdf4]/25 text-sm mt-2">Volte em breve para novos jogos</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </MainLayout>
    );
}
