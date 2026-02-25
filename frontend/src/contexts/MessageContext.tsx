'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import AlertDialog from '@/components/ui/AlertDialog';

interface MessageOptions {
    title: string;
    description: string;
    type?: 'default' | 'danger' | 'success' | 'warning';
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    isAlert?: boolean;
}

interface MessageContextData {
    showAlert: (title: string, description: string, type?: 'default' | 'danger' | 'success' | 'warning') => void;
    showConfirm: (options: MessageOptions) => void;
}

const MessageContext = createContext<MessageContextData>({} as MessageContextData);

export function MessageProvider({ children }: { children: React.ReactNode }) {
    const [config, setConfig] = useState<MessageOptions & { isOpen: boolean }>({
        isOpen: false,
        title: '',
        description: '',
        type: 'default',
        isAlert: true
    });

    const showAlert = useCallback((title: string, description: string, type: 'default' | 'danger' | 'success' | 'warning' = 'default') => {
        setConfig({
            isOpen: true,
            title,
            description,
            type,
            isAlert: true,
            confirmText: 'OK'
        });
    }, []);

    const showConfirm = useCallback((options: MessageOptions) => {
        setConfig({
            ...options,
            isOpen: true,
            isAlert: options.isAlert ?? false
        });
    }, []);

    const handleClose = useCallback(() => {
        setConfig(prev => ({ ...prev, isOpen: false }));
    }, []);

    return (
        <MessageContext.Provider value={{ showAlert, showConfirm }}>
            {children}
            <AlertDialog
                isOpen={config.isOpen}
                onClose={handleClose}
                onConfirm={config.onConfirm}
                title={config.title}
                description={config.description}
                type={config.type}
                confirmText={config.confirmText}
                cancelText={config.cancelText}
                isAlert={config.isAlert}
            />
        </MessageContext.Provider>
    );
}

export const useMessage = () => useContext(MessageContext);
