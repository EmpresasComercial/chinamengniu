import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Bell, Headset, X, Copy, TrendingUp, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useLoading } from '../contexts/LoadingContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const CAROUSEL_IMAGES = [
  '/carriseul-um.jpeg',
  '/carroseul-dois.jpeg'
];

interface CoinData {
  pair: string;
  name: string;
  symbol: string;
  price: number;
  change: string;
  isPositive: boolean;
  basePrice: number;
}

export default function Home() {
  const navigate = useNavigate();
  const { showLoading, hideLoading, registerFetch } = useLoading();
  const [notification, setNotification] = useState<string | null>(null);
  const { profile } = useAuth();
  const [links, setLinks] = useState({
    whatsapp_gerente_url: 'https://wa.me/1234567890',
    whatsapp_grupo_vendas_url: 'https://wa.me/1234567890',
    link_app_atualizado: '#',
    splash_message: 'carregando avisos...'
  });
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Real-time Trends State
  const [trends, setTrends] = useState<CoinData[]>([
    { pair: 'AOG/AOA', name: 'AOG', symbol: 'ADA', price: 1.0000, change: '0%', isPositive: true, basePrice: 1.0000 },
    { pair: 'BTC/USDT', name: 'BTC', symbol: 'USDT', price: 96512, change: '0.25%', isPositive: true, basePrice: 96512 },
    { pair: 'AVAX/USDT', name: 'AVAX', symbol: 'USDT', price: 40.96, change: '2.14%', isPositive: false, basePrice: 40.96 },
    { pair: 'USDT/USDT', name: 'USDT', symbol: 'USDT', price: 0.9991, change: '0.02%', isPositive: false, basePrice: 0.9991 },
    { pair: 'IOTA/USDT', name: 'IOTA', symbol: 'USDT', price: 0.3536, change: '5.71%', isPositive: false, basePrice: 0.3536 },
  ]);

  // Handle Carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // PWA Prompt
  useEffect(() => {
    const handler = (e: any) => setDeferredPrompt(e);
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallApp = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') setNotification('Operação concluída.');
        setDeferredPrompt(null);
      } catch (err) {}
    } else {
      setNotification('O aplicativo já se encontra instalado.');
      setTimeout(() => setNotification(null), 2500);
    }
  }, [deferredPrompt]);

  // Fetch Links
  useEffect(() => {
    async function fetchLinks() {
      const done = registerFetch();
      try {
        const { data } = await supabase.from('atendimento_links').select('*').single();
        if (data) setLinks(prev => ({ ...prev, ...data }));
      } finally { done(); }
    }
    fetchLinks();
  }, [registerFetch]);

  // 📈 REAL-TIME DATA LOGIC (Ticker Simulation)
  const fetchCryptoTrends = useCallback(async () => {
    try {
      const response = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbols=["BTCUSDT","AVAXUSDT","IOTAUSDT"]');
      const data = await response.json();
      
      setTrends(prev => prev.map(coin => {
        const live = data.find((d: any) => d.symbol === coin.name + 'USDT');
        if (live) {
          const lp = parseFloat(live.lastPrice);
          return {
            ...coin,
            basePrice: lp,
            change: (parseFloat(live.priceChangePercent) >= 0 ? '+' : '') + parseFloat(live.priceChangePercent).toFixed(2) + '%',
            isPositive: parseFloat(live.priceChangePercent) >= 0
          };
        }
        return coin;
      }));
    } catch (err) {}
  }, []);

  useEffect(() => {
    fetchCryptoTrends();
    const fetchInterval = setInterval(fetchCryptoTrends, 10000);
    
    // Pulse effect: slightly fluctuate shown prices every 1s
    const pulseInterval = setInterval(() => {
      setTrends(prev => prev.map(coin => {
        if (coin.name === 'AOG') return coin; // Stable
        const drift = (Math.random() - 0.5) * (coin.basePrice * 0.0001); // 0.01% drift
        return { ...coin, price: coin.basePrice + drift };
      }));
    }, 800);

    return () => {
      clearInterval(fetchInterval);
      clearInterval(pulseInterval);
    };
  }, [fetchCryptoTrends]);

  const handleLinkClick = useCallback((url: string, e: React.MouseEvent) => {
    e.preventDefault();
    window.open(url, '_blank');
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFDFD] pb-32 font-sans antialiased page-content">
      {/* 🟣 Header Section */}
      <header className="bg-[#6D28D9] pt-4 pb-16 px-4 relative overflow-hidden">
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
              <img src="/ai-go-onrender.png" alt="logo" className="w-full h-full object-contain p-1" />
            </div>
            <div>
              <h1 className="text-white font-bold text-[15px] leading-tight">AI-GO onrender</h1>
            </div>
          </div>
          <button onClick={() => setIsSupportModalOpen(true)} className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm active:scale-90 transition-transform" title="atendimento">
            <Headset className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="bg-black/20 backdrop-blur-md rounded-xl h-9 border border-white/10 flex items-center overflow-hidden relative">
          <Bell className="w-3.5 h-3.5 text-white shrink-0 ml-4 z-10" />
          <div className="flex-1 overflow-hidden relative h-full flex items-center">
            <div className="absolute whitespace-nowrap animate-marquee-infinite flex gap-12 items-center">
              <span className="text-white text-[12.5px] font-medium whitespace-nowrap">{links.splash_message.replace(/\n/g, ' ')}</span>
              <span className="text-white text-[12.5px] font-medium whitespace-nowrap">{links.splash_message.replace(/\n/g, ' ')}</span>
            </div>
          </div>
        </div>
      </header>

      {/* ⚪ Feature Grid */}
      <section className="mx-4 -mt-12 z-10 bg-white rounded-xl p-6 shadow-xl shadow-gray-200/50 border border-slate-50">
        <div className="grid grid-cols-3 gap-2 text-center mb-8">
          <div onClick={() => navigate('/apresentacao-da-empresa')} className="flex flex-col items-center">
            <div className="w-[52px] h-[52px] bg-purple-50 rounded-xl flex items-center justify-center mb-2">
              <img src="/coin-DnOWIML3.png" alt="icon" className="w-8 h-8 object-contain" />
            </div>
            <span className="text-[12px] font-bold text-slate-800 leading-tight">apresentação<br />institucional</span>
          </div>
          <div onClick={() => navigate('/equipe')} className="flex flex-col items-center">
            <div className="w-[52px] h-[52px] bg-purple-50 rounded-xl flex items-center justify-center mb-2">
              <Users className="w-6 h-6 text-[#6D28D9]" />
            </div>
            <span className="text-[12px] font-bold text-slate-800 lowercase">equipe</span>
          </div>
          <div onClick={() => navigate('/central-de-ajuda')} className="flex flex-col items-center">
            <div className="w-[52px] h-[52px] bg-purple-50 rounded-xl flex items-center justify-center mb-2">
              <TrendingUp className="w-6 h-6 text-[#6D28D9]" />
            </div>
            <span className="text-[12px] font-bold text-slate-800 lowercase">suporte</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-5 relative overflow-hidden">
          <h3 onClick={handleInstallApp} className="text-[#6D28D9] font-black text-[22px] mb-1 underline decoration-2 underline-offset-4 cursor-pointer">baixar aplicativo</h3>
          <p className="text-[#6D28D9]/60 text-[10px] font-black uppercase tracking-widest leading-none">AI-GO onrender premium</p>
          <div className="flex gap-2 w-full z-10 mt-6">
            <button onClick={() => navigate('/select-bank')} className="flex-1 bg-[#6D28D9] text-white px-3 rounded-xl text-[11px] font-bold h-[45px] flex items-center justify-center active:scale-95 shadow-lg shadow-purple-900/20 lowercase">
              <img src="/deposit1-Dk3ugVyJ.png" alt="dep" className="w-4 h-4 mr-2" /> depósito
            </button>
            <button onClick={() => navigate('/retirar')} className="flex-1 bg-white text-[#6D28D9] border border-purple-100 px-3 rounded-xl text-[11px] font-bold h-[45px] flex items-center justify-center active:scale-95 lowercase">
              <img src="/withdraw1-pLMbG-t2.png" alt="wit" className="w-4 h-4 mr-2" /> levantar
            </button>
          </div>
        </div>
      </section>

      {/* 🖼 Carousel */}
      <section className="mt-4 px-4">
        <div className="rounded-2xl overflow-hidden bg-gray-100 aspect-[21/9] relative shadow-lg">
          <AnimatePresence mode="wait">
             <motion.img
                key={currentSlide}
                src={CAROUSEL_IMAGES[currentSlide]}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 w-full h-full object-cover"
             />
          </AnimatePresence>
        </div>
      </section>

      {/* 📊 TENDÊNCIA – Real-time Crypto Market */}
      <section className="mt-8 px-4 mb-20">
        <div className="flex items-center gap-2 mb-4 px-2">
          <div className="w-1.5 h-4 bg-[#6D28D9] rounded-full"></div>
          <h3 className="text-slate-900 font-bold text-[15px] lowercase">tendência</h3>
        </div>

        <div className="bg-white rounded-2xl p-0.5 shadow-xl shadow-gray-100 border border-gray-50">
          <div className="flex flex-col">
            {trends.map((coin, idx) => (
              <div 
                key={idx} 
                className={`flex items-center justify-between p-4 ${idx !== trends.length - 1 ? 'border-b border-gray-50' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center p-0.5 bg-gray-50">
                     {/* Static path for coins icons to match provided reference style better */}
                     <img 
                        src={`https://static.okx.com/cdn/oksupport/asset/currency/icon/${coin.name.toLowerCase()}.png`} 
                        alt={coin.name}
                        className="w-full h-full object-contain rounded-full"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/coin-DnOWIML3.png' }}
                     />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                       <span className="text-[14px] font-black text-gray-900 leading-none">{coin.name}</span>
                       <span className="text-[10px] font-bold text-gray-400 opacity-60">/{coin.symbol}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between flex-1 pl-12">
                  {/* Dynamic value with micro-fluctuation */}
                  <motion.span 
                    key={coin.price}
                    initial={{ opacity: 0.8 }} animate={{ opacity: 1 }}
                    className="text-[15px] font-black text-gray-900"
                  >
                    {coin.price > 100 ? Math.floor(coin.price) : coin.price.toFixed(4)}
                  </motion.span>
                  
                  <div 
                    className={`min-w-[75px] h-[30px] rounded-lg flex items-center justify-center px-2 transition-colors duration-500 ${coin.isPositive ? 'bg-[#22c55e]' : 'bg-[#ef4444]'}`}
                  >
                    <span className="text-white text-[11px] font-bold">{coin.change}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Support Modal */}
      <AnimatePresence>
        {isSupportModalOpen && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSupportModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-[90%] max-w-sm bg-white rounded-xl p-5 z-[101]">
                <div className="flex justify-between items-center mb-5">
                    <div className="flex items-center gap-2">
                        <Headset className="w-5 h-5 text-[#6D28D9]" />
                        <h3 className="text-[#6D28D9] font-bold text-[12.5px] lowercase">suporte técnico</h3>
                    </div>
                    <button onClick={() => setIsSupportModalOpen(false)} className="p-1.5 bg-slate-100 rounded-xl" title="fechar">
                        <X className="w-4 h-4 text-slate-500" />
                    </button>
                </div>
                <div className="flex flex-col gap-2.5">
                    <button onClick={(e) => { handleLinkClick(links.whatsapp_grupo_vendas_url, e); setIsSupportModalOpen(false); }} className="w-full h-[45px] bg-slate-50 rounded-xl flex items-center px-3 active:bg-slate-100 transition-none border border-slate-100">
                        <div className="w-9 h-9 bg-[#25D366]/10 rounded-xl flex items-center justify-center mr-3">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png" className="w-5 h-5" alt="wa" />
                        </div>
                        <p className="text-slate-900 font-bold text-[12.5px] text-left lowercase">canal oficial whatsapp</p>
                    </button>
                    <button onClick={(e) => { handleLinkClick(links.whatsapp_gerente_url, e); setIsSupportModalOpen(false); }} className="w-full h-[45px] bg-slate-50 rounded-xl flex items-center px-3 active:bg-slate-100 transition-none border border-slate-100">
                        <div className="w-9 h-9 bg-[#25D366]/10 rounded-xl flex items-center justify-center mr-3">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png" className="w-5 h-5" alt="wa" />
                        </div>
                        <p className="text-slate-900 font-bold text-[12.5px] text-left lowercase">gerência de atendimento</p>
                    </button>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {notification && (
          <div className="fixed inset-0 pointer-events-none z-[10000] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-black/80 backdrop-blur-sm text-white px-5 py-3 rounded-xl text-[12.5px] font-bold text-center pointer-events-auto">
              {notification}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
