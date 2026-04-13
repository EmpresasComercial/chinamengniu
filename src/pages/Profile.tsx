import React, { useState, useEffect, useCallback } from 'react';
import { 
  Headset, X, Users, HelpCircle,
  Info, Bell, Download, Lock, UserCheck, FileText, Share2,
  LogOut, LayoutDashboard, CreditCard
} from 'lucide-react';
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
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [links, setLinks] = useState({
    whatsapp_gerente_url: 'https://wa.me/1234567890',
    whatsapp_grupo_vendas_url: 'https://wa.me/1234567890',
    link_app_atualizado: '#',
    splash_message: 'carregando avisos...'
  });

  const { user, profile, signOut, loading: authLoading } = useAuth();

  useEffect(() => {
    // Redireciona apenas quando o carregamento inicial termina e não há sessão ativa
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  const handleLogout = useCallback(async () => {
    setProfileNotification('limpando dados e saindo...');
    
    setTimeout(async () => {
      try {
        await signOut();
        localStorage.clear();
        sessionStorage.clear();
        if ('caches' in window) {
           const cacheNames = await caches.keys();
           await Promise.all(cacheNames.map(name => caches.delete(name)));
        }
        window.location.href = '/login';
      } catch (err) {
        window.location.href = '/login';
      }
    }, 1000);
  }, [signOut]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="w-8 h-8 border-4 border-[#6D28D9] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

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

  // PWA Install Logic
  useEffect(() => {
    const handler = (e: any) => {
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallApp = useCallback(async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setProfileNotification('instalação iniciada com sucesso!');
        }
        setDeferredPrompt(null);
      } catch (err) {
        setProfileNotification('erro ao tentar instalar. tente pelo menu do navegador.');
      }
    } else {
      // Fallback para quando o evento não foi capturado (iOS ou já instalado)
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      if (isIOS) {
        setProfileNotification('no ios: clique em "compartilhar" e depois em "adicionar à tela de início".');
      } else {
        setProfileNotification('o aplicativo já está instalado ou use o menu do navegador para instalar.');
      }
      setTimeout(() => setProfileNotification(null), 5000);
    }
  }, [deferredPrompt]);

  const handleLinkClick = useCallback((url: string, e: React.MouseEvent) => {
    e.preventDefault();
    window.open(url, '_blank');
  }, []);

  const funcaoItems = [
    { name: 'informação', icon: Info, colorClass: 'yellow', path: '/apresentacao-da-empresa' },
    { name: 'equipe', icon: Users, colorClass: 'blue', path: '/equipe' },
    { name: 'serviço', icon: Headset, colorClass: 'orange', path: 'support' },
    { name: 'Partilha', icon: Share2, colorClass: 'red', path: '/convidar' },
    { name: 'terraço', icon: LayoutDashboard, colorClass: 'orange', path: '/terraco' },
    { name: 'ajuda', icon: HelpCircle, colorClass: 'coral', path: '/central-de-ajuda' },
    { name: 'anúncio', icon: Bell, colorClass: 'blue', path: '/anuncios' },
    { name: 'download', icon: Download, colorClass: 'yellow', path: 'install' },
  ];

  const segurancaItems = [
    { name: 'senha', icon: Lock, colorClass: 'orange', path: '/alterar-senha' },
    { name: 'banco', icon: CreditCard, colorClass: 'blue', path: '/adicionar-banco' },
    { name: 'validar', icon: UserCheck, colorClass: 'orange', path: '/validar' },
    { name: 'contrato', icon: FileText, colorClass: 'coral', path: '/contrato' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFDFD] pb-32 font-sans antialiased page-content">
      {/* 🔴 Header Navigation */}
      <header className="flex items-center justify-between px-6 py-4 bg-white/50 sticky top-0 z-20">
        <h1 className="text-[20px] font-black text-gray-900 lowercase">meu</h1>
        <div className="flex items-center gap-5 text-gray-700">
           <button onClick={handleLogout} className="active:scale-95 transition-all text-gray-400 hover:text-red-500" title="sair da conta">
              <LogOut className="w-5 h-5 opacity-70" />
           </button>
           
           <button onClick={() => navigate('/anuncios')} className="relative active:scale-95 transition-all text-gray-400 hover:text-[#6D28D9]" title="anúncios">
              <Bell className="w-5 h-5 opacity-70" />
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></div>
           </button>

           <button onClick={() => setIsSupportModalOpen(true)} className="active:scale-95 transition-all text-gray-400 hover:text-[#6D28D9]" title="atendimento">
              <Headset className="w-5 h-5 opacity-70" />
           </button>
        </div>
      </header>

      {/* 👤 User Info Section */}
      <section className="px-6 py-8 flex items-center gap-4">
        <div className="w-20 h-20 rounded-full border-[3px] border-white shadow-lg overflow-hidden bg-white">
           <img 
              src="/ai-go-onrender.png" 
              alt="avatar" 
              className="w-full h-full object-cover scale-110"
           />
        </div>
        <div>
          <h2 className="text-[22px] font-bold text-gray-900 flex items-center gap-1">
             Olá ,
          </h2>
          <p className="text-[12px] text-gray-500 font-medium">
             {profile?.phone ? `+244 ${profile.phone}` : 'carregando...'}
          </p>
        </div>
      </section>

      {/* 🛠 Função Section */}
      <section className="px-5 mb-8">
        <h3 className="text-[15px] font-bold text-gray-900 mb-4 ml-1">Função</h3>
        <div className="bg-white rounded-2xl p-4 shadow-xl shadow-gray-100 border border-gray-50">
          <div className="grid grid-cols-4 gap-y-8 gap-x-2">
            {funcaoItems.map((item, idx) => (
              <button 
                key={idx} 
                onClick={() => {
                  if (item.path === 'support') setIsSupportModalOpen(true);
                  else if (item.path === 'install') handleInstallApp();
                  else if (item.path !== '#') {
                     navigate(item.path);
                  }
                }}
                className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
              >
                <div className="relative">
                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center icon-box-${item.colorClass}`}>
                     <item.icon className="w-5 h-5" />
                   </div>
                   <div className={`absolute -inset-1 rounded-xl blur-md opacity-20 glow-${item.colorClass}`}></div>
                </div>
                <span className="text-[10px] font-bold text-gray-500 whitespace-nowrap">{item.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 🛡 Segurança Section */}
      <section className="px-5">
        <h3 className="text-[15px] font-bold text-gray-900 mb-4 ml-1">Segurança</h3>
        <div className="bg-white rounded-2xl p-4 shadow-xl shadow-gray-100 border border-gray-50">
          <div className="grid grid-cols-4 gap-y-8 gap-x-2">
            {segurancaItems.map((item, idx) => (
              <button 
                key={idx} 
                onClick={() => {
                  if (item.path !== '#') navigate(item.path);
                }}
                className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
              >
                <div className="relative">
                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center icon-box-${item.colorClass}`}>
                     <item.icon className="w-5 h-5" />
                   </div>
                   <div className={`absolute -inset-1 rounded-xl blur-md opacity-20 glow-${item.colorClass}`}></div>
                </div>
                <span className="text-[10px] font-bold text-gray-500 whitespace-nowrap">{item.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>



      {/* Profile inline toast for feedback */}
      <AnimatePresence>
        {profileNotification && (
          <div className="fixed inset-0 pointer-events-none z-[10000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-black/80 backdrop-blur-sm text-white px-5 py-3 rounded-xl text-[12.5px] font-bold text-center pointer-events-auto"
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
    </div>
  );
}
