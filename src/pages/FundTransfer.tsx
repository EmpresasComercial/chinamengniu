import { useState, useEffect, ChangeEvent } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useLoading } from '../contexts/LoadingContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function FundTransfer() {
  const navigate = useNavigate();
  const { showLoading, hideLoading, registerFetch } = useLoading();
  const { user } = useAuth();
  const [amountInput, setAmountInput] = useState('');
  const [balanceCorrete, setBalanceCorrete] = useState(0);
  const [balanceMain, setBalanceMain] = useState(0);
  const [feedback, setFeedback] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  useEffect(() => {
    if (!user) return;
    async function fetchData() {
      const done = registerFetch();
      try {
        const { data: reprData } = await supabase
          .from('tarefas_diarias')
          .select('balance_correte')
          .eq('user_id', user.id);
        
        if (reprData) {
          const total = reprData.reduce((s, t) => s + Number(t.balance_correte || 0), 0);
          setBalanceCorrete(total);
        }

        const { data: profData } = await supabase
          .from('profiles')
          .select('balance')
          .eq('id', user.id)
          .single();
        
        if (profData) {
          setBalanceMain(Number(profData.balance || 0));
        }
      } finally {
        done();
      }
    }
    fetchData();
  }, [user, registerFetch]);

  const showToast = (message: string, type: 'error' | 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleTransfer = async () => {
    const amount = Number(amountInput);
    if (isNaN(amount) || amount <= 0) {
      showToast('Por favor, introduza um montante válido.', 'error'); return;
    }

    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();

    if (day < 1 || day > 5) {
      showToast('As conversões são permitidas apenas de Segunda a Sexta-feira.', 'error'); return;
    }
    if (hour < 10 || hour >= 22) {
      showToast('As conversões estão disponíveis apenas entre as 10:00 e as 22:00.', 'error'); return;
    }

    if (amount < 1000) {
      showToast('O montante mínimo para conversão é de 1.000 Kz.', 'error'); return;
    }
    if (amount > 100000) {
      showToast('O montante máximo permitido por operação é de 100.000 Kz.', 'error'); return;
    }
    if (amount > balanceCorrete) {
      showToast('Saldo de processamento insuficiente para esta operação.', 'error'); return;
    }

    showLoading();
    try {
      const { data, error } = await supabase.rpc('transfer_reproducao_to_balance', { p_amount: amount });
      if (error) throw error;
      if (data.success) {
        showToast(`Conversão de ${amount.toLocaleString('pt-AO')} Kz efetuada com sucesso.`, 'success');
        setBalanceCorrete(prev => prev - amount);
        setBalanceMain(prev => prev + amount);
        setAmountInput('');
      } else {
        showToast(data.message.toLowerCase(), 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'Falha na transferência de fundos. Tente novamente.', 'error');
    } finally {
      hideLoading();
    }
  };

  const fmt = (val: number) => val.toLocaleString('pt-AO', { minimumFractionDigits: 2 });

  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setAmountInput(raw);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white antialiased page-content relative overflow-hidden">
      {/* Red Background Gradient Top */}
      <div 
        className="absolute top-0 left-0 right-0 h-[38vh] bg-gradient-to-b from-[#FF4D4D] to-white/0 -z-10" 
      />

      {/* Main Container */}
      <main className="flex-grow p-4 pt-12 relative z-10 flex flex-col">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)} 
          className="absolute top-4 left-4 p-2 bg-white/10 backdrop-blur-md rounded-full text-white active:scale-90 transition-transform"
          title="voltar"
          aria-label="voltar"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        {/* Balance Display Card */}
        <section className="bg-white rounded-[2.5rem] p-8 shadow-[0_15px_40px_rgba(0,0,0,0.03)] border border-gray-50 flex flex-col mb-8 mt-6">
          <div className="flex justify-end mb-5">
            <span className="text-gray-400 text-[11px] font-bold lowercase tracking-tight">
              saldo disponível {Math.floor(balanceCorrete)} aoa
            </span>
          </div>
          
          <div className="flex items-baseline gap-3 mb-2">
            <h2 className="text-[52px] font-black text-gray-900 tracking-tighter leading-none">
              {amountInput || '0'}
            </h2>
            <div className="flex items-center gap-2">
               <span className="text-[#FF4141] font-black text-[20px] uppercase">aog</span>
               <button 
                 onClick={() => setAmountInput(String(Math.floor(balanceCorrete)))}
                 className="text-gray-400 text-[13px] font-black lowercase ml-1 active:opacity-60"
               >
                 todos
               </button>
            </div>
          </div>
        </section>

        {/* Helper Texts */}
        <div className="px-3 space-y-1 mb-auto">
          <p className="text-gray-400 text-[14px] font-bold lowercase">
            aluguel {Math.floor(balanceCorrete)}aog
          </p>
          <p className="text-gray-300 text-[11px] font-bold lowercase leading-relaxed">
            as transacções serão concluídas no prazo de 72 horas
          </p>
        </div>

        {/* Amount Input (Hidden but accessible for logic) */}
        <input 
          type="number" 
          value={amountInput} 
          onChange={handleAmountChange}
          className="opacity-0 absolute pointer-events-none"
          id="amount-trigger"
          title="montante de transferência"
          placeholder="0"
        />

        {/* Confirmation Button */}
        <div className="px-2 pt-10 pb-16">
          <button
            onClick={handleTransfer}
            className="w-full h-[58px] bg-[#FF3B30] text-white rounded-full text-[16px] font-extrabold active:scale-[0.97] transition-all shadow-[0_12px_24px_rgba(255,59,48,0.25)]"
          >
            Confirmação de vendas
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
            } text-white px-6 py-4 rounded-2xl text-[13px] font-black text-center shadow-2xl z-[1000]`}
          >
            {feedback.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
