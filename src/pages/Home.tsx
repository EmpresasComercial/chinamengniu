import React, { useEffect, useState } from 'react';
import { Bell, Headset, X, Share, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLoading } from '../contexts/LoadingContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

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
  const [isIosModalOpen, setIsIosModalOpen] = useState(false);

  // Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselImages = [
    '/carroucel-001.jpg',
    '/carroucel-002.jpg',
    '/carroucel-003.jpg',
    '/carroucel-004.jpg'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [carouselImages.length]);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const isIos = () => {
    const ua = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(ua);
  };

  const isInStandaloneMode = () =>
    ('standalone' in window.navigator) && (window.navigator as any).standalone;

  const handleInstallApp = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (deferredPrompt) {
      // Android Chrome: acionar prompt nativo
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setNotification('Instalação iniciada!');
        setTimeout(() => setNotification(null), 2500);
      }
      setDeferredPrompt(null);
    } else if (isIos() && !isInStandaloneMode()) {
      // iOS Safari: mostrar guia visual
      setIsIosModalOpen(true);
    } else if (isInStandaloneMode()) {
      setNotification('Aplicativo já está instalado!');
      setTimeout(() => setNotification(null), 2500);
    } else {
      // Android sem prompt: app pode já estar instalado ou contexto não elegível
      setNotification('Para instalar, use o menu do navegador → "Adicionar ao ecrã inicial"');
      setTimeout(() => setNotification(null), 3500);
    }
  };

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
    
    const baseLink = links.link_app_atualizado && links.link_app_atualizado !== '#' 
      ? links.link_app_atualizado 
      : `${window.location.origin}/#/register`;

    const inviteLink = baseLink.includes('(codigo)')
      ? baseLink.replace('(codigo)', inviteCode)
      : baseLink.includes('invite=') 
        ? baseLink 
        : baseLink.includes('?') ? `${baseLink}&invite=${inviteCode}` : `${baseLink}?invite=${inviteCode}`;

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
            <button 
              onClick={() => setIsSupportModalOpen(true)}
              className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/10"
              title="suporte"
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

      <section className="mx-4 -mt-12 z-10 bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
        <div className="grid grid-cols-3 gap-2 text-center mb-8">
          <div
            onClick={() => navigate('/apresentacao-da-empresa')}
            className="flex flex-col items-center cursor-pointer"
          >
            <div className="w-[52px] h-[52px] bg-[#00008B] rounded-full flex items-center justify-center mb-2 overflow-hidden shadow-md">
              <img src="/coin-DnOWIML3.png" alt="Apresentação da Empresa" className="w-8 h-8 object-contain" />
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
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-[12.5px] font-black text-slate-900">equipe</span>
          </div>
          <div
            onClick={() => navigate('/central-de-ajuda')}
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

        <div className="bg-[#EBF1FF] rounded-[2rem] p-4 flex flex-col justify-between relative overflow-hidden min-h-[140px] group cursor-pointer transition-none">
          <div className="z-10">
            <h3
              onClick={handleInstallApp}
              className="text-[#0000AA] font-black text-[22px] mb-1 underline decoration-2 underline-offset-4 cursor-pointer active:opacity-70 transition-none"
            >
              Baixe o aplicativo
            </h3>
            <p className="text-[#0000AA]/60 text-[11px] font-bold uppercase tracking-tight">mengniu company premium</p>
          </div>

          <div className="flex gap-2 w-full z-10 mt-4">
            <button
              onClick={(e) => { e.stopPropagation(); navigate('/recarregar'); }}
              className="flex-1 bg-[#0000AA] text-white px-4 rounded-2xl text-[12.5px] font-black shadow-lg shadow-blue-900/10 h-[44px] flex items-center justify-center active:scale-[0.96] transition-none whitespace-nowrap"
            >
              <img src="/deposit1-Dk3ugVyJ.png" alt="Recarregar" className="w-5 h-5 mr-1.5 object-contain" />
              Recarregar
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); navigate('/retirar'); }}
              className="flex-1 bg-white text-[#0000AA] border border-blue-100 px-4 rounded-2xl text-[12.5px] font-black shadow-lg shadow-blue-900/5 h-[44px] flex items-center justify-center active:scale-[0.96] transition-none whitespace-nowrap"
            >
              <img src="/withdraw1-pLMbG-t2.png" alt="Extrair" className="w-5 h-5 mr-1.5 object-contain" />
              Extrair
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
        <div className="rounded-2xl overflow-hidden shadow-sm bg-gray-100 min-h-[140px] relative w-full aspect-[2/1] sm:aspect-[21/9]">
          <img
            key={currentSlide}
            src={carouselImages[currentSlide]}
            alt={`Mengniu Banner ${currentSlide + 1}`}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
            {carouselImages.map((_, idx) => (
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
          <div className="w-1 h-4 bg-[#0000AA] rounded-full"></div>
          <h3 className="text-slate-800 font-bold text-[15px]">sobre a mengniu company</h3>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-50 leading-relaxed text-slate-600">
          <p className="text-[12.5px] mb-4">
            a <span className="font-bold text-[#0000AA]">mengniu company</span>, formalmente conhecida como inner mongolia mengniu dairy (group) co., ltd., foi fundada em 1999 por niu gensheng, um antigo empregado da empresa yili. com sede em hohhot, na mongólia interior, a empresa cresceu rapidamente para se tornar a segunda maior produtora de lacticínios da china e uma das dez maiores do mundo.
          </p>
          <p className="text-[12.5px] mb-4">
            nossa vasta gama de produtos inclui leite uht (marcas como milk deluxe), iogurtes (marcas como champion), bebidas lácteas, gelados, leite em pó, queijo e marcas famosas que dominam o mercado asiático. cotada na bolsa de valores de hong kong sob o código 2319, a mengniu é também um componente importante do hang seng index, refletindo a sua solidez financeira e importância no mercado de capitais.
          </p>
          <p className="text-[12.5px]">
            através de parcerias estratégicas globais com gigantes como a danone e a arla foods, a mengniu continua a elevar os padrões de segurança alimentar e inovação tecnológica. em 2024, a empresa consolidou a sua posição de liderança, focada na missão de produzir 'nutrição saudável' e promover um estilo de vida equilibrado para milhões de pessoas em todo o mundo.
          </p>
        </div>
      </section>

      {/* Modal de instruções iOS */}
      {isIosModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center p-0">
          <div
            onClick={() => setIsIosModalOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
          />
          <div className="relative w-full bg-white rounded-t-[2.5rem] p-6 shadow-2xl z-[201] pb-10">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6" />
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 bg-[#001f8d] rounded-2xl flex items-center justify-center shrink-0">
                <img
                  src="https://s3-symbol-logo.tradingview.com/mengniu-dairy--600.png"
                  alt="Mengniu"
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div>
                <p className="text-slate-900 font-bold text-[15px]">Mengniu Company</p>
                <p className="text-slate-500 text-[11px]">adicionar ao ecrã inicial</p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 bg-[#EBF1FF] rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-[#0000AA] font-black text-[15px]">1</span>
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-slate-900 font-bold text-[13px] mb-0.5">Toque no botão de partilhar</p>
                  <p className="text-slate-500 text-[11px]">Na barra inferior do Safari, toque no ícone <span className="font-bold text-[#0000AA]">Partilhar</span> (quadrado com seta para cima)</p>
                </div>
                <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                  <Share className="w-5 h-5 text-[#0000AA]" />
                </div>
              </div>

              <div className="h-px bg-slate-100" />

              <div className="flex items-start gap-4">
                <div className="w-9 h-9 bg-[#EBF1FF] rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-[#0000AA] font-black text-[15px]">2</span>
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-slate-900 font-bold text-[13px] mb-0.5">Selecione "Adicionar ao Ecrã Inicial"</p>
                  <p className="text-slate-500 text-[11px]">Role para baixo nas opções e toque em <span className="font-bold text-[#0000AA]">Adicionar ao Ecrã Inicial</span></p>
                </div>
              </div>

              <div className="h-px bg-slate-100" />

              <div className="flex items-start gap-4">
                <div className="w-9 h-9 bg-[#EBF1FF] rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-[#0000AA] font-black text-[15px]">3</span>
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-slate-900 font-bold text-[13px] mb-0.5">Confirme a instalação</p>
                  <p className="text-slate-500 text-[11px]">Toque em <span className="font-bold text-[#0000AA]">Adicionar</span> no canto superior direito para concluir</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsIosModalOpen(false)}
              className="mt-6 w-full h-[48px] bg-[#0000AA] text-white rounded-2xl font-black text-[13px] shadow-lg shadow-blue-900/20 active:scale-[0.98] transition-none"
            >
              entendido
            </button>
          </div>
        </div>
      )}

      {isSupportModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            onClick={() => setIsSupportModalOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
          />
          <div className="relative w-[90%] max-w-sm bg-white rounded-[8px] p-5 shadow-2xl z-[101]">
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-2">
                <Headset className="w-5 h-5 text-[#0000AA]" />
                <h3 className="text-[#0000AA] font-bold text-[15px]">atendimento ao cliente</h3>
              </div>
              <button 
                onClick={() => setIsSupportModalOpen(false)} 
                className="p-1.5 bg-slate-100 rounded-[6px]"
                title="fechar"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={(e) => { handleLinkClick(links.whatsapp_grupo_vendas_url, e); setIsSupportModalOpen(false); }}
                className="w-full h-[48px] bg-slate-50 rounded-[8px] flex items-center px-3 active:bg-slate-100 transition-none"
              >
                <div className="w-9 h-9 bg-[#25D366]/10 rounded-[6px] flex items-center justify-center mr-3">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png" className="w-5 h-5" alt="whatsapp" />
                </div>
                <p className="text-slate-900 font-bold text-[12.5px] text-left">entrar no grupo de venda de whatsapp</p>
              </button>

              <button
                onClick={(e) => { handleLinkClick(links.whatsapp_gerente_url, e); setIsSupportModalOpen(false); }}
                className="w-full h-[48px] bg-slate-50 rounded-[8px] flex items-center px-3 active:bg-slate-100 transition-none"
              >
                <div className="w-9 h-9 bg-[#25D366]/10 rounded-[6px] flex items-center justify-center mr-3">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png" className="w-5 h-5" alt="whatsapp" />
                </div>
                <p className="text-slate-900 font-bold text-[12.5px] text-left">contactar o gerente pelo whatsapp</p>
              </button>

              <button
                onClick={(e) => { handleCopyInvite(e); setIsSupportModalOpen(false); }}
                className="w-full h-[48px] bg-slate-50 rounded-[8px] flex items-center justify-center gap-2 active:bg-slate-100 transition-none"
              >
                <p className="text-slate-700 font-bold text-[12.5px]">copiar link</p>
                <svg className="w-4 h-4 text-[#0000AA]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {notification && (
        <div className="fixed inset-0 m-auto w-fit h-fit min-w-[260px] bg-black/50 backdrop-blur-sm text-white px-5 py-3 rounded-2xl text-[12.5px] shadow-xl z-[500] text-center max-w-[85vw] whitespace-normal break-words">
          {notification}
        </div>
      )}
    </div>
  );
}
