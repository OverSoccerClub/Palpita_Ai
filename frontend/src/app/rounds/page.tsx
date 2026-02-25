'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import api from '@/services/api';
import { motion } from 'framer-motion';
import { Trophy, Clock, Users, ChevronRight, Zap, Lock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

type RoundStatus = 'OPEN' | 'CLOSED' | 'FINALIZED' | 'PROCESSED';

interface Match {
    id: string;
    homeTeam: string;
    awayTeam: string;
    stadium?: string;
    startTime: string;
    result?: string;
}

interface Round {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    status: RoundStatus;
    poolAmount: string;
    matches: Match[];
    _count?: { betSlips: number };
}

const statusConfig: Record<RoundStatus, { label: string; color: string; icon: React.ElementType }> = {
    OPEN: { label: 'ABERTO', color: '#22c55e', icon: Zap },
    CLOSED: { label: 'ENCERRADO', color: '#f59e0b', icon: Lock },
    FINALIZED: { label: 'FINALIZADO', color: '#38bdf8', icon: CheckCircle2 },
    PROCESSED: { label: 'PROCESSADO', color: '#a3a3a3', icon: CheckCircle2 },
};

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function formatCurrency(value: string | number) {
    return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function RoundsPage() {
    const [rounds, setRounds] = useState<Round[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | RoundStatus>('ALL');

    useEffect(() => {
        api.get('/rounds')
            .then(r => setRounds(r.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const filtered = filter === 'ALL' ? rounds : rounds.filter(r => r.status === filter);

    return (
        <MainLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <p className="score-label text-[#22c55e] mb-1">ARENA DE APOSTAS</p>
                        <h1 className="text-3xl md:text-4xl font-display font-black tracking-tight flex items-center gap-3">
                            <Trophy className="w-8 h-8 text-[#f59e0b]" />
                            CONCURSOS
                        </h1>
                    </div>
                    {/* Filters */}
                    <div className="flex gap-2 flex-wrap">
                        {(['ALL', 'OPEN', 'CLOSED', 'FINALIZED'] as const).map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-1.5 text-[10px] font-display font-bold tracking-widest uppercase border transition-all ${filter === f
                                    ? 'bg-[#22c55e] border-[#22c55e] text-[#020c06]'
                                    : 'border-[#14532d] text-[#f0fdf4]/40 hover:border-[#22c55e]/40 hover:text-[#f0fdf4]/70'
                                    }`}
                            >
                                {f === 'ALL' ? 'TODOS' : statusConfig[f as RoundStatus]?.label ?? f}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-[#14532d] to-transparent" />

                {/* Content */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-2 border-[#22c55e]/20 border-t-[#22c55e] animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 match-card p-12">
                        <div className="text-5xl mb-4">⚽</div>
                        <p className="score-label text-[#f0fdf4]/30">NENHUM CONCURSO ENCONTRADO</p>
                    </div>
                ) : (
                    <div className="grid gap-5">
                        {filtered.map((round, idx) => {
                            const cfg = statusConfig[round.status];
                            const Icon = cfg.icon;
                            const isOpen = round.status === 'OPEN';
                            return (
                                <motion.div
                                    key={round.id}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <Link href={`/rounds/${round.id}`}>
                                        <div className="match-card p-6 cursor-pointer group" style={{ borderTopColor: cfg.color }}>
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                {/* Left */}
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <div className="flex items-center gap-1.5 px-3 py-1 border text-[10px] font-display font-bold tracking-wider"
                                                            style={{ borderColor: `${cfg.color}40`, color: cfg.color, background: `${cfg.color}08` }}>
                                                            <Icon className="w-3 h-3" />
                                                            {cfg.label}
                                                        </div>
                                                        {isOpen && (
                                                            <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
                                                        )}
                                                    </div>
                                                    <h2 className="font-display font-black text-xl tracking-tight text-[#f0fdf4] mb-1">
                                                        {round.title}
                                                    </h2>
                                                    <div className="flex flex-wrap gap-4 text-xs text-[#f0fdf4]/30 font-medium">
                                                        <span className="flex items-center gap-1.5">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            Até {formatDate(round.endTime)}
                                                        </span>
                                                        <span className="flex items-center gap-1.5">
                                                            <Users className="w-3.5 h-3.5" />
                                                            {round.matches?.length ?? 0} jogos
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Right */}
                                                <div className="flex items-center gap-6">
                                                    <div className="text-right">
                                                        <p className="score-label mb-0.5">PRIZE POOL</p>
                                                        <p className="font-display font-black text-xl text-[#f59e0b]">
                                                            {formatCurrency(round.poolAmount)}
                                                        </p>
                                                    </div>
                                                    <ChevronRight className="w-5 h-5 text-[#f0fdf4]/20 group-hover:text-[#22c55e] transition-colors" />
                                                </div>
                                            </div>

                                            {/* Matches preview */}
                                            {round.matches?.length > 0 && (
                                                <div className="mt-5 pt-4 border-t border-[#14532d] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                                    {round.matches.slice(0, 6).map(m => (
                                                        <div key={m.id} className="text-[11px] text-[#f0fdf4]/35 flex items-center gap-1.5">
                                                            <span className="text-[#f0fdf4]/20">⚽</span>
                                                            <span className="font-medium">{m.homeTeam}</span>
                                                            <span className="text-[#14532d]">×</span>
                                                            <span className="font-medium">{m.awayTeam}</span>
                                                        </div>
                                                    ))}
                                                    {round.matches.length > 6 && (
                                                        <p className="text-[10px] text-[#22c55e]/50 font-bold">
                                                            +{round.matches.length - 6} mais jogos
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
