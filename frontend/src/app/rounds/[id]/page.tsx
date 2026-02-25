'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMessage } from '@/contexts/MessageContext';
import { MainLayout } from '@/components/layout/MainLayout';
import api from '@/services/api';
import { useParams, useRouter } from 'next/navigation';
import { Trophy, ChevronLeft, Zap, Send, Clock, CheckCircle2, AlertCircle, HelpCircle, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Prediction = 'H' | 'D' | 'A';
interface MatchSelection { matchId: string; prediction: Prediction; }

function formatDeadline(iso: string) {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

/* ── Tutorial "Como Funciona?" ──────────────────────────── */
function HowItWorksBanner({ onDismiss }: { onDismiss: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="relative border border-[#22c55e]/20 overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #071a0d 0%, #0d2718 50%, #13311e 100%)' }}
        >
            {/* Glow effect */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#22c55e]/40 to-transparent" />

            <div className="p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center border border-[#22c55e]/30 bg-[#22c55e]/08 shrink-0">
                            <HelpCircle className="w-5 h-5 text-[#22c55e]" />
                        </div>
                        <div>
                            <h3 className="font-display font-black text-base text-[#f0fdf4]">COMO FUNCIONA?</h3>
                            <p className="text-[10px] text-[#f0fdf4]/30 font-bold tracking-wider uppercase">SEU PRIMEIRO PALPITE</p>
                        </div>
                    </div>
                    <button onClick={onDismiss} className="p-1.5 text-[#f0fdf4]/20 hover:text-[#f0fdf4]/60 transition-colors shrink-0">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                        {
                            step: '1',
                            emoji: '⚽',
                            title: 'Escolha o vencedor',
                            desc: 'Para cada jogo, clique no time que você acha que vai vencer — ou escolha "Empate" se achar que ninguém ganha.',
                        },
                        {
                            step: '2',
                            emoji: '✅',
                            title: 'Preencha todos os jogos',
                            desc: 'Complete todos os 14 palpites para liberar o envio. Use "Surpresinha" se quiser palpites aleatórios!',
                        },
                        {
                            step: '3',
                            emoji: '🏆',
                            title: 'Acerte e ganhe!',
                            desc: 'Quanto mais acertos, maior o prêmio. Acertar os 14 leva a bolada principal!',
                        },
                    ].map(item => (
                        <div key={item.step} className="p-4 border border-[#22c55e]/10 bg-[#000000]/20">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-6 h-6 flex items-center justify-center bg-[#22c55e]/10 border border-[#22c55e]/20 text-[#22c55e] text-[10px] font-display font-black">{item.step}</span>
                                <span className="text-lg">{item.emoji}</span>
                            </div>
                            <p className="font-display font-bold text-sm text-[#f0fdf4]/90 mb-1">{item.title}</p>
                            <p className="text-xs text-[#f0fdf4]/40 leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-4 flex items-center justify-between">
                    <p className="text-[10px] text-[#f0fdf4]/20">Dica: isto só aparece uma vez!</p>
                    <button
                        onClick={onDismiss}
                        className="flex items-center gap-2 px-5 py-2 bg-[#22c55e] text-[#020c06] text-xs font-display font-bold tracking-wider uppercase hover:bg-[#16a34a] transition-colors"
                    >
                        ENTENDI! <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

/* ── Match Prediction Card (Premium) ─────────────────── */
function MatchPredictionCard({
    match, idx, selection, isOpen, onSelect,
}: {
    match: any; idx: number; selection: Prediction | null;
    isOpen: boolean; onSelect: (p: Prediction) => void;
}) {
    const hasResult = !!match.result;

    const resultLabel = hasResult
        ? match.result === 'H' ? `${match.homeTeam} venceu`
            : match.result === 'D' ? 'Empate'
                : `${match.awayTeam} venceu`
        : null;

    const matchDate = new Date(match.startTime).toLocaleDateString('pt-BR', {
        weekday: 'short', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03 }}
            className="relative border-b border-[#14532d]/25 last:border-0 hover:bg-[#22c55e]/[0.02] transition-colors"
        >
            {/* ── Top bar: # · stadium · date ── */}
            <div className="flex items-center justify-between px-4 sm:px-5 pt-3 pb-1.5 gap-3">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 flex items-center justify-center text-[9px] font-display font-black text-[#f0fdf4]/15 border border-[#14532d]/30 shrink-0">
                        {idx + 1}
                    </span>
                    {match.stadium ? (
                        <span className="text-[10px] text-[#f0fdf4]/25 truncate leading-none">
                            🏟 {match.stadium.split(' – ')[0]}
                        </span>
                    ) : (
                        <span className="text-[10px] text-[#f0fdf4]/10">—</span>
                    )}
                </div>
                <span className="text-[10px] text-[#f0fdf4]/30 font-bold tracking-wide shrink-0 tabular-nums">
                    {matchDate}
                </span>
            </div>

            {/* ── Prediction row (centered) ── */}
            <div className="flex items-center justify-center gap-2 px-3 sm:px-5 pb-3">

                {/* Home team */}
                <button
                    onClick={() => isOpen && onSelect('H')}
                    disabled={!isOpen}
                    className={`relative flex items-center gap-2 flex-1 min-w-0 max-w-[200px] justify-center px-3 py-2.5 border overflow-hidden group transition-all ${selection === 'H'
                        ? 'border-[#22c55e] bg-[#22c55e]/10 shadow-[0_0_20px_rgba(34,197,94,0.12)]'
                        : 'border-[#14532d]/50 hover:border-[#22c55e]/40 hover:bg-[#22c55e]/04 disabled:hover:border-[#14532d]/50 disabled:hover:bg-transparent disabled:cursor-default'
                        }`}
                >
                    {selection === 'H' && <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#22c55e]" />}
                    {match.homeLogo && (
                        <img src={match.homeLogo} alt="" className={`w-6 h-6 object-contain shrink-0 transition-transform ${selection === 'H' ? 'scale-110' : 'group-hover:scale-105'}`}
                            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                    )}
                    <div className="text-left min-w-0">
                        <p className={`font-display font-bold text-xs leading-tight truncate transition-colors ${selection === 'H' ? 'text-[#22c55e]' : 'text-[#f0fdf4]/70 group-hover:text-[#f0fdf4]/90'}`}>
                            {match.homeTeam}
                        </p>
                        <p className={`text-[8px] font-bold tracking-widest uppercase transition-colors ${selection === 'H' ? 'text-[#22c55e]/60' : 'text-[#f0fdf4]/15'}`}>
                            CASA · VENCE
                        </p>
                    </div>
                </button>

                {/* Draw */}
                <button
                    onClick={() => isOpen && onSelect('D')}
                    disabled={!isOpen}
                    className={`relative flex flex-col items-center justify-center w-16 sm:w-20 py-2.5 border overflow-hidden group transition-all shrink-0 ${selection === 'D'
                        ? 'border-[#f59e0b] bg-[#f59e0b]/10 shadow-[0_0_16px_rgba(245,158,11,0.12)]'
                        : 'border-[#14532d]/50 hover:border-[#f59e0b]/40 hover:bg-[#f59e0b]/04 disabled:hover:border-[#14532d]/50 disabled:hover:bg-transparent disabled:cursor-default'
                        }`}
                >
                    {selection === 'D' && <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#f59e0b]" />}
                    <span className={`font-display font-black text-base leading-none transition-colors ${selection === 'D' ? 'text-[#f59e0b]' : 'text-[#f0fdf4]/20 group-hover:text-[#f59e0b]/50'}`}>
                        ✕
                    </span>
                    <span className={`text-[8px] font-bold tracking-widest uppercase mt-0.5 transition-colors ${selection === 'D' ? 'text-[#f59e0b]/70' : 'text-[#f0fdf4]/15'}`}>
                        EMPATE
                    </span>
                </button>

                {/* Away team */}
                <button
                    onClick={() => isOpen && onSelect('A')}
                    disabled={!isOpen}
                    className={`relative flex items-center gap-2 flex-1 min-w-0 max-w-[200px] justify-center px-3 py-2.5 border overflow-hidden group transition-all ${selection === 'A'
                        ? 'border-[#22c55e] bg-[#22c55e]/10 shadow-[0_0_20px_rgba(34,197,94,0.12)]'
                        : 'border-[#14532d]/50 hover:border-[#22c55e]/40 hover:bg-[#22c55e]/04 disabled:hover:border-[#14532d]/50 disabled:hover:bg-transparent disabled:cursor-default'
                        }`}
                >
                    {selection === 'A' && <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#22c55e]" />}
                    <div className="text-right min-w-0">
                        <p className={`font-display font-bold text-xs leading-tight truncate transition-colors ${selection === 'A' ? 'text-[#22c55e]' : 'text-[#f0fdf4]/70 group-hover:text-[#f0fdf4]/90'}`}>
                            {match.awayTeam}
                        </p>
                        <p className={`text-[8px] font-bold tracking-widest uppercase transition-colors ${selection === 'A' ? 'text-[#22c55e]/60' : 'text-[#f0fdf4]/15'}`}>
                            FORA · VENCE
                        </p>
                    </div>
                    {match.awayLogo && (
                        <img src={match.awayLogo} alt="" className={`w-6 h-6 object-contain shrink-0 transition-transform ${selection === 'A' ? 'scale-110' : 'group-hover:scale-105'}`}
                            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                    )}
                </button>
            </div>

            {/* Result */}
            {hasResult && resultLabel && (
                <div className="flex justify-center pb-2 -mt-1">
                    <span className="text-[9px] px-3 py-0.5 bg-[#22c55e]/06 border border-[#22c55e]/20 text-[#22c55e] font-bold tracking-wide">
                        ✓ {resultLabel}
                    </span>
                </div>
            )}
        </motion.div>
    );
}


/* ── Page ───────────────────────────────────────────────── */
export default function RoundDetailsPage() {
    const { id } = useParams();
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const { showAlert } = useMessage();

    const [round, setRound] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selections, setSelections] = useState<MatchSelection[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showTutorial, setShowTutorial] = useState(false);

    useEffect(() => {
        api.get(`/rounds/${id}`)
            .then(r => setRound(r.data))
            .catch(() => router.push('/rounds'))
            .finally(() => setLoading(false));
    }, [id]);

    // Tutorial: show once for first-time users
    useEffect(() => {
        const key = '@PalpitaAi:hasSeenBetTutorial';
        if (!localStorage.getItem(key)) {
            setShowTutorial(true);
        }
    }, []);

    const dismissTutorial = useCallback(() => {
        setShowTutorial(false);
        localStorage.setItem('@PalpitaAi:hasSeenBetTutorial', 'true');
    }, []);

    const handleSelect = (matchId: string, prediction: Prediction) => {
        setSelections(prev => [...prev.filter(s => s.matchId !== matchId), { matchId, prediction }]);
    };

    const handleRandom = () => {
        if (!round) return;
        const opts: Prediction[] = ['H', 'D', 'A'];
        setSelections(round.matches.map((m: any) => ({
            matchId: m.id,
            prediction: opts[Math.floor(Math.random() * 3)],
        })));
    };

    const handleSubmit = async () => {
        if (selections.length < round?.matches?.length) {
            showAlert('Palpite Incompleto', `Selecione o resultado de todos os ${round.matches.length} jogos.`, 'danger');
            return;
        }
        setIsSubmitting(true);
        try {
            await api.post('/bets/place', { roundId: round.id, predictions: selections });
            showAlert('🏆 Sucesso!', 'Palpite confirmado! Boa sorte no concurso.', 'success');
            setTimeout(() => router.push('/bets'), 2000);
        } catch (err: any) {
            const msg = err.response?.data?.message;
            showAlert('Erro ao Apostar', Array.isArray(msg) ? msg[0] : msg || 'Falha ao confirmar o palpite.', 'danger');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading || authLoading) {
        return (
            <div className="min-h-screen bg-[#020c06] flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-[#22c55e]/20 border-t-[#22c55e] animate-spin" />
            </div>
        );
    }

    if (!round) return null;

    const isOpen = round.status === 'OPEN';
    const totalMatches = round.matches?.length ?? 0;
    const done = selections.length;
    const progress = totalMatches > 0 ? Math.round((done / totalMatches) * 100) : 0;

    return (
        <MainLayout>
            <div className="space-y-5 pb-36">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 border border-[#14532d] text-[#f0fdf4]/40 hover:border-[#22c55e]/40 hover:text-[#f0fdf4]/80 transition-all"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <p className="score-label text-[#22c55e] mb-0.5">DETALHE DO CONCURSO</p>
                            <h1 className="font-display font-black text-2xl md:text-3xl tracking-tight">{round.title}</h1>
                            <p className="text-[#f0fdf4]/30 text-xs flex items-center gap-1.5 mt-1">
                                <Clock className="w-3.5 h-3.5" />
                                Encerra em {formatDeadline(round.endTime)}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* How it works button */}
                        <button
                            onClick={() => setShowTutorial(true)}
                            className="flex items-center gap-1.5 px-3 py-2.5 border border-[#22c55e]/20 text-[#22c55e]/60 hover:text-[#22c55e] hover:border-[#22c55e]/40 transition-all text-xs font-bold tracking-wider uppercase"
                        >
                            <HelpCircle className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">COMO FUNCIONA?</span>
                            <span className="sm:hidden">?</span>
                        </button>

                        {isOpen && (
                            <button
                                onClick={handleRandom}
                                className="flex items-center gap-2 px-5 py-2.5 border border-[#f59e0b]/30 text-[#f59e0b] hover:bg-[#f59e0b]/08 transition-all text-xs font-display font-bold tracking-wider uppercase"
                            >
                                <Zap className="w-4 h-4" />
                                SURPRESINHA
                            </button>
                        )}
                    </div>
                </div>

                {/* Tutorial */}
                <AnimatePresence>
                    {showTutorial && <HowItWorksBanner onDismiss={dismissTutorial} />}
                </AnimatePresence>

                {/* Prize pool info */}
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: 'PRIZE POOL', value: Number(round.poolAmount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), color: '#f59e0b' },
                        { label: 'JOGOS', value: `${totalMatches}`, color: '#22c55e' },
                        { label: 'VALOR DO PALPITE', value: 'R$ 10,00', color: '#f0fdf4' },
                    ].map(s => (
                        <div key={s.label} className="stat-card p-4 text-center">
                            <p className="font-display font-black text-lg md:text-xl" style={{ color: s.color }}>{s.value}</p>
                            <p className="score-label mt-0.5">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-6 py-2 text-[10px] text-[#f0fdf4]/30 font-bold tracking-wider uppercase">
                    <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-[#22c55e]/30 border border-[#22c55e]/50" /> Selecionado
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-[#f59e0b]/30 border border-[#f59e0b]/50" /> Empate
                    </span>
                </div>

                {/* Matches */}
                <div className="match-card overflow-hidden">
                    <div className="divide-y divide-[#14532d]/30">
                        {round.matches?.map((match: any, idx: number) => (
                            <MatchPredictionCard
                                key={match.id}
                                match={match}
                                idx={idx}
                                selection={selections.find(s => s.matchId === match.id)?.prediction ?? null}
                                isOpen={isOpen}
                                onSelect={(p) => handleSelect(match.id, p)}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Sticky footer bar */}
            {isOpen && (
                <div className="fixed bottom-0 left-0 right-0 lg:left-64 z-40 border-t border-[#14532d]"
                    style={{ background: 'linear-gradient(135deg, #000000 0%, #020c06 50%, #071a0d 100%)' }}>
                    <div className="max-w-4xl mx-auto px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                        {/* Progress */}
                        <div className="flex items-center gap-6 w-full sm:w-auto">
                            <div>
                                <p className="score-label mb-0.5">SELECIONADOS</p>
                                <p className={`font-display font-black text-2xl ${done === totalMatches ? 'text-[#22c55e]' : 'text-[#f0fdf4]'}`}>
                                    {done} <span className="text-[#f0fdf4]/20 text-lg">/ {totalMatches}</span>
                                </p>
                            </div>
                            {/* Progress bar */}
                            <div className="flex-1 sm:w-32">
                                <div className="h-1.5 bg-[#14532d]/40 w-full">
                                    <motion.div
                                        className="h-full bg-[#22c55e]"
                                        animate={{ width: `${progress}%` }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                    />
                                </div>
                                <p className="text-[10px] text-[#f0fdf4]/20 mt-0.5 font-bold">{progress}% completo</p>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || done < totalMatches}
                            className="btn-champion w-full sm:w-auto px-10 py-3.5 text-xs flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-[#020c06]/30 border-t-[#020c06] animate-spin" />
                            ) : (
                                <>
                                    <Trophy className="w-4 h-4" />
                                    CONFIRMAR PALPITE — R$ 10,00
                                    <Send className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}
