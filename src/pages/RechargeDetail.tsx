import { useState } from 'react';
import { ChevronLeft, Check } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLoading } from '../contexts/LoadingContext';

export default function RechargeDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showLoading, hideLoading } = useLoading();
  const { amount, bank } = location.state || { amount: '50000', bank: 'BAI' };
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatAmount = (val: string) => {
    const num = parseFloat(val.replace(/[^\d.-]/g, ''));
    if (isNaN(num)) return val;
    return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
  };

  const bankIcons: Record<string, string> = {
    'BAI': 'https://upload.wikimedia.org/wikipedia/commons/4/4f/BAI_-_.jpg',
    'BIC': 'https://lh3.googleusercontent.com/aida-public/AB6AXuAIIrIpIy7O9QhQzc9I73Rauw8CA6XeqPLIiI2TMPgn4tW3aQpHXVg7PyB00nTxHsRfuMe-YTFblWIq1KGIz4TAud7xX7SgLNPpe_LkhUyKb08N3IVFyIGUBgH4AcxuL9jf8edRdQi0Z7Z7y-UD2i_Fs__BCIxogbxvXMMQYEhLvpMyRTHS02QXf3A5nncLsrHtRDQ1-4fHUf3UXXyB_pwK8kz7H3AIUWG51ZcJF3x5lL6NuDJz6OPaZzElu-HItGu1MURd54-U5Q',
    'BFA': 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGhX8jKBfzNurF3wgrLdxOQDTwjGBAFwOg2-VwZmnttyd3yaHRRSrJkKJrRFRA1wz2LgpyvME6WpHqjCxA9TK8y-8DBE3I72y1w0a4wtY8mvggDLn4tKJhDGjCkDz44eF0-ZiY2zsGUqVkqGR9tvLfQ_JEWE0cgMZySLweK0VqNxGlymFwA3oweY9s88J6lDjL8iJMR1OFdVrDAaCvcTXQSV0y9kB848CPMk_0wpMiuL63Potit2yXy_3F50qQcb-Tyam9oY4NvQ',
    'SOL': 'https://lh3.googleusercontent.com/aida-public/AB6AXuAh4IDqjP7awRJlrCiIH2U6Op0XXDR7HQvp685HIhMQqzxKwmNnTdPmepV7hiYSciNg2qZOr0OjrxWqa5jH3_0_NiEKG8E6z_EayZ0XUSWO3c_5gdeXamKGDWJesgoLl1-0lD3uU5944iH-WjjUtuVN5AZnp-ALoYNrrTLZXvjwLrf8X1nCjyHcwcIQkpkHM-Jx1GDPl8Btv_NLsBsZIwTIVcdJJ0ME2fipRyKmbKbk4S4S37at4MnhZxqNr9ANK3z2rC4YcXxqhw'
  };

  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    showLoading();
    setTimeout(() => {
      hideLoading();
      setConfirmed(true);
      setTimeout(() => setConfirmed(false), 3000);
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#E6E8F0] antialiased">
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
              alt={`${bank} Icon`}
              className="rounded-full w-8 h-8 object-cover"
              src={bankIcons[bank] || bankIcons['BAI']}
              referrerPolicy="no-referrer"
            />
            <span className="font-bold text-[15px] text-gray-800">selecionado/{bank}</span>
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
              <div className="flex flex-col overflow-hidden">
                <span className="text-[12.5px] text-gray-500 font-semibold uppercase tracking-wider"> iban</span>
                <span className="text-[15px] font-bold text-gray-900 truncate"> 0000 0000 0000 0000 0000 0</span>
              </div>
              <button
                onClick={() => handleCopy('000000000000000000000', 'iban')}
                className="bg-black text-white text-[12.5px] px-3 py-1 rounded-full font-medium ml-2 btn-small"
              >
                {copiedField === 'iban' ? 'copiado!' : 'copiar'}
              </button>
            </div>

            <div className="flex flex-col bg-gray-50 rounded-xl p-3 border border-gray-100">
              <span className="text-[12.5px] text-gray-500 font-semibold uppercase tracking-wider">nome</span>
              <span className="text-[15px] font-bold text-gray-900">joão silva pinto</span>
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
    </div>
  );
}
