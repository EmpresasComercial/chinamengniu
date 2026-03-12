import { useState, useEffect } from 'react';
import { ChevronLeft, Check } from 'lucide-react';
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
  const bank = state.bank || { nome_do_banco: 'BAI', iban: '---', nome_favorecido: '---' };

  useEffect(() => {
    // If no bank name (invalid state from refresh or direct access), redirect back
    if (!state.bank) {
      navigate('/recarregar');
    }
  }, [state, navigate]);

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    showNotification(`Copiado: ${field === 'amount' ? 'Valor' : 'IBAN'}`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatAmount = (val: string) => {
    const num = parseFloat(val);
    if (isNaN(num)) return val;
    return new Intl.NumberFormat('pt-AO', { minimumFractionDigits: 2 }).format(num);
  };

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

  const handleConfirm = async () => {
    if (!user) return;
    showLoading();

    // Call the RPC function with the exact parameters defined in your SQL
    const { data: rpcData, error: rpcError } = await supabase.rpc('create_deposit_request', {
      p_amount: parseFloat(amount),
      p_bank_name: bank.nome_do_banco,
      p_iban: bank.iban
    });

    hideLoading();

    // Handle the RPC response (typically returns JSON with success/message)
    if (!rpcError && (rpcData?.success || rpcData)) {
      setConfirmed(true);
      showNotification('bem-sucedido');
      setTimeout(() => {
        setConfirmed(false);
        navigate('/detalhes');
      }, 3000);
    } else {
      const errorMsg = rpcError?.message || rpcData?.message || 'não sucedido,Tente novamente.';
      showNotification(errorMsg);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#E6E8F0] antialiased page-content">
      {/* Header */}
      <header className="bg-[#0000AA] flex items-center h-12 px-4 sticky top-0 z-50">
        <button onClick={() => navigate(-1)} className="text-white">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="flex-1 text-center text-white text-[15px] font-bold pr-5">detalhes do pagamento</h1>
      </header>

      <main className="p-4 space-y-4">
        {/* Top Card */}
        <section className="bg-white rounded-3xl p-6 shadow-sm flex flex-col items-center">
          {/* Bank Logo and Label */}
          <div className="flex items-center space-x-2 mb-6">
            <img
              alt={`${bank.nome_do_banco} Icon`}
              className="rounded-full w-8 h-8 object-cover"
              src={getBankLogo(bank.nome_do_banco)}
              referrerPolicy="no-referrer"
            />
            <span className="font-bold text-[15px] text-gray-800">selecionado/{bank.nome_do_banco}</span>
          </div>

          {/* Payment Details */}
          <div className="w-full space-y-4 mb-6">
            <div className="flex justify-between items-center bg-gray-50 rounded-xl p-3 border border-gray-100">
              <div className="flex flex-col">
                <span className="text-[12.5px] text-gray-500 font-semibold uppercase tracking-wider">valor a pagar</span>
                <span className="text-[15px] font-bold text-gray-900">{formatAmount(amount)} KZs</span>
              </div>
              <button
                onClick={() => handleCopy(amount, 'amount')}
                className="bg-black text-white text-[12.5px] px-3 py-1 rounded-full font-medium relative btn-small"
              >
                {copiedField === 'amount' ? 'copiado!' : 'copiar'}
              </button>
            </div>

            <div className="flex justify-between items-center bg-gray-50 rounded-xl p-3 border border-gray-100">
              <div className="flex flex-col overflow-hidden mr-2">
                <span className="text-[12.5px] text-gray-500 font-semibold uppercase tracking-wider"> iban</span>
                <span className="text-[14px] font-bold text-gray-900 break-all">{bank.iban}</span>
              </div>
              <button
                onClick={() => handleCopy(bank.iban, 'iban')}
                className="bg-black text-white text-[12.5px] px-3 py-1 rounded-full font-medium flex-shrink-0 btn-small"
              >
                {copiedField === 'iban' ? 'copiado!' : 'copiar'}
              </button>
            </div>

            <div className="flex flex-col bg-gray-50 rounded-xl p-3 border border-gray-100">
              <span className="text-[12.5px] text-gray-500 font-semibold uppercase tracking-wider">nome</span>
              <span className="text-[15px] font-bold text-gray-900">{bank.nome_favorecido || 'DEEPBANK LDA'}</span>
            </div>
          </div>


          {/* Confirmation Button */}
          <button
            onClick={handleConfirm}
            className="bg-[#0000AA] text-white w-full h-[45px] rounded-full text-[15px] font-semibold shadow-lg relative"
          >
            {confirmed ? 'confirmado!' : 'clique confirme'}
          </button>
        </section>

        {/* Instructions Card */}
        <section className="bg-white rounded-3xl p-6 shadow-sm">
          <h3 className="text-[15px] font-bold text-gray-900 mb-6">instruções de recarga bancária</h3>
          <div className="space-y-4 text-[12.5px] leading-relaxed text-gray-700">
            <p>1. copie o iban acima para realizar o pagamento no seu aplicativo do banco.</p>
            <p>2. por favor, utilize apenas transferências via bancária. os fundos chegarão à sua conta cerca de 5 a 10 minutos após a confirmação para pagamentos iguais, se for diferente por favor tenha paciência por 24hs.</p>
            <p>3. o valor mínimo para depósito bancário é de 9000 kzs e o máximo é de 7.000.000 kzs.</p>
            <p>4. se demorar muito para chegar, atualize a página ou entre em contato com o atendimento ao cliente.</p>
          </div>
        </section>
      </main>

      {/* Centralized Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: '-50%', y: '-50%' }}
            animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
            exit={{ opacity: 0, scale: 0.8, x: '-50%', y: '-50%' }}
            className="fixed top-1/2 left-1/2 bg-black/80 backdrop-blur-md text-white px-8 py-4 rounded-2xl text-[14px] font-bold shadow-2xl z-[100] text-center min-w-[280px] border border-white/10"
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
