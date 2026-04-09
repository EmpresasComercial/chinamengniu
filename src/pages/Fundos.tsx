import React, { useState, useEffect, useCallback } from 'react';
import { 
  Wallet, ArrowDownRight, ArrowUpRight, 
  ArrowRightLeft, BadgeDollarSign, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLoading } from '../contexts/LoadingContext';
import { supabase } from '../lib/supabase';

export default function Fundos() {
  const navigate = useNavigate();
  const { profile, refreshProfile } = useAuth();
  const { registerFetch } = useLoading();
  const [totalBonus, setTotalBonus] = useState(0);

  const fetchBonus = useCallback(async () => {
    if (!profile?.id) return;
    const done = registerFetch();
    try {
      const { data, error } = await supabase
        .from('bonus_transacoes')
        .select('valor_recebido')
        .eq('user_id', profile.id);
      
      if (!error && data) {
        const sum = data.reduce((acc, curr) => acc + Number(curr.valor_recebido), 0);
        setTotalBonus(sum);
      }
    } catch (err) {
      console.error('Erro ao buscar bônus:', err);
    } finally {
      done();
    }
  }, [profile?.id, registerFetch]);

  useEffect(() => {
    fetchBonus();
    refreshProfile();
  }, [fetchBonus, refreshProfile]);

  const fmt = (val: number | string | undefined) => {
    const num = Number(val || 0);
    return num.toLocaleString('pt-AO', { minimumFractionDigits: 2 });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFDFD] pb-32 font-sans antialiased page-content">
      {/* 🔴 Top Banner - Fixed Image Path and Dynamic Data */}
      <section className="pt-0 mb-6">
        <div 
            style={{ backgroundImage: "url('/fundo-para%20a%20paginafundotualizada.png')" }}
            className="h-[180px] relative overflow-hidden flex flex-col justify-center px-8 bg-cover bg-center shadow-lg"
        >
            <div className="relative z-10 flex items-center gap-2 text-white">
                <span className="text-[34px] font-bold tracking-tight drop-shadow-md">
                    ≈{fmt(profile?.balance).replace(/\s/g, '')}
                </span>
                <span className="text-[14px] font-bold opacity-90 mt-2 drop-shadow-sm uppercase">AOA</span>
            </div>
        </div>
      </section>

      {/* ⚪ Quick Actions Grid */}
      <section className="px-4 mb-10">
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'recarregar', icon: Wallet, path: '/recarregar' },
            { label: 'extrair', icon: ArrowUpRight, path: '/retirar' },
            { label: 'conversões', icon: ArrowRightLeft, path: '/recarregar-usdt' },
            { label: 'vendido', icon: BadgeDollarSign, path: '/equipe' },
          ].map((item, idx) => (
            <button 
              key={idx}
              onClick={() => navigate(item.path)} 
              className="flex flex-col items-center gap-3 active:scale-95 transition-all"
            >
              <div className="w-14 h-14 bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-50 flex items-center justify-center">
                <item.icon className="w-6 h-6 text-gray-800" />
              </div>
              <span className="text-[11px] font-black text-gray-500 lowercase leading-tight">{item.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 📋 Account List section - Fixed Mapping to Bank Data */}
      <section className="px-6">
        <h2 className="text-[16px] font-black text-gray-900 mb-6 font-sans">A minha conta</h2>

        <div className="space-y-4">
          {[
            { label: 'ativos monetários', value: profile?.reloaded_amount, unit: 'AOA' },
            { label: 'Ativos simbólicos', value: profile?.income, unit: 'AI-GO' },
            { label: 'Activos de bónus', value: totalBonus, unit: 'AI-GO' },
            { label: 'Fundo', value: 0, unit: 'AOA', prefix: '≈' },
          ].map((item: any, idx) => (
            <div 
              key={idx}
              className="bg-white rounded-[24px] p-6 flex flex-col shadow-xl shadow-gray-100/40 border border-gray-50 active:scale-[0.98] transition-all relative"
            >
               <span className="text-gray-400 text-[11px] font-black lowercase mb-2">{item.label}</span>
               <div className="flex items-center gap-1.5">
                  <span className="text-gray-800 text-[20px] font-black leading-none">
                     {item.prefix || ''}{fmt(item.value)}
                  </span>
                  <span className="text-gray-400 text-[10px] font-black uppercase mt-1.5">{item.unit}</span>
               </div>
               <ChevronRight className="w-4 h-4 text-gray-200 absolute right-6 top-1/2 -translate-y-1/2" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
