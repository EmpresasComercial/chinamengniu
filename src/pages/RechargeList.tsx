import { useState, useEffect } from 'react';
import { ChevronLeft, Check, BadgeDollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useLoading } from '../contexts/LoadingContext';
import { supabase } from '../lib/supabase';

export default function RechargeList() {
  const navigate = useNavigate();
  const { registerFetch } = useLoading();
  const [selectedBankId, setSelectedBankId] = useState('');
  const [banks, setBanks] = useState<any[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBanks() {
      const done = registerFetch();
      try {
        const { data, error } = await supabase
          .from('bancos_empresa')
          .select('*')
          .eq('ativo', true);

        if (!error && data) {
          setBanks(data);
        }
      } finally {
        done();
      }
    }
    fetchBanks();
  }, []);

  const handleAdvance = () => {
    if (!selectedBankId) {
      setValidationError('por favor, selecione um banco ou usdt');
      setTimeout(() => setValidationError(null), 3000);
    } else if (selectedBankId === 'usdt') {
      navigate('/recarregar-usdt');
    } else {
      const bankData = banks.find(b => b.id === selectedBankId);
      navigate('/detalhes-pagamento', { state: { bank: bankData } });
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getBankLogo = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('bfa')) return '/logo-bfa.png';
    if (lowerName.includes('bai')) return '/bai_sem_fundo.png';
    if (lowerName.includes('atl')) return '/logo%20atl-nova.jpeg';
    if (lowerName.includes('sol')) return '/logp-sol.jpg';
    if (lowerName.includes('bic')) return '/logo-bic.png';
    return null;
  };

  const getBankColor = (name: string) => {
    const colors = ['bg-[#C62828]', 'bg-[#1565C0]', 'bg-[#2E7D32]', 'bg-[#EF6C00]', 'bg-[#6A1B9A]', 'bg-[#37474F]'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFDFE] antialiased page-content font-sans lowercase">
      {/* Header */}
      <header className="bg-white flex items-center h-14 px-4 sticky top-0 z-50 border-b border-gray-50">
        <button 
          onClick={() => navigate(-1)} 
          className="text-gray-400 p-2 active:opacity-50 transition-opacity"
          aria-label="voltar"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="flex-1 text-center text-gray-800 text-[17px] font-bold pr-10">selecionar banco</h1>
      </header>

      <main className="p-3 flex-1">
        <div className="flex flex-col space-y-2">
          {banks.map((b) => (
            <div
              key={b.id}
              onClick={() => setSelectedBankId(b.id)}
              className={`flex items-center justify-between p-2 rounded-[10px] border-2 transition-all cursor-pointer bg-white active:scale-[0.99] ${
                selectedBankId === b.id 
                  ? 'border-[#6D28D9]/30 bg-[#F5F3FF]' 
                  : 'border-gray-50 hover:border-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {/* Logo Section */}
                {getBankLogo(b.nome_do_banco) ? (
                  <div className="w-7 h-7 border border-gray-50 rounded-[6px] flex items-center justify-center bg-white overflow-hidden shadow-sm">
                    <img 
                      src={getBankLogo(b.nome_do_banco)!} 
                      alt={b.nome_do_banco} 
                      className="w-full h-full object-contain p-0.5"
                    />
                  </div>
                ) : (
                  <div className={`w-7 h-7 rounded-[6px] flex items-center justify-center text-white text-[10px] font-bold shadow-sm ${getBankColor(b.nome_do_banco)}`}>
                    {getInitials(b.nome_do_banco)}
                  </div>
                )}
                
                <div className="flex flex-col">
                  <span className={`text-[12px] font-bold transition-colors ${selectedBankId === b.id ? 'text-[#6D28D9]' : 'text-gray-800'}`}>
                    {b.nome_do_banco}
                  </span>
                  <span className="text-[9px] text-gray-400 font-medium">transferência bancária</span>
                </div>
              </div>

              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                selectedBankId === b.id 
                  ? 'border-[#6D28D9] bg-[#6D28D9]' 
                  : 'border-gray-200'
              }`}>
                {selectedBankId === b.id && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
              </div>
            </div>
          ))}

          {/* Opção USDT */}
          <div
            onClick={() => setSelectedBankId('usdt')}
            className={`flex items-center justify-between p-2 rounded-[10px] border-2 transition-all cursor-pointer bg-white active:scale-[0.99] ${
              selectedBankId === 'usdt' 
                ? 'border-[#6D28D9]/30 bg-[#F5F3FF]' 
                : 'border-gray-50 hover:border-gray-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-[6px] flex items-center justify-center bg-teal-500 shadow-sm">
                <BadgeDollarSign className="w-4 h-4 text-white" />
              </div>
              
              <div className="flex flex-col">
                <span className={`text-[12px] font-bold transition-colors ${selectedBankId === 'usdt' ? 'text-[#6D28D9]' : 'text-gray-800'}`}>
                  usdt (trc20)
                </span>
                <span className="text-[9px] text-gray-400 font-medium">criptomoeda</span>
              </div>
            </div>

            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
              selectedBankId === 'usdt' 
                ? 'border-[#6D28D9] bg-[#6D28D9]' 
                : 'border-gray-200'
            }`}>
              {selectedBankId === 'usdt' && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
            </div>
          </div>

        </div>
      </main>

      {/* Footer with Confirm Button */}
      <div className="p-3 sticky bottom-0 bg-white/80 backdrop-blur-md">
        <button
          onClick={handleAdvance}
          className={`w-full h-[45px] rounded-[12px] text-[15px] font-bold transition-all lowercase shadow-sm ${
            !selectedBankId 
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
              : 'bg-[#6D28D9] text-white active:scale-[0.98]'
          }`}
        >
          confirmar
        </button>
      </div>

      <AnimatePresence>
        {validationError && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md text-white px-6 py-2.5 rounded-full text-[13px] font-medium z-[100] whitespace-nowrap lowercase"
          >
            {validationError}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
