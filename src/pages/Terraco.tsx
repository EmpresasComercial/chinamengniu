import React, { useState, useEffect } from 'react';
import { Smartphone, Contact, Send, Facebook, Youtube, Copy, ChevronLeft, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLoading } from '../contexts/LoadingContext';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';

export default function Terraco() {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { showLoading, hideLoading, registerFetch } = useLoading();
  const [notification, setNotification] = useState<string | null>(null);
  
  const [links, setLinks] = useState({
    telegram_url: '',
    facebook_url: '',
    youtube_url: '',
    whatsapp_gerente_url: ''
  });

  useEffect(() => {
    async function fetchLinks() {
      const done = registerFetch();
      try {
        const { data, error } = await supabase
          .from('atendimento_links')
          .select('telegram_url, facebook_url, youtube_url, whatsapp_gerente_url')
          .single();

        if (!error && data) {
          setLinks({
            telegram_url: data.telegram_url || '',
            facebook_url: data.facebook_url || '',
            youtube_url: data.youtube_url || '',
            whatsapp_gerente_url: data.whatsapp_gerente_url || ''
          });
        }
      } finally {
        done();
      }
    }
    fetchLinks();
  }, [registerFetch]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    showNotification('copiado com sucesso');
  };

  const handleLogout = async () => {
    showLoading();
    try {
      // 1. Logout do Supabase
      await signOut();
      
      // 2. Limpeza profunda
      localStorage.clear();
      sessionStorage.clear();
      
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }

      // 3. Reset total
      window.location.href = '/login';
    } catch (err) {
      window.location.href = '/login';
    } finally {
      hideLoading();
    }
  };

  const displayUid = profile?.phone ? `000${profile.phone}` : '---';

  const handleLinkClick = (url: string) => {
    if (url) {
      window.open(url, '_blank');
    } else {
      showNotification('link não configurado');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans antialiased relative overflow-x-hidden pb-10">
      {/* 🟣 Decorative Background Elements (Top Right) */}
      <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-[#6D28D9]/5 rounded-[32px] rotate-12 -z-10 blur-[1px]"></div>
      <div className="absolute top-[40px] right-[-40px] w-24 h-24 bg-[#6D28D9]/3 rounded-[24px] -rotate-12 -z-10 blur-[2px]"></div>
      <div className="absolute top-[-10px] right-[60px] w-16 h-16 bg-[#6D28D9]/8 rounded-[16px] rotate-45 -z-10 blur-[1px]"></div>
      
      <div className="absolute top-0 left-0 right-0 h-[280px] bg-white -z-20"></div>

      <header className="flex items-center h-14 px-4 sticky top-0 z-50">
        <button 
          onClick={() => navigate(-1)} 
          className="text-gray-500 p-2 active:opacity-50 transition-opacity"
          aria-label="voltar"
          title="voltar"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      </header>

      <main className="px-5 flex-1 mt-2">
        <div className="flex flex-col items-center mb-8">
          <div className="w-[80px] h-[80px] rounded-full bg-white overflow-hidden flex items-center justify-center mb-4 shadow-sm border border-gray-100">
            <img src="/ai-go-onrender.png" alt="avatar" className="w-full h-full object-contain p-1" />
          </div>
          
          <div className="flex items-center justify-center gap-1">
            <span className="text-[#1f2937] text-[15px] font-bold">UID</span>
            <span className="text-gray-800 text-[15px] font-bold tracking-tight">{displayUid}</span>
            <button 
              onClick={() => handleCopy(displayUid)}
              className="ml-1 p-1 text-gray-400 active:text-gray-600 transition-colors"
              aria-label="copiar uid"
              title="copiar uid"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-[16px] p-2 mb-6 shadow-sm border border-gray-50">
          <div className="flex items-center justify-between px-3 py-4 border-b border-gray-50/80">
            <div className="flex items-center gap-3">
              <Smartphone className="w-[18px] h-[18px] text-gray-400" strokeWidth={2} />
              <span className="text-[13.5px] font-medium text-gray-500">phone</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-bold text-gray-800">{profile?.phone || ''}</span>
              <button onClick={() => handleCopy(profile?.phone || '')} className="text-gray-400 active:text-gray-600 transition-colors" aria-label="copiar telefone" title="copiar telefone">
                <Copy className="w-[14px] h-[14px]" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between px-3 py-4">
            <div className="flex items-center gap-3">
              <Contact className="w-[18px] h-[18px] text-gray-400" strokeWidth={2} />
              <span className="text-[13.5px] font-medium text-gray-500">Código de Convite</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-bold text-gray-800">{profile?.invite_code || ''}</span>
              <button onClick={() => handleCopy(profile?.invite_code || '')} className="text-gray-400 active:text-gray-600 transition-colors" aria-label="copiar código" title="copiar código">
                <Copy className="w-[14px] h-[14px]" />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[16px] p-2 mb-8 shadow-sm border border-gray-50">
          <button onClick={() => handleLinkClick(links.telegram_url)} className="w-full flex items-center justify-between px-3 py-4 border-b border-gray-50/80 active:bg-gray-50 transition-colors text-left">
            <div className="flex items-center gap-3">
              <Send className="w-[18px] h-[18px] text-gray-400" strokeWidth={2} />
              <span className="text-[13.5px] font-medium text-gray-500">Telegram</span>
            </div>
            <span className="text-[12.5px] text-gray-300">conta de telegrama</span>
          </button>
          
          <button onClick={() => handleLinkClick(links.facebook_url)} className="w-full flex items-center justify-between px-3 py-4 border-b border-gray-50/80 active:bg-gray-50 transition-colors text-left">
            <div className="flex items-center gap-3">
              <Facebook className="w-[18px] h-[18px] text-gray-400" strokeWidth={2} />
              <span className="text-[13.5px] font-medium text-gray-500">Facebook</span>
            </div>
            <span className="text-[12.5px] text-gray-300">conta do Facebook</span>
          </button>

          <button onClick={() => handleLinkClick(links.youtube_url)} className="w-full flex items-center justify-between px-3 py-4 border-b border-gray-50/80 active:bg-gray-50 transition-colors text-left">
            <div className="flex items-center gap-3">
              <Youtube className="w-[18px] h-[18px] text-gray-400" strokeWidth={2} />
              <span className="text-[13.5px] font-medium text-gray-500">Youtube</span>
            </div>
            <span className="text-[12.5px] text-gray-300">Conta do YouTube</span>
          </button>

          <button onClick={() => handleLinkClick(links.whatsapp_gerente_url)} className="w-full flex items-center justify-between px-3 py-4 active:bg-gray-50 transition-colors text-left">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-[18px] h-[18px] text-gray-400" strokeWidth={2} />
              <span className="text-[13.5px] font-medium text-gray-500">WhatsApp</span>
            </div>
            <span className="text-[12.5px] text-gray-300">Conta Whatsapp</span>
          </button>
        </div>

        <button
          onClick={handleLogout}
          className="w-full h-[48px] bg-[#ee3f3f] text-white rounded-[24px] text-[16px] font-bold active:scale-[0.98] transition-all shadow-lg shadow-red-500/20 lowercase"
        >
          deixar
        </button>
      </main>

      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md text-white px-5 py-2.5 rounded-full text-[12px] font-medium z-[100] whitespace-nowrap lowercase"
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
