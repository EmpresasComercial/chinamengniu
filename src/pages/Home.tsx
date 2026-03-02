import React, { useEffect, useState } from 'react';
import { Bell, MessageSquare, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useLoading } from '../contexts/LoadingContext';
import { supabase } from '../lib/supabase';

export default function Home() {
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();
  const [notification, setNotification] = useState<string | null>(null);
  const [whatsappUrl, setWhatsappUrl] = useState('https://wa.me/1234567890');

  useEffect(() => {
    async function fetchLinks() {
      const { data, error } = await supabase
        .from('atendimento_links')
        .select('whatsapp_gerente_url')
        .single();

      if (!error && data?.whatsapp_gerente_url) {
        setWhatsappUrl(data.whatsapp_gerente_url);
      }
    }
    fetchLinks();
  }, []);

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.preventDefault();
    showLoading();
    setTimeout(() => {
      hideLoading();
      setNotification('Redirecionando para o WhatsApp...');
      setTimeout(() => {
        setNotification(null);
        window.open(whatsappUrl, '_blank');
      }, 2000);
    }, 500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f0f2f5]">
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
            <div className="w-16 h-16 bg-[#00008B] rounded-full flex items-center justify-center mb-2 overflow-hidden shadow-md">
              <img
                alt="Moedas corporativas"
                className="w-12 h-12 object-contain"
                src="https://www.mengniu.wang/assets/coin-DnOWIML3.png"
              />
            </div>
            <span className="text-[14px] font-black text-slate-900 leading-[1.1]">
              Apresentação da<br />Empresa
            </span>
          </div>
          <div
            onClick={() => navigate('/equipe')}
            className="flex flex-col items-center cursor-pointer"
          >
            <div className="w-16 h-16 bg-[#0000AA] rounded-[1.5rem] flex items-center justify-center mb-2 shadow-md">
              {/* Custom SVG reflecting the 'Logout/Action' icon in image */}
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-[14px] font-black text-slate-900">equipe</span>
          </div>
          <div
            onClick={() => navigate('/ajuda')}
            className="flex flex-col items-center cursor-pointer"
          >
            <div className="w-16 h-16 bg-[#00008B] rounded-[1.5rem] flex items-center justify-center mb-2 shadow-md">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-[14px] font-black text-slate-900">ajuda</span>
          </div>
        </div>

        {/* App Banner */}
        <div className="bg-[#EBF1FF] rounded-[2rem] p-6 flex justify-between items-center relative overflow-hidden h-28 group cursor-pointer transition-transform active:scale-[0.98]">
          <div className="z-10 flex flex-col justify-center">
            <h3 className="text-[#0000AA] font-black text-[22px] mb-3">Baixe o aplicativo</h3>
            <div className="bg-[#0000AA] rounded-full w-10 h-6 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="4">
                <path d="M13 5l7 7-7 7M5 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-36 py-2 px-2 flex items-center justify-center">
            <img
              alt="App gift promo"
              className="w-full h-full object-contain drop-shadow-lg"
              src="https://www.mengniu.wang/assets/empty-image-CHCN_UjN.png"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </section>

      {/* Hero Image */}
      <section className="mt-4 px-4">
        <div className="rounded-2xl overflow-hidden shadow-sm">
          <img
            alt="Industrial building"
            className="w-full h-auto object-cover"
            src="https://api.mengniu.wang/upload/img/6993c3911410.webp"
            referrerPolicy="no-referrer"
          />
        </div>
      </section>

      {/* WhatsApp Support Section */}
      <section className="mt-6 px-4 mb-8 flex justify-center">
        <button
          onClick={handleWhatsAppClick}
          className="block rounded-full overflow-hidden shadow-sm hover:opacity-80 hover:scale-105 transition-all duration-300 w-16 h-16 bg-white p-2"
        >
          <img
            alt="suporte whatsapp"
            className="w-full h-full object-contain"
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png"
            referrerPolicy="no-referrer"
          />
        </button>
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
