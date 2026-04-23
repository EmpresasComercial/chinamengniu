import React, { useState, useEffect } from 'react';
import { ChevronLeft, Copy, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useLoading } from '../contexts/LoadingContext';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function RechargeUSDT() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showLoading, hideLoading, registerFetch } = useLoading();

  const [notification, setNotification] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [hasSent, setHasSent] = useState(false);
  
  const exchangeRate = 1100; // Câmbio fixado
  const [companyWallet, setCompanyWallet] = useState<any>(null);

  useEffect(() => {
    const done = registerFetch();
    async function fetchData() {
      // Buscar carteira USDT ativa
      const { data: walletData } = await supabase
        .rpc('get_company_usdt')
        .maybeSingle();
      
      if (walletData) {
        setCompanyWallet(walletData);
      } else {
        setCompanyWallet({
          endereco_carteira: 'TMTfSjN6V4REo87NMTfSjN6V4REo87NMTf',
          network: 'TRC20'
        });
      }
    }
    fetchData().finally(() => done());
  }, []);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCopy = (text: string, fieldName: string) => {
    const lowerFieldName = fieldName.toLowerCase();
    
    // Regras idênticas ao banco (só permite copiar após preencher/enviar)
    if (lowerFieldName === 'endereço da carteira') {
      if (!depositAmount || parseFloat(depositAmount) <= 0) {
        showNotification('por favor, digite o valor e clique em enviar antes de copiar o endereço.');
        return;
      }
      if (!hasSent) {
        showNotification('por favor, clique em enviar antes de copiar o endereço.');
        return;
      }
    }

    navigator.clipboard.writeText(text);
    showNotification(`${lowerFieldName} copiado`);
  };

  const handleConfirm = async () => {
    if (!user) return;
    
    showLoading();

    try {
      const { data, error } = await supabase.rpc('create_usdt_deposit', {
        p_amount_usdt: parseFloat(depositAmount) || 0,
        p_exchange_rate: exchangeRate
      });

      if (error) {
        showNotification(error.message);
      } else if (data && data.success) {
        setHasSent(true);
        showNotification(data.message || 'depósito solicitado com sucesso.');
      } else {
        showNotification(data?.message || 'falha no processamento. por favor, tente novamente.');
      }
    } catch (err: any) {
      showNotification('erro inesperado. tente novamente mais tarde.');
    } finally {
      hideLoading();
    }
  };

  const amountKZ = (parseFloat(depositAmount) || 0) * exchangeRate;
  const walletAddress = companyWallet?.endereco_carteira || 'TMTfSjN6V4REo87NMTfSjN6V4REo87NMTf';

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#ffe4e1]/20 via-white to-[#ffe4e1]/20 font-sans antialiased text-gray-900 pb-8">
      {/* Header with Back Button */}
      <header className="bg-[#6D28D9] flex items-center justify-between px-4 h-14 sticky top-0 z-50 shadow-sm">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 text-white active:scale-90 transition-transform"
          title="voltar"
          aria-label="voltar"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="flex-1 text-center text-[17px] font-bold text-white lowercase tracking-tight">detalhe play</h1>
        <button
          onClick={() => navigate('/detalhes', { state: { initialFilter: 'recarregamentos' } })}
          className="p-2 text-white active:scale-90 transition-transform"
          title="histórico de depósitos"
          aria-label="histórico de depósitos usdt"
        >
          <ClipboardList className="h-6 w-6" />
        </button>
      </header>

      <main className="px-5 flex-1 mt-4">
        {/* Main Content Card-like structure idêntica ao RechargeDetail */}
        <div className="bg-white/40 backdrop-blur-[2px] rounded-[12px] p-1 -mx-1">
          
          {/* Rede */}
          <div className="mb-1 last:mb-0">
            <p className="text-[11px] text-gray-400 font-semibold tracking-tight lowercase">rede</p>
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-bold text-[#1f2937] tracking-tight lowercase">trc20</span>
            </div>
          </div>

          {/* Endereço da Carteira */}
          <div className="mb-1 last:mb-0">
            <p className="text-[11px] text-gray-400 font-semibold tracking-tight lowercase">endereço da carteira</p>
            <div className="flex items-center justify-between w-full">
              <span className="text-[13px] font-bold text-[#1f2937] break-all mr-2 tracking-tight lowercase line-clamp-1 truncate block max-w-[80%]">
                {walletAddress.toLowerCase()}
              </span>
              <button 
                onClick={() => handleCopy(walletAddress, 'endereço da carteira')} 
                className="p-1 flex-shrink-0 active:opacity-50 transition-all"
                title="copiar endereço da carteira"
              >
                <div className="w-[20px] h-[20px] flex items-center justify-center border border-gray-200 rounded-[12px] bg-white">
                  <Copy className="w-[11px] h-[11px] text-gray-300" strokeWidth={2.5} />
                </div>
              </button>
            </div>
          </div>

          {/* Câmbio */}
          <div className="mb-1 last:mb-0">
            <p className="text-[11px] text-gray-400 font-semibold tracking-tight">câmbio</p>
            <div className="flex items-center gap-1 font-bold">
              <span className="text-[15px] text-[#1f2937] tracking-tight lowercase">1 usdt ≈ {exchangeRate.toLocaleString('pt-AO')} aoa</span>
            </div>
          </div>

          {/* Limites de Depósito */}
          <div className="mb-1 last:mb-0">
            <p className="text-[11px] text-gray-400 font-semibold tracking-tight">limites de depósito</p>
            <div className="flex items-center gap-1 font-bold">
              <span className="text-[15px] text-[#1f2937] tracking-tight lowercase">10 ~ 100.000 usdt</span>
            </div>
          </div>

          {/* Observações */}
          <div className="mb-4 last:mb-0">
            <p className="text-[11px] text-gray-400 mb-0.5 font-semibold tracking-tight">observações</p>
            <div className="flex items-start justify-between">
              <p className="text-[14px] font-medium text-[#1f2937] leading-[1.25] tracking-tight lowercase">
                caro utilizador: certifique-se de usar exclusivamente a rede trc20 para o envio. o mínimo exigido é 10 usdt.
              </p>
            </div>
          </div>
        </div>

        <hr className="border-gray-100/30 my-4" />

        {/* Montante da Recarga e Botão Inline */}
        <div className="mb-6">
          <p className="text-[12px] text-gray-400 mb-1 font-medium lowercase">montante da recarga usdt</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 flex flex-col justify-center bg-gray-50/50 rounded-xl px-4 h-[58px] border border-gray-100 transition-colors focus-within:border-purple-200 focus-within:bg-white">
              <div className="flex items-center">
                <input 
                  type="number"
                  min="0"
                  value={depositAmount}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (parseFloat(val) < 0) return;
                    setDepositAmount(val);
                  }}
                  className="text-[20px] font-bold text-[#f25e5e] tracking-tight bg-transparent outline-none w-full placeholder:text-[#f25e5e]/40"
                  placeholder="10.00"
                  readOnly={hasSent}
                />
                <span className="text-[11px] font-bold text-black opacity-80 lowercase ml-2">usdt</span>
              </div>
              {parseFloat(depositAmount) > 0 && (
                <span className="text-[9px] font-medium text-gray-400 lowercase -mt-1">
                  ≈ {amountKZ.toLocaleString('pt-AO')} aoa
                </span>
              )}
            </div>
            
            <button
              onClick={handleConfirm}
              disabled={hasSent}
              className={`min-w-[100px] h-[58px] text-white rounded-xl text-[15px] font-bold active:scale-[0.98] transition-all lowercase shadow-md ${
                hasSent 
                  ? 'bg-green-500 shadow-green-900/10 cursor-default' 
                  : 'bg-[#6D28D9] hover:bg-[#5b21b6] shadow-purple-900/20'
              }`}
            >
              {hasSent ? 'enviado' : 'enviar'}
            </button>
          </div>
        </div>

        {/* Footer Text */}
        <div className="space-y-3 pb-8">
          <p className="text-[15px] lowercase">
            <span className="text-[#f25e5e] font-bold">Horário de recarga: 10:00 - 22:00 horas</span>
          </p>
          <p className="text-[13px] leading-[1.35] text-[#1f2937] font-medium pr-2 lowercase">
            <span className="font-bold text-black opacity-90">nota:</span> conclua o envio na sua corretora usando o endereço copiado.
          </p>
        </div>
      </main>

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md text-white px-6 py-2.5 rounded-full text-[12px] font-medium z-[100] whitespace-nowrap lowercase shadow-xl"
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
