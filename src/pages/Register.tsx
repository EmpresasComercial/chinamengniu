import React, { useState } from 'react';
import { Globe, Eye, EyeOff } from 'lucide-react';
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

  const showToast = (message: string) => {
    setFeedback(message);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.phone) {
      showToast('por favor, insira o número de telefone');
      return;
    }
    const phoneRegex = /^9\d{8}$/;
    if (!phoneRegex.test(formData.phone)) {
      showToast('o número de telefone deve começar com 9 e ter 9 dígitos');
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
      showToast('por favor, insira o código de convite');
      return;
    }

    showLoading();
    try {
      const { error } = await supabase.auth.signUp({
        email: `${formData.phone}@user.com`,
        password: formData.password,
        options: {
          data: {
            phone: formData.phone,
            referred_by: formData.inviteCode
          }
        }
      });

      if (error) {
        showToast(`erro no registro: ${error.message}`);
        return;
      }

      showToast('Registro realizado com sucesso!');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err: any) {
      showToast('Erro inesperado ao registrar');
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
        {/* Language/Globe Icon */}
        <div className="absolute top-4 right-4 text-white/80">
          <Globe className="h-6 w-6" />
        </div>

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
              initial={{ opacity: 0, scale: 0.9, x: '-50%', y: '-50%' }}
              animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
              exit={{ opacity: 0, scale: 0.9, x: '-50%', y: '-50%' }}
              className="fixed top-1/2 left-1/2 bg-black/80 text-white px-6 py-3 rounded-xl text-[12.5px] font-medium shadow-2xl z-[100] text-center min-w-[280px]"
            >
              {feedback}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      {/* END: Main Registration Form */}
    </div>
  );
}
