import { useState, useEffect } from 'react';
import { ChevronLeft, Gift, ArrowRightLeft, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useLoading } from '../contexts/LoadingContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

type Mode = null | 'gift' | 'transfer';

export default function FundTransfer() {
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();
  const { user } = useAuth();
  const [mode, setMode] = useState<Mode>(null);
  const [code, setCode] = useState('');
  const [balanceCorrete, setBalanceCorrete] = useState(0);
  const [feedback, setFeedback] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('tarefas_diarias')
      .select('balance_correte')
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (data) {
          const total = data.reduce((s, t) => s + Number(t.balance_correte || 0), 0);
          setBalanceCorrete(total);
        }
      });
  }, [user]);

  const showToast = (message: string, type: 'error' | 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3000);
  };

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

  const handleTransferReproducao = async () => {
    showLoading();
    try {
      const { data, error } = await supabase.rpc('transfer_reproducao_to_balance');
      if (error) throw error;
      if (data.success) {
        showToast(`transferido ${Number(data.amount).toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz com sucesso!`, 'success');
        setBalanceCorrete(0);
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

  return (
    <div className="flex flex-col min-h-screen bg-[#e9ecf3] antialiased page-content">
      {/* Header */}
      <header className="flex items-center px-4 h-12 bg-[#000080] sticky top-0 z-50">
        <button onClick={() => navigate(-1)} className="flex-none">
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

        {/* MODO: CÓDIGO DE PRESENTE */}
        {mode === 'gift' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <section className="mb-4">
              <div className="bg-[#f5d7a1] rounded-[24px] border border-[#cfb586] p-8 flex flex-col items-center justify-center text-center">
                <div className="bg-black w-12 h-12 rounded-full flex items-center justify-center shadow-lg mb-3">
                  <Gift className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-[18px] font-black text-black lowercase leading-tight mb-1">resgatar código de presente</h2>
                <p className="text-[11px] text-gray-700 font-medium lowercase">insira o seu código de convite ou código de presente</p>
              </div>
            </section>
            <section>
              <div className="bg-white rounded-[24px] shadow-[0_4px_25px_rgba(0,0,0,0.06)] p-8">
                <div className="mb-8">
                  <label className="block text-gray-400 text-[12.5px] mb-3 lowercase font-bold" htmlFor="gift-code">informe o seu código</label>
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

        {/* MODO: CONTA DE REPRODUÇÃO → BALANCE */}
        {mode === 'transfer' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <section className="mb-4">
              <div className="bg-gradient-to-br from-[#0000AA] to-[#0000CC] rounded-[24px] p-8 flex flex-col items-center text-center text-white">
                <div className="bg-white/20 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                  <ArrowRightLeft className="h-7 w-7 text-white" />
                </div>
                <p className="text-[12px] opacity-70 mb-1">saldo disponível para transferir</p>
                <p className="text-[32px] font-black">{fmt(balanceCorrete)} Kz</p>
                <p className="text-[10px] opacity-60 mt-1">conta de reprodução → saldo principal</p>
              </div>
            </section>
            <section>
              <div className="bg-white rounded-[24px] shadow-[0_4px_25px_rgba(0,0,0,0.06)] p-8">
                <div className="mb-6 text-center">
                  <p className="text-[12.5px] text-gray-500 font-medium">ao confirmar, o valor da sua <strong>conta de reprodução</strong> será transferido integralmente para o seu <strong>saldo principal</strong>.</p>
                </div>
                <button
                  onClick={handleTransferReproducao}
                  disabled={balanceCorrete <= 0}
                  className={`w-full h-[45px] rounded-full text-[15px] font-black shadow-lg transition-all lowercase ${balanceCorrete > 0 ? 'bg-[#000080] text-white active:scale-[0.98]' : 'bg-gray-300 text-gray-400 cursor-not-allowed'}`}
                >
                  {balanceCorrete > 0 ? 'confirmar transferência' : 'saldo insuficiente'}
                </button>
              </div>
            </section>
          </motion.div>
        )}

        {/* POPUP DE SELEÇÃO (modo === null) */}
        {mode === null && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
            >
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="bg-white w-full max-w-md rounded-t-[2rem] p-6 pb-10"
              >
                <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-6"></div>
                <h2 className="text-[15px] font-black text-[#000080] text-center mb-1">selecionar método</h2>
                <p className="text-[11px] text-gray-400 text-center mb-6">escolha o que deseja fazer</p>

                <div className="space-y-3">
                  <button
                    onClick={() => setMode('transfer')}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-[#0000AA]/20 bg-[#0000AA]/5 active:bg-[#0000AA]/10 transition-all"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#0000AA] flex items-center justify-center flex-shrink-0">
                      <Wallet className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-[15px] font-black text-[#000080]">conta de reprodução</p>
                      <p className="text-[11px] text-gray-500">transferir saldo reprodução → carteira</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setMode('gift')}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-[#000]/10 bg-[#f5d7a1]/30 active:bg-[#f5d7a1]/50 transition-all"
                  >
                    <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                      <Gift className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-[15px] font-black text-black">código de presentes</p>
                      <p className="text-[11px] text-gray-500">resgatar código de convite ou presente</p>
                    </div>
                  </button>
                </div>

                <button onClick={() => navigate(-1)} className="w-full mt-4 h-[45px] rounded-full text-[12.5px] font-bold text-gray-400">
                  cancelar
                </button>
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
