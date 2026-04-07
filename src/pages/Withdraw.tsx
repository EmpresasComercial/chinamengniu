import { useState, useEffect, ChangeEvent } from 'react';
import { ChevronLeft, Wallet, Landmark, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLoading } from '../contexts/LoadingContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';

interface BankAccount {
  id: string;
  banco_nome: string;
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
  }, [user, registerFetch]);

  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3500);
  };

  const taxRate = 0.14;
  const minWithdrawal = 1000;
  const maxWithdrawal = 100000;
  const balance = parseFloat(profile?.balance || '0');
  const numericAmount = parseFloat(amountInput) || 0;
  const amountToReceive = numericAmount * (1 - taxRate);

  const maskIban = (val?: string) => {
    if (!val) return '';
    if (val.length < 8) return val;
    const first = val.slice(0, 4);
    const last = val.slice(-4);
    return `${first}${'*'.repeat(val.length - 8)}${last}`;
  };

  const handleConfirmWithdraw = async () => {
    if (!amountInput || numericAmount < minWithdrawal) {
      showToast(`o saldo mínimo para retirada é de ${minWithdrawal.toLocaleString()} kz.`);
      return;
    }
    if (numericAmount > maxWithdrawal) {
      showToast(`o limite máximo por operação é de ${maxWithdrawal.toLocaleString()} kz.`);
      return;
    }
    if (numericAmount > balance) {
      showToast('o valor solicitado excede o seu saldo disponível.');
      return;
    }
    if (!pin || pin.length < 4) {
      showToast('por favor, insira a sua senha de retirada válida.');
      return;
    }
    if (!selectedBankId) {
      showToast('por favor, vincule uma conta bancária para prosseguir.');
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
        showToast('solicitação de levantamento enviada com sucesso.', 'success');
        refreshProfile(); 
        setAmountInput('');
        setPin('');
      } else {
        showToast(data?.message || 'falha no processamento. tente novamente.');
      }
    } catch {
      showToast('erro inesperado. tente novamente mais tarde.');
    } finally {
      hideLoading();
    }
  };

  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setAmountInput(raw);
  };

  const selectedBank = banks.find(b => b.id === selectedBankId);
  const fmt = (val: number) => val.toLocaleString('pt-AO', { minimumFractionDigits: 0 });

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F7FA] antialiased page-content">
      <header className="flex items-center px-4 h-12 bg-[#001f8d] sticky top-0 z-50">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2" title="voltar" aria-label="voltar">
          <ChevronLeft className="h-5 w-5 text-white" />
        </button>
        <div className="flex-grow text-center">
          <h1 className="text-white text-[14px] font-bold pr-8 lowercase">
            levantamento de fundos
          </h1>
        </div>
      </header>

      <main className="flex-grow p-4">
        <div className="bg-white rounded-xl p-4 mb-4 flex justify-between items-center border border-slate-50">
          <div className="text-center flex-1">
            <p className="text-[9px] text-slate-400 font-bold mb-0.5 uppercase tracking-wider lowercase">saldo disponível</p>
            <p className="text-[16px] font-black text-[#001f8d]">{fmt(balance)} Kz</p>
          </div>
          <div className="w-10 h-10 bg-[#001f8d] rounded-xl flex items-center justify-center shrink-0 mx-2">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div className="text-center flex-1">
            <p className="text-[9px] text-slate-400 font-bold mb-0.5 uppercase tracking-wider lowercase">valor a receber</p>
            <p className="text-[16px] font-black text-green-600">{fmt(amountToReceive)} Kz</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-100">
          <div className="flex justify-between gap-1 mb-10">
            {[1000, 5000, 10000, 50000].map(v => (
              <button
                key={v}
                onClick={() => setAmountInput(String(v))}
                className="flex-1 bg-[#001f8d] text-white rounded-md h-[24px] text-[9.5px] font-normal hover:bg-blue-700 active:scale-95 transition-all"
              >
                {v.toLocaleString('pt-AO')}
              </button>
            ))}
          </div>

          <div className="space-y-12">
            <div className="flex flex-col">
              <div className="border-b-2 border-[#001f8d] w-full pb-1 focus-within:border-blue-500 transition-colors">
                <input
                  className="w-full border-none focus:ring-0 p-0 text-slate-800 bg-transparent text-[15px] font-medium outline-none text-left placeholder:text-slate-300 placeholder:font-normal"
                  placeholder="por favor, insira o valor de retirada"
                  type="text"
                  inputMode="numeric"
                  value={amountInput}
                  onChange={handleAmountChange}
                />
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center border-b-2 border-[#001f8d] w-full pb-1 focus-within:border-blue-500 transition-colors">
                <input
                  className="w-full border-none focus:ring-0 p-0 text-slate-800 bg-transparent text-[15px] font-medium outline-none text-left placeholder:text-slate-300 placeholder:font-normal"
                  placeholder="por favor, insira a senha de segurança (login)"
                  type={showPin ? "text" : "password"}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="text-slate-300 ml-2"
                >
                  {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-10 border-t border-slate-100">
            {banks.length > 0 ? (
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center border border-slate-100">
                    <Landmark className="w-6 h-6 text-[#001f8d]" />
                  </div>
                  <div className="flex-grow">
                    <p className="text-[17px] font-black text-slate-900 tracking-wider">
                      {maskIban(selectedBank?.iban)}
                    </p>
                    <p className="text-[11px] font-bold text-[#001f8d] mt-1.5 lowercase">
                      {selectedBank?.banco_nome}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {banks.length > 0 ? (
            <button
              onClick={handleConfirmWithdraw}
              className="w-full h-11 bg-[#001f8d] text-white rounded-xl text-[14px] font-bold mt-10 active:scale-[0.98] transition-all shadow-lg shadow-blue-900/10 lowercase"
            >
              confirmar levantamento
            </button>
          ) : (
            <button
              onClick={() => navigate('/adicionar-banco')}
              className="w-full h-11 bg-[#001f8d] text-white rounded-xl text-[14px] font-bold mt-10 active:scale-[0.98] transition-all shadow-lg shadow-blue-900/10 lowercase"
            >
              vincular conta bancária
            </button>
          )}
        </div>

        <section className="mt-8 px-1 pb-10">
          <h4 className="text-red-500 font-black text-[13px] uppercase tracking-tighter mb-2 pl-0.5 lowercase">diretrizes de levantamento</h4>
          <div className="space-y-1.5 text-[10px] text-slate-400 leading-normal lowercase">
            <p>1. pedidos de levantamento são processados de <strong className="text-slate-500">segunda a sexta-feira</strong>.</p>
            <p>2. o tempo de processamento institucional é de até <strong className="text-slate-500">24 horas</strong> úteis.</p>
            <p>3. valor <strong className="text-slate-500">mínimo: 1.000 kz</strong> | <strong className="text-slate-500">máximo: 100.000 kz</strong> por operação.</p>
            <p>4. uma <strong className="text-slate-500">taxa administrativa de 14%</strong> é aplicada sobre o valor bruto solicitado.</p>
            <p className="bg-red-50/50 text-red-500 p-2 rounded-xl mt-2 border border-red-100/50">
              5. certifique-se de que o <strong className="text-red-700">iban e o nome do titular</strong> estão corretos para evitar falhas irreversíveis.
            </p>
          </div>
        </section>
      </main>

      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`fixed inset-0 m-auto w-fit h-fit min-w-[260px] ${feedback.type === 'error' ? 'bg-red-600/90' : 'bg-[#001f8d]/90'} backdrop-blur-sm text-white px-5 py-3 rounded-xl text-[12.5px] font-bold z-[500] text-center max-w-[85vw] whitespace-normal break-words shadow-2xl shadow-black/20`}
          >
            {feedback.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
