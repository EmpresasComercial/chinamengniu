import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { useLoading } from './LoadingContext';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    profile: any | null;
    loading: boolean;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { showError } = useLoading();

    const fetchProfile = useCallback(async (userId: string) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, phone, balance, invite_code')
            .eq('id', userId)
            .single();

        if (!error && data) {
            setProfile(data);
        }
    }, []);

    const refreshProfile = useCallback(async () => {
        if (user) {
            await fetchProfile(user.id);
        }
    }, [user, fetchProfile]);

    useEffect(() => {
        // 1. Pega a sessão inicial sem bloquear a UI (async background)
        supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
            setSession(initialSession);
            setUser(initialSession?.user ?? null);
            if (initialSession?.user) {
                fetchProfile(initialSession.user.id);
            }
            // Marcamos loading como false assim que temos o resultado inicial
            setLoading(false);
        }).catch((err) => {
            console.error("Erro ao recuperar sessão:", err);
            setLoading(false);
        });

        // 2. Escuta mudanças de autenticação (redirecionamento automático)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
            setSession(currentSession);
            setUser(currentSession?.user ?? null);
            
            if (currentSession?.user) {
                fetchProfile(currentSession.user.id);
            } else {
                setProfile(null);
            }
            
            // Tratamento de eventos para navegação (UX fluida)
            if (event === 'SIGNED_IN') {
                navigate('/', { replace: true });
            }
            if (event === 'SIGNED_OUT') {
                showError('sua sessão expirou ou foi encerrada.');
                navigate('/registrar', { replace: true });
            }

            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, [fetchProfile, navigate]);

    const signOut = useCallback(async () => {
        await supabase.auth.signOut();
    }, []);

    return (
        <AuthContext.Provider value={{ user, session, profile, loading, signOut, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
