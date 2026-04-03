import { useState, useEffect, ChangeEvent } from 'react';
import { ChevronLeft, Gift, ArrowRightLeft, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useLoading } from '../contexts/LoadingContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

type Mode = null | 'gift' | 'transfer';

export default function FundTransfer() {
  const navigate = useNavigate();
  const { showLoading, hideLoading, registerFetch } = useLoading();
  const { user } = useAuth();
  const [mode, setMode] = useState<Mode>(null);
  const [code, setCode] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [balanceCorrete, setBalanceCorrete] = useState(0);
  const [feedback, setFeedback] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  useEffect(() => {
    if (!user) return;
    async function fetchBalance() {
      const done = registerFetch();
      try {
        const { data } = await supabase
          .from('tarefas_diarias')
          .select('balance_correte')
          .eq('user_id', user.id);
        
        if (data) {
          const total = data.reduce((s, t) => s + Number(t.balance_correte || 0), 0);
          setBalanceCorrete(total);
        }
      } finally {
        done();
      }
    }
    fetchBalance();
  }, [user, registerFetch]);

  const showToast = (message: string, type: 'error' | 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3500);
  };

  // --- RESGATAR CÓDIGO DE PRESENTE ---
  const handleRedeemCode = async () => {
    if (!code) { showToast('por favor, insira o seu código', 'error'); return; }
    showLoading();
    try {
      const { data, error } = await supabase.rpc('redeem_gift_code', { p_code: code });
      if (error) throw error;
      if (data.success) {
        showToast(data.message.toLowerCase(), 'success');
        setCode('');
      } else {
        showToast(data.message.toLowerCase(), 'error');
      }
    } catch {
      showToast('erro ao processar o código. tente novamente.', 'error');
    } finally {
      hideLoading();
    }
  };

  // --- TRANSFERIR CONTA DE REPRODUÇÃO → BALANCE ---
  const handleTransfer = async () => {
    const amount = parsedAmount;
    if (isNaN(amount) || amount <= 0) {
      showToast('por favor, insira um valor válido', 'error'); return;
    }
    if (amount < 100) {
      showToast('valor mínimo para transferência é 100 Kz', 'error'); return;
    }
    if (amount > 30000) {
      showToast('valor máximo para transferência é 30.000 Kz', 'error'); return;
    }
    if (amount > balanceCorrete) {
      showToast('saldo insuficiente na conta de reprodução', 'error'); return;
    }
    showLoading();
    try {
      const { data, error } = await supabase.rpc('transfer_reproducao_to_balance', { p_amount: amount });
      if (error) throw error;
      if (data.success) {
        showToast(`${fmt(data.amount)} Kz transferidos com sucesso!`, 'success');
        setBalanceCorrete(prev => prev - amount);
        setAmountInput('');
      } else {
        showToast(data.message.toLowerCase(), 'error');
      }
    } catch {
      showToast('erro ao transferir. tente novamente.', 'error');
    } finally {
      hideLoading();
    }
  };

  const fmt = (val: number) => val.toLocaleString('pt-AO', { minimumFractionDigits: 2 });

  // Formatar input de valor ao digitar (trata como centavos para entrada fluida)
  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) { setAmountInput(''); return; }
    const num = parseInt(raw, 10) / 100;
    setAmountInput(num.toLocaleString('pt-AO', { minimumFractionDigits: 2 }));
  };

  // Parsing robusto: remove espaços (non-breaking e normais), pontos de milhar pt-AO
  const parseAmount = (str: string): number => {
    if (!str) return 0;
    const cleaned = str
      .replace(/[\s\u00A0\u202F]/g, '') // espaços e non-breaking spaces
      .replace(/\./g, '')               // pontos de milhar
      .replace(',', '.');               // vírgula decimal → ponto
    return parseFloat(cleaned) || 0;
  };

  const parsedAmount = parseAmount(amountInput);

  return (
    <div className="flex flex-col min-h-screen bg-[#e9ecf3] antialiased page-content">
      {/* Header */}
      <header className="flex items-center px-4 h-12 bg-[#000080] sticky top-0 z-50">
        <button onClick={() => navigate(-1)} className="flex-none" title="voltar" aria-label="voltar">
          <ChevronLeft className="h-6 w-6 text-white" />
        </button>
        <div className="flex-grow text-center">
          <h1 className="text-white text-[15px] font-bold pr-6">
            {mode === 'gift' ? 'código de presentes' : mode === 'transfer' ? 'conta de reprodução' : 'trocar saldo'}
          </h1>
        </div>
        {mode !== null && (
          <button onClick={() => setMode(null)} className="flex-none text-white text-[11px] font-bold opacity-70">
            voltar
          </button>
        )}
      </header>

      <main className="flex-grow p-4">

        {/* ── MODO: CÓDIGO DE PRESENTE ── */}
        {mode === 'gift' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <section className="mb-4">
              <div className="bg-[#f5d7a1] rounded-[24px] border border-[#cfb586] p-8 flex flex-col items-center text-center">
                <div className="bg-black w-14 h-14 rounded-full flex items-center justify-center shadow-lg mb-3">
                  <Gift className="h-7 w-7 text-white" />
                </div>
                <h2 className="text-[18px] font-black text-black lowercase leading-tight mb-1">resgatar código de presente</h2>
                <p className="text-[11px] text-gray-700 font-medium lowercase">insira o seu código de convite ou código de presente</p>
              </div>
            </section>
            <section>
              <div className="bg-white rounded-[24px] shadow-[0_4px_25px_rgba(0,0,0,0.06)] p-8">
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
                <button
                  onClick={handleRedeemCode}
                  className="w-full h-[45px] bg-[#000080] text-white rounded-full text-[15px] font-black shadow-lg active:scale-[0.98] transition-all lowercase"
                >
                  resgatar código
                </button>
              </div>
            </section>
          </motion.div>
        )}

        {/* ── MODO: CONTA DE REPRODUÇÃO → BALANCE ── */}
        {mode === 'transfer' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Saldo disponível */}
            <section className="mb-4">
              <div className="bg-gradient-to-br from-[#0000AA] to-[#0000CC] rounded-[24px] p-6 flex flex-col items-center text-center text-white">
                <div className="bg-white/20 w-14 h-14 rounded-full flex items-center justify-center mb-3">
                  <ArrowRightLeft className="h-7 w-7 text-white" />
                </div>
                <p className="text-[11px] opacity-70 mb-1">saldo disponível</p>
                <p className="text-[28px] font-black">{fmt(balanceCorrete)} Kz</p>
                <p className="text-[10px] opacity-50 mt-1">conta de reprodução</p>
              </div>
            </section>

            {/* Formulário de transferência */}
            <section>
              <div className="bg-white rounded-[24px] shadow-[0_4px_25px_rgba(0,0,0,0.06)] p-6">
                <label className="block text-gray-400 text-[12px] mb-2 font-bold lowercase">valor a transferir</label>
                <div className="border-b-2 border-[#e2e8f0] py-3 focus-within:border-[#000080] transition-colors mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-[15px] font-bold">Kz</span>
                    <input
                      className="flex-1 border-none focus:ring-0 p-0 text-gray-800 bg-transparent text-[22px] font-black outline-none placeholder:text-gray-200 placeholder:font-normal placeholder:text-[16px]"
                      placeholder="0,00"
                      type="text"
                      inputMode="numeric"
                      value={amountInput}
                      onChange={handleAmountChange}
                    />
                  </div>
                </div>

                {/* Limites */}
                <div className="flex justify-between text-[10px] text-gray-400 mb-5">
                  <span>mínimo: <strong className="text-gray-600">100,00 Kz</strong></span>
                  <span>máximo: <strong className="text-gray-600">30.000,00 Kz</strong></span>
                </div>

                {/* Atalhos rápidos */}
                <div className="grid grid-cols-4 gap-2 mb-6">
                  {[500, 1000, 5000, 30000].map(v => (
                    <button
                      key={v}
                      onClick={() => setAmountInput(v.toLocaleString('pt-AO', { minimumFractionDigits: 2 }))}
                      className="bg-[#0000AA]/8 border border-[#0000AA]/20 rounded-lg py-2 text-[10px] font-bold text-[#000080]"
                    >
                      {v.toLocaleString('pt-AO')}
                    </button>
                  ))}
                </div>

                <p className="text-[11px] text-gray-400 text-center mb-5">
                  o valor será transferido da sua <strong>conta de reprodução</strong> para o seu <strong>saldo principal</strong>
                </p>

                <button
                  onClick={handleTransfer}
                  disabled={parsedAmount < 100 || parsedAmount > 30000 || parsedAmount > balanceCorrete}
                  className={`w-full h-[45px] rounded-full text-[15px] font-black transition-all lowercase shadow-lg
                    ${parsedAmount >= 100 && parsedAmount <= 30000 && parsedAmount <= balanceCorrete
                      ? 'bg-[#000080] text-white active:scale-[0.98]'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                >
                  confirmar transferência
                </button>
              </div>
            </section>
          </motion.div>
        )}

        {/* ── POPUP DE SELEÇÃO ── */}
        {mode === null && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-end bg-black/60 backdrop-blur-sm"
            >
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                className="bg-white w-full rounded-t-[2rem] px-5 pt-4 pb-10"
              >
                {/* Pill */}
                <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-6" />

                <h2 className="text-[16px] font-black text-gray-800 text-center mb-6 lowercase">
                  selecione o método
                </h2>

                <div className="flex flex-col gap-2 mb-8">
                  {/* Opção 1: Conversão Reprodução (Radio à direita) */}
                  <button
                    onClick={() => {
                      showLoading();
                      setTimeout(() => { hideLoading(); setMode('transfer'); }, 300);
                    }}
                    className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50 active:bg-gray-100 transition-all group"
                  >
                    <span className="text-[14px] font-bold text-gray-800 lowercase">conversão reprodução</span>
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center group-active:border-[#0000AA] group-active:bg-[#0000AA] transition-colors">
                      <svg className="w-3 h-3 text-white opacity-0 group-active:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </button>

                  {/* Opção 2: Resgate de Presente (Radio à direita) */}
                  <button
                    onClick={() => {
                      showLoading();
                      setTimeout(() => { hideLoading(); setMode('gift'); }, 300);
                    }}
                    className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50 active:bg-gray-100 transition-all group"
                  >
                    <span className="text-[14px] font-bold text-gray-800 lowercase">resgate de presente</span>
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center group-active:border-[#0000AA] group-active:bg-[#0000AA] transition-colors">
                      <svg className="w-3 h-3 text-white opacity-0 group-active:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </button>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={() => navigate(-1)}
                    className="flex flex-col items-center justify-center text-gray-400 active:scale-95 transition-transform"
                  >
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-1">
                      <svg className="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <span className="text-[11px] font-bold lowercase">cancelar</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* Toast */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: '-50%', y: '-10%' }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: '-50%', y: '-10%' }}
            className={`fixed inset-0 m-auto w-fit h-fit min-w-[260px] ${feedback.type === 'error' ? 'bg-red-600/80' : 'bg-black/50'} backdrop-blur-sm text-white px-5 py-3 rounded-2xl text-[12.5px] shadow-xl z-[500] text-center max-w-[85vw] whitespace-normal break-words`}
          >
            {feedback.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
