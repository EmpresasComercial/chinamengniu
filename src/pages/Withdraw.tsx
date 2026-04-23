import { useState, useEffect, ChangeEvent } from 'react';
import { ChevronLeft, ChevronRight, Eye, EyeOff, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLoading } from '../contexts/LoadingContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';

interface BankAccount {
  id: string;
  nome_banco: string;
  iban: string;
}

export default function Withdraw() {
  const navigate = useNavigate();
  const { showLoading, hideLoading, registerFetch } = useLoading();
  const { profile, refreshProfile, user } = useAuth();
  const [banks, setBanks] = useState<BankAccount[]>([]);
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);
  const [amountInput, setAmountInput] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [freeWithdrawalAvailable, setFreeWithdrawalAvailable] = useState<boolean>(false);

  useEffect(() => {
    if (!user) return;
    async function fetchBanks() {
      const done = registerFetch();
      try {
        const { data, error } = await supabase.rpc('get_my_bank_accounts');
        if (!error && data) {
          setBanks(data);
          if (data.length > 0) setSelectedBankId(data[0].id);
        }
      } finally {
        done();
      }
    }
    fetchBanks();

    async function checkVerification() {
      try {
        const { data } = await supabase.rpc('get_user_verification');
        setIsVerified(data?.status === 'verificado');
        setFreeWithdrawalAvailable(data?.retirada_gratis_verificada === '300AOA');
      } catch {
        setIsVerified(false);
        setFreeWithdrawalAvailable(false);
      }
    }
    checkVerification();
  }, [user, registerFetch]);

  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3500);
  };

  const taxRate = 0.14;
  const minWithdrawal = 300;
  const maxWithdrawal = 100000;
  const balance = parseFloat(profile?.balance || '0');
  const numericAmount = parseFloat(amountInput) || 0;

  const handleConfirmWithdraw = async () => {
    // Validações leves (formatos básicos)
    if (!amountInput || numericAmount <= 0) {
      showToast('por favor, insira um montante válido.');
      return;
    }
    if (!pin) {
      showToast('por favor, insira o seu PIN de retirada.');
      return;
    }
    if (!selectedBankId) {
      showToast('por favor, selecione ou vincule uma conta bancária.');
      return;
    }

    showLoading();
    try {
      const { data, error } = await supabase.rpc('request_withdrawal', {
        p_amount: numericAmount,
        p_bank_id: selectedBankId,
        p_pin: pin
      });

      if (error) {
        showToast(error.message);
      } else if (data && data.success) {
        showToast(data.message || 'solicitação de levantamento enviada com sucesso.', 'success');
        refreshProfile(); 
        setAmountInput('');
        setPin('');
      } else {
        showToast(data?.message || 'falha no processamento. tente novamente.');
      }
    } catch (err: any) {
      showToast(err?.message || 'erro inesperado. tente novamente mais tarde.');
    } finally {
      hideLoading();
    }
  };

  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setAmountInput(raw);
  };

  const selectedBank = banks.find(b => b.id === selectedBankId);
  const fmt = (val: number | string | undefined) => {
    const num = Number(val || 0);
    return num.toLocaleString('pt-AO', { minimumFractionDigits: 2 });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 antialiased font-serif page-content relative overflow-x-hidden">
      <div className="absolute top-0 left-0 right-0 h-[20vh] bg-[#6D28D9] -z-20" />

      <section className="fixed top-0 left-4 right-4 h-[140px] overflow-hidden rounded-b-[1rem] shadow-sm z-30">
         <div className="absolute inset-0 z-0">
            <img 
               src="/fundo-para a paginafundotualizada.png" 
               alt="balance background" 
               className="w-full h-full object-cover object-center"
            />
         </div>
         
         <button 
           onClick={() => navigate(-1)} 
           className="absolute top-3 left-4 p-2 bg-white/10 backdrop-blur-md rounded-full text-white active:scale-90 transition-transform z-20"
           title="voltar"
           aria-label="voltar"
         >
           <ChevronLeft className="h-5 w-5" />
         </button>

         <button
           onClick={() => navigate('/detalhes', { state: { initialFilter: 'retiradas' } })}
           className="absolute top-3 right-4 p-2 bg-white/10 backdrop-blur-md rounded-full text-white active:scale-90 transition-transform z-20"
           title="histórico de retiradas"
           aria-label="histórico de retiradas"
         >
           <ClipboardList className="h-5 w-5" />
         </button>

         <div className="relative z-10 h-full flex flex-col justify-center px-8 pt-4">
            <span className="text-white/90 text-[12.5px] lowercase font-normal mb-1">saldo da conta(AOA)</span>
            <span className="text-[32px] font-bold text-white tracking-tighter leading-none">
              {fmt(balance)}
            </span>
         </div>
      </section>

      <main className="flex-grow p-4 pt-[155px] space-y-2 relative z-10">
        <section className="bg-white rounded-[1rem] p-5 shadow-sm border border-gray-100 space-y-4">
          <div className="space-y-1">
            <label className="text-gray-900 text-[12.5px] font-normal lowercase">montante da retirada</label>
            <div className="flex items-center border-b border-gray-100 pb-1 focus-within:border-[#6D28D9] transition-colors">
              <input
                className="flex-1 bg-transparent border-none focus:ring-0 p-0 text-[12.5px] font-normal text-gray-900 placeholder:text-gray-200"
                placeholder="Introduzir o montante a retirar"
                type="text"
                inputMode="numeric"
                value={amountInput}
                onChange={handleAmountChange}
              />
              <span className="text-gray-900 font-normal text-[12.5px]">AOA</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-gray-900 text-[12.5px] font-normal lowercase">Seleccionar o cartão bancário</label>
            <button 
              onClick={() => navigate('/adicionar-banco')}
              className="w-full flex items-center justify-between border-b border-gray-100 pb-1 h-auto focus-within:border-[#6D28D9] transition-colors"
            >
              <span className={`text-[12.5px] ${selectedBank ? 'text-gray-900 font-normal' : 'text-gray-300 font-normal'}`}>
                {selectedBank ? `${selectedBank.nome_banco} (${selectedBank.iban.slice(-4)})` : 'Seleccionar o cartão bancário'}
              </span>
              <ChevronRight className="h-4 w-4 text-gray-300" />
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-gray-900 text-[12.5px] font-normal lowercase">Código PIN</label>
            <div className="flex items-center border-b border-gray-100 pb-1 focus-within:border-[#6D28D9] transition-colors">
              <input
                className="flex-1 bg-transparent border-none focus:ring-0 p-0 text-[12.5px] font-normal text-gray-900 placeholder:text-gray-200"
                placeholder="Insira o PIN"
                type={showPin ? "text" : "password"}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
              />
              <button title="ver senha" onClick={() => setShowPin(!showPin)} className="px-1 text-gray-300">
                {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button 
            onClick={() => navigate('/adicionar-banco')}
            className="w-full flex flex-col items-start h-auto pt-0.5"
          >
            <span className="text-gray-900 text-[12.5px] font-normal lowercase">Gerir cartões bancários</span>
            <span className="text-gray-400 text-[10.5px] lowercase font-normal leading-tight">Carregue para gerir cartões bancários</span>
          </button>

          {freeWithdrawalAvailable && isVerified && (
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-100 mt-2">
              <p className="text-[#6D28D9] text-[11px] font-medium text-center">
                ✨ você tem 1 retirada gratuita disponível de 300 AOA.
              </p>
            </div>
          )}
        </section>

        <div className="pt-1">
          <button
            onClick={handleConfirmWithdraw}
            className="w-full h-11 bg-[#6D28D9] text-white rounded-[20px] text-[12.5px] font-bold active:scale-[0.98] transition-all shadow shadow-[#6D28D9]/10"
          >
            enviar
          </button>
        </div>

        <section className="px-4 py-1 text-gray-400 text-[10.5px] space-y-1 leading-normal lowercase">
          <p className="font-bold text-gray-900 text-[11px] mb-0.5">Precauções</p>
          <p>· montante mínimo de levantamento: {fmt(minWithdrawal).replace(',00', '')} AOA</p>
          <p>· montante máximo de levantamento: {fmt(maxWithdrawal).replace(',00', '')} AOA</p>
          <p>· Taxa de manuseamento administrativa: {Math.round(taxRate * 100)}%</p>
          <p>· Volume máximo diário de extração: 1 vez</p>
        </section>
      </main>

      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className={`fixed bottom-24 left-4 right-4 ${
              feedback.type === 'error' ? 'bg-red-500' : 'bg-green-500'
            } text-white px-6 py-4 rounded-xl text-[12.5px] font-bold text-center shadow-xl z-[1000]`}
          >
            {feedback.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
