import React, { useState, useEffect } from 'react';
import { Headset, X, Eye, EyeOff, Download } from 'lucide-react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useLoading } from '../contexts/LoadingContext';
import { supabase } from '../lib/supabase';

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showLoading, hideLoading } = useLoading();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [links, setLinks] = useState({
    whatsapp_gerente_url: '',
    whatsapp_grupo_vendas_url: '',
    link_app_atualizado: '',
    splash_message: 'carregando...'
  });

  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    confirmPassword: '',
    inviteCode: ''
  });

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  useEffect(() => {
    async function fetchLinks() {
      try {
        const { data, error } = await supabase
          .from('atendimento_links')
          .select('whatsapp_gerente_url, whatsapp_grupo_vendas_url, link_app_atualizado, splash_message')
          .single();

        if (!error && data) {
          setLinks({
            whatsapp_gerente_url: data.whatsapp_gerente_url || '',
            whatsapp_grupo_vendas_url: data.whatsapp_grupo_vendas_url || '',
            link_app_atualizado: data.link_app_atualizado || '',
            splash_message: data.splash_message || ''
          });
        }
      } catch (err) {
        console.error('Erro ao buscar links de atendimento:', err);
      }
    }
    fetchLinks();
  }, []);

  useEffect(() => {
    const code = searchParams.get('join');
    if (code) {
      const sanitizedCode = code.replace(/[^\w]/g, '').slice(0, 20);
      setFormData(prev => ({ ...prev, inviteCode: sanitizedCode }));
    }
  }, [searchParams, setFormData]);

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

    if (!formData.phone) {
      showToast('Por favor, introduza o seu número de telefone.');
      return;
    }
    const phoneRegex = /^9\d{8}$/;
    if (!phoneRegex.test(formData.phone)) {
      showToast('O telefone deve iniciar por 9 e conter 9 dígitos.');
      return;
    }
    if (!formData.password) {
      showToast('Por favor, insira a sua palavra-passe.');
      return;
    }
    if (!formData.confirmPassword) {
      showToast('Por favor, confirme a sua palavra-passe.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      showToast('As palavras-passe não coincidem.');
      return;
    }
    if (!formData.inviteCode) {
      showToast('Por favor, introduza o código de convite.');
      return;
    }

    showLoading();
    try {
      const { data, error } = await supabase.functions.invoke('secure-registration', {
        body: {
          phone: formData.phone,
          password: formData.password,
          inviteCode: formData.inviteCode
        }
      });

      if (error) {
        let errorMsg = error.message;
        try {
          const body = await error.context?.json();
          if (body && body.error) errorMsg = body.error;
        } catch (e) {}
        showToast(errorMsg);
        return;
      }

      if (data && data.error) {
        showToast(data.error);
        return;
      }

      showToast('registo efetuado com sucesso. bem-vindo!');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err: any) {
      showToast('Falha ao processar o registo. Tente novamente.');
    } finally {
      hideLoading();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = e.target.value.replace(/[^\p{L}\p{N}]/gu, '');
    setFormData({ ...formData, [e.target.name]: sanitizedValue });
  };
  return (
    <div className="min-h-screen flex flex-col bg-white page-content relative pt-12">
      {/* 📱 PWA Install Banner */}
      <AnimatePresence>
        {deferredPrompt && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-0 right-0 h-14 bg-white shadow-lg border-b border-gray-100 px-5 flex items-center justify-between z-[1000]"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center">
                <Download className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-[12px] font-bold text-gray-700 leading-tight">instale nosso app para<br/>uma melhor experiência!</p>
            </div>
            <div className="flex items-center gap-2">
               <button 
                onClick={handleInstallApp}
                title="instalar aplicativo"
                aria-label="instalar aplicativo"
                className="bg-purple-600 text-white px-3.5 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider active:scale-95 shadow-md shadow-purple-200"
              >
                instalar
              </button>
              <button 
                onClick={() => setDeferredPrompt(null)} 
                title="fechar aviso"
                aria-label="fechar aviso"
                className="text-gray-300 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BEGIN: Logo Section */}
      <div className="flex flex-col items-center pt-0 pb-0">
        <div className="w-40 h-40 bg-white rounded-3xl flex items-center justify-center mb-0 p-0 transform -translate-y-4">
          <img
            alt="AI-GO onrender logo"
            className="w-full h-full object-contain scale-150 transition-transform"
            src="/ai-go-onrender.png"
          />
        </div>
      </div>
      {/* END: Logo Section */}

      {/* BEGIN: Main Registration Form */}
      <main className="flex-grow px-6 pb-12 relative z-20">
        <section className="bg-white rounded-xl p-8 max-w-md mx-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Field: Phone Number */}
            <div className="space-y-1">
              <div className="flex items-center border-b-[1.5px] border-[#6D28D9] py-2 transition-colors">
                <span className="text-gray-800 mr-2 font-bold text-[12.5px]">+244</span>
                <input
                  className="w-full border-none p-0 focus:ring-0 text-gray-800 placeholder-gray-400 text-[12.5px]"
                  id="phone"
                  name="phone"
                  placeholder="número de telefone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Field: Password */}
            <div className="space-y-1">
              <div className="flex items-center border-b-[1.5px] border-[#6D28D9] py-2 transition-colors">
                <input
                  className="w-full border-none p-0 focus:ring-0 text-gray-800 placeholder-gray-400 text-[12.5px]"
                  id="password"
                  name="password"
                  placeholder="senha de acesso"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  className="text-gray-400 hover:text-gray-600 btn-small"
                  type="button"
                  title={showPassword ? "ocultar senha" : "mostrar senha"}
                  aria-label={showPassword ? "ocultar senha" : "mostrar senha"}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Field: Confirm Password */}
            <div className="space-y-1">
              <div className="flex items-center border-b-[1.5px] border-[#6D28D9] py-2 transition-colors">
                <input
                  className="w-full border-none p-0 focus:ring-0 text-gray-800 placeholder-gray-400 text-[12.5px]"
                  id="confirm-password"
                  name="confirmPassword"
                  placeholder="confirmar senha"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button
                  className="text-gray-400 hover:text-gray-600 btn-small"
                  type="button"
                  title={showConfirmPassword ? "ocultar senha" : "mostrar senha"}
                  aria-label={showConfirmPassword ? "ocultar senha" : "mostrar senha"}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Field: Invite Code */}
            <div className="space-y-1">
              <div className="flex items-center border-b-[1.5px] border-[#6D28D9] py-2 transition-colors">
                <input
                  className="w-full border-none p-0 focus:ring-0 text-gray-800 text-[12.5px] font-bold placeholder-gray-400"
                  id="invite-code"
                  name="inviteCode"
                  placeholder="código de convite"
                  type="text"
                  value={formData.inviteCode}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                className="w-full bg-[#6D28D9] text-white h-[45px] rounded-xl font-bold text-[12.5px] transition-all active:scale-95 shadow-lg shadow-purple-900/20 lowercase"
                type="submit"
              >
                criar conta
              </button>
            </div>

            {/* Footer Links */}
            <div className="text-center space-y-4 pt-6">
              <p className="text-[12.5px] text-gray-500 lowercase">
                já possui uma conta? <Link className="text-[#6D28D9] font-bold hover:underline" to="/login">conectar-se</Link>
              </p>
            </div>
          </form>
        </section>

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
      {/* END: Main Registration Form */}

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
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
