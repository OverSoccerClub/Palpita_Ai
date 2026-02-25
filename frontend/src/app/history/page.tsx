'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import api from '@/services/api';
import { motion } from 'framer-motion';
import { History, ArrowUpCircle, ArrowDownCircle, TrendingUp, TrendingDown, Trophy, Wallet } from 'lucide-react';

type TxType = 'DEPOSIT' | 'WITHDRAW' | 'BET' | 'PRIZE';
type TxStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

interface Transaction {
    id: string;
    type: TxType;
    status: TxStatus;
    amount: string;
    description?: string;
    createdAt: string;
}

interface WalletData {
    balance: string;
    transactions: Transaction[];
}

const txConfig: Record<TxType, { label: string; color: string; sign: string; icon: React.ElementType }> = {
    DEPOSIT: { label: 'Depósito', color: '#22c55e', sign: '+', icon: ArrowDownCircle },
    PRIZE: { label: 'Prêmio', color: '#f59e0b', sign: '+', icon: Trophy },
    BET: { label: 'Aposta', color: '#f0fdf4', sign: '-', icon: TrendingDown },
    WITHDRAW: { label: 'Saque', color: '#38bdf8', sign: '-', icon: ArrowUpCircle },
};

const statusLabel: Record<TxStatus, { text: string; color: string }> = {
    PENDING: { text: 'Pendente', color: '#f59e0b' },
    SUCCESS: { text: 'Confirmado', color: '#22c55e' },
    FAILED: { text: 'Falhou', color: '#ef4444' },
};

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function formatCurrency(v: string | number) {
    return Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function HistoryPage() {
    const [wallet, setWallet] = useState<WalletData | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | TxType>('ALL');

    useEffect(() => {
        api.get('/wallet/me')
            .then(r => setWallet(r.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const txs = wallet?.transactions ?? [];
    const filtered = filter === 'ALL' ? txs : txs.filter(t => t.type === filter);

    const deposits = txs.filter(t => t.type === 'DEPOSIT' && t.status === 'SUCCESS').reduce((a, b) => a + Number(b.amount), 0);
    const prizes = txs.filter(t => t.type === 'PRIZE').reduce((a, b) => a + Number(b.amount), 0);
    const spent = txs.filter(t => t.type === 'BET').reduce((a, b) => a + Number(b.amount), 0);

    return (
        <MainLayout>
            <div className="space-y-8">
                {/* Header */}
                <div>
                    <p className="score-label text-[#22c55e] mb-1">MOVIMENTAÇÕES</p>
                    <h1 className="text-3xl md:text-4xl font-display font-black tracking-tight flex items-center gap-3">
                        <History className="w-8 h-8 text-[#22c55e]" />
                        EXTRATO
                    </h1>
                </div>

                {/* Balance + Summary */}
                {wallet && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="col-span-2 md:col-span-1 stat-card p-5 flex flex-col gap-1">
                            <div className="flex items-center gap-2 mb-1">
                                <Wallet className="w-4 h-4 text-[#22c55e]" />
                                <p className="score-label">SALDO</p>
                            </div>
                            <p className="font-display font-black text-2xl text-[#22c55e]">
                                R$ {formatCurrency(wallet.balance)}
                            </p>
                        </div>
                        {[
                            { label: 'DEPOSITADO', value: deposits, color: '#22c55e', icon: TrendingUp },
                            { label: 'PRÊMIOS', value: prizes, color: '#f59e0b', icon: Trophy },
                            { label: 'APOSTADO', value: spent, color: '#f0fdf4', icon: TrendingDown },
                        ].map(s => (
                            <div key={s.label} className="stat-card p-5">
                                <div className="flex items-center gap-2 mb-1">
                                    <s.icon className="w-4 h-4" style={{ color: s.color }} />
                                    <p className="score-label">{s.label}</p>
                                </div>
                                <p className="font-display font-black text-xl" style={{ color: s.color }}>
                                    R$ {formatCurrency(s.value)}
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Filters */}
                <div className="flex gap-2 flex-wrap">
                    {(['ALL', 'DEPOSIT', 'PRIZE', 'BET', 'WITHDRAW'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 text-[10px] font-display font-bold tracking-widest uppercase border transition-all ${filter === f
                                ? 'bg-[#22c55e] border-[#22c55e] text-[#020c06]'
                                : 'border-[#14532d] text-[#f0fdf4]/40 hover:border-[#22c55e]/40 hover:text-[#f0fdf4]/70'
                                }`}
                        >
                            {f === 'ALL' ? 'TODOS' : txConfig[f as TxType]?.label ?? f}
                        </button>
                    ))}
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-[#14532d] to-transparent" />

                {/* List */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-2 border-[#22c55e]/20 border-t-[#22c55e] animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 match-card p-12">
                        <div className="text-5xl mb-4">📋</div>
                        <p className="score-label text-[#f0fdf4]/30">NENHUMA MOVIMENTAÇÃO ENCONTRADA</p>
                    </div>
                ) : (
                    <div className="match-card overflow-hidden">
                        <div className="divide-y divide-[#14532d]/50">
                            {filtered.map((tx, idx) => {
                                const cfg = txConfig[tx.type];
                                const Icon = cfg.icon;
                                const st = statusLabel[tx.status];
                                const isCredit = tx.type === 'DEPOSIT' || tx.type === 'PRIZE';
                                return (
                                    <motion.div
                                        key={tx.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: idx * 0.03 }}
                                        className="flex items-center gap-4 px-5 py-4 hover:bg-[#14532d]/10 transition-colors"
                                    >
                                        {/* Icon */}
                                        <div className="w-10 h-10 flex items-center justify-center flex-shrink-0"
                                            style={{ background: `${cfg.color}12`, border: `1px solid ${cfg.color}25` }}>
                                            <Icon className="w-5 h-5" style={{ color: cfg.color }} />
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-display font-bold text-sm text-[#f0fdf4]/80 truncate">
                                                {tx.description || cfg.label}
                                            </p>
                                            <div className="flex items-center gap-3 mt-0.5">
                                                <span className="text-xs text-[#f0fdf4]/30">{formatDate(tx.createdAt)}</span>
                                                <span className="text-[10px] font-bold" style={{ color: st.color }}>{st.text}</span>
                                            </div>
                                        </div>

                                        {/* Amount */}
                                        <div className="text-right flex-shrink-0">
                                            <p className="font-display font-black text-base"
                                                style={{ color: isCredit ? cfg.color : '#f0fdf4' }}>
                                                {cfg.sign} R$ {formatCurrency(tx.amount)}
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
