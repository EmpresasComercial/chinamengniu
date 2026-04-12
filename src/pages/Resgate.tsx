import { useState } from 'react';
import { ChevronLeft, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useLoading } from '../contexts/LoadingContext';

export default function Resgate() {
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();
  const [code, setCode] = useState('');
  const [feedback, setFeedback] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  const showToast = (message: string, type: 'error' | 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleRedeem = () => {
    if (!code.trim()) {
      showToast('por favor, insira o código de resgate', 'error');
      return;
    }

    showLoading();
    // Simulate API call for code redemption
    setTimeout(() => {
      hideLoading();
      showToast('código inválido ou expirado', 'error'); // Default generic response
      setCode('');
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFDFD] font-sans antialiased relative overflow-hidden">
      <header className="bg-[#6D28D9] flex items-center justify-between px-4 h-14 sticky top-0 z-30 shadow-sm">
        <button onClick={() => navigate(-1)} className="p-2 text-white active:scale-90 transition-transform" title="voltar">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-[17px] font-bold text-white lowercase mr-8">resgatar código</h1>
        <div className="w-6" />
      </header>

      <main className="flex-grow p-6 relative z-10 flex flex-col items-center mt-12">
        <div className="w-full max-w-sm mb-12 flex flex-col items-center">
            {/* Ícone de Convite/Presente isolado */}
            <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mb-10 shadow-sm border border-purple-100">
                <Gift className="w-10 h-10 text-[#6D28D9]" />
            </div>

            {/* Input underline */}
            <div className="w-full relative border-b-2 border-[#6D28D9] mb-8">
               <input 
                  type="text" 
                  value={code} 
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="por favor, introduza um código aqui"
                  className="w-full bg-transparent p-3 text-center text-[15px] font-medium text-gray-900 focus:outline-none placeholder:text-gray-400 placeholder:normal-case placeholder:font-medium transition-colors"
               />
            </div>
            
            {/* Botão Roxo (Dinâmico) */}
            <button
              onClick={handleRedeem}
              disabled={code.trim() === ''}
              className={`w-full h-[52px] text-white rounded-full text-[15px] font-bold transition-all shadow-md lowercase mt-2 ${
                code.trim() 
                  ? 'bg-[#6D28D9] active:scale-[0.98] shadow-purple-900/20' 
                  : 'bg-[#A78BFA] shadow-purple-200 cursor-not-allowed'
              }`}
            >
              enviar
            </button>
        </div>
      </main>

      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className={`fixed bottom-28 left-4 right-4 ${
              feedback.type === 'error' ? 'bg-red-500' : 'bg-green-500'
            } text-white px-5 py-3 rounded-xl text-[12.5px] font-bold text-center shadow-xl z-[1000] lowercase max-w-fit mx-auto`}
          >
            {feedback.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
