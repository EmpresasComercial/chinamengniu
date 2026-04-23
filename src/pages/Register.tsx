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
        const { data, error } = await supabase.rpc('get_support_links');

        const linkData = Array.isArray(data) ? data[0] : data;

        if (!error && linkData) {
          setLinks({
            whatsapp_gerente_url: linkData.whatsapp_gerente_url || '',
            whatsapp_grupo_vendas_url: linkData.whatsapp_grupo_vendas_url || '',
            link_app_atualizado: linkData.link_app_atualizado || '',
            splash_message: linkData.splash_message || ''
          });
        }
      } catch (err) {
        // erro silenciado para segurança
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
        showToast(error.message || 'erro na conexão com o servidor.');
        return;
      }

      if (data && data.error) {
        showToast(data.error);
        return;
      }

      showToast(data?.message || 'registo efetuado com sucesso. bem-vindo!');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err: any) {
      showToast(err.message || 'Falha ao processar o registo. Tente novamente.');
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
              <div className="flex items-center border-b-[2px] border-[#6D28D9] py-3 transition-colors">
                <span className="text-gray-800 mr-2 font-bold text-[15px]">+244</span>
                <input
                  className="w-full border-none p-0 focus:ring-0 text-gray-800 placeholder-gray-400 text-[15px]"
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
              <div className="flex items-center border-b-[2px] border-[#6D28D9] py-3 transition-colors">
                <input
                  className="w-full border-none p-0 focus:ring-0 text-gray-800 placeholder-gray-400 text-[15px]"
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
              <div className="flex items-center border-b-[2px] border-[#6D28D9] py-3 transition-colors">
                <input
                  className="w-full border-none p-0 focus:ring-0 text-gray-800 placeholder-gray-400 text-[15px]"
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
              <div className="flex items-center border-b-[2px] border-[#6D28D9] py-3 transition-colors">
                <input
                  className="w-full border-none p-0 focus:ring-0 text-gray-800 text-[15px] font-bold placeholder-gray-400"
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
            <div className="pt-8">
              <button
                className="w-full bg-[#6D28D9] text-white h-[54px] rounded-[24px] font-bold text-[15px] transition-all active:scale-95 shadow-lg shadow-purple-100 lowercase"
                type="submit"
              >
                registrar
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
                  type="button"
                  onClick={(e) => { handleLinkClick(links.whatsapp_grupo_vendas_url, e); setIsSupportModalOpen(false); }}
                  className="w-full h-[50px] bg-[#25D366] text-white rounded-xl flex items-center justify-center gap-2 active:bg-[#1DA851] transition-colors shadow-sm"
                >
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  <span className="font-bold text-[14px] lowercase">canal oficial whatsapp</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => { handleLinkClick(links.whatsapp_gerente_url, e); setIsSupportModalOpen(false); }}
                  className="w-full h-[50px] bg-[#25D366] text-white rounded-xl flex items-center justify-center gap-2 active:bg-[#1DA851] transition-colors shadow-sm"
                >
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  <span className="font-bold text-[14px] lowercase">gerência de atendimento</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
