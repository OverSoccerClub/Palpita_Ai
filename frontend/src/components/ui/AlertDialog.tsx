'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

interface AlertDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm?: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'default' | 'danger' | 'success' | 'warning';
    isAlert?: boolean;
}

export default function AlertDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    type = 'default',
    isAlert = false
}: AlertDialogProps) {
    const colors = {
        default: {
            icon: <AlertCircle className="w-8 h-8 text-[#f59e0b]" />,
            border: 'border-[#f59e0b]/20',
            button: 'bg-[#f59e0b] hover:bg-[#f59e0b]/80 text-black',
            light: 'bg-[#f59e0b]/10'
        },
        danger: {
            icon: <AlertCircle className="w-8 h-8 text-red-500" />,
            border: 'border-red-500/20',
            button: 'bg-red-500 hover:bg-red-500/80 text-white',
            light: 'bg-red-500/10'
        },
        success: {
            icon: <CheckCircle2 className="w-8 h-8 text-[#22c55e]" />,
            border: 'border-[#22c55e]/20',
            button: 'bg-[#22c55e] hover:bg-[#22c55e]/80 text-black',
            light: 'bg-[#22c55e]/10'
        },
        warning: {
            icon: <AlertCircle className="w-8 h-8 text-[#f59e0b]" />,
            border: 'border-[#f59e0b]/20',
            button: 'bg-[#f59e0b] hover:bg-[#f59e0b]/80 text-black',
            light: 'bg-[#f59e0b]/10'
        }
    };

    const current = colors[type];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className={`relative w-full max-w-md bg-[#050500] border ${current.border} shadow-2xl p-8 overflow-hidden`}
                    >
                        {/* Glow effect */}
                        <div className={`absolute -top-24 -left-24 w-48 h-48 ${current.light} blur-[100px] rounded-full opacity-50`} />

                        <div className="relative flex flex-col items-center text-center">
                            <div className={`mb-6 p-4 rounded-full ${current.light} border ${current.border}`}>
                                {current.icon}
                            </div>

                            <h3 className="font-display font-black text-2xl text-[#f0fdf4] mb-3 uppercase tracking-tight">
                                {title}
                            </h3>

                            <p className="text-sm font-bold text-[#f0fdf4]/50 leading-relaxed max-w-[280px] mb-8">
                                {description}
                            </p>

                            <div className={`grid ${isAlert ? 'grid-cols-1 max-w-[160px]' : 'grid-cols-2'} gap-4 w-full`}>
                                {!isAlert && (
                                    <button
                                        onClick={onClose}
                                        className="py-3.5 px-6 border border-[#f0fdf4]/10 hover:bg-[#f0fdf4]/05 text-[#f0fdf4]/40 font-bold text-[11px] uppercase tracking-widest transition-all"
                                    >
                                        {cancelText}
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        if (onConfirm) onConfirm();
                                        onClose();
                                    }}
                                    className={`py-3.5 px-6 font-display font-black text-[11px] uppercase tracking-widest transition-all ${current.button} ${isAlert ? 'w-full' : ''}`}
                                >
                                    {confirmText}
                                </button>
                            </div>
                        </div>

                        {/* Top-right close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-[#f0fdf4]/20 hover:text-[#f0fdf4] transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
