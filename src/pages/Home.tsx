import React, { useEffect, useState } from 'react';
import { Bell, MessageSquare, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useLoading } from '../contexts/LoadingContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function Home() {
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();
  const [notification, setNotification] = useState<string | null>(null);
  const { profile } = useAuth();
  const [links, setLinks] = useState({
    manager: 'https://wa.me/1234567890',
    group: 'https://wa.me/1234567890'
  });
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallApp = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      setNotification('Instalação já disponível no seu navegador ou já instalada.');
      setTimeout(() => setNotification(null), 3000);
    }
  };

  useEffect(() => {
    async function fetchLinks() {
      const { data, error } = await supabase
        .from('atendimento_links')
        .select('whatsapp_gerente_url, whatsapp_grupo_vendas_url')
        .single();

      if (!error && data) {
        setLinks({
          manager: data.whatsapp_gerente_url || 'https://wa.me/1234567890',
          group: data.whatsapp_grupo_vendas_url || 'https://wa.me/1234567890'
        });
      }
    }
    fetchLinks();
  }, []);

  const handleLinkClick = (url: string, e: React.MouseEvent) => {
    e.preventDefault();
    showLoading();
    setTimeout(() => {
      hideLoading();
      setNotification('Redirecionando para o WhatsApp...');
      setTimeout(() => {
        setNotification(null);
        window.open(url, '_blank');
      }, 2000);
    }, 500);
  };

  const handleCopyInvite = (e: React.MouseEvent) => {
    e.preventDefault();
    const inviteCode = profile?.invite_code || '';
    const inviteLink = `https://www.mengniu.wang/#/register?invite=${inviteCode}`;

    if (inviteCode) {
      navigator.clipboard.writeText(inviteLink);
      setNotification('Link de convite copiado!');
      setTimeout(() => setNotification(null), 2500);
    } else {
      setNotification('Erro ao gerar link. Tente novamente.');
      setTimeout(() => setNotification(null), 2500);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f0f2f5] page-content">
      {/* Header */}
      <header className="bg-gradient-to-b from-[#001f8d] to-[#001561] pt-4 pb-16 px-4 relative">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center p-1">
              <img
                alt="Mengniu Company logo"
                className="w-full h-full object-contain"
                src="https://s3-symbol-logo.tradingview.com/mengniu-dairy--600.png"
              />
            </div>
            <span className="text-white font-bold text-lg">Mengniu Company</span>
          </div>
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        {/* Notification Bar */}
        <div className="bg-white/20 backdrop-blur-sm rounded-full py-2 px-4 flex items-center gap-2 mb-4 overflow-hidden">
          <Bell className="w-4 h-4 text-white shrink-0" />
          <div className="flex-1 overflow-hidden">
            <span className="text-white text-[12.5px] animate-marquee">uma plataforma digital de operação e manutenção de criação</span>
          </div>
        </div>
      </header>

      {/* Quick Actions Card */}
      <section className="mx-4 -mt-12 z-10 bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
        <div className="grid grid-cols-3 gap-2 text-center mb-8">
          <div
            onClick={() => navigate('/apresentacao-da-empresa')}
            className="flex flex-col items-center cursor-pointer"
          >
            <div className="w-[52px] h-[52px] bg-[#00008B] rounded-full flex items-center justify-center mb-2 overflow-hidden shadow-md">
              <img src="/images/icon-empresa.png" alt="Apresentação da Empresa" className="w-8 h-8 object-contain" />
            </div>
            <span className="text-[12.5px] font-black text-slate-900 leading-[1.1]">
              Apresentação da<br />Empresa
            </span>
          </div>
          <div
            onClick={() => navigate('/equipe')}
            className="flex flex-col items-center cursor-pointer"
          >
            <div className="w-[52px] h-[52px] bg-[#0000AA] rounded-2xl flex items-center justify-center mb-2 shadow-md">
              {/* Custom SVG reflecting the 'Logout/Action' icon in image */}
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-[12.5px] font-black text-slate-900">equipe</span>
          </div>
          <div
            onClick={() => navigate('/ajuda')}
            className="flex flex-col items-center cursor-pointer"
          >
            <div className="w-[52px] h-[52px] bg-[#00008B] rounded-2xl flex items-center justify-center mb-2 shadow-md">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-[12.5px] font-black text-slate-900">ajuda</span>
          </div>
        </div>

        {/* App Banner */}
        <div className="bg-[#EBF1FF] rounded-[2rem] p-4 flex flex-col justify-between relative overflow-hidden min-h-[140px] group cursor-pointer transition-all active:scale-[0.98]">
          <div className="z-10">
            <h3
              onClick={handleInstallApp}
              className="text-[#0000AA] font-black text-[22px] mb-1 underline decoration-2 underline-offset-4 cursor-pointer active:opacity-70 transition-opacity"
            >
              Baixe o aplicativo
            </h3>
            <p className="text-[#0000AA]/60 text-[11px] font-bold uppercase tracking-tight">mengniu company premium</p>
          </div>

          {/* Nova Row de Botões Esticados */}
          <div className="flex gap-2 w-full z-10 mt-4">
            <button
              onClick={(e) => { e.stopPropagation(); navigate('/recarregar'); }}
              className="flex-1 bg-[#0000AA] text-white px-4 rounded-2xl text-[12.5px] font-black shadow-lg shadow-blue-900/10 h-[44px] flex items-center justify-center active:scale-[0.96] transition-all whitespace-nowrap"
            >
              Recarregar
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); navigate('/retirar'); }}
              className="flex-1 bg-white text-[#0000AA] border border-blue-100 px-4 rounded-2xl text-[12.5px] font-black shadow-lg shadow-blue-900/5 h-[44px] flex items-center justify-center active:scale-[0.96] transition-all whitespace-nowrap"
            >
              Extrair
            </button>
          </div>

          <div className="absolute right-[-10px] top-[-10px] w-32 h-32 opacity-20 pointer-events-none">
            <img
              alt="Decoration"
              className="w-full h-full object-contain"
              src="https://www.mengniu.wang/assets/empty-image-CHCN_UjN.png"
            />
          </div>
        </div>
      </section>

      {/* Hero Banner */}
      <section className="mt-4 px-4">
        <div className="rounded-2xl overflow-hidden shadow-sm bg-gray-100 min-h-[120px]">
          <img src="/images/hero-banner.png" alt="Mengniu Banner" className="w-full h-auto object-cover" loading="lazy" />
        </div>
      </section>

      {/* Customer Service Section */}
      <section className="mt-6 px-4 mb-20">
        <div className="flex items-center gap-2 mb-4 px-2">
          <div className="w-1 h-4 bg-[#0000AA] rounded-full"></div>
          <h3 className="text-slate-800 font-bold text-[15px]">Atendimento ao cliente</h3>
        </div>

        <div className="flex flex-col gap-2">
          {/* WhatsApp Group */}
          <button
            onClick={(e) => handleLinkClick(links.group, e)}
            className="w-full h-[45px] bg-white rounded-2xl border border-slate-100 flex items-center px-4 active:bg-slate-50 transition-colors"
          >
            <div className="w-10 h-10 bg-[#25D366]/10 rounded-full flex items-center justify-center mr-3">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png"
                alt="WhatsApp Group"
                className="w-6 h-6 object-contain"
              />
            </div>
            <div className="flex-1 text-left">
              <p className="text-slate-900 font-bold text-[13px]">Entra grupo whatsapp</p>
              <p className="text-slate-500 text-[10px]">Junte-se à nossa comunidade</p>
            </div>
            <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
            </svg>
          </button>

          {/* WhatsApp Manager */}
          <button
            onClick={(e) => handleLinkClick(links.manager, e)}
            className="w-full h-[45px] bg-white rounded-2xl border border-slate-100 flex items-center px-4 active:bg-slate-50 transition-colors"
          >
            <div className="w-10 h-10 bg-[#0000AA]/10 rounded-full flex items-center justify-center mr-3">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png"
                alt="WhatsApp Manager"
                className="w-6 h-6 object-contain"
              />
            </div>
            <div className="flex-1 text-left">
              <p className="text-slate-900 font-bold text-[13px]">Whatsapp Gestor</p>
              <p className="text-slate-500 text-[10px]">Fale diretamente com o suporte</p>
            </div>
            <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
            </svg>
          </button>

          {/* Invite Button */}
          <button
            onClick={handleCopyInvite}
            className="w-full h-[45px] bg-white rounded-2xl border border-slate-100 flex items-center px-4 active:bg-slate-50 transition-colors"
          >
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-[#0000AA]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <p className="text-slate-900 font-bold text-[13px]">Convidar amigos</p>
              <p className="text-slate-500 text-[10px]">Copiar meu link de convite</p>
            </div>
            <div className="bg-blue-600 px-2.5 py-1 rounded-lg text-white text-[10px] font-bold">
              COPIAR
            </div>
          </button>
        </div>
      </section>

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: '-50%', y: '-50%' }}
            animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
            exit={{ opacity: 0, scale: 0.9, x: '-50%', y: '-50%' }}
            className="fixed top-1/2 left-1/2 bg-black/80 text-white px-6 py-3 rounded-xl text-[12.5px] font-medium shadow-2xl z-[100] text-center min-w-[280px]"
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
