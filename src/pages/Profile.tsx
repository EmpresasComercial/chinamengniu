import React, { useState, useEffect, useCallback } from 'react';
import { Headset, X, Rocket, Users, BarChart3, CircleDollarSign, ShieldCheck, HelpCircle, ChevronRight, Eye, EyeOff, PlusCircle, ArrowUpRight, ArrowRightLeft, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useLoading } from '../contexts/LoadingContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function Profile() {
  const navigate = useNavigate();
  const { showLoading, hideLoading, registerFetch } = useLoading();
  const [profileNotification, setProfileNotification] = useState<string | null>(null);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [links, setLinks] = useState({
    whatsapp_gerente_url: 'https://wa.me/1234567890',
    whatsapp_grupo_vendas_url: 'https://wa.me/1234567890',
    link_app_atualizado: '#',
    splash_message: 'carregando avisos...'
  });

  const showProfileNotification = (msg: string) => {
    setProfileNotification(msg);
    setTimeout(() => setProfileNotification(null), 3000);
  };
  const { profile, signOut, user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
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

  useEffect(() => {
    async function fetchLinks() {
      const done = registerFetch();
      try {
        const { data, error } = await supabase
          .from('atendimento_links')
          .select('whatsapp_gerente_url, whatsapp_grupo_vendas_url, link_app_atualizado, splash_message')
          .single();

        if (!error && data) {
          setLinks({
            whatsapp_gerente_url: data.whatsapp_gerente_url || 'https://wa.me/1234567890',
            whatsapp_grupo_vendas_url: data.whatsapp_grupo_vendas_url || 'https://wa.me/1234567890',
            link_app_atualizado: data.link_app_atualizado || '#',
            splash_message: data.splash_message || 'recarregue hoje mesmo, após a adtação'
          });
        }
      } finally {
        done();
      }
    }
    fetchLinks();
  }, [registerFetch]);

  const handleLinkClick = useCallback((url: string, e: React.MouseEvent) => {
    e.preventDefault();
    window.open(url, '_blank');
  }, []);

  const handleCopyUID = useCallback(() => {
    if (profile?.invite_code) {
      navigator.clipboard.writeText(profile.invite_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [profile?.invite_code]);

  const fmt = (val: number) => val.toLocaleString('pt-AO', { minimumFractionDigits: 2 });

  const menuItems = [
    { name: 'solicitar levantamento', icon: ArrowUpRight, path: '/retirar' },
    { name: 'efetuar depósito', icon: PlusCircle, path: '/recarregar' },
    { name: 'recarga via usdt', icon: CircleDollarSign, path: '/recarregar-usdt' },
    { name: 'programa de convite', icon: Rocket, path: '/convidar' },
    { name: 'gestão de equipe', icon: Users, path: '/equipe' },
    { name: 'histórico de transações', icon: BarChart3, path: '/detalhes' },
    { name: 'transferência de fundos', icon: ArrowRightLeft, path: '/transferencia-de-fundos' },
    { name: 'centro de segurança', icon: ShieldCheck, path: '/centro-de-seguranca' },
    { name: 'centro de ajuda & faq', icon: HelpCircle, path: '/central-de-ajuda' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#EAEBED] page-content">
      {/* Header Section */}
      <header className="bg-[#6D28D9] p-4 text-white pb-8 relative overflow-hidden">
        {/* Decorative circle */}
        <div className="absolute -right-10 top-10 w-32 h-32 rounded-full bg-white/10 border-4 border-white/20"></div>

        <button 
          onClick={() => setIsSupportModalOpen(true)}
          className="absolute top-4 right-4 text-white/80 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all active:scale-95 z-20"
          title="atendimento ao cliente"
        >
          <Headset className="h-6 w-6" />
        </button>

        <div className="flex items-center space-x-3 mb-2">
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center overflow-hidden">
            <img
              alt="logo"
              className="w-full h-full object-contain p-1"
              src="/ai-go-onrender.png"
            />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-[12.5px] truncate max-w-[150px]">
                {profile?.phone ? `+244 ${profile.phone}` : 'carregando...'}
              </span>
              <span className="bg-yellow-500 text-[10px] px-2 rounded-full text-black font-bold lowercase">
                {profile?.state || 'vip0'}
              </span>
            </div>
            <div className="flex items-center mt-1">
              <span className="text-[12.5px] text-yellow-400 font-bold tracking-wider">
                id: {profile?.invite_code || '---'}
              </span>
              <button
                onClick={handleCopyUID}
                className="ml-2 p-1 bg-white/20 rounded flex items-center justify-center active:scale-90 transition-transform"
                title="copiar ID"
              >
                {copied ? <span className="text-[9px] font-bold">copiado!</span> : <Copy className="w-3 h-3 text-white" />}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-start px-4">
          <div className="flex items-center gap-2 mb-1 text-white/90 lowercase">
            <p className="text-[12px] font-bold tracking-wider uppercase opacity-80">saldo disponível</p>
            <button 
              onClick={() => setShowBalance(!showBalance)}
              className="opacity-70 active:opacity-100 transition-opacity"
            >
              {showBalance ? <Eye className="w-[16px] h-[16px]" /> : <EyeOff className="w-[16px] h-[16px]" />}
            </button>
          </div>
          <p className="text-[34px] font-bold -mt-1 tracking-tight">
            {showBalance ? `${fmt(Number(profile?.balance || 0))} Kz` : '••••••••'}
          </p>
        </div>

        {/* Linha 2: conta de processamento + retirada total + comissão total equipe */}
        <div className="grid grid-cols-3 gap-1 mt-6 lowercase">
          <div className="text-center">
            <p className="text-[10px] uppercase font-bold opacity-70 whitespace-nowrap tracking-tighter">conta processamento</p>
            <p className="font-bold text-[14px] mt-1 whitespace-nowrap lowercase">{fmt(financialData.contaReproducao)} kz</p>
          </div>
          <div className="text-center border-l border-white/20">
            <p className="text-[10px] uppercase font-bold opacity-70 whitespace-nowrap tracking-tighter">retirada total</p>
            <p className="font-bold text-[14px] mt-1 whitespace-nowrap lowercase">{fmt(financialData.retiradaTotal)} kz</p>
          </div>
          <div className="text-center border-l border-white/20">
            <p className="text-[10px] uppercase font-bold opacity-70 whitespace-nowrap tracking-tighter">comissão equipe</p>
            <p className="font-bold text-[14px] mt-1 whitespace-nowrap lowercase">{fmt(financialData.comissaoTotalEquipe)} kz</p>
          </div>
        </div>

      </header>

      {/* Stats Section */}
      <section className="bg-[#6D28D9] px-4 pb-6 text-white relative">
        <div className="absolute right-[-20px] top-4 w-24 h-24 rounded-full bg-white/5 border-2 border-white/10"></div>
        <div className="grid grid-cols-3 gap-1 text-center py-4 border-t border-white/10 px-1 lowercase">
          <div>
            <p className="text-[10px] uppercase font-bold opacity-60 whitespace-nowrap tracking-tighter">recarga total</p>
            <p className="font-bold text-[14px] whitespace-nowrap">{fmt(Number(profile?.reloaded_amount || 0))} kz</p>
          </div>
          <div className="border-l border-white/10 px-1">
            <p className="text-[10px] uppercase font-bold opacity-60 whitespace-nowrap tracking-tighter">ganhos hoje</p>
            <p className="font-bold text-[14px] whitespace-nowrap">{fmt(financialData.ganhoHoje)} kz</p>
          </div>
          <div className="border-l border-white/10 px-1">
            <p className="text-[10px] uppercase font-bold opacity-60 whitespace-nowrap tracking-tighter">comissão hoje</p>
            <p className="font-bold text-[14px] whitespace-nowrap">{fmt(financialData.comissaoHoje)} kz</p>
          </div>
        </div>

      </section >

      {/* Action List Section */}
      <section className="bg-[#EAEBED] rounded-t-xl -mt-4 relative z-10 px-4 pt-6 flex-grow">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          className="space-y-1"
        >
          {menuItems.map((item, idx) => (
            <motion.div
              key={idx}
              variants={{
                hidden: { opacity: 0, x: -20 },
                visible: { opacity: 1, x: 0 }
              }}
              onClick={() => item.path !== '#' && navigate(item.path)}
              className="flex items-center justify-between py-3 border-b border-gray-200 cursor-pointer active:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <item.icon className="w-5 h-5 text-[#6D28D9]" />
                <span className="text-[#6D28D9] text-[12.5px] font-medium">{item.name}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </motion.div>
          ))}
        </motion.div>
        
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          onClick={async () => {
            showLoading();
            await signOut();
            hideLoading();
            navigate('/login');
          }}
          className="w-full bg-[#6D28D9] text-white font-bold h-[45px] mt-8 mb-24 rounded-xl text-[12.5px] active:scale-[0.98] transition-all shadow-lg shadow-purple-900/20 lowercase"
        >
          encerrar sessão
        </motion.button>
      </section>

      {/* Profile inline toast for USDT validation */}
      <AnimatePresence>
        {profileNotification && (
          <div className="fixed inset-0 pointer-events-none z-[10000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-black/80 backdrop-blur-sm text-white px-5 py-3 rounded-xl text-[12.5px]  text-center max-w-[85vw] whitespace-normal break-words pointer-events-auto"
            >
              {profileNotification}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Support Modal */}
      <AnimatePresence>
        {isSupportModalOpen && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSupportModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-[90%] max-w-sm bg-white rounded-xl p-5  z-[101]"
            >
              <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-2">
                  <Headset className="w-5 h-5 text-[#6D28D9]" />
                  <h3 className="text-[#6D28D9] font-bold text-[12.5px] lowercase">suporte técnico</h3>
                </div>
                <button 
                  onClick={() => setIsSupportModalOpen(false)} 
                  className="p-1.5 bg-slate-100 rounded-xl"
                  title="fechar"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              <div className="flex flex-col gap-2.5">
                <button
                  onClick={(e) => { handleLinkClick(links.whatsapp_grupo_vendas_url, e); setIsSupportModalOpen(false); }}
                  className="w-full h-[45px] bg-slate-50 rounded-xl flex items-center px-3 active:bg-slate-100 transition-none border border-slate-100"
                >
                  <div className="w-9 h-9 bg-[#25D366]/10 rounded-xl flex items-center justify-center mr-3">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png" className="w-5 h-5" alt="whatsapp" />
                  </div>
                  <p className="text-slate-900 font-bold text-[12.5px] text-left lowercase">canal oficial whatsapp</p>
                </button>

                <button
                  onClick={(e) => { handleLinkClick(links.whatsapp_gerente_url, e); setIsSupportModalOpen(false); }}
                  className="w-full h-[45px] bg-slate-50 rounded-xl flex items-center px-3 active:bg-slate-100 transition-none border border-slate-100"
                >
                  <div className="w-9 h-9 bg-[#25D366]/10 rounded-xl flex items-center justify-center mr-3">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png" className="w-5 h-5" alt="whatsapp" />
                  </div>
                  <p className="text-slate-900 font-bold text-[12.5px] text-left lowercase">gerência de atendimento</p>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div >
  );
}
