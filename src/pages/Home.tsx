import React, { useEffect, useState, useCallback } from 'react';
import { Bell, Headset, X, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useLoading } from '../contexts/LoadingContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const CAROUSEL_IMAGES = [
  '/MW-FD846_gold_m_ZG_2017011807144-1024x576 minas.webp',
  '/ai-pessoas.jpg',
  '/imagesuma pessao na mina.jpg',
  '/minas.jpg'
];

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

  // Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handler = (e: any) => {
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const isInStandaloneMode = useCallback(() =>
    ('standalone' in window.navigator) && (window.navigator as any).standalone, []);

  const handleInstallApp = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setNotification('Operação concluída com sucesso.');
          setTimeout(() => setNotification(null), 2500);
        }
        setDeferredPrompt(null);
      } catch (err) {
        // Silently fails to comply with 'no instructions' request
      }
    } else if (isInStandaloneMode()) {
      setNotification('O aplicativo já se encontra instalado.');
      setTimeout(() => setNotification(null), 2500);
    }
  }, [deferredPrompt, isInStandaloneMode]);

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

  const handleCopyInvite = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const inviteCode = profile?.invite_code || '';

    const baseLink = links.link_app_atualizado && links.link_app_atualizado !== '#'
      ? links.link_app_atualizado
      : `${window.location.origin}/#/register`;

    const inviteLink = baseLink.includes('(codigo)')
      ? baseLink.replace('(codigo)', inviteCode)
      : baseLink.includes('join=')
        ? baseLink
        : baseLink.includes('?') ? `${baseLink}&join=${inviteCode}` : `${baseLink}?join=${inviteCode}`;

    if (inviteCode) {
      navigator.clipboard.writeText(inviteLink);
      setNotification('Link de convite copiado com sucesso.');
      setTimeout(() => setNotification(null), 2500);
    } else {
      setNotification('Falha ao gerar link de convite. Tente novamente.');
      setTimeout(() => setNotification(null), 2500);
    }
  }, [profile?.invite_code, links.link_app_atualizado]);

  return (
    <div className="flex flex-col min-h-screen bg-[#f0f2f5] page-content">
      <header className="bg-gradient-to-b from-[#6D28D9] to-[#5B21B6] pt-4 pb-16 px-4 relative">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center p-1">
              <img
                alt="AI logo"
                className="w-full h-full object-contain"
                src="/file_loga IAc78c7243befa67a31cf49487.png"
              />
            </div>
            <span className="text-white font-bold text-lg lowercase">ai</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsSupportModalOpen(true)}
              className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/10"
              title="Atendimento"
            >
              <Headset className="w-6 h-6 text-white" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-full h-8 flex items-center gap-2 mb-4 overflow-hidden relative">
          <Bell className="w-3.5 h-3.5 text-white shrink-0 ml-4 z-10" />
          <div className="flex-1 overflow-hidden relative h-full flex items-center">
            <div className="absolute whitespace-nowrap animate-marquee-infinite flex gap-12 items-center">
              <span className="text-white text-[12.5px] font-medium whitespace-nowrap">
                {links.splash_message.replace(/\n/g, ' ')}
              </span>
              <span className="text-white text-[12.5px] font-medium whitespace-nowrap">
                {links.splash_message.replace(/\n/g, ' ')}
              </span>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-4 -mt-12 z-10 bg-white rounded-xl p-6  border border-slate-100">
        <div className="grid grid-cols-3 gap-2 text-center mb-8">
          <div
            onClick={() => navigate('/apresentacao-da-empresa')}
            className="flex flex-col items-center cursor-pointer"
          >
            <div className="w-[52px] h-[52px] bg-[#6D28D9] rounded-xl flex items-center justify-center mb-2 overflow-hidden ">
              <img src="/coin-DnOWIML3.png" alt="Apresentação da Empresa" className="w-8 h-8 object-contain" />
            </div>
            <span className="text-[12.5px] font-bold text-slate-900 leading-[1.1] lowercase">
              apresentação<br />institucional
            </span>
          </div>
          <div
            onClick={() => navigate('/equipe')}
            className="flex flex-col items-center cursor-pointer"
          >
            <div className="w-[52px] h-[52px] bg-[#6D28D9] rounded-xl flex items-center justify-center mb-2 shadow-sm">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-[12.5px] font-bold text-slate-900 lowercase">equipe</span>
          </div>
          <div
            onClick={() => navigate('/central-de-ajuda')}
            className="flex flex-col items-center cursor-pointer"
          >
            <div className="w-[52px] h-[52px] bg-[#6D28D9] rounded-xl flex items-center justify-center mb-2 shadow-sm">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-[12.5px] font-bold text-slate-900 lowercase">suporte</span>
          </div>
        </div>

        <div className="bg-[#EBF1FF] rounded-xl p-4 flex flex-col justify-between relative overflow-hidden min-h-[140px] group cursor-pointer transition-none">
          <div className="z-10">
            <h3
              onClick={handleInstallApp}
              className="text-[#6D28D9] font-bold text-[22px] mb-1 underline decoration-2 underline-offset-4 cursor-pointer active:opacity-70 transition-none lowercase"
            >
              baixar aplicativo
            </h3>
            <p className="text-[#6D28D9]/60 text-[11px] font-bold uppercase tracking-widest lowercase">ai premium</p>
          </div>

          <div className="flex gap-2 w-full z-10 mt-4">
            <button
              onClick={(e) => { e.stopPropagation(); navigate('/recarregar'); }}
              className="flex-1 bg-[#6D28D9] text-white px-4 rounded-xl text-[12.5px] font-semibold h-[44px] flex items-center justify-center active:scale-[0.96] transition-all shadow-md shadow-purple-900/10 lowercase"
            >
              <img src="/deposit1-Dk3ugVyJ.png" alt="Recarregar" className="w-5 h-5 mr-1.5 object-contain" />
              efetuar depósito
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); navigate('/retirar'); }}
              className="flex-1 bg-white text-[#6D28D9] border border-purple-100 px-4 rounded-xl text-[12.5px] font-semibold h-[44px] flex items-center justify-center active:scale-[0.96] transition-all shadow-sm lowercase"
            >
              <img src="/withdraw1-pLMbG-t2.png" alt="Coletar" className="w-5 h-5 mr-1.5 object-contain" />
              levantamento
            </button>
          </div>

          <div className="absolute right-[-10px] top-[-10px] w-32 h-32 opacity-20 pointer-events-none">
            <img
              alt="Decoration"
              className="w-full h-full object-contain"
              src="/empty-image-CHCN_UjN.png"
            />
          </div>
        </div>
      </section>

      <section className="mt-4 px-4">
        <div className="rounded-xl overflow-hidden  bg-gray-100 min-h-[140px] relative w-full aspect-[2/1] sm:aspect-[21/9]">
          <img
            key={currentSlide}
            src={CAROUSEL_IMAGES[currentSlide]}
            alt={`AI Banner ${currentSlide + 1}`}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
            {CAROUSEL_IMAGES.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-none ${currentSlide === idx ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 px-4 mb-20 fade-in">
        <div className="flex items-center gap-2 mb-4 px-2">
          <div className="w-1.5 h-5 bg-[#0000AA] rounded-full"></div>
          <h3 className="text-slate-900 font-bold text-[15px] lowercase">sobre a ai</h3>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-100 leading-relaxed text-slate-700 shadow-sm lowercase">
          <p className="text-[12.5px] mb-4">
            a <span className="font-bold text-[#0000AA]">ai</span> (nyse: nem) é uma das maiores e mais importantes empresas de tecnologia do mundo, sendo reconhecida como a líder global em inteligência artificial. fundada em 1921, com sede global, a empresa tem operações em todo o mundo.
          </p>
          <p className="text-[12.5px] mb-4">
            além da ia, nossa empresa também produz e explora novas tecnologias para o futuro. a ai possui excelência operacional, disciplina financeira e forte reconhecimento global, o que comprova nossa solidez financeira no mercado internacional.
          </p>
          <p className="text-[12.5px]">
            estamos comprometidos com a inovação no setor de inteligência artificial e nos processos de sustentabilidade digital. buscamos proporcionar criação de valor a longo prazo, focando na integridade das nossas operações, transparência e retorno em inovação tecnológica para todas as nossas parcerias globais.
          </p>
        </div>
      </section>


      <AnimatePresence>
        {isSupportModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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

              <div className="flex flex-col gap-3">
                <button
                  onClick={(e) => { handleLinkClick(links.whatsapp_grupo_vendas_url, e); setIsSupportModalOpen(false); }}
                  className="w-full h-[45px] bg-slate-50 rounded-xl flex items-center px-4 active:bg-slate-100 transition-all border border-slate-100"
                >
                  <div className="w-9 h-9 bg-[#25D366]/10 rounded-xl flex items-center justify-center mr-3">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png" className="w-5 h-5" alt="whatsapp" />
                  </div>
                  <p className="text-slate-900 font-bold text-[12.5px] text-left lowercase">canal oficial whatsapp</p>
                </button>

                <button
                  onClick={(e) => { handleLinkClick(links.whatsapp_gerente_url, e); setIsSupportModalOpen(false); }}
                  className="w-full h-[45px] bg-slate-50 rounded-xl flex items-center px-4 active:bg-slate-100 transition-all border border-slate-100"
                >
                  <div className="w-9 h-9 bg-[#25D366]/10 rounded-xl flex items-center justify-center mr-3">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png" className="w-5 h-5" alt="whatsapp" />
                  </div>
                  <p className="text-slate-900 font-bold text-[12.5px] text-left lowercase">gerência de atendimento</p>
                </button>

                <button
                  onClick={(e) => { handleCopyInvite(e); setIsSupportModalOpen(false); }}
                  className="w-full h-[45px] bg-slate-50 rounded-xl flex items-center justify-center gap-2 active:bg-slate-100 transition-all border border-slate-100"
                >
                  <p className="text-slate-700 font-bold text-[12.5px] lowercase">copiar link de convite</p>
                  <Copy className="w-4 h-4 text-[#0000AA]" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {notification && (
        <div className="fixed inset-0 m-auto w-fit h-fit min-w-[260px] bg-black/50 backdrop-blur-sm text-white px-5 py-3 rounded-xl text-[12.5px]  z-[500] text-center max-w-[85vw] whitespace-normal break-words">
          {notification}
        </div>
      )}
    </div>
  );
}
