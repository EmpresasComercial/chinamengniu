import { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
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

  const bankIcons: Record<string, string> = {
    'BAI': 'https://upload.wikimedia.org/wikipedia/commons/4/4f/BAI_-_.jpg',
    'BIC': 'https://lh3.googleusercontent.com/aida-public/AB6AXuAIIrIpIy7O9QhQzc9I73Rauw8CA6XeqPLIiI2TMPgn4tW3aQpHXVg7PyB00nTxHsRfuMe-YTFblWIq1KGIz4TAud7xX7SgLNPpe_LkhUyKb08N3IVFyIGUBgH4AcxuL9jf8edRdQi0Z7Z7y-UD2i_Fs__BCIxogbxvXMMQYEhLvpMyRTHS02QXf3A5nncLsrHtRDQ1-4fHUf3UXXyB_pwK8kz7H3AIUWG51ZcJF3x5lL6NuDJz6OPaZzElu-HItGu1MURd54-U5Q',
    'BFA': 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGhX8jKBfzNurF3wgrLdxOQDTwjGBAFwOg2-VwZmnttyd3yaHRRSrJkKJrRFRA1wz2LgpyvME6WpHqjCxA9TK8y-8DBE3I72y1w0a4wtY8mvggDLn4tKJhDGjCkDz44eF0-ZiY2zsGUqVkqGR9tvLfQ_JEWE0cgMZySLweK0VqNxGlymFwA3oweY9s88J6lDjL8iJMR1OFdVrDAaCvcTXQSV0y9kB848CPMk_0wpMiuL63Potit2yXy_3F50qQcb-Tyam9oY4NvQ',
    'SOL': 'https://lh3.googleusercontent.com/aida-public/AB6AXuAh4IDqjP7awRJlrCiIH2U6Op0XXDR7HQvp685HIhMQqzxKwmNnTdPmepV7hiYSciNg2qZOr0OjrxWqa5jH3_0_NiEKG8E6z_EayZ0XUSWO3c_5gdeXamKGDWJesgoLl1-0lD3uU5944iH-WjjUtuVN5AZnp-ALoYNrrTLZXvjwLrf8X1nCjyHcwcIQkpkHM-Jx1GDPl8Btv_NLsBsZIwTIVcdJJ0ME2fipRyKmbKbk4S4S37at4MnhZxqNr9ANK3z2rC4YcXxqhw'
  };

  const getBankLogo = (name: string) => {
    const uppercaseName = name.toUpperCase();
    if (uppercaseName.includes('BAI')) return bankIcons['BAI'];
    if (uppercaseName.includes('BIC')) return bankIcons['BIC'];
    if (uppercaseName.includes('BFA')) return bankIcons['BFA'];
    if (uppercaseName.includes('SOL')) return bankIcons['SOL'];
    return bankIcons['BAI']; // Fallback
  };

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
      <header className="bg-[#0000AA] flex items-center h-12 px-4 sticky top-0 z-50">
        <button onClick={() => navigate(-1)} className="text-white">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="flex-1 text-center text-white text-[15px] font-bold pr-5">recarregar</h1>
      </header>

      <main className="p-4">
        {/* Main Card */}
        <section className="bg-white rounded-[2rem] p-6 shadow-sm flex flex-col">
          {/* Amount Selection */}
          <div className="flex justify-between mb-8">
            {[10000, 50000, 100000, 500000].map((val) => (
              <button
                key={val}
                onClick={() => setAmount(val.toString())}
                className={`w-[22%] py-2 rounded-full border border-gray-200 text-[12.5px] font-medium transition-colors ${amount === val.toString() ? 'bg-[#0000AA] text-white' : 'hover:bg-[#0000AA] hover:text-white'
                  }`}
              >
                {val.toLocaleString('pt-AO')} KZs
              </button>
            ))}
          </div>

          {/* Amount Input */}
          <div className="w-full mb-6">
            <label className="block text-gray-700 text-[12.5px] font-bold mb-2">
              se não encontro o valor desejado, por favor digite no campo abaixo
            </label>
            <div className={`border-b border-gray-200 py-2 ${amount && !isAmountInRange ? 'border-red-500' : ''}`}>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^\p{L}\p{N}]/gu, ''))}
                className="w-full border-none focus:ring-0 p-0 text-gray-700 bg-transparent text-[15px] font-semibold outline-none"
                placeholder="digite o valor"
                type="number"
              />
            </div>
            {amount && !isAmountInRange && (
              <p className="text-red-500 text-[12.5px] mt-1">
                o valor deve ser entre 9.000 kzs e 7.000.000 kzs
              </p>
            )}
          </div>

          {/* Bank Selection */}
          <div className="w-full mb-8">
            <p className="text-[12.5px] font-bold text-gray-700 mb-4">selecione abaixo um dos bancos a usar no pagamento</p>
            <div className="grid grid-cols-2 gap-y-4 gap-x-2">
              {banks.map((b) => (
                <label key={b.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    className="text-[#0000AA] focus:ring-[#0000AA] h-4 w-4"
                    name="bank"
                    type="radio"
                    checked={selectedBankId === b.id}
                    onChange={() => setSelectedBankId(b.id)}
                  />
                  <div className={`w-6 h-6 rounded-full overflow-hidden border border-gray-100 flex items-center justify-center`}>
                    <img
                      src={getBankLogo(b.nome_do_banco)}
                      alt={b.nome_do_banco}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className="text-[12.5px] font-medium">{b.nome_do_banco}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="w-full border-t border-dashed border-gray-200 my-4"></div>

          {/* Action Button */}
          <button
            onClick={handleAdvance}
            className={`w-full h-[45px] rounded-full text-[15px] font-semibold shadow-lg transition-colors ${!isFormValid ? 'bg-gray-400' : 'bg-[#0000AA] text-white'
              }`}
          >
            avança proxima
          </button>

          <AnimatePresence>
            {validationError && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, x: '-50%', y: '-50%' }}
                animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
                exit={{ opacity: 0, scale: 0.8, x: '-50%', y: '-50%' }}
                className="fixed top-1/2 left-1/2 bg-black/80 backdrop-blur-md text-white px-8 py-4 rounded-2xl text-[14px] font-bold shadow-2xl z-[100] text-center min-w-[280px] border border-white/10"
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
