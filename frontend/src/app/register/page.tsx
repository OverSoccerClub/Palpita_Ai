'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { UserPlus, ArrowLeft, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

/* ── Mask helpers ─────────────────────────────────────── */
function maskCPF(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    return digits
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function maskPhone(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 10) {
        return digits
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{4})(\d)/, '$1-$2');
    }
    return digits
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
}

function onlyDigits(value: string): string {
    return value.replace(/\D/g, '');
}

export default function RegisterPage() {
    /* Display values (formatted) */
    const [displayCPF, setDisplayCPF] = useState('');
    const [displayPhone, setDisplayPhone] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        cpf: '',          // raw digits only
        phone: '',        // raw digits only
        password: '',
        birthDate: '',
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { register } = useAuth();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCPF = (e: React.ChangeEvent<HTMLInputElement>) => {
        const masked = maskCPF(e.target.value);
        setDisplayCPF(masked);
        setFormData(prev => ({ ...prev, cpf: onlyDigits(masked) }));
    };

    const handlePhone = (e: React.ChangeEvent<HTMLInputElement>) => {
        const masked = maskPhone(e.target.value);
        setDisplayPhone(masked);
        setFormData(prev => ({ ...prev, phone: onlyDigits(masked) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            // Send raw data — no masks
            await register(formData);
        } catch (err: any) {
            const msg = err.response?.data?.message;
            setError(Array.isArray(msg) ? msg.join(' — ') : msg || 'Falha ao criar conta. Verifique os dados.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020c06] flex items-center justify-center p-4 py-10">
            {/* Football field tactical background */}
            <div className="fixed inset-0 z-0 pointer-events-none"
                style={{ backgroundImage: "url('/football-field.png')", backgroundSize: 'cover', backgroundPosition: 'center center', backgroundRepeat: 'no-repeat' }}
            />
            <div className="fixed inset-0 z-0 pointer-events-none"
                style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.92) 0%, rgba(2,12,6,0.82) 40%, rgba(7,26,13,0.72) 70%, rgba(13,36,20,0.65) 100%)' }}
            />

            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="relative z-10 w-full max-w-lg"
            >
                {/* Stadium gate top accent */}
                <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#22c55e] to-transparent mb-px" />

                <div className="bg-[#071a0d] border border-[#14532d] border-t-0 p-8 md:p-10">
                    {/* Back link */}
                    <Link href="/login" className="flex items-center gap-2 text-[#f0fdf4]/30 hover:text-[#22c55e] transition-colors text-xs font-bold tracking-wider uppercase mb-8 w-fit">
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Voltar ao Acesso
                    </Link>

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="text-4xl mb-3 select-none" aria-hidden="true">🏟️</div>
                        <h1 className="text-3xl font-display font-black text-[#f0fdf4] tracking-tight mb-1">
                            JUNTE-SE<span className="text-[#22c55e]"> AO TIME</span>
                        </h1>
                        <div className="flex items-center justify-center gap-3 mt-3">
                            <span className="h-px flex-1 bg-[#14532d]" />
                            <p className="score-label">CADASTRO DE JOGADOR</p>
                            <span className="h-px flex-1 bg-[#14532d]" />
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="mb-6 p-4 bg-red-950/40 border-l-2 border-red-500 flex items-start gap-3 text-red-400 text-xs font-medium"
                        >
                            <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </motion.div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name */}
                        <div className="space-y-1.5">
                            <label className="score-label block">Nome Completo</label>
                            <input
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleChange}
                                className="field-input w-full px-4 py-3 text-sm"
                                placeholder="Ex: João da Silva"
                                required
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="score-label block">Email</label>
                            <input
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="field-input w-full px-4 py-3 text-sm"
                                placeholder="seu@email.com"
                                required
                            />
                        </div>

                        {/* CPF + Phone */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="score-label block">CPF</label>
                                <input
                                    name="cpf"
                                    type="text"
                                    inputMode="numeric"
                                    value={displayCPF}
                                    onChange={handleCPF}
                                    className="field-input w-full px-4 py-3 text-sm"
                                    placeholder="000.000.000-00"
                                    maxLength={14}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="score-label block">Telefone</label>
                                <input
                                    name="phone"
                                    type="text"
                                    inputMode="numeric"
                                    value={displayPhone}
                                    onChange={handlePhone}
                                    className="field-input w-full px-4 py-3 text-sm"
                                    placeholder="(00) 00000-0000"
                                    maxLength={15}
                                />
                            </div>
                        </div>

                        {/* Birthdate + Password */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="score-label block">Nascimento</label>
                                <input
                                    name="birthDate"
                                    type="date"
                                    value={formData.birthDate}
                                    onChange={handleChange}
                                    className="field-input w-full px-4 py-3 text-sm"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="score-label block">Senha</label>
                                <div className="relative">
                                    <input
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="field-input w-full px-4 py-3 pr-10 text-sm"
                                        placeholder="Mín. 6 caracteres"
                                        required
                                        minLength={6}
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
                        </div>

                        {/* Submit */}
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
                                        <UserPlus className="w-4 h-4" />
                                        ENTRAR NO CAMPO
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Bottom accent */}
                <div className="w-full h-px bg-gradient-to-r from-transparent via-[#14532d] to-transparent" />
            </motion.div>
        </div>
    );
}
