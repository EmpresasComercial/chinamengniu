import React, { useState, useEffect } from 'react';
import { ChevronLeft, Copy, ClipboardList } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useLoading } from '../contexts/LoadingContext';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function RechargeDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { showLoading, hideLoading } = useLoading();

  // Defensive state handling
  const state = location.state || {};
  const amount = state.amount || '0';
  const bank = state.bank || { nome_do_banco: '---', iban: '---', nome_favorecido: '---' };

  useEffect(() => {
    if (!state.bank) {
      navigate('/recarregar');
    }
  }, [state, navigate]);

  const [notification, setNotification] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [hasSent, setHasSent] = useState(false);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCopy = (text: string, fieldName: string) => {
    const lowerFieldName = fieldName.toLowerCase();
    
    // special validation for IBAN based on user requirement
    if (lowerFieldName === 'iban') {
      if (!depositAmount || parseFloat(depositAmount) <= 0) {
        showNotification('por favor, digite o valor e clique em enviar antes de copiar o iban.');
        return;
      }
      if (!hasSent) {
        showNotification('por favor, clique em enviar antes de copiar o iban.');
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
      const { data, error } = await supabase.rpc('create_deposit_request', {
        p_amount: parseFloat(depositAmount) || 0,
        p_bank_name: bank.nome_do_banco,
        p_iban: bank.iban
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

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#ffe4e1]/20 via-white to-[#ffe4e1]/20 font-sans antialiased text-gray-900 pb-8">
      {/* Header with Back Button */}
      <header className="bg-[#6D28D9] flex items-center justify-between px-4 h-14 sticky top-0 z-50 shadow-sm">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 text-white active:scale-90 transition-transform"
          title="voltar"
          aria-label="voltar para a página anterior"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="flex-1 text-center text-[17px] font-bold text-white lowercase">detalhes de pagamento</h1>
        <button
          onClick={() => navigate('/detalhes', { state: { initialFilter: 'recarregamentos' } })}
          className="p-2 text-white active:scale-90 transition-transform"
          title="histórico de depósitos"
          aria-label="histórico de depósitos"
        >
          <ClipboardList className="h-6 w-6" />
        </button>
      </header>

      <main className="px-5 flex-1">
        {/* Main Content Card-like structure */}
        <div className="bg-white/40 backdrop-blur-[2px] rounded-[12px] p-1 -mx-1">
          {/* Banco Receptor */}
          <div className="mb-3 last:mb-0">
            <p className="text-[11px] text-gray-400 mb-0.5 font-semibold tracking-tight lowercase">banco receptor</p>
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-bold text-[#1f2937] tracking-tight lowercase">{bank.nome_do_banco.toLowerCase()}</span>
              <button 
                onClick={() => handleCopy(bank.nome_do_banco, 'banco')} 
                className="p-1 active:opacity-50 transition-all"
                title="copiar nome do banco"
                aria-label="copiar nome do banco"
              >
                <div className="w-[20px] h-[20px] flex items-center justify-center border border-gray-200 rounded-[12px] bg-white">
                  <Copy className="w-[11px] h-[11px] text-gray-300" strokeWidth={2.5} />
                </div>
              </button>
            </div>
          </div>

          {/* Titular do Cartão */}
          <div className="mb-3 last:mb-0">
            <p className="text-[11px] text-gray-400 mb-0.5 font-semibold tracking-tight lowercase">titular do cartão beneficiário</p>
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-bold text-[#1f2937] tracking-tight lowercase">{bank.nome_favorecido?.toLowerCase() || 'joaquim chitumba handa'}</span>
              <button 
                onClick={() => handleCopy(bank.nome_favorecido || 'joaquim chitumba handa', 'titular')} 
                className="p-1 active:opacity-50 transition-all"
                title="copiar nome do titular"
                aria-label="copiar nome do titular"
              >
                <div className="w-[20px] h-[20px] flex items-center justify-center border border-gray-200 rounded-[12px] bg-white">
                  <Copy className="w-[11px] h-[11px] text-gray-300" strokeWidth={2.5} />
                </div>
              </button>
            </div>
          </div>

          {/* Pagamento IBAN */}
          <div className="mb-3 last:mb-0">
            <p className="text-[11px] text-gray-400 mb-0.5 font-semibold tracking-tight lowercase">pagamento iban</p>
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-bold text-[#1f2937] break-all mr-2 tracking-tight lowercase">{bank.iban.toLowerCase()}</span>
              <button 
                onClick={() => handleCopy(bank.iban, 'iban')} 
                className="p-1 flex-shrink-0 active:opacity-50 transition-all"
                title="copiar iban"
                aria-label="copiar iban"
              >
                <div className="w-[20px] h-[20px] flex items-center justify-center border border-gray-200 rounded-[12px] bg-white">
                  <Copy className="w-[11px] h-[11px] text-gray-300" strokeWidth={2.5} />
                </div>
              </button>
            </div>
          </div>

          {/* Faixa de Depósito */}
          <div className="mb-3 last:mb-0">
            <p className="text-[11px] text-gray-400 mb-0.5 font-semibold tracking-tight">faixa de depósito</p>
            <div className="flex items-center gap-1 font-bold">
              <span className="text-[15px] text-[#1f2937] tracking-tight">9000 ~ 1000000 aoa</span>
            </div>
          </div>

          {/* Observações */}
          <div className="mb-4 last:mb-0">
            <p className="text-[11px] text-gray-400 mb-0.5 font-semibold tracking-tight">observações</p>
            <div className="flex items-start justify-between">
              <p className="text-[14px] font-medium text-[#f25e5e] leading-[1.25] tracking-tight lowercase">
                por favor, recarregue o dinheiro de acordo com o valor digitado, caso contrário a recarga não será bem-sucedida.
              </p>
            </div>
          </div>
        </div>

        <hr className="border-gray-100/30 my-4" />

        {/* Montante da Recarga */}
        <div className="mb-4">
          <p className="text-[12px] text-gray-400 mb-1 font-medium lowercase">montante da recarga</p>
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1.5 w-full">
              <input 
                type="number"
                min="0"
                value={depositAmount}
                onChange={(e) => {
                  const val = e.target.value;
                  if (parseFloat(val) < 0) return;
                  setDepositAmount(val);
                }}
                className={`text-[24px] font-bold text-[#f25e5e] tracking-tight bg-transparent border-b-2 outline-none w-full placeholder:text-[#f25e5e]/50 pb-1 transition-colors ${hasSent ? 'border-green-400/40' : 'border-[#6D28D9]/40'}`}
                placeholder="0.00"
                readOnly={hasSent}
              />
            </div>
            <span className="text-[11px] font-bold text-black opacity-80 lowercase ml-2">aoa</span>
          </div>
        </div>





        {/* Botão Enviar */}
        <button
          onClick={handleConfirm}
          disabled={hasSent}
          className={`w-full h-[52px] text-white rounded-[12px] text-[16px] font-semibold mb-6 active:scale-[0.98] transition-all lowercase shadow-md ${
            hasSent 
              ? 'bg-green-500 shadow-green-900/20 cursor-default' 
              : 'bg-[#6D28D9] hover:bg-[#5b21b6] shadow-purple-900/20'
          }`}
        >
          {hasSent ? 'enviado' : 'enviar'}
        </button>

        {/* Footer Text */}
        <div className="space-y-3 pb-8">
          <p className="text-[15px] lowercase">
            <span className="text-[#f25e5e] font-bold">Horário de recarga: 10:00 - 22:00 horas</span>
          </p>
          <p className="text-[13px] leading-[1.35] text-[#1f2937] font-medium pr-2 lowercase">
            <span className="font-bold text-black opacity-90">nota:</span> faça login na plataforma para obter o número de conta bancária mais recente para cada carregamento.
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
