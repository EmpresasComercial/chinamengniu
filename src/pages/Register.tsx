import React, { useState } from 'react';
import { Headset, X, Eye, EyeOff } from 'lucide-react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useLoading } from '../contexts/LoadingContext';
import { supabase } from '../lib/supabase';
import { useEffect } from 'react';

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showLoading, hideLoading } = useLoading();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [links, setLinks] = useState({
    whatsapp_gerente_url: 'https://wa.me/1234567890',
    whatsapp_grupo_vendas_url: 'https://wa.me/1234567890',
    link_app_atualizado: '#',
    splash_message: 'carregando avisos...'
  });

  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    confirmPassword: '',
    inviteCode: ''
  });

  useEffect(() => {
    const code = searchParams.get('invite');
    if (code) {
      // Sanitização rigorosa: apenas caracteres alfanuméricos
      const sanitizedCode = code.replace(/[^\w]/g, '').slice(0, 20);
      setFormData(prev => ({ ...prev, inviteCode: sanitizedCode }));
    }
  }, [searchParams]);

  useEffect(() => {
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

    if (!formData.phone) {
      showToast('por favor, insira celular');
      return;
    }
    const phoneRegex = /^9\d{8}$/;
    if (!phoneRegex.test(formData.phone)) {
      showToast('celular começar com 9 e ter 9 dígitos');
      return;
    }
    if (!formData.password) {
      showToast('por favor, insira sua senha');
      return;
    }
    if (!formData.confirmPassword) {
      showToast('por favor, confirme sua senha');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      showToast('as senhas não coincidem');
      return;
    }
    if (!formData.inviteCode) {
      showToast('por favor, insira código');
      return;
    }

    showLoading();
    try {
      // Usando a Edge Function para registro seguro com limites de IP e anti-fraude
      const { data, error } = await supabase.functions.invoke('secure-registration', {
        body: {
          phone: formData.phone,
          password: formData.password,
          inviteCode: formData.inviteCode
        }
      });

      if (error) {
        // If it's a 4xx/5xx error, the body might contain the actual error message
        let errorMsg = error.message;
        try {
          const body = await error.context?.json();
          if (body && body.error) errorMsg = body.error;
        } catch (e) {
          // Fallback to default error message
        }
        showToast(errorMsg);
        return;
      }

      if (data && data.error) {
        showToast(data.error);
        return;
      }

      showToast('registro bem-sucedido');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err: any) {
      showToast('registro não sucedido');
    } finally {
      hideLoading();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = e.target.value.replace(/[^\p{L}\p{N}]/gu, '');
    setFormData({ ...formData, [e.target.name]: sanitizedValue });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f3f4f6] page-content">
      {/* BEGIN: Header */}
      <header className="bg-[#00008b] h-64 relative flex flex-col items-center pt-8 overflow-hidden header-pattern">
        {/* Support Icon */}
        <button 
          onClick={() => setIsSupportModalOpen(true)}
          className="absolute top-4 right-4 text-white/80 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all active:scale-95"
          title="atendimento ao cliente"
        >
          <Headset className="h-6 w-6" />
        </button>

        {/* Logo Container */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mb-2 shadow-lg p-2">
            <img
              alt="Mengniu Company logo"
              className="w-full h-full object-contain"
              src="https://s3-symbol-logo.tradingview.com/mengniu-dairy--600.png"
            />
          </div>
          <h1 className="text-white text-2xl font-semibold tracking-tight">Mengniu Company</h1>
        </div>
      </header>
      {/* END: Header */}

      {/* BEGIN: Main Registration Form */}
      <main className="flex-grow -mt-12 px-6 pb-12 relative z-20">
        <section className="bg-white rounded-t-[40px] rounded-b-xl shadow-xl p-8 max-w-md mx-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Field: Phone Number */}
            <div className="space-y-1">
              <label className="block text-[12.5px] font-medium text-gray-700" htmlFor="phone">telefone</label>
              <div className="border-b border-gray-200 py-2 flex items-center focus-within:border-[#00008b] transition-colors">
                <span className="text-gray-800 mr-2 font-medium text-[12.5px]">+244</span>
                <input
                  className="w-full border-none p-0 focus:ring-0 text-gray-800 placeholder-gray-400 text-[12.5px]"
                  id="phone"
                  name="phone"
                  placeholder="telefone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Field: Password */}
            <div className="space-y-1">
              <label className="block text-[12.5px] font-medium text-gray-700" htmlFor="password">senha</label>
              <div className="border-b border-gray-200 py-2 flex items-center focus-within:border-[#00008b] transition-colors">
                <input
                  className="w-full border-none p-0 focus:ring-0 text-gray-800 placeholder-gray-400 text-[12.5px]"
                  id="password"
                  name="password"
                  placeholder="senha"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  className="text-gray-500 hover:text-gray-700 btn-small"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Field: Confirm Password */}
            <div className="space-y-1">
              <label className="block text-[12.5px] font-medium text-gray-700" htmlFor="confirm-password">confirmar senha</label>
              <div className="border-b border-gray-200 py-2 flex items-center focus-within:border-[#00008b] transition-colors">
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
                  className="text-gray-500 hover:text-gray-700 btn-small"
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Field: Invite Code */}
            <div className="space-y-1">
              <label className="block text-[12.5px] font-medium text-gray-700" htmlFor="invite-code">código de convite</label>
              <div className="border-b border-gray-200 py-2 focus-within:border-[#00008b] transition-colors">
                <input
                  className="w-full border-none p-0 focus:ring-0 text-gray-800 text-[12.5px] font-medium"
                  id="invite-code"
                  name="inviteCode"
                  type="text"
                  value={formData.inviteCode}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                className="w-full bg-[#0000aa] text-white h-[45px] rounded-full font-medium text-[15px] shadow-md transition-all active:scale-95"
                type="submit"
              >
                registrar
              </button>
            </div>

            {/* Footer Links */}
            <div className="text-center space-y-4 pt-4">
              <p className="text-[12.5px] text-gray-500">
                você já possui uma conta? <Link className="text-[#00008b] font-semibold" to="/login">conecte-se</Link>
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
              className="fixed inset-0 m-auto w-fit h-fit min-w-[260px] bg-black/50 backdrop-blur-sm text-white px-5 py-3 rounded-2xl text-[12.5px] shadow-xl z-[500] text-center max-w-[85vw] whitespace-normal break-words"
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
                  onClick={(e) => { handleLinkClick(links.whatsapp_grupo_vendas_url, e); setIsSupportModalOpen(false); }}
                  className="w-full h-[48px] bg-slate-50 rounded-[8px] flex items-center px-3 active:bg-slate-100 transition-none"
                >
                  <div className="w-9 h-9 bg-[#25D366]/10 rounded-[6px] flex items-center justify-center mr-3">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png" className="w-5 h-5" alt="whatsapp" />
                  </div>
                  <p className="text-slate-900 font-bold text-[12.5px] text-left">entrar no grupo whatsapp</p>
                </button>

                <button
                  onClick={(e) => { handleLinkClick(links.whatsapp_gerente_url, e); setIsSupportModalOpen(false); }}
                  className="w-full h-[48px] bg-slate-50 rounded-[8px] flex items-center px-3 active:bg-slate-100 transition-none"
                >
                  <div className="w-9 h-9 bg-[#25D366]/10 rounded-[6px] flex items-center justify-center mr-3">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png" className="w-5 h-5" alt="whatsapp" />
                  </div>
                  <p className="text-slate-900 font-bold text-[12.5px] text-left">contactar gerente whatsapp</p>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
