'use client';

import React, { useState, useEffect } from 'react';
import {
    Zap, CheckCircle2, XCircle, Search,
    Clock, Wallet, User as UserIcon,
    ArrowRight, Loader2, AlertCircle, Copy
} from 'lucide-react';
import api from '@/services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useMessage } from '@/contexts/MessageContext';

interface Withdrawal {
    id: string;
    amount: string;
    status: 'PENDING' | 'SUCCESS' | 'CANCELLED' | 'FAILED';
    description: string;
    createdAt: string;
    wallet: {
        user: {
            name: string;
            cpf: string;
            email: string;
        }
    }
}

export default function AdminWithdrawalsPage() {
    const { showAlert, showConfirm } = useMessage();
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [isAutomatic, setIsAutomatic] = useState(true);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const fetchGatewayConfig = async () => {
        try {
            const res = await api.get('/admin/gateways');
            const active = res.data.find((g: any) => g.isActive);
            if (active) setIsAutomatic(active.automaticWithdrawal);
        } catch (err) {
            console.error('Erro ao buscar config do gateway', err);
        }
    };

    useEffect(() => {
        fetchWithdrawals();
        fetchGatewayConfig();
    }, []);

    const fetchWithdrawals = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/withdrawals');
            setWithdrawals(res.data.data);
        } catch (err) {
            console.error('Erro ao buscar saques', err);
            showAlert('Erro', 'Falha ao carregar lista de saques.', 'danger');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: string, action: 'approve' | 'reject' | 'retry-payout') => {
        let title = '';
        let description = '';
        let confirmText = '';
        let type: 'success' | 'danger' | 'warning' = 'success';

        if (action === 'approve') {
            title = isAutomatic ? 'Aprovar Saque Automático?' : 'Aprovar Saque Manual?';
            description = isAutomatic
                ? 'O dinheiro será transferido IMEDIATAMENTE para a conta do usuário via Pix.'
                : 'Confirme que você realizou a transferência via Pix MANUALMENTE para este usuário.';
            confirmText = isAutomatic ? 'Sim, Transferir Agora' : 'Sim, Marcar como Pago';
            type = 'success';
        } else if (action === 'reject') {
            title = 'Rejeitar Saque?';
            description = 'O valor solicitado será estornado automaticamente para o saldo do usuário.';
            confirmText = 'Sim, Rejeitar';
            type = 'danger';
        } else if (action === 'retry-payout') {
            title = 'Retentar Payout Automático?';
            description = 'O sistema tentará enviar o dinheiro via API agora. Use apenas se o pagamento manual não foi feito.';
            confirmText = 'Sim, Tentar Novamente';
            type = 'warning';
        }

        showConfirm({
            title,
            description,
            type,
            confirmText,
            onConfirm: () => executeAction(id, action)
        });
    };

    const executeAction = async (id: string, action: 'approve' | 'reject' | 'retry-payout') => {
        setProcessingId(id);
        try {
            await api.patch(`/admin/withdrawals/${id}/${action}`);
            showAlert('Sucesso', 'Ação processada com sucesso.', 'success');
            fetchWithdrawals();
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Erro ao processar ação.';
            showAlert('Erro no Processamento', msg, 'danger');
        } finally {
            setProcessingId(null);
        }
    };

    const copyTransactionId = (id: string) => {
        navigator.clipboard.writeText(id);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const filteredWithdrawals = withdrawals.filter(w =>
        w.wallet.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.wallet.user.cpf.includes(searchTerm) ||
        w.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <p className="text-[10px] font-bold tracking-[.2em] text-[#f59e0b] uppercase mb-1">Gestão Financeira</p>
                    <h1 className="font-display font-black text-2xl md:text-3xl flex items-center gap-3">
                        <Zap className="w-8 h-8 text-[#f59e0b]" />
                        Solicitações de Saque
                    </h1>
                </div>

                <div className="relative group max-w-sm w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#f0fdf4]/20 group-focus-within:text-[#f59e0b] transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar por nome, CPF ou chave Pix..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-[#000] border border-[#f59e0b]/10 py-3 pl-12 pr-4 text-sm font-bold placeholder:text-[#f0fdf4]/10 focus:border-[#f59e0b]/40 outline-none transition-all"
                    />
                </div>
            </div>

            {/* Withdrawal List */}
            <div className="match-card overflow-hidden">
                {loading ? (
                    <div className="p-20 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="w-10 h-10 text-[#f59e0b] animate-spin" />
                        <p className="text-[10px] font-bold tracking-widest text-[#f59e0b]/40 uppercase">Carregando dados...</p>
                    </div>
                ) : filteredWithdrawals.length === 0 ? (
                    <div className="p-20 text-center">
                        <div className="w-16 h-16 bg-[#f59e0b]/5 border border-[#f59e0b]/10 flex items-center justify-center mx-auto mb-4">
                            <Zap className="w-8 h-8 text-[#f59e0b]/20" />
                        </div>
                        <p className="text-[#f0fdf4]/30 font-bold uppercase tracking-tight">Nenhuma solicitação encontrada.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#000] border-b border-[#f59e0b]/10">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black tracking-widest text-[#f0fdf4]/40 uppercase">Usuário / CPF</th>
                                    <th className="px-6 py-4 text-[10px] font-black tracking-widest text-[#f0fdf4]/40 uppercase">Valor</th>
                                    <th className="px-6 py-4 text-[10px] font-black tracking-widest text-[#f0fdf4]/40 uppercase">Chave Pix / Info</th>
                                    <th className="px-6 py-4 text-[10px] font-black tracking-widest text-[#f0fdf4]/40 uppercase">Data</th>
                                    <th className="px-6 py-4 text-[10px] font-black tracking-widest text-[#f0fdf4]/40 uppercase">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-black tracking-widest text-[#f0fdf4]/40 uppercase text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#f59e0b]/05">
                                {filteredWithdrawals.map(w => (
                                    <tr key={w.id} className="hover:bg-[#f59e0b]/03 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-[#f59e0b]/5 border border-[#f59e0b]/10 flex items-center justify-center text-[#f59e0b]">
                                                    <UserIcon className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-display font-black text-sm text-[#f0fdf4]">{w.wallet.user.name}</p>
                                                    <p className="text-[10px] font-bold font-mono text-[#f0fdf4]/40">{w.wallet.user.cpf}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="font-display font-black text-lg text-[#f59e0b]">
                                                {Number(w.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="max-w-[200px]">
                                                <p className="text-xs font-bold text-[#f0fdf4]/60 truncate" title={w.description}>
                                                    {w.description?.replace('Saque via Pix — ', '')}
                                                </p>
                                                <div className="flex items-center gap-1.5 mt-2 px-2 py-1 bg-[#f59e0b]/05 border border-[#f59e0b]/20 w-fit group/hash cursor-pointer relative"
                                                    onClick={() => copyTransactionId(w.id)}
                                                    title="Clique para copiar o ID completo">
                                                    <span className="text-[10px] font-mono font-bold text-[#f59e0b]/60 group-hover/hash:text-[#f59e0b] transition-colors">
                                                        #TX-{w.id.split('-')[0].toUpperCase()}
                                                    </span>
                                                    <div className="relative">
                                                        <AnimatePresence mode="wait">
                                                            {copiedId === w.id ? (
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
                                                        {copiedId === w.id && (
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
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2 text-[#f0fdf4]/40">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span className="text-xs font-bold">
                                                    {new Date(w.createdAt).toLocaleDateString('pt-BR')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`px-2.5 py-1 text-[9px] font-black tracking-[0.1em] uppercase ${w.status === 'PENDING' ? 'bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20' :
                                                w.status === 'SUCCESS' ? 'bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20' :
                                                    'bg-red-500/10 text-red-400 border border-red-500/20'
                                                }`}>
                                                {w.status === 'PENDING' ? 'Pendente' :
                                                    w.status === 'SUCCESS' ? 'Concluído' :
                                                        w.status === 'CANCELLED' ? 'Cancelado' : 'Falhou'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center justify-center gap-2">
                                                {w.status === 'PENDING' ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleAction(w.id, 'approve')}
                                                            disabled={processingId === w.id}
                                                            className="p-2 bg-[#22c55e]/10 border border-[#22c55e]/20 text-[#22c55e] hover:bg-[#22c55e] hover:text-black transition-all disabled:opacity-50"
                                                            title="Aprovar Saque"
                                                        >
                                                            {processingId === w.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction(w.id, 'reject')}
                                                            disabled={processingId === w.id}
                                                            className="p-2 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-black transition-all disabled:opacity-50"
                                                            title="Rejeitar e Estornar"
                                                        >
                                                            {processingId === w.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                                                        </button>
                                                    </>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className="text-[10px] font-bold text-[#f0fdf4]/10 uppercase tracking-widest italic">Sem ações</span>
                                                        {w.status === 'SUCCESS' && w.description?.includes('Confirmado Manualmente') && (
                                                            <button
                                                                onClick={() => handleAction(w.id, 'retry-payout')}
                                                                disabled={processingId === w.id}
                                                                className="text-[9px] font-black text-[#f59e0b] hover:text-[#f59e0b]/80 flex items-center gap-1.5 uppercase tracking-tighter transition-colors"
                                                            >
                                                                <Zap className="w-3 h-3" /> Retentar Payout
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
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
    );
}
