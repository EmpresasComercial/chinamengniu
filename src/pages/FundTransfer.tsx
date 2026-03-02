import { useState } from 'react';
import { ChevronLeft, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useLoading } from '../contexts/LoadingContext';
import { supabase } from '../lib/supabase';

export default function FundTransfer() {
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();
  const [code, setCode] = useState('');
  const [feedback, setFeedback] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  const handleConfirm = async () => {
    if (!code) {
      showFeedback('por favor, insira o seu código', 'error');
      return;
    }

    showLoading();
    try {
      const { data, error } = await supabase.rpc('redeem_gift_code', {
        p_code: code
      });

      if (error) throw error;

      if (data.success) {
        showFeedback(data.message.toLowerCase(), 'success');
        setCode('');
      } else {
        showFeedback(data.message.toLowerCase(), 'error');
      }
    } catch (err: any) {
      console.error('Error redeeming code:', err);
      showFeedback('erro ao processar o código. tente novamente.', 'error');
    } finally {
      hideLoading();
    }
  };

  const showFeedback = (message: string, type: 'error' | 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#e9ecf3] antialiased page-content">
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
        {/* Banner Section */}
        <section className="mb-4">
          <div className="bg-[#f5d7a1] rounded-[24px] border border-[#cfb586] p-8 flex flex-col items-center justify-center relative shadow-sm text-center">
            <div className="bg-black w-12 h-12 rounded-full flex items-center justify-center shadow-lg mb-3">
              <Gift className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-[18px] font-black text-black lowercase leading-tight mb-1">resgate de recompensas</h2>
            <p className="text-[11px] text-gray-700 font-medium lowercase">insira o seu código de convite ou código de presente abaixo</p>
          </div>
        </section>

        {/* Transfer Form Card */}
        <section>
          <div className="bg-white rounded-[24px] shadow-[0_4px_25px_rgba(0,0,0,0.06)] p-8 mt-2">
            {/* Gift Code Input */}
            <div className="mb-8">
              <label className="block text-gray-400 text-[12.5px] mb-3 lowercase font-bold" htmlFor="gift-code">
                informe o seu código
              </label>
              <div className="border-b-2 border-[#e2e8f0] py-3 focus-within:border-[#000080] transition-colors">
                <input
                  className="w-full border-none focus:ring-0 p-0 text-gray-800 bg-transparent text-[16px] font-bold outline-none placeholder:text-gray-300 placeholder:font-normal"
                  id="gift-code"
                  placeholder="insira o código aqui"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-2">
              <button
                onClick={handleConfirm}
                className="w-full h-[45px] bg-[#000080] text-white rounded-full text-[15px] font-black shadow-lg active:scale-[0.98] transition-all tracking-wide lowercase"
              >
                resgatar código
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Visual Feedback (Toast) */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: '-50%', y: '-10%' }}
            animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
            exit={{ opacity: 0, scale: 0.9, x: '-50%', y: '-10%' }}
            className={`fixed top-1/2 left-1/2 ${feedback.type === 'error' ? 'bg-red-600' : 'bg-black/90'} text-white px-6 py-4 rounded-2xl text-[12.5px] font-bold shadow-2xl z-[100] text-center min-w-[280px]`}
          >
            {feedback.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
