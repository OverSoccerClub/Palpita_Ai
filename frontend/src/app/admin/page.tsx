'use client';

import React, { useEffect, useState, useCallback } from 'react';
import api from '@/services/api';
import {
    ShieldCheck, Plus, Settings2, CheckCircle2, AlertCircle,
    Database, ArrowRight, X, Trophy, Users, TrendingUp, Zap, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

/* ── Types ────────────────────────────────────────── */
interface MatchForm {
    homeTeam: string;
    awayTeam: string;
    stadium: string;
    startTime: string;
}

const EMPTY_MATCH = (): MatchForm => ({
    homeTeam: '', awayTeam: '', stadium: '', startTime: '',
});

const STATUS_STYLES: Record<string, string> = {
    OPEN: 'border-[#22c55e]/30 text-[#22c55e] bg-[#22c55e]/08',
    CLOSED: 'border-[#f59e0b]/30 text-[#f59e0b] bg-[#f59e0b]/08',
    FINALIZED: 'border-[#38bdf8]/30 text-[#38bdf8] bg-[#38bdf8]/08',
    PROCESSED: 'border-[#a3a3a3]/30 text-[#a3a3a3] bg-[#a3a3a3]/08',
};

function formatCurrency(v: number | string) {
    return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/* ── Modal ────────────────────────────────────────── */
function CreateRoundModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
    const N_MATCHES = 14;

    const [title, setTitle] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [matches, setMatches] = useState<MatchForm[]>(
        Array.from({ length: N_MATCHES }, EMPTY_MATCH)
    );
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const updateMatch = (idx: number, field: keyof MatchForm, value: string) => {
        setMatches(prev => prev.map((m, i) => i === idx ? { ...m, [field]: value } : m));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate all matches have teams
        const incomplete = matches.filter(m => !m.homeTeam.trim() || !m.awayTeam.trim() || !m.startTime);
        if (incomplete.length > 0) {
            setError(`Preencha os times e horário de todos os ${N_MATCHES} jogos.`);
            return;
        }

        setSubmitting(true);
        try {
            await api.post('/rounds', {
                title,
                startTime,
                endTime,
                matches: matches.map(m => ({
                    homeTeam: m.homeTeam.trim(),
                    awayTeam: m.awayTeam.trim(),
                    stadium: m.stadium.trim() || undefined,
                    startTime: m.startTime,
                })),
            });
            onCreated();
            onClose();
        } catch (err: any) {
            const msg = err.response?.data?.message;
            setError(Array.isArray(msg) ? msg.join(' ') : msg || 'Erro ao criar concurso.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 py-8 overflow-y-auto"
            style={{ background: 'rgba(0,0,0,0.85)' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.97, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                className="w-full max-w-4xl"
                style={{ background: 'linear-gradient(135deg, #000000 0%, #071a0d 100%)', border: '1px solid #14532d' }}
            >
                {/* Modal header */}
                <div className="flex items-center justify-between p-6 border-b border-[#14532d]">
                    <div>
                        <p className="score-label text-[#22c55e] mb-1">PAINEL ADMIN</p>
                        <h2 className="font-display font-black text-2xl">CRIAR NOVO CONCURSO</h2>
                    </div>
                    <button onClick={onClose} className="p-2 border border-[#14532d] text-[#f0fdf4]/30 hover:text-[#f0fdf4] hover:border-[#22c55e]/40 transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Error */}
                    {error && (
                        <div className="p-4 border-l-2 border-red-500 bg-red-900/15 text-red-400 text-sm flex items-start gap-3">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            {error}
                        </div>
                    )}

                    {/* Round info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-3 space-y-1.5">
                            <label className="score-label block">TÍTULO DO CONCURSO</label>
                            <input
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                required
                                className="field-input w-full px-4 py-3 text-sm"
                                placeholder="Ex: Rodada 1 — Brasileirão 2026"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="score-label block">INÍCIO</label>
                            <input
                                type="datetime-local"
                                value={startTime}
                                onChange={e => setStartTime(e.target.value)}
                                required
                                className="field-input w-full px-4 py-3 text-sm"
                            />
                        </div>
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="score-label block">ENCERRAMENTO DAS APOSTAS</label>
                            <input
                                type="datetime-local"
                                value={endTime}
                                onChange={e => setEndTime(e.target.value)}
                                required
                                className="field-input w-full px-4 py-3 text-sm"
                            />
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gradient-to-r from-transparent via-[#14532d] to-transparent" />

                    {/* Matches */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <p className="score-label text-[#22c55e]">{N_MATCHES} PARTIDAS</p>
                            <p className="text-[#f0fdf4]/25 text-xs">Preencha todos os jogos</p>
                        </div>

                        {/* Header row */}
                        <div className="hidden md:grid grid-cols-[28px_1fr_1fr_1fr_160px] gap-3 px-2 mb-2">
                            {['#', 'TIME CASA (1)', 'TIME FORA (2)', 'ESTÁDIO', 'DATA / HORA'].map(h => (
                                <p key={h} className="score-label">{h}</p>
                            ))}
                        </div>

                        <div className="space-y-2">
                            {matches.map((m, idx) => (
                                <div key={idx} className="grid grid-cols-1 md:grid-cols-[28px_1fr_1fr_1fr_160px] gap-3 items-center p-3 border border-[#14532d]/50 hover:border-[#14532d] transition-colors">
                                    <span className="font-display font-black text-sm text-[#f0fdf4]/15 text-center hidden md:block">{idx + 1}</span>
                                    <input
                                        value={m.homeTeam}
                                        onChange={e => updateMatch(idx, 'homeTeam', e.target.value)}
                                        className="field-input px-3 py-2 text-xs"
                                        placeholder={`Casa ${idx + 1}`}
                                        required
                                    />
                                    <input
                                        value={m.awayTeam}
                                        onChange={e => updateMatch(idx, 'awayTeam', e.target.value)}
                                        className="field-input px-3 py-2 text-xs"
                                        placeholder={`Fora ${idx + 1}`}
                                        required
                                    />
                                    <input
                                        value={m.stadium}
                                        onChange={e => updateMatch(idx, 'stadium', e.target.value)}
                                        className="field-input px-3 py-2 text-xs"
                                        placeholder="Estádio (opcional)"
                                    />
                                    <input
                                        type="datetime-local"
                                        value={m.startTime}
                                        onChange={e => updateMatch(idx, 'startTime', e.target.value)}
                                        className="field-input px-3 py-2 text-xs"
                                        required
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-[#14532d]">
                        <button type="button" onClick={onClose} className="w-full sm:w-auto px-8 py-3 border border-[#14532d] text-[#f0fdf4]/40 hover:text-[#f0fdf4]/70 text-xs font-bold tracking-widest uppercase transition-all">
                            CANCELAR
                        </button>
                        <button type="submit" disabled={submitting} className="btn-champion w-full sm:w-auto px-12 py-3 text-xs flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed">
                            {submitting ? (
                                <div className="w-5 h-5 border-2 border-[#020c06]/30 border-t-[#020c06] animate-spin" />
                            ) : (
                                <>
                                    <Plus className="w-4 h-4" />
                                    CRIAR CONCURSO
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

/* ── Set Result inline ────────────────────────────── */
function SetResultModal({ round, onClose, onUpdated }: { round: any; onClose: () => void; onUpdated: () => void }) {
    const [results, setResults] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSave = async () => {
        const pending = round.matches.filter((m: any) => !results[m.id] && !m.result);
        if (pending.length > 0) {
            setError(`Defina o resultado de todos os ${round.matches.length} jogos.`);
            return;
        }
        setSubmitting(true);
        try {
            await Promise.all(
                round.matches
                    .filter((m: any) => results[m.id])
                    .map((m: any) =>
                        api.patch(`/rounds/match/${m.id}/result`, { result: results[m.id] })
                    )
            );
            onUpdated();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao salvar resultados.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
            style={{ background: 'rgba(0,0,0,0.85)' }}>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="w-full max-w-2xl"
                style={{ background: 'linear-gradient(135deg,#000 0%,#071a0d 100%)', border: '1px solid #14532d' }}>
                <div className="flex items-center justify-between p-5 border-b border-[#14532d]">
                    <div>
                        <p className="score-label text-[#22c55e] mb-1">INSERIR RESULTADOS</p>
                        <h3 className="font-display font-black text-lg">{round.title}</h3>
                    </div>
                    <button onClick={onClose} className="p-2 border border-[#14532d] text-[#f0fdf4]/30 hover:text-[#f0fdf4] transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
                    {error && <p className="text-red-400 text-xs border-l-2 border-red-500 pl-3">{error}</p>}
                    {round.matches?.map((m: any, idx: number) => {
                        const current = results[m.id] || m.result || '';
                        return (
                            <div key={m.id} className="flex items-center gap-3 p-3 border border-[#14532d]/50">
                                <span className="font-display font-black text-xs text-[#f0fdf4]/15 w-5 text-center">{idx + 1}</span>
                                <p className="flex-1 text-xs text-[#f0fdf4]/60">
                                    <span className="font-bold text-[#f0fdf4]/80">{m.homeTeam}</span>
                                    <span className="text-[#14532d] mx-2">×</span>
                                    <span className="font-bold text-[#f0fdf4]/80">{m.awayTeam}</span>
                                </p>
                                <div className="flex gap-1.5">
                                    {[{ v: 'H', label: '1' }, { v: 'D', label: 'X' }, { v: 'A', label: '2' }].map(opt => (
                                        <button
                                            key={opt.v}
                                            onClick={() => setResults(r => ({ ...r, [m.id]: opt.v }))}
                                            className={`w-9 h-9 font-display font-black text-sm border transition-all ${current === opt.v
                                                ? 'bg-[#22c55e] border-[#22c55e] text-[#020c06]'
                                                : 'border-[#14532d] text-[#f0fdf4]/30 hover:border-[#22c55e]/40'
                                                }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="p-5 border-t border-[#14532d] flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2.5 border border-[#14532d] text-[#f0fdf4]/40 text-xs font-bold tracking-widest uppercase">CANCELAR</button>
                    <button onClick={handleSave} disabled={submitting} className="btn-champion px-8 py-2.5 text-xs flex items-center gap-2 disabled:opacity-50">
                        {submitting ? <div className="w-4 h-4 border-2 border-[#020c06]/30 border-t-[#020c06] animate-spin" /> : <><CheckCircle2 className="w-4 h-4" /> SALVAR RESULTADOS</>}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

/* ── Main admin page ──────────────────────────────── */
export default function AdminPage() {
    const [authLoading] = useState(false); // auth handled by layout.tsx
    const [rounds, setRounds] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [resultRound, setResultRound] = useState<any>(null);
    const [processing, setProcessing] = useState<string | null>(null);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const showToast = (type: 'success' | 'error', text: string) => {
        setToast({ type, text });
        setTimeout(() => setToast(null), 4000);
    };

    const fetchData = useCallback(async () => {
        try {
            const [roundsRes, statsRes] = await Promise.all([
                api.get('/rounds'),
                api.get('/admin/stats'),
            ]);
            setRounds(roundsRes.data);
            setStats(statsRes.data);
        } catch { }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleCalculate = async (roundId: string) => {
        setProcessing(roundId + '-calc');
        try {
            await api.post(`/prizes/calculate/${roundId}`);
            showToast('success', 'Acertos calculados com sucesso!');
            fetchData();
        } catch (err: any) {
            showToast('error', err.response?.data?.message || 'Erro ao calcular.');
        } finally {
            setProcessing(null);
        }
    };

    const handleDistribute = async (roundId: string) => {
        setProcessing(roundId + '-dist');
        try {
            await api.post(`/prizes/distribute/${roundId}`);
            showToast('success', 'Prêmios distribuídos com sucesso!');
            fetchData();
        } catch (err: any) {
            showToast('error', err.response?.data?.message || 'Erro ao distribuir.');
        } finally {
            setProcessing(null);
        }
    };

    if (authLoading) return null;

    return (
        <>
            <AnimatePresence>
                {showCreate && (
                    <CreateRoundModal
                        onClose={() => setShowCreate(false)}
                        onCreated={() => { fetchData(); showToast('success', 'Concurso criado com sucesso!'); }}
                    />
                )}
                {resultRound && (
                    <SetResultModal
                        round={resultRound}
                        onClose={() => setResultRound(null)}
                        onUpdated={() => { fetchData(); showToast('success', 'Resultados salvos!'); }}
                    />
                )}
            </AnimatePresence>

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`fixed top-20 right-4 z-50 px-5 py-3 border-l-2 flex items-center gap-3 text-sm font-medium shadow-2xl ${toast.type === 'success'
                            ? 'bg-[#071a0d] border-[#22c55e] text-[#22c55e]'
                            : 'bg-[#1c0b0b] border-red-500 text-red-400'
                            }`}
                    >
                        {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        {toast.text}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="space-y-8">

                {/* Header */}
                <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <p className="score-label text-[#22c55e] mb-1">VESTÍÁRIO</p>
                        <h1 className="text-3xl font-display font-black tracking-tight flex items-center gap-3">
                            <ShieldCheck className="w-8 h-8 text-[#f59e0b]" />
                            PAINEL ADMINISTRATIVO
                        </h1>
                    </div>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="btn-champion flex items-center gap-2 px-6 py-3 text-xs"
                    >
                        <Plus className="w-4 h-4" />
                        NOVO CONCURSO
                    </button>
                </header>

                <div className="h-px bg-gradient-to-r from-transparent via-[#14532d] to-transparent" />

                {/* Stats */}
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { icon: TrendingUp, label: 'VOLUME TOTAL', value: formatCurrency(stats.totalVolume), color: '#22c55e' },
                            { icon: Zap, label: 'FUNDO RESERVA', value: formatCurrency(stats.reserveFund), color: '#f59e0b' },
                            { icon: Database, label: 'TOTAL APOSTAS', value: String(stats.bets), color: '#38bdf8' },
                            { icon: Users, label: 'TOTAL USUÁRIOS', value: String(stats.users), color: '#a3a3a3' },
                        ].map((s, idx) => (
                            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.07 }}
                                className="stat-card p-5" style={{ borderLeftColor: s.color }}>
                                <div className="p-2 mb-3 w-fit" style={{ background: `${s.color}12` }}>
                                    <s.icon className="w-4 h-4" style={{ color: s.color }} />
                                </div>
                                <p className="score-label mb-1">{s.label}</p>
                                <p className="font-display font-black text-xl" style={{ color: s.color }}>{s.value}</p>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Rounds table */}
                <section>
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="font-display font-black text-xl flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-[#f59e0b]" />
                            GERENCIAR CONCURSOS
                        </h2>
                        <p className="score-label">{rounds.length} concurso(s)</p>
                    </div>

                    <div className="match-card overflow-hidden">
                        {rounds.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="text-4xl mb-3">🏟️</div>
                                <p className="score-label text-[#f0fdf4]/30 mb-4">NENHUM CONCURSO CRIADO</p>
                                <button onClick={() => setShowCreate(true)} className="btn-champion px-8 py-3 text-xs flex items-center gap-2 mx-auto">
                                    <Plus className="w-4 h-4" /> CRIAR PRIMEIRO CONCURSO
                                </button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-[#14532d]" style={{ background: '#00000040' }}>
                                            {['TÍTULO', 'STATUS', 'JOGOS', 'APOSTAS', 'POOL', 'AÇÕES'].map(h => (
                                                <th key={h} className="score-label px-5 py-3 text-left">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#14532d]/40">
                                        {rounds.map((round) => {
                                            const isCalc = processing === round.id + '-calc';
                                            const isDist = processing === round.id + '-dist';
                                            return (
                                                <tr key={round.id} className="hover:bg-[#071a0d]/40 transition-colors">
                                                    <td className="px-5 py-4">
                                                        <p className="font-display font-bold text-sm text-[#f0fdf4]/80">{round.title}</p>
                                                        <p className="text-[10px] text-[#f0fdf4]/25 mt-0.5">
                                                            Até {new Date(round.endTime).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <span className={`px-2.5 py-1 text-[10px] font-display font-black tracking-wider border ${STATUS_STYLES[round.status] ?? ''}`}>
                                                            {round.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4 font-bold text-[#f0fdf4]/50 text-sm">{round.matches?.length ?? 0}</td>
                                                    <td className="px-5 py-4 font-bold text-[#f0fdf4]/50 text-sm">{round._count?.betSlips ?? round.betSlips?.length ?? 0}</td>
                                                    <td className="px-5 py-4 font-display font-black text-sm text-[#f59e0b]">
                                                        {formatCurrency(round.poolAmount)}
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            {/* Set results */}
                                                            {round.status === 'OPEN' && (
                                                                <button
                                                                    onClick={() => setResultRound(round)}
                                                                    className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold tracking-wider border border-[#14532d] text-[#f0fdf4]/50 hover:border-[#22c55e]/40 hover:text-[#f0fdf4]/80 uppercase transition-all"
                                                                >
                                                                    <Settings2 className="w-3.5 h-3.5" />
                                                                    RESULTADOS
                                                                </button>
                                                            )}
                                                            {/* Calculate */}
                                                            {(round.status === 'OPEN' || round.status === 'CLOSED') && new Date(round.endTime) < new Date() && (
                                                                <button
                                                                    onClick={() => handleCalculate(round.id)}
                                                                    disabled={!!processing}
                                                                    className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold tracking-wider border border-[#38bdf8]/30 text-[#38bdf8] hover:bg-[#38bdf8]/08 uppercase transition-all disabled:opacity-50"
                                                                >
                                                                    {isCalc ? <div className="w-3 h-3 border border-[#38bdf8]/30 border-t-[#38bdf8] animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                                                                    CALCULAR
                                                                </button>
                                                            )}
                                                            {/* Distribute */}
                                                            {round.status === 'CLOSED' && (
                                                                <button
                                                                    onClick={() => handleDistribute(round.id)}
                                                                    disabled={!!processing}
                                                                    className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold tracking-wider bg-[#22c55e]/10 border border-[#22c55e]/30 text-[#22c55e] hover:bg-[#22c55e]/20 uppercase transition-all disabled:opacity-50"
                                                                >
                                                                    {isDist ? <div className="w-3 h-3 border border-[#22c55e]/20 border-t-[#22c55e] animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                                                                    DISTRIBUIR
                                                                </button>
                                                            )}
                                                            {/* View */}
                                                            <Link href={`/rounds/${round.id}`}
                                                                className="p-1.5 border border-[#14532d] text-[#f0fdf4]/30 hover:text-[#22c55e] hover:border-[#22c55e]/40 transition-all">
                                                                <ExternalLink className="w-3.5 h-3.5" />
                                                            </Link>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </>
    );
}
