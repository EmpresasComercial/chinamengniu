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
        const { data, error } = await supabase.rpc('get_support_links');
        
        const linkData = Array.isArray(data) ? data[0] : data;

        if (!error && linkData) {
          setLinks({
            whatsapp_gerente_url: linkData.whatsapp_gerente_url || 'https://wa.me/1234567890',
            whatsapp_grupo_vendas_url: linkData.whatsapp_grupo_vendas_url || 'https://wa.me/1234567890',
            link_app_atualizado: linkData.link_app_atualizado || '#',
            splash_message: linkData.splash_message || 'recarregue hoje mesmo, após a adtação'
          });
        }
      } catch (err) {
        // erro silenciado para segurança
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
      // O redirecionamento será tratado automaticamente pelo AuthProvider (onAuthStateChange)
    } catch (err: any) {
      showToast('Falha na autenticação. Tente novamente mais tarde.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white page-content">
      {/* BEGIN: MainContainer */}
      <main className="w-full max-w-[430px] min-h-screen flex flex-col relative overflow-hidden mx-auto">
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

        {/* BEGIN: LoginCard */}
        <section className="bg-white px-6 py-6 flex flex-col">
          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-4">
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
                className="w-full bg-[#6D28D9] text-white h-[45px] rounded-[20px] font-bold text-[12.5px] transition-all active:scale-95 shadow-lg shadow-purple-900/20 lowercase"
                type="submit"
              >
                entrar
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
