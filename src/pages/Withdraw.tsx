import { useState } from 'react';
import { ChevronLeft, Eye, EyeOff, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useLoading } from '../contexts/LoadingContext';

export default function Withdraw() {
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleConfirm = () => {
    const numAmount = parseFloat(amount);

    if (!amount) {
      showToast('por favor, insira o valor do saque');
      return;
    }
    if (isNaN(numAmount) || numAmount < 1000 || numAmount > 1000000) {
      showToast('o valor deve estar entre 1000 e 1.000.000,00 kz');
      return;
    }
    if (!address) {
      showToast('por favor, insira o endereço para retirada (iban)');
      return;
    }
    if (!password) {
      showToast('por favor, insira sua senha segura');
      return;
    }

    showLoading();
    setTimeout(() => {
      hideLoading();
      // success simulation
      showToast('solicitação de saque enviada com sucesso!');
      setAmount('');
      setAddress('');
      setPassword('');
    }, 1500);
  };

  const showToast = (message: string) => {
    setFeedback(message);
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[#d1d5db]">
      {/* header */}
      <header className="bg-[#0000cc] text-white px-4 py-3 flex items-center sticky top-0 z-50">
        <button onClick={() => navigate(-1)} className="flex-none cursor-pointer">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="flex-grow text-center text-[15px] font-bold mr-6">retirar</h1>
      </header>

      <main className="p-4 space-y-4 max-w-md mx-auto">
        {/* main content card */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          {/* alert text */}
          <div className="flex justify-between items-start mb-4">
            <p className="text-[12.5px] text-red-500 italic">abrir limite em até 24 horas.</p>
            <div className="text-blue-800">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>

          {/* balance display card */}
          <div className="bg-[#e9ecef] rounded-xl p-4 mb-6">
            <p className="text-[12.5px] text-gray-500 font-medium">guacador</p>
            <div className="flex items-baseline space-x-1 my-1">
              <span className="text-[24px] font-bold text-[#0000cc]">0.000</span>
              <span className="text-[12.5px] font-semibold text-gray-400">KZs</span>
            </div>
            <p className="text-[12.5px] text-gray-500">valor pendente: <span className="text-[#f97316] font-bold">0,00 KZs</span></p>
          </div>

          {/* payment methods section */}
          <div className="mb-6">
            <h3 className="text-[12.5px] font-bold text-gray-700 mb-3">métodos de pagamento</h3>
            <div className="flex flex-wrap gap-2">
              {/* active bank BAI */}
              <button className="flex items-center space-x-1 border-2 border-[#0000cc] bg-[#0000cc] text-white px-3 py-1.5 rounded-md text-[12.5px] font-bold">
                <img
                  alt="bank-icon"
                  className="w-4 h-4 rounded-full"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDT2yWRZiDDPR5KiIQW8QDBXwkC0iP95o8cd6hfBPNiGUcfIzWQkM22m4yRfn9HqeE_-3jx44Nl14opzkdZKiwgGHgAu8hVYKR_A3RBfQZvG3qQks2McrRuqMX8Vh6XcjcVjRKFrAl9Jguc2UH212ysmPU2rvGEo_9HaEJI4ZqTCXF11MAHfdcGnenjb8i7AADJGG93ib1raPBJypbGJHwJTow803OQT0gEBJkzW69nPdDq3dbj-JRtq0pT5EeKz35-vkWZlUxp6g"
                  referrerPolicy="no-referrer"
                />
                <span>bank bai</span>
              </button>
              {/* angola */}
              <button className="flex items-center space-x-1 border border-gray-300 bg-white text-gray-500 px-3 py-1.5 rounded-md text-[12.5px] font-bold">
                <img
                  alt="angola-icon"
                  className="w-4 h-4 rounded-full"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAIIrIpIy7O9QhQzc9I73Rauw8CA6XeqPLIiI2TMPgn4tW3aQpHXVg7PyB00nTxHsRfuMe-YTFblWIq1KGIz4TAud7xX7SgLNPpe_LkhUyKb08N3IVFyIGUBgH4AcxuL9jf8edRdQi0Z7Z7y-UD2i_Fs__BCIxogbxvXMMQYEhLvpMyRTHS02QXf3A5nncLsrHtRDQ1-4fHUf3UXXyB_pwK8kz7H3AIUWG51ZcJF3x5lL6NuDJz6OPaZzElu-HItGu1MURd54-U5Q"
                  referrerPolicy="no-referrer"
                />
                <span>angola</span>
              </button>
            </div>
          </div>

          {/* withdrawal limit info */}
          <div className="mb-6">
            <label className="block text-[12.5px] font-bold text-gray-700 mb-1">faixa de limite de saque 1000 - 1.000.000,00 kz</label>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\p{L}\p{N}]/gu, ''))}
              className="w-full border-b border-gray-200 focus:border-[#0000cc] focus:ring-0 text-[12.5px] py-2 px-0 text-gray-700 outline-none"
              placeholder="faixa de limite de saque 1000 - 1.000.000,00"
              type="number"
            />
          </div>

          {/* withdrawal address input */}
          <div className="mb-6">
            <label className="block text-[12.5px] font-bold text-gray-700 mb-1">endereço para retirada</label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value.replace(/[^\p{L}\p{N}]/gu, ''))}
              className="w-full border-b border-gray-200 focus:border-[#0000cc] focus:ring-0 text-[12.5px] py-2 px-0 text-gray-700 outline-none"
              placeholder="endereço para retirada (iban)"
              type="text"
            />
          </div>

          {/* security password input */}
          <div className="mb-6 relative">
            <label className="block text-[12.5px] font-bold text-gray-700 mb-1">senha segura</label>
            <div className="relative">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value.replace(/[^\p{L}\p{N}]/gu, ''))}
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

          {/* summary section */}
          <div className="flex flex-col space-y-2 mb-6">
            <div className="flex justify-between items-center text-[12.5px]">
              <span className="text-gray-500">taxa de manuseio</span>
              <div className="text-right">
                <span className="text-[#f97316] font-bold block">14%</span>
              </div>
            </div>
            <div className="flex justify-between items-center text-[12.5px]">
              <span className="text-gray-500">fundos recebidos</span>
              <span className="text-teal-500 font-bold">0,00&nbsp; KZs</span>
            </div>
          </div>

          {/* confirm button */}
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
              initial={{ opacity: 0, scale: 0.9, x: '-50%', y: '-50%' }}
              animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
              exit={{ opacity: 0, scale: 0.9, x: '-50%', y: '-50%' }}
              className="fixed top-1/2 left-1/2 bg-black/80 text-white px-6 py-3 rounded-xl text-[12.5px] font-medium shadow-2xl z-[100] text-center min-w-[280px]"
            >
              {feedback}
            </motion.div>
          )}
        </AnimatePresence>

        {/* instructions section */}
        <div>
          <h4 className="text-[15px] font-bold text-gray-700 mb-3">instruções para retirada</h4>
          <div className="bg-white rounded-2xl p-4 text-[12.5px] leading-relaxed text-gray-600 space-y-3 shadow-sm">
            <p>suporte para retiradas usando transferência bancária (iban).</p>
            <p>as retiradas geralmente levam de 24 a 48 minutos para chegar.</p>
            <p>o valor mínimo de saque é 1000 kz, limite máximo 1.000.000,00.</p>
            <p>a taxa de retirada é 14%.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
