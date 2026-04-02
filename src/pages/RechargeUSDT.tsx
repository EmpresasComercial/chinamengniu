import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, Info, Copy, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useLoading } from '../contexts/LoadingContext';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';




export default function RechargeUSDT() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showLoading, hideLoading, registerFetch } = useLoading();
  
  const [amountUSDT, setAmountUSDT] = useState('');
  const [exchangeRate, setExchangeRate] = useState(900); // Taxa padrão fallback
  const [companyWallet, setCompanyWallet] = useState<any>(null);
  const [step, setStep] = useState(1); // 1: Input, 2: Payment Details
  const [notification, setNotification] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loadingRate, setLoadingRate] = useState(true);

  useEffect(() => {
    const done = registerFetch();
    async function fetchData() {
      // 1. Buscar taxa de câmbio em tempo real (USD -> AOA)
      try {
        const response = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await response.json();
        if (data && data.rates && data.rates.AOA) {
          setExchangeRate(Math.ceil(data.rates.AOA));
        }
      } catch (err) {
        console.error('Erro ao buscar taxa de câmbio:', err);
      } finally {
        setLoadingRate(false);
      }

      // 2. Buscar carteira USDT ativa
      const { data: walletData } = await supabase
        .from('usdt_empresarial')
        .select('*')
        .eq('ativo', true)
        .single();
      
      if (walletData) {
        setCompanyWallet(walletData);
      }
    }
    fetchData().finally(() => done());
  }, []);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCreateDeposit = async () => {
    const val = parseFloat(amountUSDT);
    if (isNaN(val) || val < 4 || val > 1090) {
      showNotification('Mínimo 4 USDT, Máximo 1090 USDT');
      return;
    }

    // Validate wallet address availability before proceeding
    if (!companyWallet?.endereco_carteira) {
      showNotification('Endereço de pagamento em USDT indisponível.');
      return;
    }

    showLoading();
    try {
      const { data, error } = await supabase.rpc('create_usdt_deposit', {
        p_amount_usdt: val,
        p_exchange_rate: exchangeRate
      });

      if (error) throw error;

      if (data && data.success) {
        setStep(2);
        showNotification('Depósito iniciado!');
      } else {
        showNotification(data?.message || 'Erro ao criar depósito');
      }
    } catch (err: any) {
      showNotification(err.message || 'Erro técnico');
    } finally {
      hideLoading();
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    showNotification('Copiado para a área de transferência');
    setTimeout(() => setCopied(false), 2000);
  };

  const amountKZ = (parseFloat(amountUSDT) || 0) * exchangeRate;

  // QR Code URL — built from backend data, not from user input
  const walletAddress = companyWallet?.endereco_carteira || '';


  return (
    <div className="flex flex-col min-h-screen bg-[#F0F2F5] antialiased page-content">
      {/* Header */}
      <header className="bg-[#0000AA] flex items-center h-12 px-4 sticky top-0 z-50">
        <button onClick={() => navigate(-1)} className="text-white">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="flex-1 text-center text-white text-[15px] font-bold pr-5">Recarga USDT (TRC20)</h1>
      </header>

      <main className="p-4 space-y-4">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.section
              key="step1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="bg-white rounded-3xl p-6 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-6 p-3 bg-blue-50 rounded-xl border border-blue-100 italic">
                <Info className="w-5 h-5 text-blue-600 shrink-0" />
                <p className="text-[12.5px] text-blue-800">
                  {loadingRate ? 'Atualizando taxa de câmbio...' : 'Deposite USDT de forma rápida com conversão em tempo real.'}
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-[12.5px] font-bold text-gray-700 mb-2 uppercase tracking-wider">Quantia em USDT</label>
                <div className="relative flex items-center group">
                  <input
                    type="number"
                    inputMode="decimal"
                    value={amountUSDT}
                    onChange={(e) => setAmountUSDT(e.target.value)}
                    className="w-full bg-transparent border-0 border-b-2 border-gray-200 h-[50px] px-0 font-bold text-[24px] focus:border-[#0000AA] outline-none transition-all placeholder:text-gray-200"
                    placeholder="0.00"
                  />
                  <span className="ml-2 font-black text-gray-300 text-[18px] select-none">USDT</span>
                  <div className="absolute bottom-0 left-0 h-[2px] bg-[#0000AA] w-0 group-focus-within:w-full transition-all duration-300" />
                </div>
                <div className="mt-3 flex justify-between text-[11px] text-gray-400 font-bold italic">
                  <span>Mín: 4.00 USDT</span>
                  <span>Máx: 1,090.00 USDT</span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 mb-8 border border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[12.5px] text-gray-500 font-medium">Taxa de câmbio</span>
                  <span className="text-[12.5px] font-bold">1 USDT = {exchangeRate} Kz</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-[12.5px] text-gray-900 font-bold">Total a receber</span>
                  <span className="text-[18px] font-black text-[#0000AA]">
                    {amountKZ.toLocaleString('pt-AO')} Kz
                  </span>
                </div>
              </div>

              <button
                onClick={handleCreateDeposit}
                className="w-full h-[50px] bg-[#0000AA] text-white rounded-xl font-bold text-[15px] shadow-lg active:scale-[0.98] transition-all"
              >
                Continuar
              </button>
            </motion.section>
          ) : (
            <motion.section
              key="step2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.1 }}
              className="space-y-4"
            >
              <div className="bg-white rounded-3xl p-6 shadow-sm flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-[15px] font-black text-gray-900 mb-1">Depósito Solicitado!</h2>
                <p className="text-[12px] text-gray-500 mb-6 font-medium">Envie o valor exato para o endereço abaixo.</p>

                <div className="w-full space-y-4 text-left">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-[11px] text-gray-400 font-bold uppercase mb-1">Endereço USDT (TRC20)</p>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[13px] font-mono font-bold text-gray-800 break-all">
                        {walletAddress}
                      </span>
                      <button 
                        onClick={() => handleCopy(walletAddress)}
                        className="p-2 bg-black text-white rounded-lg shrink-0 active:scale-90 transition-transform"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex justify-between items-center">
                    <div>
                      <p className="text-[11px] text-gray-400 font-bold uppercase mb-1">Rede</p>
                      <span className="text-[14px] font-bold text-gray-800">{companyWallet?.network || 'TRC20'}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-gray-400 font-bold uppercase mb-1">Quantia</p>
                      <span className="text-[14px] font-bold text-gray-800">{amountUSDT} USDT</span>
                    </div>
                  </div>


                </div>

                <div className="mt-8 italic text-[11px] text-red-500 font-medium">
                  * Aviso: Envie apenas USDT via rede TRC20. O uso de outras redes resultará em perda permanente dos fundos.
                </div>

                <button
                  onClick={() => navigate('/detalhes')}
                  className="w-full h-[50px] bg-black text-white rounded-xl font-bold text-[15px] mt-6 shadow-lg"
                >
                  Ver Histórico
                </button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-[14px] font-bold text-gray-900 mb-4">Como depositar?</h3>
          <ul className="space-y-3 text-[12.5px] text-gray-600 font-medium">
            <li className="flex gap-2">
              <span className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-[10px] shrink-0">1</span>
              <span>Digite a quantia desejada em USDT (mínimo 4 USDT).</span>
            </li>
            <li className="flex gap-2">
              <span className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-[10px] shrink-0">2</span>
              <span>Escaneie o QR Code ou copie o endereço da carteira TRC20 exibido.</span>
            </li>
            <li className="flex gap-2">
              <span className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-[10px] shrink-0">3</span>
              <span>Faça o envio a partir da sua Binance, Trust Wallet ou similar.</span>
            </li>
            <li className="flex gap-2">
              <span className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-[10px] shrink-0">4</span>
              <span>O sistema detectará automaticamente ou o suporte revisará em instantes.</span>
            </li>
          </ul>
        </section>
      </main>

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, x: '-50%', y: '-50%' }}
            animate={{ opacity: 1, x: '-50%', y: '-50%' }}
            exit={{ opacity: 0, x: '-50%', y: '-50%' }}
            transition={{ duration: 0.1 }}
            className="fixed top-1/2 left-1/2 bg-black/80 backdrop-blur-md text-white px-8 py-4 rounded-2xl text-[13px] font-bold shadow-2xl z-[100] text-center min-w-[280px] border border-white/10"
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
