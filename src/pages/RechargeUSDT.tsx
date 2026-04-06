import { useState, useEffect } from 'react';
import { ChevronLeft, Copy, CheckCircle2, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useLoading } from '../contexts/LoadingContext';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const SUGGESTED_VALUES = [10, 20, 50, 100, 200, 500];

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
  const [supportLink, setSupportLink] = useState('https://wa.me/244943142132');

  useEffect(() => {
    const done = registerFetch();
    async function fetchData() {
      // 1. Buscar taxa de câmbio (USD -> AOA)
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
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (walletData) {
        setCompanyWallet(walletData);
      } else {
        setCompanyWallet({
          endereco_carteira: 'TMTfSjN6V4REo87NMTfSjN6V4REo87NMTf',
          network: 'TRC20'
        });
      }

      const { data: links } = await supabase
        .from('atendimento_links')
        .select('whatsapp_gerente_url')
        .single();
      if (links?.whatsapp_gerente_url) {
        setSupportLink(links.whatsapp_gerente_url);
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
    if (isNaN(val) || val < 10) {
      showNotification('o valor mínimo de depósito é 10 usdt');
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
        showNotification('depósito iniciado!');
      } else {
        showNotification(data?.message?.toLowerCase() || 'erro ao criar depósito');
      }
    } catch (err: any) {
      showNotification('erro técnico ao processar no servidor');
    } finally {
      hideLoading();
    }
  };

  const handleCopy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    showNotification('endereço copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  const amountKZ = (parseFloat(amountUSDT) || 0) * exchangeRate;
  const walletAddress = companyWallet?.endereco_carteira || '';

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F2F5] antialiased">
      {/* Header - Azul conforme solicitado */}
      <header className="bg-[#0000AA] flex items-center h-14 px-4 sticky top-0 z-50">
        <button 
          onClick={() => navigate(-1)} 
          className="text-white p-1"
          aria-label="voltar"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="flex-1 text-center text-white text-[16px] font-medium pr-8">recarregar usdt (trc20)</h1>
      </header>

      <main className="flex-1 p-5 max-w-lg mx-auto w-full">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Card de Taxa e Total (Minúsculas e Subtexto) */}
              <div className="bg-white rounded-xl p-5  border border-gray-100">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-900 font-bold text-[15px]">câmbio</span>
                  <span className="font-semibold text-gray-900 text-[15px]">1 usdt ≈ {exchangeRate.toLocaleString()} kz</span>
                </div>
                <p className="text-gray-400 text-[12px] mb-4">valor total de recarga</p>
                
                <div className="pt-4 border-t border-gray-50 flex justify-between items-end">
                  <div>
                    <p className="text-[24px] font-bold text-[#0000AA]">
                      {amountKZ.toLocaleString('pt-AO')} <span className="text-[14px] font-medium text-gray-400">kz</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Valores Sugeridos (Botões Azuis e Sem Símbolos) - Mais compactos */}
              <div>
                <p className="text-[13px] font-semibold text-gray-700 mb-3 ml-1">valores sugeridos</p>
                <div className="grid grid-cols-3 gap-3">
                  {SUGGESTED_VALUES.map((val) => (
                    <button
                      key={val}
                      onClick={() => setAmountUSDT(val.toString())}
                      className={`h-8 rounded-lg transition-all text-[13px] font-medium ${
                        parseFloat(amountUSDT) === val
                          ? 'bg-[#0000AA] text-white '
                          : 'bg-[#0000AA] text-white opacity-90 active:opacity-100'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Campo de Entrada (Underline Azul e Sempre Visível) */}
              <div className="px-1 py-1">
                <div className="relative border-b-2 border-[#0000AA] transition-all">
                  <input
                    type="number"
                    inputMode="decimal"
                    value={amountUSDT}
                    onChange={(e) => setAmountUSDT(e.target.value)}
                    className="w-full text-[20px] font-medium text-gray-900 bg-transparent border-none p-2 focus:ring-0 placeholder:text-gray-300 placeholder:text-[14px]"
                    placeholder="por favor insira o valor do depósito"
                  />
                </div>
              </div>

              <button
                onClick={handleCreateDeposit}
                className="w-full h-[54px] bg-[#0000AA] text-white rounded-xl text-[15px] font-normal transition-all active:scale-[0.98]"
              >
                continuar
              </button>

              {/* Bloco de Instruções (Vermelho e Minúsculas) */}
              <div className="p-2">
                <p className="text-red-500 font-bold text-[14px] mb-3">siga os passos abaixo</p>
                <ul className="space-y-3 text-[13px] text-gray-600 leading-relaxed">
                  <li className="flex gap-2">
                    <span className="shrink-0">•</span>
                    <span>o valor mínimo de depósito é de 10 usdt e o máximo é de 1.090 usdt.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="shrink-0">•</span>
                    <span>certifique-se de usar exclusivamente a rede trc20 para o envio.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="shrink-0">•</span>
                    <span>copie o endereço da carteira na próxima etapa e complete o envio através da sua corretora.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="shrink-0">•</span>
                    <span>após concluir o envio, envie o comprovante via whatsapp para agilizar o crédito.</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-5"
            >
              <div className="bg-white rounded-xl p-6  border border-gray-100 flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-5">
                  <CheckCircle2 className="w-8 h-8 text-[#0000AA]" />
                </div>
                <h2 className="text-[17px] font-bold text-gray-900 mb-2">detalhes de depósito usdt</h2>
                <p className="text-[13px] text-gray-500 mb-8 px-4">envie exatamente <span className="font-bold text-gray-900">{amountUSDT} usdt</span> para o endereço abaixo:</p>

                <div className="w-full space-y-4 text-left mb-6">
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 relative group">
                    <p className="text-[11px] text-gray-400 font-bold mb-2 uppercase tracking-widest">endereço para cópia</p>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[13px] font-mono font-bold text-gray-800 break-all leading-tight">
                        {walletAddress}
                      </span>
                      <button 
                        onClick={() => handleCopy(walletAddress)}
                        className="p-3 bg-white border border-gray-200 text-[#0000AA] rounded-xl  active:scale-95 transition-all"
                        aria-label="copiar endereço"
                      >
                        <Copy className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-1 bg-gray-50 rounded-xl p-4 border border-gray-100 text-center">
                      <p className="text-[10px] text-gray-400 font-bold mb-1 uppercase">rede</p>
                      <p className="text-[14px] font-bold text-gray-900">usttrc</p>
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-xl p-4 border border-gray-100 text-center">
                      <p className="text-[10px] text-gray-400 font-bold mb-1 uppercase">valor</p>
                      <p className="text-[14px] font-bold text-gray-900">{amountUSDT} usdt</p>
                    </div>
                  </div>
                </div>

                <div className="w-full space-y-3">
                  <a
                    href={`${supportLink}?text=olá, acabei de fazer um depósito de ${amountUSDT} usdt. segue meu comprovante.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full h-12 bg-green-600 text-white rounded-xl font-medium  transition-all active:scale-[0.98]"
                  >
                    <MessageSquare className="w-5 h-5" />
                    enviar comprovante (whatsapp)
                  </a>
                  
                  <button
                    onClick={() => navigate('/detalhes')}
                    className="w-full h-12 bg-white border border-gray-200 text-gray-600 rounded-xl font-medium transition-all text-[14px]"
                  >
                    ver histórico de recargas
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-xl text-[13px]  z-[100] whitespace-nowrap font-medium"
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


