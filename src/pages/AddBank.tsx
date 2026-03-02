import React, { useState } from 'react';
import { ChevronLeft, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLoading } from '../contexts/LoadingContext';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';

export default function AddBank() {
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();
  const [isBankPopupOpen, setIsBankPopupOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState('');
  const [fullName, setFullName] = useState('');
  const [iban, setIban] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const banks = ['BAI', 'BIC', 'BFA', 'SOL', 'ATL'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      setValidationError('por favor, insira seu nome completo.');
      setTimeout(() => setValidationError(null), 3000);
      return;
    }

    if (!iban.trim()) {
      setValidationError('por favor, insira o endereço bancário (iban).');
      setTimeout(() => setValidationError(null), 3000);
      return;
    }

    if (!selectedBank) {
      setValidationError('por favor, selecione o nome do banco.');
      setTimeout(() => setValidationError(null), 3000);
      return;
    }

    showLoading();
    try {
      const { error } = await supabase.rpc('add_bank_account', {
        p_bank_name: selectedBank,
        p_holder_name: fullName,
        p_iban: iban
      });

      if (error) {
        setValidationError(error.message);
        setTimeout(() => setValidationError(null), 3000);
      } else {
        navigate(-1);
      }
    } catch (err: any) {
      setValidationError('Erro inesperado ao salvar banco.');
      setTimeout(() => setValidationError(null), 3000);
    } finally {
      hideLoading();
    }
  };

  return (
    <div className="min-h-screen bg-[#E8EBF2] flex flex-col">
      {/* Header */}
      <header className="bg-[#000080] text-white h-14 flex items-center px-4 sticky top-0 z-50">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="flex-1 text-center text-[15px] font-bold pr-8">adicionar banco</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4">
        <div className="bg-white rounded-3xl shadow-sm p-6 mt-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative border-b border-gray-200 py-2">
              <input
                type="text"
                placeholder="nome completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full border-none focus:ring-0 p-0 text-gray-700 placeholder-gray-400 text-[15px] bg-transparent"
              />
            </div>

            <div className="relative border-b border-gray-200 py-2">
              <input
                type="text"
                placeholder="endereço bancário (iban)"
                value={iban}
                onChange={(e) => setIban(e.target.value)}
                className="w-full border-none focus:ring-0 p-0 text-gray-700 placeholder-gray-400 text-[15px] bg-transparent"
              />
            </div>

            <div
              className="relative border-b border-gray-200 py-2 cursor-pointer flex justify-between items-center"
              onClick={() => setIsBankPopupOpen(true)}
            >
              <input
                type="text"
                placeholder="nome do banco"
                value={selectedBank}
                readOnly
                className="w-full border-none focus:ring-0 p-0 text-gray-700 placeholder-gray-400 text-[15px] bg-transparent cursor-pointer"
              />
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </div>

            <div className="pt-8 pb-2">
              <button
                type="submit"
                className="w-full h-[45px] bg-[#000080] text-white font-medium rounded-full text-[15px] hover:opacity-90 transition-opacity"
              >
                salvar
              </button>
            </div>
          </form>
        </div>
      </main>
      <AnimatePresence>
        {validationError && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: '-50%', y: '-50%' }}
            animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
            exit={{ opacity: 0, scale: 0.9, x: '-50%', y: '-50%' }}
            className="fixed top-1/2 left-1/2 bg-black/80 text-white px-6 py-3 rounded-xl text-[12.5px] font-medium shadow-2xl z-[100] text-center min-w-[280px]"
          >
            {validationError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bank Selection Popup */}
      <AnimatePresence>
        {isBankPopupOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBankPopupOpen(false)}
              className="fixed inset-0 bg-black/50 z-[60]"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[70] overflow-hidden"
            >
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-800 text-lg">selecione o banco</h3>
                <button
                  onClick={() => setIsBankPopupOpen(false)}
                  className="text-gray-500 p-2"
                >
                  ✕
                </button>
              </div>
              <div className="max-h-[50vh] overflow-y-auto">
                {banks.map((bank) => (
                  <button
                    key={bank}
                    type="button"
                    onClick={() => {
                      setSelectedBank(bank);
                      setIsBankPopupOpen(false);
                    }}
                    className="w-full text-left px-6 py-4 border-b border-gray-50 hover:bg-gray-50 active:bg-gray-100 transition-colors text-gray-700 font-medium"
                  >
                    {bank}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
