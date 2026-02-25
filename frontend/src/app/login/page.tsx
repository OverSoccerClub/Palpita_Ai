'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { LogIn, UserPlus, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            await login({ email, password });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Credenciais inválidas. Tente novamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020c06] flex items-center justify-center p-4">
            {/* Football field tactical background */}
            <div
                className="fixed inset-0 z-0 pointer-events-none"
                style={{
                    backgroundImage: "url('/football-field.png')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center center',
                    backgroundRepeat: 'no-repeat',
                }}
            />
            {/* Dark overlay — diagonal black premium */}
            <div className="fixed inset-0 z-0 pointer-events-none"
                style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.92) 0%, rgba(2,12,6,0.82) 40%, rgba(7,26,13,0.72) 70%, rgba(13,36,20,0.65) 100%)' }}
            />

            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="relative z-10 w-full max-w-md"
            >
                {/* Stadium gate top accent */}
                <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#22c55e] to-transparent mb-px" />

                <div className="bg-[#071a0d] border border-[#14532d] border-t-0 p-10">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="text-5xl mb-4 select-none" aria-hidden="true">⚽</div>
                        <h1 className="text-4xl font-display font-black text-[#f0fdf4] tracking-tight mb-1">
                            PALPITA<span className="text-[#22c55e]"> AÍ</span>
                        </h1>
                        <div className="flex items-center justify-center gap-3 mt-3">
                            <span className="h-px flex-1 bg-[#14532d]" />
                            <p className="score-label">ACESSO AO ESTÁDIO</p>
                            <span className="h-px flex-1 bg-[#14532d]" />
                        </div>
                    </div>

                    {/* Error alert */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="mb-8 p-4 bg-red-950/40 border-l-2 border-red-500 flex items-center gap-3 text-red-400 text-xs font-medium"
                        >
                            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                            <span>{error}</span>
                        </motion.div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="score-label block">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="field-input w-full px-4 py-3.5 text-sm"
                                placeholder="seu@email.com"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="score-label block">Senha</label>
                                <Link href="#" className="text-[10px] font-bold text-[#22c55e]/50 hover:text-[#22c55e] tracking-wider uppercase transition-colors">
                                    Esqueceu?
                                </Link>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="field-input w-full px-4 py-3.5 pr-10 text-sm"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#f0fdf4]/25 hover:text-[#22c55e] transition-colors"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="btn-champion w-full py-4 text-xs flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <div className="w-5 h-5 border-2 border-[#020c06]/30 border-t-[#020c06] animate-spin" />
                                ) : (
                                    <>
                                        <LogIn className="w-4 h-4" />
                                        ENTRAR NO CAMPO
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Register link */}
                    <div className="mt-8 pt-6 border-t border-[#14532d]">
                        <p className="score-label text-center mb-4">AINDA NÃO É JOGADOR?</p>
                        <Link
                            href="/register"
                            className="w-full py-3.5 border border-[#14532d] text-[#f0fdf4]/40 font-display font-bold text-[11px] tracking-widest uppercase hover:bg-[#0d2414] hover:text-[#f0fdf4]/80 hover:border-[#22c55e]/40 transition-all flex items-center justify-center gap-3"
                        >
                            <UserPlus className="w-4 h-4" />
                            CRIAR CONTA GRÁTIS
                        </Link>
                    </div>
                </div>

                {/* Bottom accent */}
                <div className="w-full h-px bg-gradient-to-r from-transparent via-[#14532d] to-transparent" />
            </motion.div>
        </div>
    );
}
