import { useState, useEffect } from 'react';
import { ChevronLeft, Eye, EyeOff, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useLoading } from '../contexts/LoadingContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface BankAccount {
  id: string;
  nome_banco: string;
  iban: string;
  nome_completo: string;
}

export default function Withdraw() {
  const navigate = useNavigate();
  const { showLoading, hideLoading, registerFetch } = useLoading();
  const { user, profile, refreshProfile } = useAuth();
  const [amount, setAmount] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [banks, setBanks] = useState<BankAccount[]>([]);
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    async function fetchBanks() {
      const done = registerFetch();
      try {
        // Use the RPC function that decrypts the IBAN server-side
        const { data, error } = await supabase.rpc('get_my_bank_accounts');

        if (!error && data) {
          setBanks(data);
          if (data.length > 0) {
            setSelectedBankId(data[0].id);
          }
        }
      } finally {
        done();
      }
    }
    fetchBanks();
  }, [user, registerFetch]);

  const showToast = (message: string) => {
    setFeedback(message);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleConfirm = async () => {
    const numAmount = parseFloat(amount);

    if (!amount) {
      showToast('por favor, valor de saque');
      return;
    }
    if (isNaN(numAmount) || numAmount < 1000 || numAmount > 100000) {
      showToast('valor minímo de saque 1000 e maxímo 100.000,00');
      return;
    }
    if (!selectedBankId) {
      showToast('por favor, adicione uma conta bancária primeiro');
      return;
    }
    if (!password) {
      showToast('por favor, insira senha segura');
      return;
    }

    showLoading();
    try {
      // 1. Verify password (the user uses login password as PIN)
      const userPhone = user?.user_metadata?.phone || profile?.phone;
      if (userPhone) {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: `${userPhone}@user.com`,
          password: password,
        });

        if (authError) {
          showToast('senha de segurança incorreta.');
          hideLoading();
          return;
        }
      }

      // 2. Call the withdrawal RPC function
      const { data, error } = await supabase.rpc('request_withdrawal', {
        p_amount: numAmount,
        p_bank_id: selectedBankId,
        p_pin: password
      });

      if (error) {
        showToast(error.message);
      } else if (data && data.success) {
        showToast('bem-sucedido');
        setAmount('');
        setPassword('');
        refreshProfile(); // Refresh balance
      } else {
        showToast('saque não sucedido');
      }
    } catch (err: any) {
      showToast('erro inesperado tente nais tarde');
    } finally {
      hideLoading();
    }
  };

  const selectedBank = banks.find(b => b.id === selectedBankId);

  const maskIban = (iban: string) => {
    if (!iban || iban.length <= 8) return iban;
    const first4 = iban.slice(0, 4);
    const last4 = iban.slice(-4);
    const masked = '*'.repeat(iban.length - 8);
    return `${first4}${masked}${last4}`;
  };

  return (
    <div className="min-h-screen bg-[#d1d5db] page-content">
      {/* header */}
      <header className="bg-[#0000cc] text-white px-4 py-3 flex items-center sticky top-0 z-50">
        <button onClick={() => navigate(-1)} className="flex-none cursor-pointer">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="flex-grow text-center text-[15px] font-bold mr-6">retirar</h1>
      </header>

      <main className="p-4 space-y-4 max-w-md mx-auto">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <p className="text-[12.5px] text-red-500 italic">abrir limite em até 24 horas.</p>
            <div className="text-blue-800">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-[#e9ecef] rounded-xl p-4 mb-6">
            <p className="text-[12.5px] text-gray-500 font-medium">guacador</p>
            <div className="flex items-baseline space-x-1 my-1">
              <span className="text-[24px] font-bold text-[#0000cc]">{profile?.balance || '0.00'} Kz</span>
            </div>
            <p className="text-[12.5px] text-gray-500">valor pendente: <span className="text-[#f97316] font-bold">0,00 Kz</span></p>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-[12.5px] font-bold text-gray-700">métodos de pagamento</h3>
              {banks.length === 0 && (
                <button
                  onClick={() => navigate('/adicionar-banco')}
                  className="text-[11px] text-[#0000cc] font-bold"
                >
                  + adicionar banco
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {banks.length > 0 ? (
                banks.map((bank) => (
                  <button
                    key={bank.id}
                    onClick={() => setSelectedBankId(bank.id)}
                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-[12.5px] font-bold border-2 transition-all ${selectedBankId === bank.id
                      ? 'border-[#0000cc] bg-[#0000cc] text-white'
                      : 'border-gray-200 bg-white text-gray-500'}`}
                  >
                    <span>{bank.nome_banco}</span>
                  </button>
                ))
              ) : (
                <p className="text-[11px] text-gray-400">nenhuma conta bancária vinculada.</p>
              )}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-[12.5px] font-bold text-gray-700 mb-1">faixa de limite de saque 1.000 Kz - 1.000.000,00 Kz</label>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ''))}
              className="w-full border-b border-gray-200 focus:border-[#0000cc] focus:ring-0 text-[12.5px] py-2 px-0 text-gray-700 outline-none"
              placeholder="faixa de limite de saque 1.000 - 1.000.000,00 Kz"
              type="text"
            />
          </div>

          <div className="mb-6">
            <label className="block text-[12.5px] font-bold text-gray-700 mb-1">endereço para retirada</label>
            <input
              value={selectedBank ? maskIban(selectedBank.iban) : ''}
              readOnly
              className="w-full border-b border-gray-200 focus:border-[#0000cc] focus:ring-0 text-[12.5px] py-2 px-0 text-gray-400 outline-none bg-gray-50"
              placeholder="vincule um banco para ver o iban"
              type="text"
            />
          </div>

          <div className="mb-6 relative">
            <label className="block text-[12.5px] font-bold text-gray-700 mb-1">senha segura</label>
            <div className="relative">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-b border-gray-200 focus:border-[#0000cc] focus:ring-0 text-[12.5px] py-2 px-0 text-gray-700 outline-none"
                placeholder="senha segura"
                type={showPassword ? "text" : "password"}
              />
              <div
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 bottom-2 cursor-pointer text-gray-400"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-2 mb-6">
            <div className="flex justify-between items-center text-[12.5px]">
              <span className="text-gray-500">taxa de manuseio</span>
              <div className="text-right">
                <span className="text-[#f97316] font-bold block">14%</span>
              </div>
            </div>
            <div className="flex justify-between items-center text-[12.5px]">
              <span className="text-gray-500">fundos recebidos</span>
              <span className="text-teal-500 font-bold">
                {amount ? (parseFloat(amount) * 0.86).toFixed(2) : '0,00'} Kz
              </span>
            </div>
          </div>

          <button
            onClick={handleConfirm}
            className="w-full h-[45px] bg-[#0000cc] text-white rounded-full text-[15px] font-bold tracking-wide hover:bg-blue-800 transition-colors"
          >
            confirmar
          </button>
        </div>

        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, x: '-50%', y: '-50%' }}
              animate={{ opacity: 1, x: '-50%', y: '-50%' }}
              exit={{ opacity: 0, x: '-50%', y: '-50%' }}
              transition={{ duration: 0.1 }}
              className="fixed top-1/2 left-1/2 bg-black/80 text-white px-6 py-3 rounded-xl text-[12.5px] font-medium shadow-2xl z-[100] text-center min-w-[280px]"
            >
              {feedback}
            </motion.div>
          )}
        </AnimatePresence>

        <div>
          <h4 className="text-[15px] font-bold text-gray-700 mb-3">instruções para retirada</h4>
          <div className="bg-white rounded-2xl p-4 text-[12.5px] leading-relaxed text-gray-600 space-y-3 shadow-sm">
            <p>suporte para retiradas usando transferência bancária (iban).</p>
            <p>as retiradas geralmente levam de 24 a 48 minutos para chegar.</p>
            <p>o valor mínimo de saque é 1.000 Kz, limite máximo 1.000.000,00 Kz.</p>
            <p>a taxa de retirada é 14%.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
