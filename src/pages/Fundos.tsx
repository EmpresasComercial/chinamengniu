import { Wallet, ArrowDownRight, ArrowUpRight, BarChart3, ChevronRight, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useLoading } from '../contexts/LoadingContext';

export default function Fundos() {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const { registerFetch } = useLoading();

  const [financialData, setFinancialData] = useState({
    contaProcessamento: 0,   // Do perfil: contaReproducao
    retiradaTotal: 0,        // Do perfil: retiradaTotal
    comissaoTotalEquipe: 0,  // Do perfil: comissaoTotalEquipe
  });

  const fetchFinancialData = useCallback(async () => {
    if (!user) return;
    const done = registerFetch();
    try {
      const tarefasPromise = supabase
        .from('tarefas_diarias')
        .select('balance_correte')
        .eq('user_id', user.id);

      const retiradasPromise = supabase
        .from('retirada_clientes')
        .select('valor_solicitado')
        .eq('user_id', user.id)
        .eq('estado_da_retirada', 'aprovado');

      const bonusPromise = supabase
        .from('bonus_transacoes')
        .select('valor_recebido')
        .eq('user_id', user.id);

      const [tarefasRes, retiradasRes, bonusRes] = await Promise.all([
        tarefasPromise,
        retiradasPromise,
        bonusPromise
      ]);

      const contaProcessamento = (tarefasRes.data || []).reduce((s, t) => s + Number(t.balance_correte || 0), 0);
      const retiradaTotal = (retiradasRes.data || []).reduce((s, r) => s + Number(r.valor_solicitado || 0), 0);
      const comissaoTotalEquipe = (bonusRes.data || []).reduce((s, b) => s + Number(b.valor_recebido || 0), 0);

      setFinancialData({ contaProcessamento, retiradaTotal, comissaoTotalEquipe });
    } finally {
      done();
    }
  }, [user, registerFetch]);

  useEffect(() => {
    fetchFinancialData();
  }, [fetchFinancialData]);

  const balance = profile?.balance || 0;
  const fmt = (val: number) => val.toLocaleString('pt-AO', { minimumFractionDigits: 2 });

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFDFD] pb-32 font-sans antialiased page-content">
      {/* 🔴 Top Banner - Com imagem de fundo e Saldo Disponível */}
      <section className="pt-0 mb-6">
        <div 
            className="h-[180px] relative overflow-hidden flex flex-col justify-center px-8 bg-cover bg-center shadow-lg"
            style={{ backgroundImage: 'url("/fundo-para a pagina fundo.png")' }}
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

          <button onClick={() => navigate('/transferencia-de-fundos')} className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-gray-700" />
            </div>
            <span className="text-[11px] font-medium text-gray-600 lowercase">conversões</span>
          </button>

          <button onClick={() => navigate('/detalhes')} className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center">
              <Package className="w-6 h-6 text-gray-700" />
            </div>
            <span className="text-[11px] font-medium text-gray-600 lowercase">vendido</span>
          </button>
        </div>
      </section>

      {/* 📋 List Items conforme mapeamento solicitado */}
      <section className="px-4 space-y-6">
        <h2 className="text-[15px] font-bold text-gray-900 ml-1 lowercase">a minha conta</h2>
        
        <div className="space-y-3">
          {/* Item 1: ativos monetários -> Conta Processamento */}
          <div className="bg-white rounded-xl py-5 px-6 shadow-sm border border-gray-50 flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-[11px] text-gray-400 font-bold lowercase">ativos monetários</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[19px] font-bold text-gray-900">{fmt(financialData.contaProcessamento)}</span>
                <span className="text-[11px] font-bold text-gray-600 uppercase">AOA</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300" />
          </div>

          {/* Item 2: Ativos simbólicos -> Retirada Total */}
          <div className="bg-white rounded-xl py-5 px-6 shadow-sm border border-gray-50 flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-[11px] text-gray-400 font-bold lowercase">Ativos simbólicos</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[19px] font-bold text-gray-900">{fmt(financialData.retiradaTotal)}</span>
                <span className="text-[11px] font-bold text-gray-600 uppercase">AOA</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300" />
          </div>

          {/* Item 3: Activos de bónus -> Comissões de Equipe */}
          <div className="bg-white rounded-xl py-5 px-6 shadow-sm border border-gray-50 flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-[11px] text-gray-400 font-bold lowercase">Activos de bónus</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[19px] font-bold text-gray-900">{fmt(financialData.comissaoTotalEquipe)}</span>
                <span className="text-[11px] font-bold text-gray-600 uppercase">AOA</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300" />
          </div>

          {/* Item 4: Fundo -> Total de Recargas */}
          <div className="bg-white rounded-xl py-5 px-6 shadow-sm border border-gray-50 flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-[11px] text-gray-400 font-bold lowercase">Fundo</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[19px] font-bold text-gray-900">≈ {fmt(Number(profile?.reloaded_amount || 0))}</span>
                <span className="text-[11px] font-bold text-gray-600 uppercase">AOA</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300" />
          </div>
        </div>
      </section>
    </div>
  );
}
