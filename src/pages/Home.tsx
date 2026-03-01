import React, { useState } from 'react';
import { Bell, MessageSquare, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useLoading } from '../contexts/LoadingContext';

export default function Home() {
  const navigate = useNavigate();
  const { setIsLoading } = useLoading();
  const [notification, setNotification] = useState<string | null>(null);

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setNotification('Redirecionando para o WhatsApp...');
      setTimeout(() => {
        setNotification(null);
        window.open('https://wa.me/1234567890', '_blank');
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
                alt="mengniu company logo"
                className="w-full h-full object-contain"
                src="https://s3-symbol-logo.tradingview.com/mengniu-dairy--600.png"
              />
            </div>
            <span className="text-white font-bold text-lg">mengniu company</span>
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
      <section className="mx-4 -mt-12 z-10 bg-white rounded-[1.5rem] p-4 shadow-sm">
        <div className="grid grid-cols-3 gap-2 text-center mb-6">
          <div
            onClick={() => navigate('/apresentacao-da-empresa')}
            className="flex flex-col items-center cursor-pointer"
          >
            <div className="w-14 h-14 bg-gradient-to-b from-blue-700 to-blue-900 rounded-full flex items-center justify-center mb-2 overflow-hidden">
              <img
                alt="Coins"
                className="w-10 h-10 object-contain"
                src="https://www.mengniu.wang/assets/coin-DnOWIML3.png"
              />
            </div>
            <span className="text-[12.5px] font-bold text-gray-800 leading-tight">apresentação da<br />empresa</span>
          </div>
          <div
            onClick={() => navigate('/equipe')}
            className="flex flex-col items-center cursor-pointer"
          >
            <div className="w-14 h-14 bg-blue-800 rounded-full flex items-center justify-center mb-2">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
            </div>
            <span className="text-[12.5px] font-bold text-gray-800">minha equipe</span>
          </div>
          <div
            onClick={() => navigate('/convidar')}
            className="flex flex-col items-center cursor-pointer"
          >
            <div className="w-14 h-14 bg-blue-800 rounded-full flex items-center justify-center mb-2">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.5 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V8.5L15.5 3z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path><path d="M15 3v6h6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
            </div>
            <span className="text-[12.5px] font-bold text-gray-800">convidar amigos</span>
          </div>
        </div>

        {/* App Banner */}
        <div className="bg-blue-50 rounded-2xl p-4 flex justify-between items-center relative overflow-hidden h-24">
          <div className="z-10">
            <h3 className="text-blue-900 font-bold text-[15px] mb-2">baixe o aplicativo</h3>
            <div className="bg-blue-800 rounded-md w-12 h-6 flex items-center justify-center">
              {/* Simple blue button as seen in image */}
            </div>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-orange-200/50 flex items-center justify-center">
            <img
              alt="App promo"
              className="w-16 h-20 object-contain"
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTX_v5WJp8wxkMeScmrKicJQkr-g1hK8G0OQQ&s"
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
