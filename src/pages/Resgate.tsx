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
      {/* Background Graphic */}
      <div className="absolute top-0 right-0 w-full h-full opacity-[0.03] pointer-events-none select-none overflow-hidden">
         <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] border-[50px] border-[#6D28D9] rounded-full"></div>
      </div>

      <header className="flex items-center justify-between px-4 h-14 bg-white/80 backdrop-blur-sm sticky top-0 z-30">
        <button onClick={() => navigate(-1)} className="p-2 text-gray-800" title="voltar">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-[17px] font-bold text-gray-900 lowercase mr-8">resgatar código</h1>
        <div className="w-6" /> {/* Spacer */}
      </header>

      <main className="flex-grow p-5 relative z-10 flex flex-col items-center mt-6">
        <div className="w-full max-w-sm mb-6 flex flex-col items-center">
            <div className="w-[70px] h-[70px] bg-purple-50 rounded-full flex items-center justify-center mb-5 shadow-inner border-[4px] border-white">
                <Gift className="w-8 h-8 text-[#6D28D9]" />
            </div>
            <h2 className="text-[20px] font-black text-gray-900 leading-tight">tens um código?</h2>
            <p className="text-[12.5px] text-gray-500 font-medium mt-1 mb-8 text-center px-4">
              introduz abaixo o teu código promocional ou de oferta para resgatar na conta principal.
            </p>

            <div className="w-full relative">
               <input 
                  type="text" 
                  value={code} 
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="DIGITE O SEU CÓDIGO AQUI"
                  className="w-full h-[54px] bg-gray-50 border-2 border-gray-100 rounded-[14px] text-center text-[15px] font-bold text-gray-900 focus:outline-none focus:border-[#6D28D9]/50 transition-colors uppercase tracking-widest placeholder:normal-case placeholder:tracking-normal placeholder:font-medium placeholder:text-gray-300"
               />
            </div>
        </div>

        <div className="w-full max-w-sm mt-4">
          <button
            onClick={handleRedeem}
            className="w-full h-[52px] bg-[#6D28D9] text-white rounded-xl text-[15px] font-bold active:scale-[0.98] transition-all shadow-md shadow-purple-200 lowercase"
          >
            resgatar prémio
          </button>
        </div>
      </main>

      {/* Toast Feedback */}
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
