'use client';

import React, { useEffect, useState } from 'react';
import api from '@/services/api';
import {
    ShieldCheck, Plus, Settings2, CheckCircle2, AlertCircle,
    Database, ArrowRight, X, Zap, Trash2, Power, PowerOff, Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMessage } from '@/contexts/MessageContext';

interface Gateway {
    id: string;
    name: string;
    provider: 'MERCADOPAGO' | 'STRIPE' | 'PAGSEGURO' | 'EFIPAY';
    isActive: boolean;
    automaticWithdrawal: boolean;
    createdAt: string;
    updatedAt: string;
}

export default function AdminGatewaysPage() {
    const { showAlert, showConfirm } = useMessage();
    const [gateways, setGateways] = useState<Gateway[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [provider, setProvider] = useState<'MERCADOPAGO' | 'STRIPE' | 'PAGSEGURO' | 'EFIPAY'>('MERCADOPAGO');
    const [automaticWithdrawal, setAutomaticWithdrawal] = useState(true);
    // Credentials — Mercado Pago
    const [accessToken, setAccessToken] = useState('');
    // Credentials — EfiPay
    const [efiClientId, setEfiClientId] = useState('');
    const [efiClientSecret, setEfiClientSecret] = useState('');
    const [efiCertBase64, setEfiCertBase64] = useState('');
    const [efiSandbox, setEfiSandbox] = useState(false);
    const [efiPixKey, setEfiPixKey] = useState('');
    const [editingGatewayId, setEditingGatewayId] = useState<string | null>(null);

    const fetchGateways = async () => {
        try {
            const res = await api.get('/admin/gateways');
            setGateways(res.data);
        } catch (err) {
            console.error('Erro ao buscar gateways', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGateways();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const credentials = provider === 'EFIPAY'
                ? { clientId: efiClientId, clientSecret: efiClientSecret, certificateBase64: efiCertBase64, sandbox: String(efiSandbox), pixKey: efiPixKey }
                : { accessToken };

            if (editingGatewayId) {
                await api.patch(`/admin/gateways/${editingGatewayId}`, {
                    name,
                    provider,
                    credentials,
                    automaticWithdrawal
                });
                showAlert('Sucesso', 'Gateway atualizado com sucesso.', 'success');
            } else {
                await api.post('/admin/gateways', {
                    name,
                    provider,
                    credentials,
                    automaticWithdrawal
                });
                showAlert('Sucesso', 'Gateway criado com sucesso.', 'success');
            }

            await fetchGateways();
            handleCloseModal();
        } catch (err: any) {
            showAlert('Erro', err.response?.data?.message || 'Erro ao processar gateway', 'danger');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditClick = async (gw: Gateway) => {
        try {
            setLoading(true);
            const res = await api.get(`/admin/gateways/${gw.id}/masked`);
            const fullGw = res.data;

            setEditingGatewayId(fullGw.id);
            setName(fullGw.name);
            setProvider(fullGw.provider);
            setAutomaticWithdrawal(fullGw.automaticWithdrawal);

            if (fullGw.provider === 'MERCADOPAGO') {
                setAccessToken(fullGw.credentials.accessToken || '');
            } else if (fullGw.provider === 'EFIPAY') {
                setEfiClientId(fullGw.credentials.clientId || '');
                setEfiClientSecret(fullGw.credentials.clientSecret || '');
                setEfiCertBase64(fullGw.credentials.certificateBase64 || '');
                setEfiPixKey(fullGw.credentials.pixKey || '');
                setEfiSandbox(fullGw.credentials.sandbox === 'true');
            }

            setIsModalOpen(true);
        } catch (err: any) {
            showAlert('Erro', 'Erro ao carregar dados do gateway', 'danger');
        } finally {
            setLoading(false);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingGatewayId(null);
        setName('');
        setAccessToken('');
        setEfiClientId('');
        setEfiClientSecret('');
        setEfiCertBase64('');
        setEfiPixKey('');
        setEfiSandbox(false);
        setProvider('MERCADOPAGO');
    };

    const handleActivate = async (id: string) => {
        try {
            await api.patch(`/admin/gateways/${id}/activate`);
            await fetchGateways();
        } catch (err) {
            console.error('Erro ao ativar gateway', err);
        }
    };

    const handleDelete = async (id: string) => {
        showConfirm({
            title: 'Excluir Gateway?',
            description: 'Tem certeza que deseja excluir este gateway? Esta ação é irreversível.',
            type: 'danger',
            confirmText: 'Sim, Excluir',
            onConfirm: async () => {
                try {
                    await api.delete(`/admin/gateways/${id}`);
                    fetchGateways();
                    showAlert('Sucesso', 'Gateway excluído com sucesso.', 'success');
                } catch (err: any) {
                    showAlert('Erro', err.response?.data?.message || 'Erro ao excluir gateway', 'danger');
                }
            }
        });
    };

    return (
        <>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <p className="score-label text-[#22c55e] mb-0.5">ADMINISTRAÇÃO</p>
                        <h1 className="font-display font-black text-2xl md:text-3xl flex items-center gap-3">
                            <ShieldCheck className="w-7 h-7 text-[#22c55e]" />
                            Gateways de Pagamento
                        </h1>
                        <p className="text-[#f0fdf4]/30 text-sm mt-1">Configure as credenciais e ative o gateway de recebimento.</p>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="btn-champion px-6 py-2.5 flex items-center gap-2 self-start md:self-center"
                    >
                        <Plus className="w-4 h-4" />
                        NOVO GATEWAY
                    </button>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="py-20 text-center">
                        <div className="w-8 h-8 border-2 border-[#22c55e]/30 border-t-[#22c55e] animate-spin mx-auto mb-4" />
                        <p className="text-[#f0fdf4]/20 score-label">Carregando gateways...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <AnimatePresence>
                            {gateways.map((gw) => (
                                <motion.div
                                    key={gw.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="match-card p-5 space-y-4 flex flex-col justify-between border-l-4"
                                    style={{ borderLeftColor: gw.isActive ? '#22c55e' : '#14532d' }}
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="score-label text-[10px] tracking-widest text-[#f0fdf4]/40">{gw.provider}</span>
                                            {gw.isActive ? (
                                                <span className="flex items-center gap-1.5 px-2 py-0.5 bg-[#22c55e]/10 border border-[#22c55e]/30 text-[#22c55e] text-[9px] font-black tracking-widest uppercase">
                                                    <CheckCircle2 className="w-2.5 h-2.5" /> ATIVO
                                                </span>
                                            ) : (
                                                <span className="px-2 py-0.5 bg-[#14532d]/10 border border-[#14532d]/30 text-[#f0fdf4]/20 text-[9px] font-black tracking-widest uppercase">
                                                    INATIVO
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="font-display font-black text-lg text-[#f0fdf4] truncate">{gw.name}</h3>
                                        <div className="flex items-center gap-2 mt-2 text-[10px] text-[#f0fdf4]/30 font-bold uppercase">
                                            <Database className="w-3 h-3" />
                                            Criado em {new Date(gw.createdAt).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1 text-[10px] text-[#f59e0b] font-bold uppercase tracking-tighter">
                                            {gw.automaticWithdrawal ? '⚡ Saque Automático Ativado' : '✋ Saque Manual'}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 pt-4 border-t border-[#14532d]/40">
                                        {!gw.isActive && (
                                            <button
                                                onClick={() => handleActivate(gw.id)}
                                                className="flex-1 py-2 bg-[#22c55e]/10 hover:bg-[#22c55e]/20 border border-[#22c55e]/30 text-[#22c55e] text-[10px] font-black tracking-widest uppercase flex items-center justify-center gap-2 transition-all"
                                            >
                                                <Power className="w-3 h-3" /> ATIVAR
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleEditClick(gw)}
                                            className="px-3 py-2 border border-[#f59e0b]/20 hover:border-[#f59e0b]/40 text-[#f59e0b]/40 hover:text-[#f59e0b] transition-all"
                                            title="Editar"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(gw.id)}
                                            className="px-3 py-2 border border-[#ef4444]/20 hover:border-[#ef4444]/40 text-[#ef4444]/40 hover:text-[#ef4444] transition-all"
                                            title="Excluir"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {gateways.length === 0 && (
                            <div className="col-span-full py-16 match-card border-dashed flex flex-col items-center justify-center text-center opacity-40">
                                <Zap className="w-10 h-10 mb-4 text-[#f0fdf4]/20" />
                                <p className="font-display font-black text-[#f0fdf4]">NENHUM GATEWAY CONFIGURADO</p>
                                <p className="text-xs mt-1">Clique em "Novo Gateway" para começar.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Create Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-lg match-card p-6 relative"
                            style={{ background: 'linear-gradient(135deg, #000000 0%, #071a0d 100%)' }}
                        >
                            <button
                                onClick={handleCloseModal}
                                className="absolute top-4 right-4 text-[#f0fdf4]/20 hover:text-[#f0fdf4] transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <h2 className="font-display font-black text-xl mb-6 flex items-center gap-2">
                                <Settings2 className="w-5 h-5 text-[#22c55e]" />
                                {editingGatewayId ? 'EDITAR GATEWAY' : 'CONFIGURAR GATEWAY'}
                            </h2>

                            <form onSubmit={handleCreate} className="space-y-4">

                                <div>
                                    <label className="score-label block mb-1.5">NOME DO GATEWAY</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        className="field-input w-full p-3 text-sm"
                                        placeholder="Ex: Mercado Pago Produção"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="score-label block mb-1.5">PROVEDOR</label>
                                    <select
                                        value={provider}
                                        onChange={e => setProvider(e.target.value as any)}
                                        className="field-input w-full p-3 text-sm appearance-none bg-[#020c06]"
                                        required
                                    >
                                        <option value="MERCADOPAGO">Mercado Pago</option>
                                        <option value="EFIPAY">EfiPay (Gerencianet)</option>
                                        <option value="STRIPE" disabled>Stripe (Em breve)</option>
                                        <option value="PAGSEGURO" disabled>PagSeguro (Em breve)</option>
                                    </select>
                                </div>

                                {provider === 'MERCADOPAGO' && (
                                    <div>
                                        <label className="score-label block mb-1.5">ACCESS TOKEN</label>
                                        <input
                                            type="password"
                                            value={accessToken}
                                            onChange={e => setAccessToken(e.target.value)}
                                            className="field-input w-full p-3 text-sm font-mono"
                                            placeholder="APP_USR-..."
                                            required={provider === 'MERCADOPAGO'}
                                        />
                                        <p className="text-[10px] text-[#f0fdf4]/20 mt-1.5">Painel de desenvolvedores do Mercado Pago.</p>
                                    </div>
                                )}

                                {provider === 'EFIPAY' && (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="score-label block mb-1.5">CLIENT ID</label>
                                            <input
                                                type="text"
                                                value={efiClientId}
                                                onChange={e => setEfiClientId(e.target.value)}
                                                className="field-input w-full p-3 text-sm font-mono"
                                                placeholder="Client_Id_..."
                                                required={provider === 'EFIPAY'}
                                            />
                                        </div>
                                        <div>
                                            <label className="score-label block mb-1.5">CHAVE PIX (CHAVE EFI)</label>
                                            <input
                                                type="text"
                                                value={efiPixKey}
                                                onChange={e => setEfiPixKey(e.target.value)}
                                                className="field-input w-full p-3 text-sm font-mono"
                                                placeholder="Sua chave Pix vinculada à conta Efi"
                                                required={provider === 'EFIPAY'}
                                            />
                                        </div>
                                        <div>
                                            <label className="score-label block mb-1.5">CLIENT SECRET</label>
                                            <input
                                                type="password"
                                                value={efiClientSecret}
                                                onChange={e => setEfiClientSecret(e.target.value)}
                                                className="field-input w-full p-3 text-sm font-mono"
                                                placeholder="Client_Secret_..."
                                                required={provider === 'EFIPAY'}
                                            />
                                        </div>
                                        <div>
                                            <label className="score-label block mb-1.5">CERTIFICADO .P12 (Base64)</label>
                                            <textarea
                                                value={efiCertBase64}
                                                onChange={e => setEfiCertBase64(e.target.value)}
                                                className="field-input w-full p-3 text-[11px] font-mono h-24 resize-none"
                                                placeholder="Cole aqui o conteúdo do certificado em Base64..."
                                                required={provider === 'EFIPAY'}
                                            />
                                            <p className="text-[10px] text-[#f0fdf4]/20 mt-1">
                                                Converta o .p12 para Base64. No Windows (PowerShell): <br />
                                                <code className="text-[#22c55e] break-all">[Convert]::ToBase64String([IO.File]::ReadAllBytes("caminho/do/arquivo.p12"))</code>
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setEfiSandbox(!efiSandbox)}
                                                className={`w-10 h-5 rounded-full relative transition-colors ${efiSandbox ? 'bg-[#f59e0b]' : 'bg-white/10'}`}
                                            >
                                                <div className={`absolute top-1 w-3 h-3 bg-black rounded-full transition-all ${efiSandbox ? 'right-1' : 'left-1'}`} />
                                            </button>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-[#f59e0b]">
                                                {efiSandbox ? '⚠️ Modo Sandbox (Teste)' : 'Produção'}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div className="p-4 bg-[#22c55e]/05 border border-[#22c55e]/10 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-black text-[#22c55e] uppercase tracking-widest">Saque Automático</p>
                                            <p className="text-[9px] text-[#f0fdf4]/40 font-bold uppercase mt-0.5">Transferir dinheiro via Pix na hora</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setAutomaticWithdrawal(!automaticWithdrawal)}
                                            className={`w-10 h-5 rounded-full relative transition-colors ${automaticWithdrawal ? 'bg-[#22c55e]' : 'bg-white/10'}`}
                                        >
                                            <div className={`absolute top-1 w-3 h-3 bg-[#000] rounded-full transition-all ${automaticWithdrawal ? 'right-1' : 'left-1'}`} />
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="flex-1 py-3 border border-[#14532d] hover:bg-[#14532d]/20 text-[#f0fdf4]/40 font-bold text-xs uppercase transition-all"
                                    >
                                        CANCELAR
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-[2] btn-champion py-3 flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <div className="w-4 h-4 border-2 border-black/30 border-t-black animate-spin" />
                                        ) : (
                                            <>SALVAR CONFIGURAÇÃO <ArrowRight className="w-4 h-4" /></>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
