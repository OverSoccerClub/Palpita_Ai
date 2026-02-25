'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '@/services/api';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    wallet?: {
        balance: number;
    };
}

interface AuthContextData {
    user: User | null;
    loading: boolean;
    login: (credentials: any) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const loadStorageData = async () => {
            const storageUser = localStorage.getItem('@PalpitaAi:user');
            const storageToken = localStorage.getItem('@PalpitaAi:token');

            if (storageUser && storageToken) {
                setUser(JSON.parse(storageUser));
            }
            setLoading(false);
        };

        loadStorageData();
    }, []);

    const login = useCallback(async (credentials: any) => {
        const response = await api.post('/auth/login', credentials);
        const { access_token, user: userData } = response.data;

        localStorage.setItem('@PalpitaAi:token', access_token);
        localStorage.setItem('@PalpitaAi:user', JSON.stringify(userData));

        setUser(userData);
        router.push('/dashboard');
    }, [router]);

    const register = useCallback(async (data: any) => {
        const response = await api.post('/auth/register', data);
        const { access_token, user: userData } = response.data;

        localStorage.setItem('@PalpitaAi:token', access_token);
        localStorage.setItem('@PalpitaAi:user', JSON.stringify(userData));

        setUser(userData);
        router.push('/dashboard');
    }, [router]);

    const logout = useCallback(() => {
        localStorage.removeItem('@PalpitaAi:token');
        localStorage.removeItem('@PalpitaAi:user');
        setUser(null);
        router.push('/login');
    }, [router]);

    const refreshUser = useCallback(async () => {
        try {
            const res = await api.get('/wallet/me'); // Get full wallet data
            const resUser = await api.get('/auth/profile'); // Get user data update

            setUser(prev => {
                const updatedUser = {
                    ...prev,
                    ...resUser.data,
                    wallet: res.data
                };
                localStorage.setItem('@PalpitaAi:user', JSON.stringify(updatedUser));
                return updatedUser as User;
            });
        } catch (err) {
            console.error('Falha ao atualizar dados do usuário', err);
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
