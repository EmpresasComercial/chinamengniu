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

  const handleRedeemCode = async () => {
    if (!code) { showToast('Por favor, introduza o seu código promocional.', 'error'); return; }
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
      showToast('Erro ao processar o código. Por favor, tente novamente.', 'error');
    } finally {
      hideLoading();
    }
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
      showToast('Saldo de extração insuficiente para esta operação.', 'error'); return;
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
    } catch {
      showToast('Falha na transferência de fundos. Tente novamente.', 'error');
    } finally {
      hideLoading();
    }
  };

  const fmt = (val: number) => val.toLocaleString('pt-AO', { minimumFractionDigits: 0 });

  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setAmountInput(raw);
  };

  const parsedAmount = Number(amountInput) || 0;

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F7FA] antialiased page-content">
      {/* Header Clássico Azul (#000080) */}
      <header className="flex items-center px-4 h-12 bg-[#000080] sticky top-0 z-50">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2" title="voltar" aria-label="voltar">
          <ChevronLeft className="h-5 w-5 text-white" />
        </button>
        <div className="flex-grow text-center">
          <h1 className="text-white text-[14px] font-bold pr-8">
            {mode === 'gift' ? 'Resgate de Recompensa' : mode === 'transfer' ? 'Conversão de Ativos' : 'Converter Ativos'}
          </h1>
        </div>
      </header>

      <main className="flex-grow p-4">

        {/* ── MODO: CÓDIGO DE PRESENTE ── */}
        {mode === 'gift' && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl p-5 border border-slate-50">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="bg-[#000080]/5 w-11 h-11 rounded-xl flex items-center justify-center mb-2">
                <Gift className="h-5 w-5 text-[#000080]" />
              </div>
              <h2 className="text-[16px] font-black text-[#000080]">Resgatar Recompensa</h2>
            </div>

            <div className="mb-6">
              <div className="border-b-2 border-[#000080] py-1.5 transition-colors">
                <input
                  className="w-full border-none focus:ring-0 p-0 text-slate-800 bg-transparent text-[15px] outline-none placeholder:text-slate-200"
                  id="gift-code"
                  placeholder="Introduza o código da recompensa"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                />
              </div>
            </div>

            <button
              onClick={handleRedeemCode}
              className="w-full h-10 bg-[#000080] text-white rounded-xl text-[13px] font-bold active:scale-[0.98] transition-all"
            >
              Confirmar Resgate
            </button>
          </motion.div>
        )}

        {/* ── MODO: CONVERSÃO DE EXTRAÇÃO → BALANCE ── */}
        {mode === 'transfer' && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
            {/* Seção Estatística Compacta */}
            <div className="bg-white rounded-xl p-4 mb-4 flex justify-between items-center">
              <div className="text-center flex-1">
                <p className="text-[9px] text-slate-400 font-bold mb-0.5 uppercase tracking-wider">Saldo de Extração</p>
                <p className="text-[16px] font-black text-[#000080]">{fmt(balanceCorrete)} Kz</p>
              </div>
              <div className="w-10 h-10 bg-[#000080] rounded-xl flex items-center justify-center shrink-0 mx-2">
                <ArrowRightLeft className="w-5 h-5 text-white" />
              </div>
              <div className="text-center flex-1">
                <p className="text-[9px] text-slate-400 font-bold mb-0.5 uppercase tracking-wider">Saldo Principal Projetado</p>
                <p className="text-[16px] font-black text-green-600">{(balanceMain + parsedAmount).toLocaleString('pt-AO')} Kz</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5">
              {/* Atalhos Rápidos (Compactos e Azuis) */}
              <div className="flex justify-between gap-1 mb-8">
                {[1000, 5000, 10000, 50000].map(v => (
                  <button
                    key={v}
                    onClick={() => setAmountInput(String(v))}
                    className="flex-1 bg-[#000080] text-white rounded-md h-[24px] text-[9.5px] font-normal hover:bg-[#0000AA] active:scale-95 transition-all"
                  >
                    {v.toLocaleString('pt-AO')}
                  </button>
                ))}
              </div>

              {/* Input Underline Azul e Alinhado à Esquerda */}
              <div className="flex flex-col mb-8">
                <div className="border-b-2 border-[#000080] w-full pb-1 focus-within:border-blue-400 transition-colors">
                  <input
                    className="w-full border-none focus:ring-0 p-0 text-slate-800 bg-transparent text-[18px] outline-none text-left placeholder:text-slate-200"
                    placeholder="Introduza o montante a converter"
                    type="text"
                    inputMode="numeric"
                    value={amountInput}
                    onChange={handleAmountChange}
                  />
                </div>
              </div>

              <button
                onClick={handleTransfer}
                disabled={parsedAmount < 1000 || parsedAmount > 100000 || parsedAmount > balanceCorrete}
                className={`w-full h-11 rounded-xl text-[14px] font-bold transition-all
                  ${parsedAmount >= 1000 && parsedAmount <= 100000 && parsedAmount <= balanceCorrete
                    ? 'bg-[#000080] text-white active:scale-[0.98]'
                    : 'bg-slate-50 text-slate-300 cursor-not-allowed border border-slate-100'}`}
              >
                Confirmar Conversão
              </button>
            </div>

            {/* Instruções Detalhas (Flat e Compactas) */}
            <section className="mt-5 px-1 pb-10">
              <h4 className="text-red-500 font-bold text-[13px] uppercase tracking-tighter mb-2 pl-0.5">Diretrizes de Conversão</h4>
              <div className="space-y-1.5 text-[10px] text-slate-400 leading-normal lowercase">
                <p>1. as conversões ocorrem apenas de <strong className="text-slate-500">segunda a sexta-feira</strong>, das <strong className="text-slate-500">10:00 às 22:00</strong>.</p>
                <p>2. valor <strong className="text-slate-500">mínimo</strong> de <strong className="text-slate-500">1.000 kz</strong> e <strong className="text-slate-500">máximo</strong> de <strong className="text-slate-500">100.000 kz</strong>.</p>
                <p>3. certifique-se de possuir saldo suficiente.</p>
                <p>4. só é permitida uma conversão diária por usuário.</p>
                <p className="bg-red-50/50 text-red-400 p-2 rounded-xl mt-2">5. evite tentativas sem saldo para evitar o <strong className="text-red-600">bloqueio ou banimento</strong> da sua conta.</p>
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
                className="bg-white w-full rounded-t-xl px-5 pt-4 pb-10"
              >
                {/* Pill */}
                <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-6" />

                <h2 className="text-[16px] font-black text-gray-800 text-center mb-6">
                  Selecione o Método
                </h2>

                <div className="flex flex-col gap-2 mb-8">
                  {/* Opção 1: Conversão Extração (Radio à direita) */}
                  <button
                    onClick={() => {
                      showLoading();
                      setTimeout(() => { hideLoading(); setMode('transfer'); }, 300);
                    }}
                    className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50 active:bg-gray-100 transition-all group"
                  >
                    <span className="text-[14px] font-bold text-gray-800">Conversão de Extração</span>
                    <div className="w-5 h-5 rounded-xl border-2 border-gray-300 flex items-center justify-center group-active:border-[#0000AA] group-active:bg-[#0000AA] transition-colors">
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
                    <span className="text-[14px] font-bold text-gray-800">Resgate de Recompensa</span>
                    <div className="w-5 h-5 rounded-xl border-2 border-gray-300 flex items-center justify-center group-active:border-[#0000AA] group-active:bg-[#0000AA] transition-colors">
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
                    <span className="text-[11px] font-bold">Fechar Operação</span>
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
            className={`fixed inset-0 m-auto w-fit h-fit min-w-[260px] ${feedback.type === 'error' ? 'bg-red-600/80' : 'bg-black/50'} backdrop-blur-sm text-white px-5 py-3 rounded-xl text-[12.5px]  z-[500] text-center max-w-[85vw] whitespace-normal break-words`}
          >
            {feedback.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
