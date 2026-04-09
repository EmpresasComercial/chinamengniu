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
      showToast('Por favor, introduza o seu número de telefone.');
      return;
    }

    // Validate phone format: starts with 9 and has 9 digits
    const phoneRegex = /^9\d{8}$/;
    if (!phoneRegex.test(phone)) {
      showToast('O telefone deve iniciar por 9 e conter 9 dígitos.');
      return;
    }

    if (!password) {
      showToast('Por favor, introduza a sua palavra-passe.');
      return;
    }

    if (isLocked) {
      showToast('Muitas tentativas. Acesso bloqueado por 30 segundos.');
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
      showToast('autenticação realizada com sucesso.');
      setTimeout(() => navigate('/'), 1000);
    } catch (err: any) {
      showToast('Falha na autenticação. Tente novamente mais tarde.');
    } finally {
      hideLoading();
    }
  };

  return (
    <div className="bg-main-gradient flex justify-center items-start p-0 m-0 min-h-screen w-full page-content">
      {/* BEGIN: MainContainer */}
      <main className="w-full max-w-[430px] min-h-screen flex flex-col relative overflow-hidden">
        {/* BEGIN: Logo Section */}
        <div className="flex flex-col items-center pt-12 pb-8">
          <div className="w-32 h-32 bg-white rounded-3xl flex items-center justify-center p-4 mb-4 shadow-xl">
            <img
              alt="AI-GO onrender logo"
              className="w-full h-full object-contain"
              src="/ai-go-onrender.png"
            />
          </div>
          <h1 className="text-gray-900 text-3xl font-bold tracking-tight">AI-GO onrender</h1>
          <p className="text-gray-500 text-[12px] font-bold uppercase tracking-widest mt-1">AI-GO onrender excellence</p>
        </div>
        {/* END: Logo Section */}

        {/* BEGIN: LoginCard */}
        <section className="flex-1 bg-white mx-4 rounded-xl p-6 mb-10 flex flex-col">

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-4 flex-grow">
            {/* Phone Input */}
            <div className="space-y-1">
              <div className="flex items-center border-b-[1.5px] border-[#6D28D9] py-2 transition-colors">
                <span className="text-gray-900 font-bold mr-3 text-[12.5px]">+244</span>
                <input
                  className="w-full border-none focus:ring-0 p-0 text-[12.5px] placeholder-gray-400 text-gray-800"
                  id="phone"
                  placeholder="número de telefone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^\p{L}\p{N}]/gu, ''))}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex items-center border-b-[1.5px] border-[#6D28D9] py-2 transition-colors">
                <input
                  className="w-full border-none focus:ring-0 p-0 text-[12.5px] placeholder-gray-400 text-gray-800"
                  id="password"
                  placeholder="senha de acesso"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value.replace(/[^\p{L}\p{N}]/gu, ''))}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 focus:outline-none btn-small"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
                <button
                className="w-full bg-[#6D28D9] text-white h-[45px] rounded-xl font-bold text-[12.5px] transition-all active:scale-95 shadow-lg shadow-purple-900/20 lowercase"
                type="submit"
              >
                acessar conta
              </button>
            </div>

            {/* Footer Links */}
            <div className="flex flex-col items-center space-y-4 pt-6">
              <p className="text-[12.5px] text-gray-500 lowercase">
                não tem uma conta? <Link className="text-blue-700 font-bold ml-1 hover:underline" to="/registrar">criar agora</Link>
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
              className="fixed inset-0 m-auto w-fit h-fit min-w-[260px] bg-black/50 backdrop-blur-sm text-white px-5 py-3 rounded-xl text-[12.5px]  z-[500] text-center max-w-[85vw] whitespace-normal break-words"
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
                  type="button"
                  onClick={(e) => { handleLinkClick(links.whatsapp_grupo_vendas_url, e); setIsSupportModalOpen(false); }}
                  className="w-full h-[45px] bg-slate-50 rounded-xl flex items-center px-4 active:bg-slate-100 transition-all border border-slate-100"
                >
                  <div className="w-9 h-9 bg-[#25D366]/10 rounded-xl flex items-center justify-center mr-3">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png" className="w-5 h-5" alt="whatsapp" />
                  </div>
                  <p className="text-slate-900 font-bold text-[12.5px] text-left lowercase">canal oficial whatsapp</p>
                </button>

                <button
                  type="button"
                  onClick={(e) => { handleLinkClick(links.whatsapp_gerente_url, e); setIsSupportModalOpen(false); }}
                  className="w-full h-[45px] bg-slate-50 rounded-xl flex items-center px-4 active:bg-slate-100 transition-all border border-slate-100"
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
