import React, { useState } from 'react';
import { Globe, Eye, EyeOff } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useLoading } from '../contexts/LoadingContext';

export default function Login() {
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const showToast = (message: string) => {
    setFeedback(message);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation Logic
    if (!phone) {
      showToast('por favor, insira o número de telefone');
      return;
    }

    // Validate phone format: starts with 9 and has 9 digits
    const phoneRegex = /^9\d{8}$/;
    if (!phoneRegex.test(phone)) {
      showToast('o número de telefone deve começar com 9 e ter 9 dígitos');
      return;
    }

    if (!password) {
      showToast('por favor, insira sua senha');
      return;
    }

    showLoading();
    setTimeout(() => {
      hideLoading();
      // Success simulation
      showToast('login realizado com sucesso!');
      setTimeout(() => navigate('/'), 1000);
    }, 1500);
  };

  return (
    <div className="bg-main-gradient flex justify-center items-start p-0 m-0 min-h-screen w-full">
      {/* BEGIN: MainContainer */}
      <main className="w-full max-w-[430px] min-h-screen flex flex-col relative overflow-hidden">
        {/* BEGIN: TopHeader */}
        <header className="w-full h-[220px] flex flex-col items-center justify-center relative header-pattern pt-8">
          {/* Language Icon */}
          <div className="absolute top-4 right-4 text-white opacity-80">
            <Globe className="h-6 w-6" />
          </div>

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
              login por telefone
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-black"></span>
            </button>
          </nav>

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-4 flex-grow">
            {/* Phone Input */}
            <div className="space-y-2">
              <label className="block text-[12.5px] font-semibold text-gray-800" htmlFor="phone">telefone</label>
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
              <Link className="text-[12.5px] text-gray-800 font-medium" to="/">ir para a página inicial</Link>
            </div>
          </form>
        </section>
        {/* END: LoginCard */}

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
      {/* END: MainContainer */}
    </div>
  );
}
