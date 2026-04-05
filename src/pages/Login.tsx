import React, { useState } from 'react';
import { Headset, X, Eye, EyeOff } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useLoading } from '../contexts/LoadingContext';
import { supabase } from '../lib/supabase';

export default function Login() {
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [links, setLinks] = useState({
    whatsapp_gerente_url: 'https://wa.me/1234567890',
    whatsapp_grupo_vendas_url: 'https://wa.me/1234567890',
    link_app_atualizado: '#',
    splash_message: 'carregando avisos...'
  });
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  React.useEffect(() => {
    async function fetchLinks() {
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
      } catch (err) {
        console.error('Erro ao buscar links de atendimento:', err);
      }
    }
    fetchLinks();
  }, []);

  const handleLinkClick = (url: string, e: React.MouseEvent) => {
    e.preventDefault();
    window.open(url, '_blank');
  };

  const showToast = (message: string) => {
    setFeedback(message);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation Logic
    if (!phone) {
      showToast('por favor, celular');
      return;
    }

    // Validate phone format: starts with 9 and has 9 digits
    const phoneRegex = /^9\d{8}$/;
    if (!phoneRegex.test(phone)) {
      showToast('celular deve começar com 9 e ter 9 dígitos');
      return;
    }

    if (!password) {
      showToast('por favor, insira sua senha');
      return;
    }

    if (isLocked) {
      showToast('muitas tentativas. aguarde 30 segundos.');
      return;
    }

    showLoading();
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: `${phone}@user.com`,
        password: password
      });

      if (error) {
        setLoginAttempts(prev => {
          const next = prev + 1;
          if (next >= 5) {
            setIsLocked(true);
            setTimeout(() => {
              setIsLocked(false);
              setLoginAttempts(0);
            }, 30000); // 30 segundos de bloqueio
          }
          return next;
        });
        showToast(error.message);
        return;
      }

      setLoginAttempts(0);
      showToast('login sucedido');
      setTimeout(() => navigate('/'), 1000);
    } catch (err: any) {
      showToast('não login sucedido');
    } finally {
      hideLoading();
    }
  };

  return (
    <div className="bg-main-gradient flex justify-center items-start p-0 m-0 min-h-screen w-full page-content">
      {/* BEGIN: MainContainer */}
      <main className="w-full max-w-[430px] min-h-screen flex flex-col relative overflow-hidden">
        {/* BEGIN: TopHeader */}
        <header className="w-full h-[220px] flex flex-col items-center justify-center relative header-pattern pt-8">
          {/* Support Icon */}
          <button 
            type="button"
            onClick={() => setIsSupportModalOpen(true)}
            className="absolute top-4 right-4 text-white p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all active:scale-95"
            title="atendimento ao cliente"
          >
            <Headset className="h-6 w-6" />
          </button>

          {/* Logo Section */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center p-2 mb-2 shadow-lg">
              <img
                alt="Mengniu Company logo"
                className="w-full h-full object-contain"
                src="https://s3-symbol-logo.tradingview.com/mengniu-dairy--600.png"
              />
            </div>
            <h1 className="text-white text-2xl font-bold tracking-wide">Mengniu Company</h1>
          </div>
        </header>
        {/* END: TopHeader */}

        {/* BEGIN: LoginCard */}
        <section className="flex-1 bg-white mx-4 -mt-6 rounded-t-[32px] rounded-b-[32px] card-shadow p-6 mb-10 flex flex-col">
          {/* Tab Navigation */}
          <nav className="flex justify-center items-center bg-gray-100 rounded-full p-1 mb-8 text-[12.5px] font-medium text-gray-600">
            <button type="button" className="flex-1 py-3 px-1 text-center text-black font-bold relative leading-tight">
              Aceder por telefone
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-black"></span>
            </button>
          </nav>

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-4 flex-grow">
            {/* Phone Input */}
            <div className="space-y-1">
              <label className="block text-[12.5px] font-medium text-gray-700" htmlFor="phone">telefone</label>
              <div className="flex items-center border-b border-gray-200 py-2 focus-within:border-blue-600 transition-colors">
                <span className="text-gray-900 font-medium mr-3 text-[12.5px]">+244</span>
                <input
                  className="w-full border-none focus:ring-0 p-0 text-[12.5px] placeholder-gray-400 text-gray-800"
                  id="phone"
                  placeholder="telefone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^\p{L}\p{N}]/gu, ''))}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="block text-[12.5px] font-semibold text-gray-800" htmlFor="password">senha</label>
              <div className="flex items-center border-b border-gray-200 py-2 focus-within:border-blue-600 transition-colors">
                <input
                  className="w-full border-none focus:ring-0 p-0 text-[12.5px] placeholder-gray-400 text-gray-800"
                  id="password"
                  placeholder="senha"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value.replace(/[^\p{L}\p{N}]/gu, ''))}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-600 focus:outline-none btn-small"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                className="w-full bg-[#0000b3] text-white h-[45px] rounded-full font-semibold text-[15px] hover:bg-blue-800 transition-colors shadow-lg shadow-blue-200"
                type="submit"
              >
                conecte-se
              </button>
            </div>

            {/* Footer Links */}
            <div className="flex flex-col items-center space-y-4 pt-4">
              <p className="text-[12.5px] text-gray-500">
                não tem conta? <Link className="text-blue-700 font-medium ml-1" to="/registrar">registrar</Link>
              </p>
            </div>
          </form>
        </section>
        {/* END: LoginCard */}

        {/* Visual Feedback (Toast) */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 0, y: 0 }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 0, y: 0 }}
              className="fixed inset-0 m-auto w-fit h-fit min-w-[260px] bg-black/50 backdrop-blur-sm text-white px-5 py-3 rounded-2xl text-[12.5px] shadow-xl z-[500] text-center max-w-[85vw] whitespace-normal break-words"
            >
              {feedback}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      {/* END: MainContainer */}

      {/* Support Modal (Same as Home) */}
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
              className="relative w-[90%] max-w-sm bg-white rounded-[8px] p-5 shadow-2xl z-[101]"
            >
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
                  type="button"
                  onClick={(e) => { handleLinkClick(links.whatsapp_grupo_vendas_url, e); setIsSupportModalOpen(false); }}
                  className="w-full h-[48px] bg-slate-50 rounded-[8px] flex items-center px-3 active:bg-slate-100 transition-none"
                >
                  <div className="w-9 h-9 bg-[#25D366]/10 rounded-[6px] flex items-center justify-center mr-3">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png" className="w-5 h-5" alt="whatsapp" />
                  </div>
                  <p className="text-slate-900 font-bold text-[12.5px] text-left">entrar no grupo de venda de whatsapp</p>
                </button>

                <button
                  type="button"
                  onClick={(e) => { handleLinkClick(links.whatsapp_gerente_url, e); setIsSupportModalOpen(false); }}
                  className="w-full h-[48px] bg-slate-50 rounded-[8px] flex items-center px-3 active:bg-slate-100 transition-none"
                >
                  <div className="w-9 h-9 bg-[#25D366]/10 rounded-[6px] flex items-center justify-center mr-3">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png" className="w-5 h-5" alt="whatsapp" />
                  </div>
                  <p className="text-slate-900 font-bold text-[12.5px] text-left">contactar o gerente pelo whatsapp</p>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
