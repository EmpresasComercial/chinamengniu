import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, Send, X } from 'lucide-react';

interface SupportFABProps {
  constraintsRef: React.RefObject<HTMLDivElement>;
}

export default function SupportFAB({ constraintsRef }: SupportFABProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const handleSend = () => {
    if (!message.trim()) return;
    
    // Simulação de envio
    setShowToast(true);
    setMessage('');
    setIsOpen(false);
    
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <>
      {/* Botão Flutuante (FAB) */}
      <motion.div
        drag
        dragMomentum={false}
        dragConstraints={constraintsRef}
        initial={{ x: 0, y: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="absolute bottom-24 right-6 z-[999] cursor-grab active:cursor-grabbing"
        style={{ touchAction: 'none' }}
      >
        <motion.button
          onClick={() => setIsOpen(true)}
          animate={{ 
            boxShadow: ["0px 4px 10px rgba(109, 40, 217, 0.3)", "0px 4px 20px rgba(109, 40, 217, 0.6)", "0px 4px 10px rgba(109, 40, 217, 0.3)"]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-14 h-14 bg-[#6D28D9] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#5b21b6] transition-colors"
          title="Suporte"
        >
          <MessageCircle className="w-7 h-7" />
        </motion.button>
      </motion.div>

      {/* Toast de Confirmação */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[2000] bg-black/80 backdrop-blur-md text-white px-6 py-2.5 rounded-full text-[12px] font-medium whitespace-nowrap shadow-xl lowercase"
          >
            mensagem enviada com sucesso
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Suporte */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Conteúdo do Modal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-[320px] bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="bg-[#6D28D9] px-6 py-4 flex items-center justify-between">
                <h3 className="text-white font-bold text-[17px] lowercase">suporte</h3>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white transition-colors"
                  title="fechar"
                  aria-label="fechar modal de suporte"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-gray-500 text-[11px] font-medium lowercase px-1">
                    como podemos ajudar?
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="digite a sua mensagem aqui..."
                    className="w-full min-h-[120px] bg-gray-50 border-none focus:ring-2 focus:ring-[#6D28D9]/20 rounded-xl p-4 text-[13px] text-gray-800 placeholder:text-gray-300 resize-none lowercase"
                  />
                </div>

                <button
                  onClick={handleSend}
                  disabled={!message.trim()}
                  className="w-full h-12 bg-[#6D28D9] text-white rounded-xl flex items-center justify-center gap-2 font-bold text-[14px] active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 shadow-md shadow-[#6D28D9]/20 lowercase"
                >
                  <span>enviar</span>
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
