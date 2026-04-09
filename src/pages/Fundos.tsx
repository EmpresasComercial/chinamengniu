import React, { useState, useEffect } from 'react';
import { 
  Wallet, ArrowDownRight, ArrowUpRight, 
  ArrowRightLeft, BadgeDollarSign, ChevronRight,
  TrendingUp, Landmark, ShieldCheck, History
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { useLoading } from '../contexts/LoadingContext';
import { supabase } from '../lib/supabase';

export default function Fundos() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { showLoading, hideLoading, registerFetch } = useLoading();
  const [balance, setBalance] = useState(0);
  const [bonus, setBonus] = useState(0);
  const [withdrawals, setWithdrawals] = useState(0);
  const [commissions, setCommissions] = useState(0);
  const [totalRecharges, setTotalRecharges] = useState(0);

  useEffect(() => {
    async function fetchFinancials() {
      if (!profile?.id) return;
      const done = registerFetch();
      try {
        const [
          { data: tarefas },
          { data: recharges },
          { data: retiradas },
          { data: bônusData }
        ] = await Promise.all([
          supabase.from('tarefas_concluidas').select('valor').eq('perfil_id', profile.id),
          supabase.from('recharges').select('amount').eq('perfil_id', profile.id).eq('status', 'completed'),
          supabase.from('withdrawals').select('amount').eq('perfil_id', profile.id).eq('status', 'completed'),
          supabase.from('bonus_records').select('amount').eq('perfil_id', profile.id)
        ]);

        const totalTarefas = tarefas?.reduce((acc, t) => acc + (t.valor || 0), 0) || 0;
        const totalRec = recharges?.reduce((acc, r) => acc + (r.amount || 0), 0) || 0;
        const totalRet = retiradas?.reduce((acc, r) => acc + (r.amount || 0), 0) || 0;
        const totalBon = bônusData?.reduce((acc, b) => acc + (b.amount || 0), 0) || 0;

        setBalance(totalTarefas + totalRec + totalBon - totalRet);
        setTotalRecharges(totalRec);
        setWithdrawals(totalRet);
        setBonus(totalBon);
        // Comissão é mapeada conforme o perfil (ex: vindo de tarefas ou bônus)
        setCommissions(totalBon); 

      } catch (err) {
        console.error('Erro ao carregar dados financeiros:', err);
      } finally {
        done();
      }
    }
    fetchFinancials();
  }, [profile?.id, registerFetch]);

  const fmt = (val: number) => val.toLocaleString('pt-AO', { minimumFractionDigits: 2 });

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFDFD] pb-32 font-sans antialiased page-content">
      {/* 🔴 Top Banner - Com imagem de fundo e Saldo Disponível */}
      <section className="pt-0 mb-6">
        <div 
            className="h-[180px] relative overflow-hidden flex flex-col justify-center px-8 bg-cover bg-center shadow-lg bg-[url('/fundo-para a paginafundotualizada.png')]"
        >
            <div className="relative z-10 flex items-center gap-2 text-white">
                <span className="text-[34px] font-bold tracking-tight drop-shadow-md">
                    ≈{fmt(balance).replace(/\s/g, '')}
                </span>
                <span className="text-[14px] font-bold opacity-90 mt-2 drop-shadow-sm">AOA</span>
            </div>
        </div>
      </section>

      {/* ⚪ Grid Actions */}
      <section className="px-4 mb-10">
        <div className="grid grid-cols-4 gap-4">
          <button onClick={() => navigate('/recarregar')} className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center">
              <div className="relative">
                <Wallet className="w-6 h-6 text-gray-700" />
                <ArrowDownRight className="w-3 h-3 text-red-500 absolute -bottom-1 -right-1" strokeWidth={3} />
              </div>
            </div>
            <span className="text-[11px] font-medium text-gray-600 lowercase">recarregar</span>
          </button>

          <button onClick={() => navigate('/retirar')} className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center">
              <div className="relative">
                <Wallet className="w-6 h-6 text-gray-700" />
                <ArrowUpRight className="w-3 h-3 text-green-500 absolute -bottom-1 -right-1" strokeWidth={3} />
              </div>
            </div>
            <span className="text-[11px] font-medium text-gray-600 lowercase">extrair</span>
          </button>

          <button onClick={() => navigate('/recarregar-usdt')} className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center">
              <ArrowRightLeft className="w-6 h-6 text-gray-700" />
            </div>
            <span className="text-[11px] font-medium text-gray-600 lowercase">conversões</span>
          </button>

          <button onClick={() => navigate('/equipe')} className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center">
              <BadgeDollarSign className="w-6 h-6 text-gray-700" />
            </div>
            <span className="text-[11px] font-medium text-gray-600 lowercase">vendido</span>
          </button>
        </div>
      </section>

      {/* 📊 Seção Ativos da Conta */}
      <section className="px-5">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-1.5 h-4 bg-[#6D28D9] rounded-full"></div>
          <h2 className="text-[16px] font-bold text-gray-900 lowercase">ativos da conta</h2>
        </div>

        <div className="space-y-4">
          {[
            { label: 'conta processamento', value: totalRecharges, icon: Landmark },
            { label: 'retirada total', value: withdrawals, icon: ArrowUpRight },
            { label: 'comissões de equipe', value: commissions, icon: TrendingUp },
            { label: 'total de recargas', value: totalRecharges, icon: ShieldCheck },
          ].map((item, idx) => (
            <div 
              key={idx}
              className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-gray-50 active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-[#6D28D9]" />
                </div>
                <span className="text-[13px] font-bold text-gray-500 lowercase">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-black text-gray-900">{fmt(item.value)}</span>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
