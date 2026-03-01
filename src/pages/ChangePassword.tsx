import React, { useState } from 'react';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLoading } from '../contexts/LoadingContext';
import { motion, AnimatePresence } from 'motion/react';

export default function ChangePassword() {
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!oldPassword) {
      setValidationError('por favor, insira a senha antiga.');
      setTimeout(() => setValidationError(null), 3000);
      return;
    }

    if (!newPassword) {
      setValidationError('por favor, insira a nova senha.');
      setTimeout(() => setValidationError(null), 3000);
      return;
    }

    if (!confirmPassword) {
      setValidationError('por favor, confirme sua senha.');
      setTimeout(() => setValidationError(null), 3000);
      return;
    }

    if (newPassword !== confirmPassword) {
      setValidationError('a nova senha e a confirmação não coincidem.');
      setTimeout(() => setValidationError(null), 3000);
      return;
    }

    showLoading();
    setTimeout(() => {
      hideLoading();
      navigate(-1);
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#E9EAEF]">
      {/* Header */}
      <header className="bg-[#0000A5] h-12 flex items-center px-4 shrink-0">
        <div className="flex items-center w-full">
          <button onClick={() => navigate(-1)} className="text-white">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="flex-grow text-center text-white text-[15px] font-bold mr-5">
            alterar a senha
          </h1>
        </div>
      </header>

      {/* Form Area */}
      <main className="flex-grow p-4">
        <section className="bg-white rounded-2xl shadow-sm p-6 mt-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Input: Senha Antiga */}
            <div className="relative border-b border-gray-200 pb-2">
              <input
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value.replace(/[^\p{L}\p{N}]/gu, ''))}
                className="w-full border-none p-0 text-[12.5px] text-gray-700 placeholder-gray-400 focus:ring-0 bg-transparent"
                placeholder="senha antiga"
                type={showOldPassword ? "text" : "password"}
              />
              <button
                className="absolute right-0 top-0 text-gray-400"
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
              >
                {showOldPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {/* Input: Nova Senha */}
            <div className="relative border-b border-gray-200 pb-2">
              <input
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value.replace(/[^\p{L}\p{N}]/gu, ''))}
                className="w-full border-none p-0 text-[12.5px] text-gray-700 placeholder-gray-400 focus:ring-0 bg-transparent"
                placeholder="nova senha"
                type={showNewPassword ? "text" : "password"}
              />
              <button
                className="absolute right-0 top-0 text-gray-400"
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {/* Input: Confirme sua senha */}
            <div className="relative border-b border-gray-200 pb-2">
              <input
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value.replace(/[^\p{L}\p{N}]/gu, ''))}
                className="w-full border-none p-0 text-[12.5px] text-gray-700 placeholder-gray-400 focus:ring-0 bg-transparent"
                placeholder="confirme sua senha"
                type={showConfirmPassword ? "text" : "password"}
              />
              <button
                className="absolute right-0 top-0 text-gray-400"
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {/* Action Button */}
            <div className="pt-4 pb-2">
              <button
                className="w-full h-[45px] bg-[#0000A5] text-white rounded-full text-[15px] font-medium hover:opacity-90 transition-opacity"
                type="submit"
              >
                confirmar
              </button>
            </div>
          </form>
        </section>
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
    </div>
  );
}
