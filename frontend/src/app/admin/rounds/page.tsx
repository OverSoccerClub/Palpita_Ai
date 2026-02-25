'use client';

import React, { useEffect, useState, useCallback } from 'react';
import api from '@/services/api';
import { Trophy, Plus, Settings2, CheckCircle2, AlertCircle, Zap, ExternalLink, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface MatchForm { homeTeam: string; homeLogo: string; awayTeam: string; awayLogo: string; stadium: string; startTime: string; }
const EMPTY_MATCH = (): MatchForm => ({ homeTeam: '', homeLogo: '', awayTeam: '', awayLogo: '', stadium: '', startTime: '' });

const STATUS_STYLES: Record<string, string> = {
    OPEN: 'border-[#22c55e]/30 text-[#22c55e]',
    CLOSED: 'border-[#f59e0b]/30 text-[#f59e0b]',
    FINALIZED: 'border-[#38bdf8]/30 text-[#38bdf8]',
    PROCESSED: 'border-[#a3a3a3]/30 text-[#a3a3a3]',
};

function fmt(v: number | string) { return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }

/* ── Create Round Modal ── */
function CreateRoundModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
    const [title, setTitle] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [matches, setMatches] = useState<MatchForm[]>(Array.from({ length: 14 }, EMPTY_MATCH));
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const updateMatch = (idx: number, field: keyof MatchForm, value: string) =>
        setMatches(prev => prev.map((m, i) => i === idx ? { ...m, [field]: value } : m));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const incomplete = matches.filter(m => !m.homeTeam.trim() || !m.awayTeam.trim() || !m.startTime);
        if (incomplete.length) { setError(`Preencha times e horário de todos os 14 jogos.`); return; }
        setSubmitting(true);
        try {
            await api.post('/rounds', { title, startTime, endTime, matches: matches.map(m => ({ homeTeam: m.homeTeam.trim(), homeLogo: m.homeLogo.trim() || undefined, awayTeam: m.awayTeam.trim(), awayLogo: m.awayLogo.trim() || undefined, stadium: m.stadium.trim() || undefined, startTime: m.startTime })) });
            onCreated(); onClose();
        } catch (err: any) {
            const msg = err.response?.data?.message;
            setError(Array.isArray(msg) ? msg.join(' ') : msg || 'Erro ao criar concurso.');
        } finally { setSubmitting(false); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 py-8 overflow-y-auto" style={{ background: 'rgba(0,0,0,0.9)' }}>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="w-full max-w-4xl border border-[#f59e0b]/15"
                style={{ background: 'linear-gradient(135deg, #0a0a00 0%, #0a0f05 100%)' }}>
                <div className="flex items-center justify-between p-5 border-b border-[#f59e0b]/10">
                    <div>
                        <p className="text-[10px] font-bold tracking-widest text-[#f59e0b]/60 uppercase mb-0.5">ADMIN</p>
                        <h2 className="font-display font-black text-xl text-[#f0fdf4]">CRIAR NOVO CONCURSO</h2>
                    </div>
                    <button onClick={onClose} className="p-2 border border-[#f59e0b]/15 text-[#f0fdf4]/30 hover:text-[#f0fdf4]"><X className="w-4 h-4" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-5">
                    {error && <div className="p-3 border-l-2 border-red-500 bg-red-900/10 text-red-400 text-xs">{error}</div>}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="md:col-span-3 space-y-1">
                            <label className="text-[10px] font-bold tracking-widest text-[#f0fdf4]/30 uppercase block">TÍTULO</label>
                            <input value={title} onChange={e => setTitle(e.target.value)} required className="field-input w-full px-3 py-2.5 text-sm" placeholder="Ex: Rodada 1 — Brasileirão 2026" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold tracking-widest text-[#f0fdf4]/30 uppercase block">INÍCIO</label>
                            <input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} required className="field-input w-full px-3 py-2.5 text-sm" />
                        </div>
                        <div className="md:col-span-2 space-y-1">
                            <label className="text-[10px] font-bold tracking-widest text-[#f0fdf4]/30 uppercase block">ENCERRAMENTO DAS APOSTAS</label>
                            <input type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} required className="field-input w-full px-3 py-2.5 text-sm" />
                        </div>
                    </div>
                    <div className="h-px" style={{ background: 'rgba(245,158,11,0.1)' }} />
                    <div>
                        <div className="hidden md:grid grid-cols-[20px_1fr_44px_1fr_44px_0.8fr_130px] gap-2 mb-2 px-1">
                            {['#', 'CASA (1)', '🏳', 'FORA (2)', '🏳', 'ESTÁDIO', 'DATA/HORA'].map(h => <p key={h} className="text-[9px] font-bold tracking-widest text-[#f0fdf4]/20 uppercase">{h}</p>)}
                        </div>
                        <div className="space-y-1.5">
                            {matches.map((m, idx) => (
                                <div key={idx} className="grid grid-cols-1 md:grid-cols-[20px_1fr_44px_1fr_44px_0.8fr_130px] gap-2 items-center p-2 border border-[#f59e0b]/08 hover:border-[#f59e0b]/15 transition-colors">
                                    <span className="hidden md:block text-center text-[10px] font-bold text-[#f0fdf4]/15">{idx + 1}</span>
                                    <input value={m.homeTeam} onChange={e => updateMatch(idx, 'homeTeam', e.target.value)} className="field-input px-2.5 py-2 text-xs" placeholder={`Casa ${idx + 1}`} required />
                                    {/* home logo */}
                                    <div className="relative flex items-center justify-center w-11 h-8 border border-[#f59e0b]/10">
                                        {m.homeLogo
                                            ? <img src={m.homeLogo} alt="" className="w-7 h-7 object-contain rounded" onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                                            : <label className="w-full h-full flex items-center justify-center cursor-pointer text-[#f0fdf4]/15 hover:text-[#f59e0b]/50">
                                                <input type="url" value={m.homeLogo} onChange={e => updateMatch(idx, 'homeLogo', e.target.value)} className="sr-only" placeholder="URL" />
                                                <span className="text-[10px]">URL</span>
                                            </label>
                                        }
                                        {m.homeLogo && <input type="url" value={m.homeLogo} onChange={e => updateMatch(idx, 'homeLogo', e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer w-full" title="Alterar URL do escudo" />}
                                    </div>
                                    <input value={m.awayTeam} onChange={e => updateMatch(idx, 'awayTeam', e.target.value)} className="field-input px-2.5 py-2 text-xs" placeholder={`Fora ${idx + 1}`} required />
                                    {/* away logo */}
                                    <div className="relative flex items-center justify-center w-11 h-8 border border-[#f59e0b]/10">
                                        {m.awayLogo
                                            ? <img src={m.awayLogo} alt="" className="w-7 h-7 object-contain rounded" onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                                            : <label className="w-full h-full flex items-center justify-center cursor-pointer text-[#f0fdf4]/15 hover:text-[#f59e0b]/50">
                                                <input type="url" value={m.awayLogo} onChange={e => updateMatch(idx, 'awayLogo', e.target.value)} className="sr-only" placeholder="URL" />
                                                <span className="text-[10px]">URL</span>
                                            </label>
                                        }
                                        {m.awayLogo && <input type="url" value={m.awayLogo} onChange={e => updateMatch(idx, 'awayLogo', e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer w-full" title="Alterar URL do escudo" />}
                                    </div>
                                    <input value={m.stadium} onChange={e => updateMatch(idx, 'stadium', e.target.value)} className="field-input px-2.5 py-2 text-xs" placeholder="Estádio" />
                                    <input type="datetime-local" value={m.startTime} onChange={e => updateMatch(idx, 'startTime', e.target.value)} className="field-input px-2 py-2 text-xs" required />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2 border-t border-[#f59e0b]/10">
                        <button type="button" onClick={onClose} className="px-6 py-2.5 border border-[#f59e0b]/15 text-[#f0fdf4]/40 text-xs font-bold tracking-widest uppercase">CANCELAR</button>
                        <button type="submit" disabled={submitting} className="px-8 py-2.5 text-xs font-bold tracking-widest uppercase flex items-center gap-2 disabled:opacity-50" style={{ background: '#f59e0b', color: '#000' }}>
                            {submitting ? <div className="w-4 h-4 border-2 border-black/20 border-t-black animate-spin" /> : <><Plus className="w-4 h-4" /> CRIAR</>}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

/* ── Set Result Modal ── */
function SetResultModal({ round, onClose, onUpdated }: { round: any; onClose: () => void; onUpdated: () => void }) {
    const [results, setResults] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSave = async () => {
        const pending = round.matches.filter((m: any) => !results[m.id] && !m.result);
        if (pending.length) { setError(`Defina o resultado de todos os ${round.matches.length} jogos.`); return; }
        setSubmitting(true);
        try {
            await Promise.all(round.matches.filter((m: any) => results[m.id]).map((m: any) => api.patch(`/rounds/match/${m.id}/result`, { result: results[m.id] })));
            onUpdated(); onClose();
        } catch (err: any) { setError(err.response?.data?.message || 'Erro ao salvar.'); }
        finally { setSubmitting(false); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.9)' }}>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="w-full max-w-xl border border-[#f59e0b]/15" style={{ background: '#0a0a00' }}>
                <div className="flex items-center justify-between p-4 border-b border-[#f59e0b]/10">
                    <h3 className="font-display font-black text-sm text-[#f0fdf4]">{round.title}</h3>
                    <button onClick={onClose} className="text-[#f0fdf4]/30 hover:text-[#f0fdf4]"><X className="w-4 h-4" /></button>
                </div>
                <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
                    {error && <p className="text-red-400 text-xs border-l-2 border-red-500 pl-3 mb-3">{error}</p>}
                    {round.matches?.map((m: any, idx: number) => {
                        const current = results[m.id] || m.result || '';
                        return (
                            <div key={m.id} className="flex items-center gap-3 p-2.5 border border-[#f59e0b]/08">
                                <span className="text-[10px] font-bold text-[#f0fdf4]/15 w-4 text-center">{idx + 1}</span>
                                <p className="flex-1 text-xs text-[#f0fdf4]/50">{m.homeTeam} <span className="text-[#f59e0b]/30 mx-1">×</span> {m.awayTeam}</p>
                                <div className="flex gap-1">
                                    {[{ v: 'H', l: '1' }, { v: 'D', l: 'X' }, { v: 'A', l: '2' }].map(o => (
                                        <button key={o.v} onClick={() => setResults(r => ({ ...r, [m.id]: o.v }))}
                                            className={`w-8 h-8 text-xs font-display font-black border transition-all ${current === o.v ? 'bg-[#22c55e] border-[#22c55e] text-[#020c06]' : 'border-[#f59e0b]/15 text-[#f0fdf4]/30 hover:border-[#f59e0b]/40'}`}>
                                            {o.l}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="p-4 border-t border-[#f59e0b]/10 flex justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2 border border-[#f59e0b]/15 text-[#f0fdf4]/40 text-xs font-bold uppercase">CANCELAR</button>
                    <button onClick={handleSave} disabled={submitting} className="px-6 py-2 text-xs font-bold uppercase flex items-center gap-2 disabled:opacity-50" style={{ background: '#f59e0b', color: '#000' }}>
                        {submitting ? <div className="w-3.5 h-3.5 border-2 border-black/20 border-t-black animate-spin" /> : <><CheckCircle2 className="w-3.5 h-3.5" />SALVAR</>}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

/* ── Page ── */
export default function AdminRoundsPage() {
    const [rounds, setRounds] = useState<any[]>([]);
    const [showCreate, setShowCreate] = useState(false);
    const [resultRound, setResultRound] = useState<any>(null);
    const [processing, setProcessing] = useState<string | null>(null);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const showToast = (type: 'success' | 'error', text: string) => { setToast({ type, text }); setTimeout(() => setToast(null), 4000); };

    const fetch = useCallback(async () => {
        try { const r = await api.get('/rounds'); setRounds(r.data); } catch { }
    }, []);

    useEffect(() => { fetch(); }, [fetch]);

    const handleCalc = async (id: string) => {
        setProcessing(id + '-c');
        try { await api.post(`/prizes/calculate/${id}`); showToast('success', 'Acertos calculados!'); fetch(); }
        catch (e: any) { showToast('error', e.response?.data?.message || 'Erro'); }
        finally { setProcessing(null); }
    };

    const handleDist = async (id: string) => {
        setProcessing(id + '-d');
        try { await api.post(`/prizes/distribute/${id}`); showToast('success', 'Prêmios distribuídos!'); fetch(); }
        catch (e: any) { showToast('error', e.response?.data?.message || 'Erro'); }
        finally { setProcessing(null); }
    };

    return (
        <>
            <AnimatePresence>
                {showCreate && <CreateRoundModal onClose={() => setShowCreate(false)} onCreated={() => { fetch(); showToast('success', 'Concurso criado!'); }} />}
                {resultRound && <SetResultModal round={resultRound} onClose={() => setResultRound(null)} onUpdated={() => { fetch(); showToast('success', 'Resultados salvos!'); }} />}
            </AnimatePresence>
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                        className={`fixed top-20 right-4 z-50 px-4 py-3 border-l-2 flex items-center gap-2 text-sm font-medium shadow-xl ${toast.type === 'success' ? 'bg-[#0a0f05] border-[#22c55e] text-[#22c55e]' : 'bg-[#1c0b0b] border-red-500 text-red-400'}`}>
                        {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />} {toast.text}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold tracking-widest text-[#f59e0b]/60 uppercase mb-0.5">GESTÃO</p>
                        <h1 className="font-display font-black text-2xl text-[#f0fdf4] flex items-center gap-2"><Trophy className="w-6 h-6 text-[#f59e0b]" />CONCURSOS</h1>
                    </div>
                    <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold tracking-widest uppercase" style={{ background: '#f59e0b', color: '#000' }}>
                        <Plus className="w-4 h-4" /> NOVO CONCURSO
                    </button>
                </div>

                <div className="border border-[#f59e0b]/10 overflow-hidden" style={{ background: '#050500' }}>
                    {rounds.length === 0 ? (
                        <div className="p-12 text-center">
                            <p className="text-[10px] font-bold tracking-widest text-[#f0fdf4]/20 uppercase mb-4">NENHUM CONCURSO</p>
                            <button onClick={() => setShowCreate(true)} className="px-6 py-2.5 text-xs font-bold uppercase flex items-center gap-2 mx-auto" style={{ background: '#f59e0b', color: '#000' }}>
                                <Plus className="w-4 h-4" /> CRIAR PRIMEIRO
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-[#f59e0b]/10" style={{ background: 'rgba(245,158,11,0.03)' }}>
                                        {['TÍTULO', 'STATUS', 'JOGOS', 'APOSTAS', 'POOL', 'AÇÕES'].map(h => (
                                            <th key={h} className="text-left px-4 py-3 text-[9px] font-bold tracking-widest text-[#f0fdf4]/25 uppercase">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#f59e0b]/05">
                                    {rounds.map(round => (
                                        <tr key={round.id} className="hover:bg-[#f59e0b]/03 transition-colors">
                                            <td className="px-4 py-3">
                                                <p className="font-display font-bold text-sm text-[#f0fdf4]/80">{round.title}</p>
                                                <p className="text-[10px] text-[#f0fdf4]/20 mt-0.5">Até {new Date(round.endTime).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 text-[9px] font-black tracking-wider border ${STATUS_STYLES[round.status] ?? ''}`}>{round.status}</span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-[#f0fdf4]/40 font-bold">{round.matches?.length ?? 0}</td>
                                            <td className="px-4 py-3 text-sm text-[#f0fdf4]/40 font-bold">{round._count?.betSlips ?? 0}</td>
                                            <td className="px-4 py-3 font-display font-black text-sm text-[#f59e0b]">{fmt(round.poolAmount)}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    {round.status === 'OPEN' && <button onClick={() => setResultRound(round)} className="flex items-center gap-1 px-2.5 py-1.5 text-[9px] font-bold uppercase border border-[#f59e0b]/20 text-[#f59e0b]/60 hover:text-[#f59e0b] transition-all"><Settings2 className="w-3 h-3" />RESULTADOS</button>}
                                                    {(round.status === 'OPEN' || round.status === 'CLOSED') && new Date(round.endTime) < new Date() && <button onClick={() => handleCalc(round.id)} disabled={!!processing} className="flex items-center gap-1 px-2.5 py-1.5 text-[9px] font-bold uppercase border border-[#38bdf8]/20 text-[#38bdf8]/60 hover:text-[#38bdf8] transition-all disabled:opacity-40">{processing === round.id + '-c' ? <div className="w-3 h-3 border border-[#38bdf8]/30 border-t-[#38bdf8] animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}CALCULAR</button>}
                                                    {round.status === 'CLOSED' && <button onClick={() => handleDist(round.id)} disabled={!!processing} className="flex items-center gap-1 px-2.5 py-1.5 text-[9px] font-bold uppercase border border-[#22c55e]/20 text-[#22c55e]/60 hover:text-[#22c55e] transition-all disabled:opacity-40">{processing === round.id + '-d' ? <div className="w-3 h-3 border border-[#22c55e]/20 border-t-[#22c55e] animate-spin" /> : <Zap className="w-3 h-3" />}DISTRIBUIR</button>}
                                                    <Link href={`/rounds/${round.id}`} className="p-1.5 border border-[#f59e0b]/10 text-[#f0fdf4]/20 hover:text-[#f59e0b] transition-all"><ExternalLink className="w-3 h-3" /></Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
