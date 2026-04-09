import { useState, useEffect } from 'react';
import { ChevronLeft, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useLoading } from '../contexts/LoadingContext';
import { supabase } from '../lib/supabase';

export default function RechargeList() {
  const navigate = useNavigate();
  const { showLoading, hideLoading, registerFetch } = useLoading();
  const [amount, setAmount] = useState('');
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

  const numericAmount = parseFloat(amount);
  const isAmountInRange = numericAmount >= 9000 && numericAmount <= 7000000;
  const isFormValid = amount !== '' && isAmountInRange && selectedBankId !== '';

  const handleAdvance = () => {
    if (!amount) {
      setValidationError('por favor, digite o valor');
    } else if (!isAmountInRange) {
      setValidationError('o valor deve ser entre 9.000 kzs e 7.000.000 kzs');
    } else if (!selectedBankId) {
      setValidationError('por favor, selecione um banco');
    } else {
      showLoading();
      const bankData = banks.find(b => b.id === selectedBankId);
      setTimeout(() => {
        hideLoading();
        navigate('/detalhes-pagamento', { state: { amount, bank: bankData } });
      }, 1000);
      return;
    }

    setTimeout(() => setValidationError(null), 3000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#E6E8F0] antialiased page-content">
      {/* Header */}
      <header className="bg-[#6D28D9] flex items-center h-12 px-4 sticky top-0 z-50">
        <button onClick={() => navigate(-1)} className="text-white">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="flex-1 text-center text-white text-[15px] font-bold pr-5">recarregar</h1>
      </header>

      <main className="p-4">
        {/* Main Card */}
        <section className="bg-white rounded-xl p-6  flex flex-col">
          {/* Amount Selection */}
          <div className="flex justify-between mb-8">
            {[10000, 50000, 100000, 500000].map((val) => (
              <button
                key={val}
                onClick={() => setAmount(val.toString())}
                className={`w-[22%] py-2 rounded-xl text-[12.5px] font-bold transition-all ${amount === val.toString() 
                  ? 'bg-[#6D28D9] text-white' 
                  : 'bg-[#F0F2F5] text-gray-700 active:bg-gray-200'
                }`}
              >
                {val}
              </button>
            ))}
          </div>

          {/* Amount Input */}
          <div className="w-full mb-6">
            <label className="block text-gray-700 text-[12.5px] font-bold mb-4">
              se não encontro o valor desejado, por favor digite no campo abaixo
            </label>
            <div className={`relative flex items-center border-b-2 transition-all ${amount && !isAmountInRange ? 'border-red-500' : 'border-[#6D28D9]'}`}>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ''))}
                className="w-full border-none focus:ring-0 p-0 py-2 text-gray-800 bg-transparent text-[16px] font-bold outline-none"
                placeholder="digite o valor"
                type="text"
                inputMode="numeric"
              />
              <span className="ml-2 text-[14px] font-bold text-gray-400">Kz</span>
            </div>
            {amount && !isAmountInRange && (
              <p className="text-red-500 text-[11px] mt-2 italic font-medium">
                o valor deve ser entre 9.000 kzs e 7.000.000 kzs
              </p>
            )}
          </div>

          {/* Bank Selection - Only show when amount is valid */}
          {isAmountInRange && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.1 }}
              className="w-full mb-8 pt-4 border-t border-gray-50"
            >
              <p className="text-[12.5px] text-gray-500 mb-6">selecione abaixo um dos bancos a usar no pagamento</p>
              <div className="flex flex-col space-y-3">
                {banks.map((b) => (
                  <label key={b.id} className="group flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50 active:bg-gray-100 transition-all cursor-pointer">
                    <div className="flex items-center">
                      <span className={`text-[13px] font-bold transition-colors ${selectedBankId === b.id ? 'text-[#6D28D9]' : 'text-gray-700'}`}>{b.nome_do_banco}</span>
                    </div>

                    <div className="relative">
                      <input
                        className="hidden"
                        name="bank"
                        type="radio"
                        checked={selectedBankId === b.id}
                        onChange={() => setSelectedBankId(b.id)}
                      />
                      <div className={`w-5 h-5 rounded-xl border-2 flex items-center justify-center transition-all ${selectedBankId === b.id ? 'border-[#6D28D9] bg-[#6D28D9]' : 'border-gray-300'}`}>
                        {selectedBankId === b.id && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </motion.div>
          )}

          <div className="w-full border-t border-dashed border-gray-200 my-4"></div>

          {/* Action Button */}
          <button
            onClick={handleAdvance}
            className={`w-full h-[45px] rounded-full text-[15px] font-semibold  transition-colors ${!isFormValid ? 'bg-gray-400' : 'bg-[#6D28D9] text-white'
              }`}
          >
            avança proxima
          </button>

          <AnimatePresence>
            {validationError && (
              <motion.div
                initial={{ opacity: 0, x: 0, y: 0 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{ opacity: 0, x: 0, y: 0 }}
                transition={{ duration: 0.1 }}
                className="fixed inset-0 m-auto w-fit h-fit min-w-[260px] bg-black/50 backdrop-blur-sm text-white px-5 py-3 rounded-xl text-[12.5px]  z-[500] text-center max-w-[85vw] whitespace-normal break-words"
              >
                {validationError}
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
}
