import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronDown, Trash2, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLoading } from '../contexts/LoadingContext';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';

interface BankAccount {
  id: string;
  nome_banco: string;
  nome_completo: string;
  iban: string;
}

export default function AddBank() {
  const navigate = useNavigate();
  const { showLoading, hideLoading, registerFetch } = useLoading();
  const [isBankPopupOpen, setIsBankPopupOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState('');
  const [fullName, setFullName] = useState('');
  const [iban, setIban] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [existingAccount, setExistingAccount] = useState<BankAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const banks = ['BAI', 'BIC', 'BFA', 'SOL', 'ATL'];

  const maskIban = (raw: string) => {
    if (!raw) return raw;
    // O IBAN costuma ter 21 dígitos. Mostramos 8 no início, 5 mascarados no meio, e 8 no final.
    if (raw.length >= 21) {
      return `${raw.slice(0, 8)}*****${raw.slice(-8)}`;
    }
    // Caso o IBAN tenha tamanho diferente, usamos a lógica proporcional
    if (raw.length <= 8) return raw;
    return `${raw.slice(0, 4)}${'*'.repeat(5)}${raw.slice(-4)}`;
  };

  useEffect(() => {
    async function fetchAccount() {
      const done = registerFetch();
      try {
        const { data, error } = await supabase.rpc('get_my_bank_accounts');
        if (!error && data && data.length > 0) {
          setExistingAccount(data[0]);
        }
      } finally {
        done();
      }
    }
    fetchAccount();
  }, [registerFetch]);

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
        // Success case for bank addition
        setValidationError('bem-sucedido');
        setTimeout(() => {
          setValidationError(null);
          navigate(-1);
        }, 1500);
      }
    } catch (err: any) {
      setValidationError('falha ao salvar');
      setTimeout(() => setValidationError(null), 3000);
    } finally {
      hideLoading();
    }
  };

  const handleDelete = async () => {
    if (!existingAccount) return;
    showLoading();
    try {
      const { error } = await supabase
        .from('bancos_clientes')
        .delete()
        .eq('id', existingAccount.id);

      if (error) {
        setValidationError(error.message);
        setTimeout(() => setValidationError(null), 3000);
      } else {
        navigate(-1);
      }
    } catch {
      setValidationError('Erro ao apagar conta.');
      setTimeout(() => setValidationError(null), 3000);
    } finally {
      hideLoading();
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E8EBF2] flex flex-col page-content">
      {/* Header */}
      <header className="bg-[#000080] text-white h-14 flex items-center px-4 sticky top-0 z-50">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2" aria-label="voltar" title="voltar">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="flex-1 text-center text-[15px] font-bold pr-8">
          {existingAccount ? 'conta bancária' : 'adicionar banco'}
        </h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4">
        {existingAccount ? (
          /* — Conta já vinculada — */
          <div className="bg-white rounded-3xl shadow-sm p-6 mt-4 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-[#000080]/10 rounded-full flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-[#000080]" />
              </div>
              <div>
                <p className="text-[11px] text-gray-400 uppercase tracking-wider">banco vinculado</p>
                <p className="text-[17px] font-black text-gray-800">{existingAccount.nome_banco}</p>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-3">
              <div>
                <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">titular</p>
                <p className="text-[15px] font-semibold text-gray-700">{existingAccount.nome_completo}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">iban</p>
                <p className="text-[15px] font-mono font-semibold text-gray-700 tracking-widest break-all">
                  {maskIban(existingAccount.iban)}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full h-[45px] bg-red-500 hover:bg-red-600 text-white font-bold rounded-full text-[15px] flex items-center justify-center gap-2 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              apagar conta
            </button>
          </div>
        ) : (
          /* — Formulário de adição — */
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
        )}
      </main>

      {/* Toast */}
      <AnimatePresence>
        {validationError && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 0, y: 0 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: 0, y: 0 }}
            className="fixed inset-0 m-auto w-fit h-fit min-w-[260px] bg-black/50 backdrop-blur-sm text-white px-5 py-3 rounded-2xl text-[12.5px] shadow-xl z-[500] text-center max-w-[85vw] whitespace-normal break-words"
          >
            {validationError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Popup */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteConfirm(false)}
              className="fixed inset-0 bg-black/50 z-[60]"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[70] p-6"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-7 h-7 text-red-500" />
                </div>
                <h3 className="text-[17px] font-black text-gray-800">apagar conta bancária?</h3>
                <p className="text-[12.5px] text-gray-500">
                  esta ação é permanente. a conta vinculada será removida e não poderá ser recuperada.
                </p>
                <div className="w-full grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="h-[45px] border-2 border-gray-200 text-gray-700 font-bold rounded-full text-[14px] hover:bg-gray-50 transition-colors"
                  >
                    cancelar
                  </button>
                  <button
                    onClick={handleDelete}
                    className="h-[45px] bg-red-500 hover:bg-red-600 text-white font-bold rounded-full text-[14px] transition-colors"
                  >
                    confirmar
                  </button>
                </div>
              </div>
            </motion.div>
          </>
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
                <button onClick={() => setIsBankPopupOpen(false)} className="text-gray-500 p-2" aria-label="fechar" title="fechar">✕</button>
              </div>
              <div className="max-h-[50vh] overflow-y-auto">
                {banks.map((bank) => (
                  <button
                    key={bank}
                    type="button"
                    onClick={() => { setSelectedBank(bank); setIsBankPopupOpen(false); }}
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
