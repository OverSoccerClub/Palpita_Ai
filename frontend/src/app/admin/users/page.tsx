'use client';

import React, { useEffect, useState, useCallback } from 'react';
import api from '@/services/api';
import { Users, Search, ShieldCheck, User } from 'lucide-react';
import { motion } from 'framer-motion';

function fmt(v: number | string) { return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try { const r = await api.get('/users'); setUsers(r.data); }
        catch { setUsers([]); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const filtered = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <p className="text-[10px] font-bold tracking-widest text-[#f59e0b]/60 uppercase mb-0.5">GESTÃO</p>
                    <h1 className="font-display font-black text-2xl text-[#f0fdf4] flex items-center gap-2">
                        <Users className="w-6 h-6 text-[#f59e0b]" /> USUÁRIOS
                    </h1>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#f0fdf4]/20" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-9 pr-4 py-2.5 text-sm bg-transparent border border-[#f59e0b]/15 text-[#f0fdf4] placeholder-[#f0fdf4]/20 focus:outline-none focus:border-[#f59e0b]/30 w-64"
                        placeholder="Buscar usuário..."
                    />
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                    { label: 'Total Usuários', value: String(users.length), color: '#f59e0b' },
                    { label: 'Admins', value: String(users.filter(u => u.role === 'ADMIN').length), color: '#38bdf8' },
                    { label: 'Usuários Ativos', value: String(users.filter(u => u.role === 'USER').length), color: '#22c55e' },
                ].map(s => (
                    <div key={s.label} className="p-4 border border-[#f59e0b]/08" style={{ background: '#050500' }}>
                        <p className="text-[9px] font-bold tracking-widest text-[#f0fdf4]/25 uppercase mb-1">{s.label}</p>
                        <p className="font-display font-black text-xl" style={{ color: s.color }}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="border border-[#f59e0b]/10 overflow-hidden" style={{ background: '#050500' }}>
                {loading ? (
                    <div className="p-12 flex items-center justify-center gap-3">
                        <div className="w-5 h-5 border-2 border-[#f59e0b]/20 border-t-[#f59e0b] animate-spin" />
                        <span className="text-[#f0fdf4]/30 text-sm">Carregando usuários...</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[#f59e0b]/10" style={{ background: 'rgba(245,158,11,0.03)' }}>
                                    {['USUÁRIO', 'ROLE', 'SALDO', 'APOSTAS', 'CADASTRADO'].map(h => (
                                        <th key={h} className="text-left px-4 py-3 text-[9px] font-bold tracking-widest text-[#f0fdf4]/25 uppercase">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#f59e0b]/05">
                                {filtered.map((user, idx) => (
                                    <motion.tr key={user.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: idx * 0.03 }}
                                        className="hover:bg-[#f59e0b]/03 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-7 h-7 flex items-center justify-center border border-[#f59e0b]/15" style={{ background: '#f59e0b08' }}>
                                                    {user.role === 'ADMIN' ? <ShieldCheck className="w-3.5 h-3.5 text-[#f59e0b]" /> : <User className="w-3.5 h-3.5 text-[#f0fdf4]/30" />}
                                                </div>
                                                <div>
                                                    <p className="font-display font-bold text-sm text-[#f0fdf4]/80">{user.name}</p>
                                                    <p className="text-[10px] text-[#f0fdf4]/25">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 text-[9px] font-black tracking-wider border ${user.role === 'ADMIN' ? 'border-[#f59e0b]/30 text-[#f59e0b]' : 'border-[#22c55e]/20 text-[#22c55e]/60'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-display font-black text-sm text-[#f59e0b]">
                                            {fmt(user.wallet?.balance ?? 0)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-[#f0fdf4]/40 font-bold">
                                            {user._count?.betSlips ?? 0}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-[#f0fdf4]/30">
                                            {new Date(user.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                    </motion.tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr><td colSpan={5} className="px-4 py-8 text-center text-[#f0fdf4]/20 text-sm">Nenhum usuário encontrado.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
