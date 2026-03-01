import { useState } from 'react';
import { ChevronLeft, Eye, MoveRight, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useLoading } from '../contexts/LoadingContext';

export default function FundTransfer() {
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();
  const [showPassword, setShowPassword] = useState(false);
  const [amount, setAmount] = useState('');
  const [password, setPassword] = useState('');
  const [feedback, setFeedback] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  const handleConfirm = () => {
    if (!amount) {
      showFeedback('a quantidade de troca não pode ser zero', 'error');
      return;
    }
    if (!password) {
      showFeedback('por favor, digite sua senha segura', 'error');
      return;
    }

    showLoading();
    setTimeout(() => {
      hideLoading();
      // Simulate successful transfer
      showFeedback('bem-sucedido!', 'success');

      // Clear form after success
      setAmount('');
      setPassword('');
    }, 1500);
  };

  const showFeedback = (message: string, type: 'error' | 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#e9ecf3] antialiased">
      {/* Header */}
      <header className="flex items-center px-4 h-12 bg-[#000080] sticky top-0 z-50">
        <button onClick={() => navigate(-1)} className="flex-none">
          <ChevronLeft className="h-6 w-6 text-white" />
        </button>
        <div className="flex-grow text-center">
          <h1 className="text-white text-[15px] font-bold pr-6">trocar saldo</h1>
        </div>
      </header>

      <main className="flex-grow p-4">
        {/* Account Status Card */}
        <section className="mb-4">
          <div className="bg-[#f5d7a1] rounded-[24px] border border-[#cfb586] p-5 flex items-center justify-between relative shadow-sm">
            {/* Left side: ativos de lucro */}
            <div className="text-center flex-1">
              <p className="text-[12.5px] text-gray-800 font-semibold mb-1">ativos de lucro</p>
              <p className="text-[15px] font-bold text-black leading-none">0</p>
            </div>

            {/* Center Arrow Button */}
            <div className="flex-none mx-2">
              <div className="bg-black w-10 h-10 rounded-full flex items-center justify-center shadow-md">
                <MoveRight className="h-5 w-5 text-white stroke-[3]" />
              </div>
            </div>

            {/* Right side: conta de reprodução */}
            <div className="text-center flex-1">
              <p className="text-[12.5px] text-gray-800 font-semibold mb-1">conta de reprodução</p>
              <p className="text-[15px] font-bold text-black leading-none">0</p>
            </div>
          </div>
        </section>

        {/* Transfer Form Card */}
        <section>
          <div className="bg-white rounded-[24px] shadow-[0_4px_15px_rgba(0,0,0,0.05)] p-8 mt-2">
            {/* Transfer Amount Input */}
            <div className="mb-4">
              <label className="block text-gray-400 text-[12.5px] mb-2" htmlFor="transfer-amount">
                transferir valor
              </label>
              <div className="border-b border-[#e2e8f0] py-2">
                <input
                  className="w-full border-none focus:ring-0 p-0 text-gray-700 bg-transparent text-[12.5px] outline-none"
                  id="transfer-amount"
                  placeholder=""
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^\p{L}\p{N}]/gu, ''))}
                />
              </div>
            </div>

            {/* Secure Password Input */}
            <div className="mb-6">
              <div className="flex justify-between items-end mb-2">
                <label className="block text-gray-400 text-[12.5px]" htmlFor="secure-password">
                  senha segura
                </label>
                {/* Eye Icon */}
                <button
                  className="text-gray-400"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <div className="border-b border-[#e2e8f0] py-2">
                <input
                  className="w-full border-none focus:ring-0 p-0 text-gray-700 bg-transparent text-[12.5px] outline-none"
                  id="secure-password"
                  placeholder=""
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value.replace(/[^\p{L}\p{N}]/gu, ''))}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-2">
              <button
                onClick={handleConfirm}
                className="w-full h-[45px] bg-[#000080] text-white rounded-full text-[15px] font-medium shadow-lg active:opacity-90 transition-opacity tracking-wide"
              >
                converter
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Visual Feedback (Toast) */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: '-50%', y: '-50%' }}
            animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
            exit={{ opacity: 0, scale: 0.9, x: '-50%', y: '-50%' }}
            className="fixed top-1/2 left-1/2 bg-black/80 text-white px-6 py-3 rounded-xl text-[12.5px] font-medium shadow-2xl z-[100] text-center min-w-[280px]"
          >
            {feedback.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
