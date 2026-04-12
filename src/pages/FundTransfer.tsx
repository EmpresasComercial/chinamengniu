import { useState, useEffect, ChangeEvent, useMemo } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useLoading } from '../contexts/LoadingContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function FundTransfer() {
  const navigate = useNavigate();
  const { showLoading, hideLoading, registerFetch } = useLoading();
  const { user, profile } = useAuth();
  const [amountInput, setAmountInput] = useState('');
  const [balanceCorrete, setBalanceCorrete] = useState(0);
  const [feedback, setFeedback] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  useEffect(() => {
    if (!profile?.id) return;
    async function fetchData() {
      const done = registerFetch();
      try {
        const { data: reprData } = await supabase
          .from('tarefas_diarias')
          .select('balance_correte')
          .eq('user_id', profile.id);
        
        if (reprData) {
          const total = reprData.reduce((s, t) => s + Number(t.balance_correte || 0), 0);
          setBalanceCorrete(total);
        }
      } finally {
        done();
      }
    }
    fetchData();
  }, [profile?.id, registerFetch]);

  const showToast = (message: string, type: 'error' | 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleTransfer = async () => {
    const amount = Number(amountInput);
    if (isNaN(amount) || amount <= 0) {
      showToast('introduza um montante válido', 'error'); return;
    }

    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();

    if (day < 1 || day > 5) {
      showToast('conversões apenas de segunda a sexta', 'error'); return;
    }
    if (hour < 10 || hour >= 22) {
      showToast('conversões disponíveis entre 10:00 e 22:00', 'error'); return;
    }
    if (amount < 1000) {
      showToast('montante mínimo é 1.000 kz', 'error'); return;
    }
    if (amount > 100000) {
      showToast('montante máximo é 100.000 kz', 'error'); return;
    }
    if (amount > balanceCorrete) {
      showToast('saldo insuficiente', 'error'); return;
    }

    showLoading();
    try {
      const { data, error } = await supabase.rpc('transfer_reproducao_to_balance', { p_amount: amount });
      if (error) throw error;
      if (data.success) {
        showToast('conversão efetuada', 'success');
        setBalanceCorrete(prev => prev - amount);
        setAmountInput('');
      } else {
        showToast(data.message.toLowerCase(), 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'falha na transferência. tente novamente', 'error');
    } finally {
      hideLoading();
    }
  };

  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setAmountInput(raw);
  };

  // Calcula o valor a receber com o desconto de 4% de taxa
  const receiveAmount = useMemo(() => {
    const amt = Number(amountInput);
    return isNaN(amt) ? 0 : amt * 0.96;
  }, [amountInput]);

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFDFD] font-sans antialiased relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[280px] bg-gradient-to-b from-[#FF4D4D] to-white/0 -z-10" />

      <main className="flex-grow p-4 pt-14 relative z-10 flex flex-col">
        <button 
          onClick={() => navigate(-1)} 
          className="absolute top-4 left-4 p-2 text-white active:scale-90 transition-transform"
          aria-label="voltar"
        >
          <ChevronLeft className="h-7 w-7" />
        </button>

        <div className="relative mt-8 space-y-2">
          {/* Card AOA */}
          <div className="bg-white rounded-[16px] p-5 shadow-sm border border-gray-50 relative z-10 w-full mb-1">
             <div className="flex justify-between mb-3 text-gray-400 font-medium">
                <span className="text-[11px] uppercase tracking-wider">TO</span>
                <span className="text-[11px]">Saldo disponível {balanceCorrete.toLocaleString('pt-AO')} AOA</span>
             </div>
             <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                   <div className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center font-bold text-gray-800 text-[9px]">Kz</div>
                   <span className="font-bold text-[16px] text-gray-800">AOA</span>
                </div>
                <input 
                  type="number" 
                  value={amountInput} 
                  onChange={handleAmountChange}
                  placeholder="Introduzir o montante a conver..."
                  className="bg-transparent text-right text-[12px] font-medium text-gray-800 focus:outline-none w-[60%] placeholder:text-[#d1d5db]"
                />
             </div>
          </div>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-[30px] h-[30px] bg-[#fce4e4] rounded-full flex flex-col items-center justify-center border-2 border-white shadow-sm pointer-events-none">
             <div className="flex gap-0.5 opacity-60">
                <svg width="8" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-gray-900"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
                <svg width="8" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-gray-900"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
             </div>
          </div>

          {/* Card AI-GO */}
          <div className="bg-white rounded-[16px] p-5 shadow-sm border border-gray-50 relative z-0 w-full mt-1">
             <div className="mb-3 text-gray-400 font-medium">
                <span className="text-[11px] uppercase tracking-wider">TO</span>
             </div>
             <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                   <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center font-bold text-red-500 text-[8px] tracking-tighter">AI-GO</div>
                   <span className="font-bold text-[16px] text-gray-800">AI-GO</span>
                </div>
                <span className="font-bold text-[15px] text-gray-800">{receiveAmount > 0 ? receiveAmount.toLocaleString('pt-AO', {minimumFractionDigits:2, maximumFractionDigits:2}) : '='}</span>
             </div>
          </div>
        </div>

        <div className="px-1 mt-6 text-center">
          <p className="text-gray-400 text-[11px] font-medium leading-relaxed">
            as transações serão concluídas instantaneamente<br/>
            (taxa de conversão: 4%)
          </p>
        </div>

        <div className="mt-20 px-2">
          <button
            onClick={handleTransfer}
            className="w-full h-[52px] bg-[#A78BFA] text-white rounded-full text-[15px] font-bold active:scale-[0.98] transition-all shadow-md shadow-purple-200 lowercase"
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
            } text-white px-5 py-3 rounded-xl text-[12px] font-medium text-center shadow-xl z-[1000] lowercase max-w-fit mx-auto`}
          >
            {feedback.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

