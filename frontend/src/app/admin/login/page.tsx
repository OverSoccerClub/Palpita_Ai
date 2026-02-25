'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldCheck, Eye, EyeOff, AlertCircle } from 'lucide-react';
import api from '@/services/api';

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('@PalpitaAi:token');
        const user = localStorage.getItem('@PalpitaAi:user');
        if (token && user) {
            try {
                const parsed = JSON.parse(user);
                if (parsed.role === 'ADMIN') router.replace('/admin');
            } catch { }
        }
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            const res = await api.post('/auth/login', { email, password });
            const { access_token, user } = res.data;

            if (user.role !== 'ADMIN') {
                setError('Acesso negado. Esta área é exclusiva para administradores.');
                return;
            }

            localStorage.setItem('@PalpitaAi:token', access_token);
            localStorage.setItem('@PalpitaAi:user', JSON.stringify(user));
            router.replace('/admin');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Credenciais inválidas.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4"
            style={{ background: 'linear-gradient(135deg, #000000 0%, #0a0a0a 40%, #0d1a0d 100%)' }}>

            {/* Subtle grid pattern */}
            <div className="fixed inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: 'linear-gradient(#f59e0b 1px, transparent 1px), linear-gradient(90deg, #f59e0b 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

            <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-sm relative z-10"
            >
                {/* Top accent */}
                <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, transparent, #f59e0b, transparent)' }} />

                <div className="p-8 border border-[#f59e0b]/15 border-t-0"
                    style={{ background: 'linear-gradient(135deg, #0d0d00 0%, #0a0f05 100%)' }}>

                    {/* Icon + header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 mb-4 border border-[#f59e0b]/30"
                            style={{ background: '#f59e0b12' }}>
                            <ShieldCheck className="w-7 h-7 text-[#f59e0b]" />
                        </div>
                        <h1 className="font-display font-black text-2xl tracking-tight text-[#f0fdf4]">
                            ACESSO <span className="text-[#f59e0b]">ADMIN</span>
                        </h1>
                        <p className="text-[10px] font-bold tracking-[0.2em] text-[#f0fdf4]/25 mt-1.5 uppercase">
                            Área Restrita · Palpita Aí
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <motion.div initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                            className="mb-5 p-3.5 border-l-2 border-red-500 bg-red-900/15 flex items-start gap-2.5 text-red-400 text-xs">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold tracking-widest text-[#f0fdf4]/30 uppercase block">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full px-4 py-3 text-sm bg-[#000]/60 border border-[#f59e0b]/15 text-[#f0fdf4] placeholder-[#f0fdf4]/20 focus:outline-none focus:border-[#f59e0b]/40 transition-colors"
                                placeholder="admin@palpitaai.com"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold tracking-widest text-[#f0fdf4]/30 uppercase block">Senha</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 pr-10 text-sm bg-[#000]/60 border border-[#f59e0b]/15 text-[#f0fdf4] placeholder-[#f0fdf4]/20 focus:outline-none focus:border-[#f59e0b]/40 transition-colors"
                                    placeholder="••••••••"
                                    required
                                />
                                <button type="button" onClick={() => setShowPassword(v => !v)} tabIndex={-1}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#f0fdf4]/20 hover:text-[#f59e0b] transition-colors">
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={isSubmitting}
                            className="w-full py-3.5 mt-2 text-xs font-display font-black tracking-widest uppercase transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#000' }}>
                            {isSubmitting
                                ? <div className="w-5 h-5 border-2 border-black/20 border-t-black animate-spin" />
                                : <><ShieldCheck className="w-4 h-4" /> ENTRAR NO PAINEL</>
                            }
                        </button>
                    </form>
                </div>

                <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, #f59e0b30, transparent)' }} />

                <p className="text-center text-[10px] text-[#f0fdf4]/15 mt-4 tracking-wider">
                    PALPITA AÍ · SISTEMA ADMINISTRATIVO
                </p>
            </motion.div>
        </div>
    );
}
