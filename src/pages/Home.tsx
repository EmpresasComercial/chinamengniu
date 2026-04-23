import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Bell, Headset, X, Copy, TrendingUp, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useLoading } from '../contexts/LoadingContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { getOptimizedImageUrl } from '../lib/image-optimization';

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

const CoinRow: React.FC<{ coin: CoinData; isLast: boolean }> = ({ coin, isLast }) => {
  const prevPrice = useRef(coin.price);
  const [flash, setFlash] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    if (coin.price > prevPrice.current) {
      setFlash('up');
      const timer = setTimeout(() => setFlash(null), 800);
      return () => clearTimeout(timer);
    } else if (coin.price < prevPrice.current) {
      setFlash('down');
      const timer = setTimeout(() => setFlash(null), 800);
      return () => clearTimeout(timer);
    }
    prevPrice.current = coin.price;
  }, [coin.price]);

  return (
    <div className={`flex items-center justify-between p-2.5 ${!isLast ? 'border-b border-gray-50' : ''} active:bg-gray-50 transition-colors`}>
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-full flex items-center justify-center p-0.5 bg-gray-50 border border-gray-100 shadow-sm">
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

      <div className="flex items-center justify-end gap-3 flex-1 min-w-0">
        <motion.span 
          animate={{ 
            color: flash === 'up' ? '#22c55e' : flash === 'down' ? '#ef4444' : '#111827',
            scale: flash ? 1.05 : 1
          }}
          className="text-[14px] font-black tracking-tight transition-colors duration-300 whitespace-nowrap"
        >
          {coin.price > 100 ? coin.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : coin.price.toFixed(4)}
        </motion.span>
        
        <div className={`min-w-[65px] h-[26px] rounded-lg flex items-center justify-center px-2 shadow-sm transition-all duration-500 ${coin.isPositive ? 'bg-[#22c55e]' : 'bg-[#ef4444]'}`}>
          <span className="text-white text-[11px] font-black whitespace-nowrap">{coin.change}</span>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const navigate = useNavigate();
  // ... rest of the Home component
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
        const { data } = await supabase.rpc('get_support_links');
        const linkData = Array.isArray(data) ? data[0] : data;
        if (linkData) setLinks(prev => ({ ...prev, ...linkData }));
      } finally { done(); }
    }
    fetchLinks();
  }, [registerFetch]);

  // 📈 REAL-TIME DATA LOGIC (CoinGecko API)
  const fetchCryptoTrends = useCallback(async () => {
    try {
      // Usando CoinGecko (IDs: bitcoin, avalanche-2, tether, iota)
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,avalanche-2,tether,iota&vs_currencies=usd&include_24hr_change=true');
      const data = await response.json();
      
      const mapping: Record<string, any> = {
        'BTC': data.bitcoin,
        'AVAX': data['avalanche-2'],
        'USDT': data.tether,
        'IOTA': data.iota
      };

      setTrends(prev => prev.map(coin => {
        const live = mapping[coin.name];
        if (live) {
          const lp = live.usd;
          const change24h = live.usd_24h_change || 0;
          return {
            ...coin,
            basePrice: lp,
            price: lp, // Atualiza o preço exibido imediatamente
            change: (change24h >= 0 ? '+' : '') + change24h.toFixed(2) + '%',
            isPositive: change24h >= 0
          };
        }
        return coin;
      }));
    } catch (err) {
      // erro silenciado para segurança
    }
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
          <button onClick={() => setIsSupportModalOpen(true)} className="w-10 h-10 bg-white/10 rounded-none flex items-center justify-center backdrop-blur-sm active:scale-90 transition-transform" title="atendimento">
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
      <section className="mx-2.5 -mt-12 z-10 bg-white rounded-2xl px-3 py-6 shadow-sm border border-gray-100">
        <div className="grid grid-cols-3 gap-1 text-center mb-8">
          <div onClick={() => navigate('/apresentacao-da-empresa')} className="flex flex-col items-center">
            <div className="w-[48px] h-[48px] bg-purple-50 rounded-none flex items-center justify-center mb-1.5 transition-transform active:scale-90">
              <img src="/coin-DnOWIML3.png" alt="icon" className="w-7 h-7 object-contain" />
            </div>
            <span className="text-[11px] font-bold text-slate-800 leading-tight lowercase">apresentação<br />institucional</span>
          </div>
          <div onClick={() => navigate('/equipe')} className="flex flex-col items-center">
            <div className="w-[48px] h-[48px] bg-purple-50 rounded-none flex items-center justify-center mb-1.5 transition-transform active:scale-90">
              <Users className="w-5 h-5 text-[#6D28D9]" />
            </div>
            <span className="text-[11px] font-bold text-slate-800 lowercase">equipe</span>
          </div>
          <div onClick={() => navigate('/central-de-ajuda')} className="flex flex-col items-center">
            <div className="w-[48px] h-[48px] bg-purple-50 rounded-none flex items-center justify-center mb-1.5 transition-transform active:scale-90">
              <TrendingUp className="w-5 h-5 text-[#6D28D9]" />
            </div>
            <span className="text-[11px] font-bold text-slate-800 lowercase">suporte</span>
          </div>
        </div>

        <div className="bg-gray-50 rounded-2xl p-5 relative overflow-hidden border border-gray-100">
          <h2 className="text-[#6D28D9] font-black text-[16px] mb-1 leading-tight">geração de receita contínua</h2>
          <p className="text-[#6D28D9]/40 text-[9px] font-black uppercase tracking-widest leading-none mb-6">AI-GO onrender premium</p>
          <div className="flex gap-2.5 w-full z-10">
            <button onClick={() => navigate('/select-bank')} className="flex-1 bg-[#6D28D9] text-white px-3 rounded-none text-[11px] font-bold h-[45px] flex items-center justify-center active:scale-95 shadow-md shadow-gray-200 lowercase gap-2">
              <img src="/deposit1-Dk3ugVyJ.png" alt="dep" className="w-4 h-4" /> recarregar
            </button>
            <button onClick={() => navigate('/retirar')} className="flex-1 bg-white text-[#6D28D9] border border-purple-100 px-3 rounded-none text-[11px] font-bold h-[45px] flex items-center justify-center active:scale-95 lowercase gap-2">
              <img src="/withdraw1-pLMbG-t2.png" alt="wit" className="w-4 h-4" /> extrair fundos
            </button>
          </div>
        </div>
      </section>

      {/* 🖼 Carousel */}
      <section className="mt-5 px-2.5">
        <div className="rounded-2xl overflow-hidden bg-gray-100 aspect-[21/9] relative shadow-lg border border-gray-100">
          <AnimatePresence mode="wait">
             <motion.img
                key={currentSlide}
                src={CAROUSEL_IMAGES[currentSlide]}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 w-full h-full object-cover"
                loading={currentSlide === 0 ? "eager" : "lazy"}
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
              <CoinRow 
                key={coin.name} 
                coin={coin} 
                isLast={idx === trends.length - 1} 
              />
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
                    <button onClick={() => setIsSupportModalOpen(false)} className="p-1.5 bg-slate-100 rounded-2xl" title="fechar">
                        <X className="w-4 h-4 text-slate-500" />
                    </button>
                </div>
                <div className="flex flex-col gap-3">
                    <button onClick={(e) => { handleLinkClick(links.whatsapp_grupo_vendas_url, e); setIsSupportModalOpen(false); }} className="w-full h-[50px] bg-[#25D366] text-white rounded-xl flex items-center justify-center gap-2 active:bg-[#1DA851] transition-colors shadow-sm">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        <span className="font-bold text-[14px] lowercase">canal oficial whatsapp</span>
                    </button>
                    <button onClick={(e) => { handleLinkClick(links.whatsapp_gerente_url, e); setIsSupportModalOpen(false); }} className="w-full h-[50px] bg-[#25D366] text-white rounded-xl flex items-center justify-center gap-2 active:bg-[#1DA851] transition-colors shadow-sm">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        <span className="font-bold text-[14px] lowercase">gerência de atendimento</span>
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
