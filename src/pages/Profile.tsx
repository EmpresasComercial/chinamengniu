import { useState, useEffect, useCallback } from 'react';
import { Rocket, Users, BarChart3, CircleDollarSign, ShieldCheck, HelpCircle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useLoading } from '../contexts/LoadingContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function Profile() {
  const navigate = useNavigate();
  const { showLoading, hideLoading, registerFetch } = useLoading();
  const [profileNotification, setProfileNotification] = useState<string | null>(null);

  const showProfileNotification = (msg: string) => {
    setProfileNotification(msg);
    setTimeout(() => setProfileNotification(null), 3000);
  };
  const { profile, signOut, user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [financialData, setFinancialData] = useState({
    contaReproducao: 0,      // tarefas_diarias.balance_correte
    retiradaTotal: 0,        // retirada_clientes.valor_solicitado (aprovado)
    comissaoTotalEquipe: 0,  // bonus_transacoes total
    lucrosOntem: 0,          // tarefas_diarias.renda_coletada de ontem
    ganhoHoje: 0,            // tarefas_diarias.renda_coletada de hoje
    comissaoHoje: 0,         // bonus_transacoes de hoje
  });

  useEffect(() => {
    if (!user) return;
    fetchFinancialData();
  }, [user]);

  const fetchFinancialData = useCallback(async () => {
    if (!user) return;
    const done = registerFetch();
    try {
      const hoje = new Date();
      const inicioDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()).getTime();
      const inicioOntem = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - 1).getTime();
      const fimOntem = inicioDia;

      const tarefasPromise = supabase
        .from('tarefas_diarias')
        .select('balance_correte, renda_coletada, data_atribuicao')
        .eq('user_id', user.id);

      const retiradasPromise = supabase
        .from('retirada_clientes')
        .select('valor_solicitado')
        .eq('user_id', user.id)
        .eq('estado_da_retirada', 'aprovado');

      const bonusPromise = supabase
        .from('bonus_transacoes')
        .select('valor_recebido, data_recebimento')
        .eq('user_id', user.id);

      const [tarefasRes, retiradasRes, bonusRes] = await Promise.all([
        tarefasPromise,
        retiradasPromise,
        bonusPromise
      ]);

      const tarefas = tarefasRes.data || [];
      const retiradas = retiradasRes.data || [];
      const bonus = bonusRes.data || [];

      const contaReproducao = tarefas.reduce((s, t) => s + Number(t.balance_correte || 0), 0);
      const retiradaTotal = retiradas.reduce((s, r) => s + Number(r.valor_solicitado || 0), 0);
      const comissaoTotalEquipe = bonus.reduce((s, b) => s + Number(b.valor_recebido || 0), 0);

      let lucrosOntem = 0;
      let ganhoHoje = 0;
      tarefas.forEach(t => {
        const time = new Date(t.data_atribuicao).getTime();
        const val = Number(t.renda_coletada || 0);
        if (time >= inicioDia) ganhoHoje += val;
        else if (time >= inicioOntem && time < fimOntem) lucrosOntem += val;
      });

      let comissaoHoje = 0;
      bonus.forEach(b => {
        if (new Date(b.data_recebimento).getTime() >= inicioDia) {
          comissaoHoje += Number(b.valor_recebido || 0);
        }
      });

      setFinancialData({ contaReproducao, retiradaTotal, comissaoTotalEquipe, lucrosOntem, ganhoHoje, comissaoHoje });
    } finally {
      done();
    }
  }, [user, registerFetch]);

  const handleCopyUID = useCallback(() => {
    if (profile?.invite_code) {
      navigator.clipboard.writeText(profile.invite_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [profile?.invite_code]);

  const fmt = (val: number) => val.toLocaleString('pt-AO', { minimumFractionDigits: 2 });

  const menuItems = [
    { name: 'Convidar amigos', icon: Rocket, path: '/convidar' },
    { name: 'Recarregar USDT', icon: CircleDollarSign, path: '/recarregar-usdt' },
    { name: 'Minha equipe', icon: Users, path: '/equipe' },
    { name: 'Registros de conta', icon: BarChart3, path: '/detalhes' },
    { name: 'Trocar saldo', icon: CircleDollarSign, path: '/transferencia-de-fundos' },
    { name: 'Centro de segurança', icon: ShieldCheck, path: '/centro-de-seguranca' },
    { name: 'Perguntas frequentes', icon: HelpCircle, path: '/central-de-ajuda' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#EAEBED] page-content">
      {/* Header Section */}
      <header className="bg-[#0000AA] p-4 text-white pb-8 relative overflow-hidden">
        {/* Decorative circle */}
        <div className="absolute -right-10 top-10 w-32 h-32 rounded-full bg-white/10 border-4 border-white/20"></div>

        <div className="flex items-center space-x-3 mb-2">
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center overflow-hidden">
            <img
              alt="logo"
              className="w-full h-full object-contain p-1"
              src="https://s3-symbol-logo.tradingview.com/mengniu-dairy--600.png"
            />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-[15px] truncate max-w-[150px]">
                {profile?.phone ? `+244 ${profile.phone}` : 'Carregando...'}
              </span>
              <span className="bg-yellow-500 text-[10px] px-2 rounded-full text-black font-bold">
                {profile?.state || 'VIP0'}
              </span>
            </div>
            <div className="flex items-center mt-1">
              <span className="text-[12.5px] text-yellow-400 font-bold tracking-wider">
                ID: {profile?.invite_code || '---'}
              </span>
              <button
                onClick={handleCopyUID}
                className="ml-2 text-[10px] bg-white/20 px-1 rounded flex items-center gap-1 btn-small"
              >
                {copied ? 'copiado!' : '📋'}
              </button>
            </div>
          </div>
        </div>

        {/* Linha 1: balance (profiles.balance) + recarga total (profiles.reloaded_amount) */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div>
            <p className="text-[10px] opacity-80 uppercase tracking-wider">Balance contabilazado</p>
            <p className="text-[20px] font-bold">{fmt(Number(profile?.balance || 0))} Kz</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] opacity-80 uppercase tracking-wider">recarga total</p>
            <p className="text-[20px] font-bold">{fmt(Number(profile?.reloaded_amount || 0))} Kz</p>
          </div>
        </div>

        {/* Linha 2: conta de reprodução + retirada total + comissão total equipe */}
        <div className="grid grid-cols-3 gap-2 mt-4 text-center">
          <div>
            <p className="text-[10px] opacity-80 leading-tight">conta de<br />reprodução</p>
            <p className="font-bold text-[14px] mt-1">{fmt(financialData.contaReproducao)} Kz</p>
          </div>
          <div>
            <p className="text-[10px] opacity-80 leading-tight">retirada<br />total</p>
            <p className="font-bold text-[14px] mt-1">{fmt(financialData.retiradaTotal)} Kz</p>
          </div>
          <div>
            <p className="text-[10px] opacity-80 leading-tight">Comissão total<br />equipe</p>
            <p className="font-bold text-[14px] mt-1">{fmt(financialData.comissaoTotalEquipe)} Kz</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <button
            onClick={() => navigate('/recarregar')}
            className="bg-[#D6F174] text-black font-bold h-[45px] rounded-lg px-3 flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform"
          >
            <img src="/deposit1-Dk3ugVyJ.png" alt="Recarregar" className="w-5 h-5 object-contain shrink-0" />
            <span className="text-[12.5px]">recarregar</span>
          </button>
          <button
            onClick={() => navigate('/retirar')}
            className="bg-[#D6F174] text-black font-bold h-[45px] rounded-lg px-3 flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform"
          >
            <img src="/withdraw1-pLMbG-t2.png" alt="Extrair" className="w-5 h-5 object-contain shrink-0" />
            <span className="text-[12.5px]">extrair</span>
          </button>
        </div>
      </header>

      {/* Stats Section */}
      <section className="bg-[#0000AA] px-4 pb-6 text-white relative">
        <div className="absolute right-[-20px] top-4 w-24 h-24 rounded-full bg-white/5 border-2 border-white/10"></div>
        <div className="grid grid-cols-3 gap-2 text-center py-4 border-t border-white/10">
          <div>
            <p className="text-[10px] opacity-70">Lucros de ontem</p>
            <p className="font-bold text-[14px]">{fmt(financialData.lucrosOntem)} Kz</p>
          </div>
          <div>
            <p className="text-[10px] opacity-70">Ganhos de hoje</p>
            <p className="font-bold text-[14px]">{fmt(financialData.ganhoHoje)} Kz</p>
          </div>
          <div>
            <p className="text-[10px] opacity-70">Comissão de hoje</p>
            <p className="font-bold text-[14px]">{fmt(financialData.comissaoHoje)} Kz</p>
          </div>
        </div>

      </section >

      {/* Action List Section */}
      < section className="bg-[#EAEBED] rounded-t-3xl -mt-4 relative z-10 px-4 pt-6 flex-grow" >
        <div className="space-y-1">
          {menuItems.map((item, idx) => (
            <div
              key={idx}
              onClick={() => item.path !== '#' && navigate(item.path)}
              className="flex items-center justify-between py-3 border-b border-gray-200 cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <item.icon className="w-5 h-5 text-blue-900" />
                <span className="text-blue-900 text-[12.5px] font-medium">{item.name}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          ))}
        </div>
        <button
          onClick={async () => {
            showLoading();
            await signOut();
            hideLoading();
            navigate('/login');
          }}
          className="w-full bg-[#0000B8] text-white font-bold h-[45px] mt-8 mb-20 rounded-full text-[15px]"
        >
          sair
        </button>
      </section >

      {/* Profile inline toast for USDT validation */}
      <AnimatePresence>
        {profileNotification && (
          <div className="fixed inset-0 pointer-events-none z-[10000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-black/80 backdrop-blur-sm text-white px-5 py-3 rounded-2xl text-[12.5px] shadow-xl text-center max-w-[85vw] whitespace-normal break-words pointer-events-auto"
            >
              {profileNotification}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div >
  );
}
