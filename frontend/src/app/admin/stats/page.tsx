'use client';

import React, { useEffect, useState, useCallback } from 'react';
import api from '@/services/api';
import { TrendingUp, Users, Database, Zap, Trophy, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

function fmt(v: number | string) { return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }

export default function AdminStatsPage() {
    const [stats, setStats] = useState<any>(null);
    const [rounds, setRounds] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetch = useCallback(async () => {
        setLoading(true);
        try {
            const [statsRes, roundsRes] = await Promise.all([api.get('/admin/stats'), api.get('/rounds')]);
            setStats(statsRes.data);
            setRounds(roundsRes.data);
        } catch { } finally { setLoading(false); }
    }, []);

    useEffect(() => { fetch(); }, [fetch]);

    if (loading) return (
        <div className="flex items-center justify-center py-24 gap-3">
            <div className="w-5 h-5 border-2 border-[#f59e0b]/20 border-t-[#f59e0b] animate-spin" />
            <span className="text-[#f0fdf4]/30 text-sm">Carregando relatórios...</span>
        </div>
    );

    const statusCounts = { OPEN: 0, CLOSED: 0, FINALIZED: 0, PROCESSED: 0 };
    rounds.forEach(r => { if (r.status in statusCounts) (statusCounts as any)[r.status]++; });
    const totalPool = rounds.reduce((acc, r) => acc + Number(r.poolAmount), 0);

    const cards = [
        { icon: TrendingUp, label: 'Volume Total', value: fmt(stats?.totalVolume ?? 0), color: '#22c55e' },
        { icon: Zap, label: 'Fundo Reserva', value: fmt(stats?.reserveFund ?? 0), color: '#f59e0b' },
        { icon: Database, label: 'Total de Apostas', value: String(stats?.bets ?? 0), color: '#38bdf8' },
        { icon: Users, label: 'Total de Usuários', value: String(stats?.users ?? 0), color: '#a78bfa' },
        { icon: Trophy, label: 'Total Concursos', value: String(rounds.length), color: '#f59e0b' },
        { icon: DollarSign, label: 'Pool Total', value: fmt(totalPool), color: '#22c55e' },
    ];

    return (
        <div className="space-y-8">
            <div>
                <p className="text-[10px] font-bold tracking-widest text-[#f59e0b]/60 uppercase mb-0.5">ADMIN</p>
                <h1 className="font-display font-black text-2xl text-[#f0fdf4] flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-[#f59e0b]" /> RELATÓRIOS
                </h1>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {cards.map((c, idx) => (
                    <motion.div key={c.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.07 }}
                        className="p-5 border border-[#f59e0b]/10" style={{ background: '#050500', borderLeftColor: c.color, borderLeftWidth: '2px' }}>
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-2" style={{ background: `${c.color}10` }}>
                                <c.icon className="w-4 h-4" style={{ color: c.color }} />
                            </div>
                        </div>
                        <p className="text-[9px] font-bold tracking-widest text-[#f0fdf4]/25 uppercase mb-1">{c.label}</p>
                        <p className="font-display font-black text-xl tabular-nums" style={{ color: c.color }}>{c.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Rounds by status */}
            <div>
                <p className="text-[10px] font-bold tracking-widest text-[#f59e0b]/60 uppercase mb-4">CONCURSOS POR STATUS</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(statusCounts).map(([status, count]) => {
                        const colors: Record<string, string> = { OPEN: '#22c55e', CLOSED: '#f59e0b', FINALIZED: '#38bdf8', PROCESSED: '#a3a3a3' };
                        const labels: Record<string, string> = { OPEN: 'Abertos', CLOSED: 'Encerrados', FINALIZED: 'Finalizados', PROCESSED: 'Processados' };
                        return (
                            <div key={status} className="p-4 border border-[#f59e0b]/08" style={{ background: '#050500' }}>
                                <span className={`text-[9px] font-bold tracking-widest text-[${colors[status]}] uppercase border px-1.5 py-0.5`} style={{ borderColor: `${colors[status]}30`, color: colors[status] }}>{status}</span>
                                <p className="font-display font-black text-2xl mt-2" style={{ color: colors[status] }}>{count}</p>
                                <p className="text-[10px] text-[#f0fdf4]/25 mt-0.5">{labels[status]}</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Top rounds by pool */}
            {rounds.length > 0 && (
                <div>
                    <p className="text-[10px] font-bold tracking-widest text-[#f59e0b]/60 uppercase mb-4">TOP CONCURSOS POR POOL</p>
                    <div className="border border-[#f59e0b]/10 overflow-hidden" style={{ background: '#050500' }}>
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[#f59e0b]/10">
                                    {['TÍTULO', 'STATUS', 'APOSTAS', 'POOL'].map(h => (
                                        <th key={h} className="text-left px-4 py-3 text-[9px] font-bold tracking-widest text-[#f0fdf4]/25 uppercase">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#f59e0b]/05">
                                {[...rounds].sort((a, b) => Number(b.poolAmount) - Number(a.poolAmount)).slice(0, 10).map(r => (
                                    <tr key={r.id} className="hover:bg-[#f59e0b]/03 transition-colors">
                                        <td className="px-4 py-3 font-display font-bold text-sm text-[#f0fdf4]/70">{r.title}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 text-[9px] font-black tracking-wider border ${({ OPEN: 'border-[#22c55e]/30 text-[#22c55e]', CLOSED: 'border-[#f59e0b]/30 text-[#f59e0b]', FINALIZED: 'border-[#38bdf8]/30 text-[#38bdf8]', PROCESSED: 'border-[#a3a3a3]/30 text-[#a3a3a3]' } as any)[r.status]}`}>{r.status}</span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-[#f0fdf4]/40 font-bold">{r._count?.betSlips ?? 0}</td>
                                        <td className="px-4 py-3 font-display font-black text-sm text-[#f59e0b]">{fmt(r.poolAmount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
