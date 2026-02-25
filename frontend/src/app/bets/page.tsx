'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import api from '@/services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Trophy, CheckCircle2, XCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';

interface BetMatch {
    id: string;
    prediction: 'H' | 'D' | 'A';
    isCorrect: boolean | null;
    match: {
        homeTeam: string;
        homeLogo?: string;
        awayTeam: string;
        awayLogo?: string;
        result?: 'H' | 'D' | 'A';
    };
}

interface BetSlip {
    id: string;
    status: string;
    price: string;
    totalAcertos: number;
    prizeAmount: string;
    createdAt: string;
    round: { id: string; title: string; status: string };
    matches: BetMatch[];
}

const predictionLabel: Record<string, string> = { H: 'CASA VENCE', D: 'EMPATE', A: 'FORA VENCE' };

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function formatCurrency(v: string | number) {
    return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function BetMatchRow({ m, idx }: { m: BetMatch; idx: number }) {
    const isWin = m.isCorrect === true;
    const isLoss = m.isCorrect === false;

    return (
        <div className="relative group/match">
            <div className="flex items-center gap-3 px-4 py-3 sm:px-5">
                {/* Index & Time (Simulated/Label) */}
                <div className="w-6 h-6 flex items-center justify-center text-[9px] font-display font-black text-[#f0fdf4]/10 border border-[#14532d]/40 shrink-0">
                    {idx + 1}
                </div>

                {/* Teams */}
                <div className="flex-1 flex items-center justify-center gap-2 sm:gap-4 min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 justify-end flex-1 min-w-0">
                        <span className="text-[11px] sm:text-xs font-display font-bold text-[#f0fdf4]/70 truncate">{m.match.homeTeam}</span>
                        {m.match.homeLogo && (
                            <img src={m.match.homeLogo} alt="" className="w-5 h-5 object-contain shrink-0"
                                onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                        )}
                    </div>

                    <div className="px-2 py-0.5 bg-[#14532d]/20 border border-[#14532d]/40 text-[9px] font-display font-black text-[#f0fdf4]/30">×</div>

                    <div className="flex items-center gap-1.5 sm:gap-2 justify-start flex-1 min-w-0">
                        {m.match.awayLogo && (
                            <img src={m.match.awayLogo} alt="" className="w-5 h-5 object-contain shrink-0"
                                onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                        )}
                        <span className="text-[11px] sm:text-xs font-display font-bold text-[#f0fdf4]/70 truncate">{m.match.awayTeam}</span>
                    </div>
                </div>

                {/* Selection & Result Indicator */}
                <div className="flex items-center gap-3 shrink-0">
                    <div className={`px-2.5 py-1.5 flex flex-col items-center justify-center border transition-all min-w-[85px] ${isWin ? 'border-[#22c55e] bg-[#22c55e]/10 shadow-[0_0_10px_rgba(34,197,94,0.1)]' :
                            isLoss ? 'border-red-500/30 bg-red-500/05' : 'border-[#14532d]'
                        }`}>
                        <span className={`text-[9px] font-display font-black text-center leading-none ${isWin ? 'text-[#22c55e]' : isLoss ? 'text-red-500/60' : 'text-[#f0fdf4]/40'
                            }`}>
                            {predictionLabel[m.prediction]}
                        </span>
                    </div>

                    <div className="w-4 flex justify-center">
                        {m.isCorrect !== null && (
                            m.isCorrect
                                ? <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
                                : <XCircle className="w-4 h-4 text-red-500/40" />
                        )}
                    </div>
                </div>
            </div>
            {isWin && (
                <div className="absolute inset-y-0 left-0 w-0.5 bg-[#22c55e]/40" />
            )}
        </div>
    );
}

function BetCard({ bet }: { bet: BetSlip }) {
    const [open, setOpen] = useState(false);
    const hasPrize = Number(bet.prizeAmount) > 0;
    const isFinished = bet.round.status === 'FINALIZED' || bet.round.status === 'PROCESSED';

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="match-card overflow-hidden">
            {/* Header */}
            <button
                onClick={() => setOpen(o => !o)}
                className={`w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left transition-colors ${open ? 'bg-[#22c55e]/[0.02]' : 'hover:bg-[#f0fdf4]/02'}`}
            >
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-1.5 border border-[#14532d] bg-[#071a0d]">
                            <Target className="w-3.5 h-3.5 text-[#22c55e]" />
                        </div>
                        <div>
                            <p className="score-label text-[#22c55e] truncate leading-none mb-1">{bet.round.title}</p>
                            <p className="text-[#f0fdf4]/30 text-[10px] font-bold tracking-wider uppercase">{formatDate(bet.createdAt)}</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0">
                    {/* Hits/Status */}
                    <div className="hidden xs:block text-right">
                        {isFinished ? (
                            <>
                                <p className="score-label text-[9px] mb-0.5 opacity-50">ACERTOS</p>
                                <p className="font-display font-black text-xl text-[#22c55e] tabular-nums leading-none">
                                    {bet.totalAcertos}
                                    <span className="text-xs text-[#22c55e]/40 ml-0.5">/14</span>
                                </p>
                            </>
                        ) : (
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-[#f59e0b]/05 border border-[#f59e0b]/20">
                                <Clock className="w-3 h-3 text-[#f59e0b]" />
                                <span className="text-[10px] font-display font-black text-[#f59e0b]">ATIVO</span>
                            </div>
                        )}
                    </div>

                    {/* Prize */}
                    {isFinished && (
                        <div className="text-right min-w-[80px]">
                            <p className="score-label text-[9px] mb-0.5 opacity-50">RESULTADO</p>
                            {hasPrize ? (
                                <div className="flex flex-col items-end">
                                    <p className="font-display font-black text-lg text-[#f59e0b] leading-none">{formatCurrency(bet.prizeAmount)}</p>
                                    <span className="text-[8px] font-bold text-[#f59e0b]/60 tracking-widest uppercase">PREMIADO!</span>
                                </div>
                            ) : (
                                <p className="text-xs font-display font-black text-[#f0fdf4]/20 uppercase">Não premiado</p>
                            )}
                        </div>
                    )}

                    <div className="p-1 sm:p-2 border border-[#14532d] rounded-full">
                        {open ? <ChevronUp className="w-3.5 h-3.5 text-[#f0fdf4]/30" /> : <ChevronDown className="w-3.5 h-3.5 text-[#f0fdf4]/30" />}
                    </div>
                </div>
            </button>

            {/* Expanded matches */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-[#14532d]/40 bg-[#000000]/20"
                    >
                        <div className="divide-y divide-[#14532d]/20">
                            {bet.matches.map((m, idx) => (
                                <BetMatchRow key={m.id} m={m} idx={idx} />
                            ))}

                            {/* Cost row */}
                            <div className="px-5 py-4 flex items-center justify-between bg-[#22c55e]/[0.03]">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-[#22c55e]" />
                                    <span className="score-label opacity-40">INVESTIMENTO TOTAL</span>
                                </div>
                                <span className="font-display font-black text-[#f0fdf4] text-sm tabular-nums">{formatCurrency(bet.price)}</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default function BetsPage() {
    const [bets, setBets] = useState<BetSlip[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/bets/history')
            .then(r => setBets(r.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const totalSpent = bets.reduce((a, b) => a + Number(b.price), 0);
    const totalPrize = bets.reduce((a, b) => a + Number(b.prizeAmount), 0);

    return (
        <MainLayout>
            <div className="space-y-8">
                {/* Header */}
                <div>
                    <p className="score-label text-[#22c55e] mb-1">HISTÓRICO DE APOSTAS</p>
                    <h1 className="text-3xl md:text-4xl font-display font-black tracking-tight flex items-center gap-3">
                        <Target className="w-8 h-8 text-[#22c55e]" />
                        MEUS PALPITES
                    </h1>
                </div>

                {/* Summary */}
                {bets.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { label: 'TOTAL DE PALPITES', value: bets.length.toString(), color: '#22c55e', bg: 'bg-[#22c55e]/05' },
                            { label: 'TOTAL APOSTADO', value: formatCurrency(totalSpent), color: '#f0fdf4', bg: 'bg-[#f0fdf4]/05' },
                            { label: 'PRÊMIOS RECEBIDOS', value: formatCurrency(totalPrize), color: '#f59e0b', bg: 'bg-[#f59e0b]/05' },
                        ].map(s => (
                            <div key={s.label} className={`stat-card p-5 text-center relative overflow-hidden ${s.bg}`}>
                                <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none opacity-20"
                                    style={{ background: `radial-gradient(circle at top right, ${s.color}, transparent 70%)` }} />
                                <p className="font-display font-black text-2xl md:text-3xl" style={{ color: s.color }}>{s.value}</p>
                                <p className="score-label mt-1 opacity-60 italic">{s.label}</p>
                            </div>
                        ))}
                    </div>
                )}

                <div className="h-px bg-gradient-to-r from-transparent via-[#14532d] to-transparent" />

                {/* List */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-2 border-[#22c55e]/20 border-t-[#22c55e] animate-spin" />
                    </div>
                ) : bets.length === 0 ? (
                    <div className="text-center py-20 match-card p-12">
                        <div className="text-5xl mb-4">⚽</div>
                        <p className="score-label text-[#f0fdf4]/30 mb-2">NENHUM PALPITE AINDA</p>
                        <p className="text-[#f0fdf4]/20 text-sm">Participe de um concurso para começar!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {bets.map(bet => <BetCard key={bet.id} bet={bet} />)}
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
