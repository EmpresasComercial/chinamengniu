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
        const { data, error } = await supabase.rpc('get_support_links');
        const linkData = Array.isArray(data) ? data[0] : data;

        if (!error && linkData) {
          setLinks({
            whatsapp_gerente_url: linkData.whatsapp_gerente_url || 'https://wa.me/1234567890',
            whatsapp_grupo_vendas_url: linkData.whatsapp_grupo_vendas_url || 'https://wa.me/1234567890',
            link_app_atualizado: linkData.link_app_atualizado || '#',
            splash_message: linkData.splash_message || 'recarregue hoje mesmo, após a adtação'
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
                  className="p-1.5 bg-slate-100 rounded-2xl"
                  title="fechar"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={(e) => { handleLinkClick(links.whatsapp_grupo_vendas_url, e); setIsSupportModalOpen(false); }}
                  className="w-full h-[50px] bg-[#25D366] text-white rounded-xl flex items-center justify-center gap-2 active:bg-[#1DA851] transition-colors shadow-sm"
                >
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  <span className="font-bold text-[14px] lowercase">canal oficial whatsapp</span>
                </button>
                <button
                  onClick={(e) => { handleLinkClick(links.whatsapp_gerente_url, e); setIsSupportModalOpen(false); }}
                  className="w-full h-[50px] bg-[#25D366] text-white rounded-xl flex items-center justify-center gap-2 active:bg-[#1DA851] transition-colors shadow-sm"
                >
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  <span className="font-bold text-[14px] lowercase">gerência de atendimento</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
