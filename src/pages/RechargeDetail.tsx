import React, { useState, useEffect } from 'react';
import { ChevronLeft, Check, Copy } from 'lucide-react';
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
  const [whatsappUrl, setWhatsappUrl] = useState('https://wa.me/');

  useEffect(() => {
    async function fetchWhatsappLink() {
      const { data } = await supabase
        .from('atendimento_links')
        .select('whatsapp_gerente_url')
        .single();
      
      if (data?.whatsapp_gerente_url) {
        setWhatsappUrl(data.whatsapp_gerente_url);
      }
    }
    fetchWhatsappLink();
  }, []);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    showNotification(`Sucesso: ${field === 'amount' ? 'Montante' : 'IBAN'} copiado para a área de transferência.`);
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
      showNotification('Depósito solicitado com sucesso.');
      setTimeout(() => {
        setConfirmed(false);
        navigate('/detalhes');
      }, 3000);
    } else {
      const errorMsg = rpcError?.message || rpcData?.message || 'Falha no processamento. Por favor, tente novamente.';
      showNotification(errorMsg);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#E6E8F0] antialiased page-content">
      {/* Header */}
      <header className="bg-white flex items-center h-12 px-4 sticky top-0 z-50">
        <button onClick={() => navigate(-1)} className="text-gray-800" title="Voltar">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="flex-1 text-center text-gray-900 text-[15px] font-bold pr-5 lowercase tracking-wide">detalhes de depósito</h1>
      </header>

      <main className="p-4 space-y-4">
        {/* Top Card */}
        <section className="bg-white rounded-xl p-6  flex flex-col items-center">
          {/* Attention Message */}
          <div className="mb-8 p-4 bg-red-50 rounded-xl border border-red-100 w-full">
            <p className="text-[13px] text-gray-800 leading-relaxed text-center">
              <span className="text-red-500 font-black lowercase">aviso importante:</span> utilize exclusivamente o banco <span className="font-black text-[#6D28D9] lowercase">{bank.nome_do_banco.toLowerCase()}</span> para concluir esta transação financeira.
            </p>
          </div>

          {/* Payment Details */}
          <div className="w-full space-y-4 mb-6">
            <div className="flex justify-between items-center bg-gray-50 rounded-xl p-3 border border-gray-100">
              <div className="flex flex-col">
                <span className="text-[12px] text-gray-400 font-bold lowercase tracking-wider">montante em kz</span>
                <span className="text-[16px] font-black text-gray-900">{formatAmount(amount)} kz</span>
              </div>
              <button
                onClick={() => handleCopy(amount, 'amount')}
                className="text-[#6D28D9] p-2 hover:bg-purple-50 rounded-lg transition-all"
              >
                {copiedField === 'amount' ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex justify-between items-center bg-gray-50 rounded-xl p-3 border border-gray-100">
              <div className="flex flex-col overflow-hidden mr-2">
                <span className="text-[12px] text-gray-400 font-bold lowercase tracking-wider">iban de destino</span>
                <span className="text-[14px] font-black text-gray-900 break-all">{bank.iban.toLowerCase()}</span>
              </div>
              <button
                onClick={() => handleCopy(bank.iban, 'iban')}
                className="text-[#6D28D9] p-2 hover:bg-purple-50 rounded-lg transition-all flex-shrink-0"
              >
                {copiedField === 'iban' ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex flex-col bg-gray-50 rounded-xl p-3 border border-gray-100">
              <span className="text-[12px] text-gray-400 font-bold lowercase tracking-wider">beneficiário</span>
              <span className="text-[15px] font-black text-gray-900">{bank.nome_favorecido?.toLowerCase() || 'deepbank lda'}</span>
            </div>
          </div>

          {/* Confirmation Button */}
          <button
            onClick={handleConfirm}
            className="bg-[#6D28D9] text-white w-full h-[45px] rounded-xl text-[14px] font-bold lowercase tracking-wide active:scale-[0.98] transition-all"
          >
            {confirmed ? 'pagamento solicitado' : 'enviar'}
          </button>
        </section>

        {/* Instructions Card */}
        <section className="bg-white rounded-xl p-6 ">
          <h3 className="text-[14px] font-black text-gray-900 mb-6 lowercase tracking-tight">diretrizes para depósito bancário</h3>
          <div className="space-y-4 text-[12.5px] leading-relaxed text-gray-700">
            <p>1. o valor mínimo para depósito bancário é de <span className="text-red-500 font-bold">9000</span> kzs e o máximo é de <span className="text-red-500 font-bold">7.000.000</span> kzs.</p>
            <p>2. após copiar a referência bancária tu podes usar softwares de pagamentos como <span className="text-red-500 font-bold">multicaixa express</span>, <span className="text-red-500 font-bold">bai directo</span>, <span className="text-red-500 font-bold">banke atlantico</span> entre outros softwares de pagamentos ou dirija-se a um <span className="text-red-500 font-bold">atm</span>.</p>
            <p>3. por favor, utilize apenas transferências <span className="text-red-500 font-bold">via bancária</span>. os fundos chegarão à sua conta cerca de <span className="text-red-500 font-bold">5 a 10 minutos</span>, se for diferente por favor tenha paciência por 24hs.</p>
            <p>4. após fazer o pagamento, <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-green-500 font-bold underline">clique agora whatsapp</a> procurar o contato do <span className="text-red-500 font-bold">gerente</span> para fornecer o <span className="text-red-500 font-bold">comprovativo</span> de pagamento e o <span className="text-red-500 font-bold">id</span> da sua conta.</p>
          </div>
        </section>
      </main>

      {/* Centralized Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 0, y: 0 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 0, y: 0 }}
            className="fixed inset-0 m-auto w-fit h-fit min-w-[260px] bg-black/50 backdrop-blur-sm text-white px-5 py-3 rounded-xl text-[12.5px]  z-[500] text-center max-w-[85vw] whitespace-normal break-words"
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
