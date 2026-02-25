'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMessage } from '@/contexts/MessageContext';
import { MainLayout } from '@/components/layout/MainLayout';
import api from '@/services/api';
import {
    Wallet, ArrowUpCircle, Copy, CheckCircle2,
    QrCode, ArrowRight, Zap, ShieldCheck, Clock,
    XCircle, Loader2, History as HistoryIcon, RefreshCw,
    Search as SearchIcon, ChevronLeft, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const QUICK_AMOUNTS = ['10', '20', '50', '100'];
const POLL_INTERVAL_MS = 5000;
const PIX_EXPIRE_MINUTES = 30;

interface Transaction {
    id: string;
    amount: number;
    type: 'DEPOSIT' | 'WITHDRAW' | 'BET' | 'PRIZE';
    status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
    description: string;
    createdAt: string;
}

type PaymentStatus = 'PENDING' | 'APPROVED' | 'CANCELLED' | 'EXPIRED';

interface PixSession {
    paymentOrderId: string;
    pixCode: string;
    pixQrBase64?: string;
    expiresAt: string;
}

/* ── Status Pill ──────────────────────────────── */
function StatusPill({ status }: { status: PaymentStatus }) {
    const map: Record<PaymentStatus, { label: string; color: string; icon: React.ReactNode }> = {
        PENDING: {
            label: 'Aguardando pagamento…',
            color: '#f59e0b',
            icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
        },
        APPROVED: {
            label: 'Pagamento confirmado! ✅',
            color: '#22c55e',
            icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        },
        CANCELLED: {
            label: 'Pagamento cancelado',
            color: '#ef4444',
            icon: <XCircle className="w-3.5 h-3.5" />,
        },
        EXPIRED: {
            label: 'Pix expirado',
            color: '#6b7280',
            icon: <Clock className="w-3.5 h-3.5" />,
        },
    };
    const { label, color, icon } = map[status];
    return (
        <div
            className="flex items-center justify-center gap-2 px-4 py-2 border text-xs font-bold tracking-wide"
            style={{ borderColor: `${color}40`, background: `${color}10`, color }}
        >
            {icon} {label}
        </div>
    );
}

export default function WalletPage() {
    const { user, refreshUser } = useAuth() as any;
    const { showAlert } = useMessage();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [localBalance, setLocalBalance] = useState<number | null>(null);
    const [loadingWallet, setLoadingWallet] = useState(true);
    const [amount, setAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [pixSession, setPixSession] = useState<PixSession | null>(null);
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('PENDING');
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [pixKey, setPixKey] = useState('');
    const [withdrawSuccess, setWithdrawSuccess] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [filterType, setFilterType] = useState('');
    const [searchHash, setSearchHash] = useState('');
    const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const getBalance = useCallback((val: any) => {
        if (val === undefined || val === null) return 0;
        if (typeof val === 'object' && val.toString) return Number(val.toString());
        return Number(val);
    }, []);

    const balance = localBalance ?? getBalance(user?.wallet?.balance);

    const fetchWallet = useCallback(async (silent = false) => {
        try {
            if (!silent) setLoadingWallet(true);
            const params = new URLSearchParams({
                page: String(currentPage),
                limit: String(itemsPerPage),
            });
            if (filterType) params.append('type', filterType);
            if (searchHash) params.append('search', searchHash);

            const res = await api.get(`/wallet/me?${params.toString()}`);
            setTransactions(res.data.transactions || []);
            setLocalBalance(getBalance(res.data.balance));
            if (res.data.pagination) {
                setPagination(res.data.pagination);
            }
        } catch (err) {
            console.error('Erro ao buscar carteira', err);
        } finally {
            if (!silent) setLoadingWallet(false);
        }
    }, [getBalance, currentPage, itemsPerPage, filterType, searchHash]);

    // Load wallet data on mount and dependencies change
    useEffect(() => {
        fetchWallet();
    }, [fetchWallet]);

    // Update Pix Key when user profile (CPF) is loaded
    useEffect(() => {
        if (user?.cpf) {
            setPixKey(user.cpf);
        }
    }, [user?.cpf]);

    /* ── Polling ── */
    const stopPolling = useCallback(() => {
        if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    }, []);

    const startPolling = useCallback((orderId: string) => {
        stopPolling();
        pollRef.current = setInterval(async () => {
            try {
                const res = await api.get(`/wallet/payment-status/${orderId}`);
                const status: PaymentStatus = res.data.status;
                setPaymentStatus(status);
                if (status !== 'PENDING') {
                    stopPolling();
                    if (status === 'APPROVED') {
                        // Refresh user data & wallet (global + local)
                        fetchWallet(true);
                        if (typeof refreshUser === 'function') refreshUser();
                    }
                }
            } catch { /* ignore */ }
        }, POLL_INTERVAL_MS);
    }, [stopPolling, refreshUser]);

    useEffect(() => () => stopPolling(), [stopPolling]);

    const handleDeposit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setPixSession(null);
        setPaymentStatus('PENDING');
        try {
            const res = await api.post('/wallet/deposit', { amount: Number(amount) });
            const session: PixSession = {
                paymentOrderId: res.data.paymentOrderId,
                pixCode: res.data.pixCode,
                pixQrBase64: res.data.pixQrBase64,
                expiresAt: res.data.expiresAt,
            };
            setPixSession(session);
            startPolling(session.paymentOrderId);
        } catch (err: any) {
            const msg = err.response?.data?.message;
            showAlert('Erro no Depósito', Array.isArray(msg) ? msg[0] : msg || 'Erro ao gerar o Pix.', 'danger');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setWithdrawSuccess(false);
        try {
            await api.post('/wallet/withdraw', {
                amount: Number(withdrawAmount),
                pixKey: pixKey
            });
            setWithdrawSuccess(true);
            setWithdrawAmount('');
            if (user?.cpf) setPixKey(user.cpf);
            if (typeof fetchWallet === 'function') fetchWallet(true);
            if (typeof refreshUser === 'function') refreshUser();
        } catch (err: any) {
            const msg = err.response?.data?.message;
            showAlert('Erro no Saque', Array.isArray(msg) ? msg[0] : msg || 'Erro ao processar o saque.', 'danger');
        } finally {
            setIsSubmitting(false);
        }
    };

    const copyToClipboard = () => {
        if (pixSession?.pixCode) {
            navigator.clipboard.writeText(pixSession.pixCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        }
    };

    const copyTransactionId = (id: string) => {
        navigator.clipboard.writeText(id);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const resetSession = () => {
        stopPolling();
        setPixSession(null);
        setPaymentStatus('PENDING');
        setAmount('');
        setWithdrawAmount('');
        if (user?.cpf) setPixKey(user.cpf);
        setWithdrawSuccess(false);
    };

    if (!user) return null;

    const isFinal = pixSession && paymentStatus !== 'PENDING';

    return (
        <MainLayout>
            <div className="space-y-6">

                {/* ── Header ── */}
                <div>
                    <p className="score-label text-[#22c55e] mb-0.5">FINANCEIRO</p>
                    <h1 className="font-display font-black text-2xl md:text-3xl flex items-center gap-3">
                        <Wallet className="w-7 h-7 text-[#f59e0b]" />
                        Minha Carteira
                    </h1>
                    <p className="text-[#f0fdf4]/30 text-sm mt-1">Gerencie seu saldo e realize depósitos via Pix.</p>
                </div>

                {/* ── Balance + Deposit ── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Balance card */}
                    <div className="md:col-span-1 stat-card p-6 flex flex-col justify-between gap-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none"
                            style={{ background: 'radial-gradient(circle at top right, rgba(245,158,11,0.06), transparent 70%)' }} />
                        <div>
                            <div className="flex items-center justify-between gap-1 mb-2">
                                <p className="score-label">SALDO DISPONÍVEL</p>
                                <button
                                    onClick={() => fetchWallet()}
                                    className="p-1 hover:bg-[#22c55e]/10 rounded-full transition-colors group"
                                    title="Atualizar saldo"
                                >
                                    <RefreshCw className={`w-3.5 h-3.5 text-[#22c55e]/40 group-hover:text-[#22c55e] ${loadingWallet ? 'animate-spin' : ''}`} />
                                </button>
                            </div>
                            <p className="font-display font-black text-4xl md:text-5xl text-[#f59e0b] tabular-nums">
                                {balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </p>
                        </div>
                        <div className="space-y-2.5 border-t border-[#14532d]/40 pt-4">
                            {[
                                { icon: Zap, text: 'Depósito Pix instantâneo' },
                                { icon: ShieldCheck, text: 'Saldo protegido e seguro' },
                                { icon: CheckCircle2, text: 'Saques em até 24h úteis' },
                            ].map(item => (
                                <div key={item.text} className="flex items-center gap-2 text-xs text-[#f0fdf4]/40">
                                    <item.icon className="w-3.5 h-3.5 text-[#22c55e] shrink-0" />
                                    {item.text}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Deposit form / PIX display */}
                    <div className="md:col-span-2 match-card p-6">
                        <div className="flex items-center gap-4 mb-6 border-b border-[#14532d]/30">
                            <button
                                onClick={() => { setActiveTab('deposit'); }}
                                className={`pb-3 text-xs font-display font-black tracking-widest transition-all relative ${activeTab === 'deposit' ? 'text-[#22c55e]' : 'text-[#f0fdf4]/20 hover:text-[#f0fdf4]/40'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <ArrowUpCircle className="w-4 h-4" />
                                    DEPÓSITO
                                </div>
                                {activeTab === 'deposit' && (
                                    <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#22c55e]" />
                                )}
                            </button>
                            <button
                                onClick={() => { setActiveTab('withdraw'); }}
                                className={`pb-3 text-xs font-display font-black tracking-widest transition-all relative ${activeTab === 'withdraw' ? 'text-[#f59e0b]' : 'text-[#f0fdf4]/20 hover:text-[#f0fdf4]/40'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <Zap className="w-4 h-4" />
                                    SAQUE PIX
                                </div>
                                {activeTab === 'withdraw' && (
                                    <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#f59e0b]" />
                                )}
                            </button>
                        </div>

                        <AnimatePresence mode="wait">
                            {activeTab === 'deposit' ? (
                                <motion.div key="deposit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    <h3 className="font-display font-black text-lg flex items-center gap-2 mb-5">
                                        <ArrowUpCircle className="w-5 h-5 text-[#22c55e]" />
                                        Recarregar com Pix
                                    </h3>

                                    <AnimatePresence mode="wait">
                                        {!pixSession ? (
                                            <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                                onSubmit={handleDeposit} className="space-y-5">
                                                <div>
                                                    <label className="block score-label mb-2">VALOR DO DEPÓSITO</label>
                                                    <div className="relative">
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-display font-black text-[#f0fdf4]/30 text-lg pointer-events-none">R$</span>
                                                        <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                                                            className="field-input w-full pl-12 pr-4 py-4 text-2xl font-display font-black"
                                                            placeholder="0,00" required min="10" />
                                                    </div>
                                                    <p className="text-[10px] text-[#f0fdf4]/20 mt-1.5 font-bold">* VALOR MÍNIMO: R$ 10,00</p>
                                                </div>
                                                <div className="grid grid-cols-4 gap-2">
                                                    {QUICK_AMOUNTS.map(val => (
                                                        <button key={val} type="button" onClick={() => setAmount(val)}
                                                            className={`py-2.5 border text-xs font-display font-bold tracking-wider transition-all ${amount === val
                                                                ? 'border-[#22c55e] text-[#22c55e] bg-[#22c55e]/08'
                                                                : 'border-[#14532d] text-[#f0fdf4]/40 hover:border-[#22c55e]/40 hover:text-[#f0fdf4]/70'}`}>
                                                            R$ {val}
                                                        </button>
                                                    ))}
                                                </div>
                                                <button type="submit" disabled={isSubmitting || !amount}
                                                    className="btn-champion w-full py-4 flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed">
                                                    {isSubmitting
                                                        ? <div className="w-5 h-5 border-2 border-[#020c06]/30 border-t-[#020c06] animate-spin" />
                                                        : <><QrCode className="w-5 h-5" /> GERAR QR CODE PIX <ArrowRight className="w-5 h-5" /></>}
                                                </button>
                                            </motion.form>
                                        ) : (
                                            <motion.div key="pix" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                                className="flex flex-col items-center text-center space-y-4">

                                                <StatusPill status={paymentStatus} />

                                                {paymentStatus === 'PENDING' && (
                                                    <>
                                                        {pixSession.pixQrBase64 ? (
                                                            <img src={`data:image/png;base64,${pixSession.pixQrBase64}`}
                                                                alt="QR Code Pix" className="w-44 h-44 border border-[#14532d] bg-white p-2" />
                                                        ) : (
                                                            <div className="p-5 border border-[#14532d] bg-white">
                                                                <QrCode className="w-44 h-44 text-black" />
                                                            </div>
                                                        )}

                                                        <div className="w-full space-y-2">
                                                            <p className="score-label">COPIE O CÓDIGO PIX ABAIXO</p>
                                                            <div className="flex gap-2">
                                                                <input readOnly value={pixSession.pixCode}
                                                                    className="field-input flex-1 text-xs font-mono px-3 py-2.5" />
                                                                <button onClick={copyToClipboard}
                                                                    className={`px-4 py-2.5 border flex items-center gap-2 text-xs font-bold tracking-wider transition-all ${copied
                                                                        ? 'border-[#22c55e] bg-[#22c55e]/10 text-[#22c55e]'
                                                                        : 'border-[#14532d] text-[#f0fdf4]/40 hover:border-[#22c55e]/40 hover:text-[#f0fdf4]/70'}`}>
                                                                    {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                                    {copied ? 'COPIADO!' : 'COPIAR'}
                                                                </button>
                                                            </div>
                                                            <p className="text-[9px] text-[#f0fdf4]/20 flex items-center justify-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                Expira em {PIX_EXPIRE_MINUTES} minutos
                                                            </p>
                                                        </div>
                                                    </>
                                                )}

                                                {paymentStatus === 'APPROVED' && (
                                                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                                        className="py-6 flex flex-col items-center gap-3">
                                                        <div className="text-5xl">🎉</div>
                                                        <p className="font-display font-black text-lg text-[#22c55e]">Depósito realizado!</p>
                                                        <p className="text-xs text-[#f0fdf4]/40">Seu saldo foi atualizado automaticamente.</p>
                                                    </motion.div>
                                                )}

                                                <button onClick={resetSession}
                                                    className="text-xs font-bold text-[#22c55e]/60 hover:text-[#22c55e] transition-colors tracking-wider uppercase border-b border-[#22c55e]/20 pb-0.5">
                                                    ← {isFinal ? 'Fazer novo depósito' : 'Cancelar e voltar'}
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ) : (
                                <motion.div key="withdraw" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    <h3 className="font-display font-black text-lg flex items-center gap-2 mb-5">
                                        <Zap className="w-5 h-5 text-[#f59e0b]" />
                                        Sacar para sua conta
                                    </h3>

                                    {withdrawSuccess ? (
                                        <div className="py-12 flex flex-col items-center text-center gap-4">
                                            <div className="w-16 h-16 bg-[#22c55e]/10 border border-[#22c55e]/20 flex items-center justify-center">
                                                <CheckCircle2 className="w-8 h-8 text-[#22c55e]" />
                                            </div>
                                            <div>
                                                <p className="font-display font-black text-lg text-[#22c55e]">Solicitação enviada!</p>
                                                <p className="text-xs text-[#f0fdf4]/40 mt-1 max-w-[280px]">Seu pedido de saque foi recebido e será processado em até 24h úteis.</p>
                                            </div>
                                            <button onClick={() => setWithdrawSuccess(false)}
                                                className="text-xs font-bold text-[#22c55e] hover:underline uppercase tracking-widest mt-2">
                                                Fazer outro saque
                                            </button>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleWithdraw} className="space-y-5">

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block score-label mb-2 opacity-50 text-[9px]">VALOR DO SAQUE</label>
                                                    <div className="relative">
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-display font-black text-[#f0fdf4]/30 text-base pointer-events-none">R$</span>
                                                        <input type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)}
                                                            className="field-input w-full pl-10 pr-4 py-3 text-lg font-display font-black"
                                                            placeholder="0,00" required min="20" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block score-label mb-2">SUA CHAVE PIX (CPF DO TITULAR)</label>
                                                    <input type="text" value={pixKey} readOnly
                                                        className="field-input w-full px-4 py-3 text-sm font-bold font-mono opacity-50 cursor-not-allowed bg-[#0a0a0a]"
                                                        placeholder="Seu CPF de cadastro" />
                                                    <p className="text-[9px] text-[#f59e0b]/40 mt-1 font-bold uppercase tracking-tighter">
                                                        * O saque é enviado exclusivamente para o CPF do titular da conta.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="p-4 bg-[#000000]/20 border border-[#14532d]/30 text-left">
                                                <p className="text-[10px] text-[#f0fdf4]/40 flex gap-2">
                                                    O valor solicitado será debitado agora e transferido para a chave Pix informada após verificação de segurança.
                                                </p>
                                            </div>

                                            <button type="submit" disabled={isSubmitting || !withdrawAmount || !pixKey}
                                                className="btn-champion w-full py-4 flex items-center justify-center gap-3 disabled:opacity-40">
                                                {isSubmitting
                                                    ? <div className="w-5 h-5 border-2 border-[#020c06]/30 border-t-[#020c06] animate-spin" />
                                                    : <><Zap className="w-5 h-5" /> SOLICITAR SAQUE AGORA</>}
                                            </button>
                                        </form>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* ── Transactions ── */}
                <div>
                    <h3 className="score-label mb-4 flex items-center gap-2">
                        <HistoryIcon className="w-4 h-4 text-[#22c55e]" />
                        TRANSAÇÕES RECENTES
                    </h3>

                    {/* Filter Bar */}
                    <div className="flex flex-col md:flex-row gap-4 mb-4">
                        <div className="flex-1 relative group">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#f0fdf4]/20 group-focus-within:text-[#22c55e] transition-colors" />
                            <input
                                type="text"
                                value={searchHash}
                                onChange={(e) => { setSearchHash(e.target.value); setCurrentPage(1); }}
                                placeholder="Buscar por Hash (#TX-XXXX)..."
                                className="field-input w-full pl-9 py-2.5 text-xs font-mono"
                            />
                        </div>
                        <div className="flex gap-4">
                            <select
                                value={filterType}
                                onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
                                className="field-input py-2.5 px-4 text-xs font-bold bg-[#0a0a0a] min-w-[140px] text-[#22c55e] focus:bg-[#0a0a0a]"
                            >
                                <option value="" className="bg-[#0a0a0a] text-[#f0fdf4]/60">TODOS OS TIPOS</option>
                                <option value="DEPOSIT" className="bg-[#0a0a0a] text-[#f0fdf4]/60">DEPÓSITOS</option>
                                <option value="WITHDRAW" className="bg-[#0a0a0a] text-[#f0fdf4]/60">SAQUES</option>
                                <option value="BET" className="bg-[#0a0a0a] text-[#f0fdf4]/60">APOSTAS</option>
                                <option value="PRIZE" className="bg-[#0a0a0a] text-[#f0fdf4]/60">PRÊMIOS</option>
                            </select>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                                className="field-input py-2.5 px-4 text-xs font-bold bg-[#0a0a0a] text-[#22c55e] focus:bg-[#0a0a0a]"
                            >
                                <option value="10" className="bg-[#0a0a0a] text-[#f0fdf4]/60">10 / PÁG</option>
                                <option value="20" className="bg-[#0a0a0a] text-[#f0fdf4]/60">20 / PÁG</option>
                                <option value="50" className="bg-[#0a0a0a] text-[#f0fdf4]/60">50 / PÁG</option>
                            </select>
                        </div>
                    </div>

                    <div className="match-card overflow-hidden">
                        {loadingWallet ? (
                            <div className="p-12 flex flex-col items-center justify-center gap-3">
                                <Loader2 className="w-8 h-8 text-[#22c55e] animate-spin opacity-20" />
                                <p className="score-label text-[#f0fdf4]/20">Carregando histórico...</p>
                            </div>
                        ) : transactions.length === 0 ? (
                            <div className="p-16 text-center">
                                <div className="p-4 bg-[#14532d]/10 border border-[#14532d]/40 w-fit mx-auto mb-4">
                                    <Wallet className="w-8 h-8 text-[#f0fdf4]/10" />
                                </div>
                                <p className="text-[#f0fdf4]/20 text-sm font-bold tracking-tight uppercase">Nenhuma transação encontrada.</p>
                                <p className="text-[10px] text-[#f0fdf4]/10 mt-1 uppercase tracking-widest font-bold">Seu histórico aparecerá aqui</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-[#14532d]/40" style={{ background: 'rgba(0,0,0,0.2)' }}>
                                            <th className="px-5 py-3 score-label">ESTATÍSTICA / DATA</th>
                                            <th className="px-5 py-3 score-label">TIPO / DESCRIÇÃO</th>
                                            <th className="px-5 py-3 score-label text-right">VALOR</th>
                                            <th className="px-5 py-3 score-label text-center">STATUS</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#14532d]/20">
                                        {transactions.map((tx) => (
                                            <tr key={tx.id} className="hover:bg-[#f0fdf4]/03 transition-colors group">
                                                <td className="px-5 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black text-[#f0fdf4]/20 uppercase tracking-widest">
                                                            {new Date(tx.createdAt).toLocaleDateString('pt-BR')}
                                                        </span>
                                                        <span className="text-xs text-[#f0fdf4]/40 font-bold font-mono">
                                                            {new Date(tx.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex flex-col">
                                                        <span className={`text-[10px] font-black tracking-widest uppercase mb-1 ${tx.type === 'DEPOSIT' || tx.type === 'PRIZE' ? 'text-[#22c55e]' : 'text-[#ef4444]'
                                                            }`}>
                                                            {tx.type}
                                                        </span>
                                                        <span className="text-xs text-[#f0fdf4]/80 font-bold tracking-tight">
                                                            {tx.description}
                                                        </span>
                                                        <div className="flex items-center gap-2 mt-2 px-2 py-1 bg-[#f59e0b]/05 border border-[#f59e0b]/20 w-fit group/hash cursor-pointer relative"
                                                            onClick={() => copyTransactionId(tx.id)}
                                                            title="Clique para copiar o ID completo">
                                                            <span className="text-[10px] font-mono font-bold text-[#f59e0b]/60 group-hover/hash:text-[#f59e0b] transition-colors">
                                                                #TX-{tx.id.split('-')[0].toUpperCase()}
                                                            </span>
                                                            <div className="relative">
                                                                <AnimatePresence mode="wait">
                                                                    {copiedId === tx.id ? (
                                                                        <motion.div
                                                                            key="check"
                                                                            initial={{ scale: 0, opacity: 0 }}
                                                                            animate={{ scale: 1, opacity: 1 }}
                                                                            exit={{ scale: 0, opacity: 0 }}
                                                                            className="absolute -top-1.5 -right-1"
                                                                        >
                                                                            <CheckCircle2 className="w-2.5 h-2.5 text-[#22c55e]" />
                                                                        </motion.div>
                                                                    ) : (
                                                                        <motion.div
                                                                            key="copy"
                                                                            initial={{ opacity: 0 }}
                                                                            animate={{ opacity: 0.3 }}
                                                                            className="group-hover/hash:opacity-100 transition-opacity"
                                                                        >
                                                                            <Copy className="w-2.5 h-2.5 text-[#f59e0b]" />
                                                                        </motion.div>
                                                                    )}
                                                                </AnimatePresence>
                                                            </div>

                                                            <AnimatePresence>
                                                                {copiedId === tx.id && (
                                                                    <motion.span
                                                                        initial={{ opacity: 0, x: 5 }}
                                                                        animate={{ opacity: 1, x: 0 }}
                                                                        exit={{ opacity: 0, x: 5 }}
                                                                        className="absolute left-full ml-2 text-[8px] font-black text-[#22c55e] uppercase tracking-widest whitespace-nowrap"
                                                                    >
                                                                        Copiado!
                                                                    </motion.span>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className={`px-5 py-4 text-right font-display font-black text-sm tracking-tight ${tx.type === 'DEPOSIT' || tx.type === 'PRIZE' ? 'text-[#22c55e]' : 'text-[#f0fdf4]/60'
                                                    }`}>
                                                    {(tx.type === 'DEPOSIT' || tx.type === 'PRIZE' ? '+' : '-')}{' '}
                                                    {Number(tx.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                </td>
                                                <td className="px-5 py-4 text-center">
                                                    <span className={`inline-flex items-center px-2 py-1 text-[9px] font-black tracking-widest border uppercase ${tx.status === 'SUCCESS'
                                                        ? 'border-[#22c55e]/20 text-[#22c55e] bg-[#22c55e]/05'
                                                        : tx.status === 'PENDING'
                                                            ? 'border-[#f59e0b]/20 text-[#f59e0b] bg-[#f59e0b]/05'
                                                            : 'border-[#ef4444]/20 text-[#ef4444] bg-[#ef4444]/05'
                                                        }`}>
                                                        {tx.status === 'SUCCESS' ? 'CONCLUÍDO' : tx.status === 'PENDING' ? 'PENDENTE' : 'FALHA'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination Footer */}
                        {!loadingWallet && transactions.length > 0 && (
                            <div className="px-5 py-4 border-t border-[#14532d]/40 flex items-center justify-between bg-[#14532d]/05">
                                <span className="text-[10px] font-black text-[#f0fdf4]/20 uppercase tracking-widest">
                                    Página {currentPage} de {pagination.totalPages} — {pagination.total} registros
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        className="p-1.5 border border-[#14532d]/40 text-[#f0fdf4]/40 hover:text-[#22c55e] hover:border-[#22c55e]/40 disabled:opacity-20 transition-all"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button
                                        disabled={currentPage >= pagination.totalPages}
                                        onClick={() => setCurrentPage(p => p + 1)}
                                        className="p-1.5 border border-[#14532d]/40 text-[#f0fdf4]/40 hover:text-[#22c55e] hover:border-[#22c55e]/40 disabled:opacity-20 transition-all"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
