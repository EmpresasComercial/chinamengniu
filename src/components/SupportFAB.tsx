import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, Send, X } from 'lucide-react';

interface SupportFABProps {
  constraintsRef: React.RefObject<HTMLDivElement>;
}

export default function SupportFAB({ constraintsRef }: SupportFABProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleWhatsApp = (type: 'canal' | 'gerencia') => {
    const phone = type === 'canal' ? '244900000000' : '244911111111'; // Substituir pelos números reais
    window.open(`https://wa.me/${phone}`, '_blank');
    setIsOpen(false);
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
          className="w-12 h-12 bg-[#6D28D9] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#5b21b6] transition-colors"
          title="Suporte"
        >
          <MessageCircle className="w-6 h-6" />
        </motion.button>
      </motion.div>

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
              className="relative w-full max-w-[340px] bg-white rounded-[2rem] shadow-2xl overflow-hidden p-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="text-[#6D28D9]">
                    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
                      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
                    </svg>
                  </div>
                  <h3 className="text-[#6D28D9] font-bold text-[18px] lowercase">suporte técnico</h3>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="w-10 h-10 flex items-center justify-center bg-gray-50 text-gray-400 hover:text-gray-600 rounded-2xl transition-colors"
                  title="fechar"
                  aria-label="fechar modal de suporte"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body - WhatsApp Buttons */}
              <div className="space-y-4">
                <button
                  onClick={() => handleWhatsApp('canal')}
                  className="w-full h-[64px] bg-[#22C55E] hover:bg-[#16a34a] text-white rounded-[1.25rem] flex items-center justify-center gap-3 font-bold text-[15px] transition-all active:scale-[0.98] shadow-lg shadow-green-500/20 lowercase"
                >
                  <div className="w-8 h-8 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.539 2.016 2.041-.536c.808.518 1.81.821 2.871.821h.001c3.182 0 5.767-2.587 5.768-5.766 0-3.18-2.585-5.767-5.767-5.767l-.026.001-.001-.001zm3.374 8.238c-.161.439-.817.817-1.129.873-.312.057-.657.094-1.071-.057-.258-.094-.582-.206-.999-.395-1.745-.785-2.883-2.564-2.97-2.678-.087-.114-.707-.941-.707-1.794 0-.853.439-1.272.597-1.442.158-.171.341-.213.456-.213.114 0 .229.001.328.006.104.004.244-.04.382.289.143.341.488 1.19.531 1.275.042.085.07.185.013.298-.056.114-.085.185-.171.285-.085.1-.185.227-.257.312-.085.086-.171.185-.071.356.1.171.439.723.94 1.17.643.573 1.18.75 1.351.836.171.085.27.071.37-.043.1-.114.426-.498.54-.668.114-.171.229-.142.383-.085.154.057 1.001.472 1.172.558.171.085.285.128.328.199.043.071.043.413-.118.851z"/>
                    </svg>
                  </div>
                  <span>canal oficial whatsapp</span>
                </button>

                <button
                  onClick={() => handleWhatsApp('gerencia')}
                  className="w-full h-[64px] bg-[#22C55E] hover:bg-[#16a34a] text-white rounded-[1.25rem] flex items-center justify-center gap-3 font-bold text-[15px] transition-all active:scale-[0.98] shadow-lg shadow-green-500/20 lowercase"
                >
                  <div className="w-8 h-8 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.539 2.016 2.041-.536c.808.518 1.81.821 2.871.821h.001c3.182 0 5.767-2.587 5.768-5.766 0-3.18-2.585-5.767-5.767-5.767l-.026.001-.001-.001zm3.374 8.238c-.161.439-.817.817-1.129.873-.312.057-.657.094-1.071-.057-.258-.094-.582-.206-.999-.395-1.745-.785-2.883-2.564-2.97-2.678-.087-.114-.707-.941-.707-1.794 0-.853.439-1.272.597-1.442.158-.171.341-.213.456-.213.114 0 .229.001.328.006.104.004.244-.04.382.289.143.341.488 1.19.531 1.275.042.085.07.185.013.298-.056.114-.085.185-.171.285-.085.1-.185.227-.257.312-.085.086-.171.185-.071.356.1.171.439.723.94 1.17.643.573 1.18.75 1.351.836.171.085.27.071.37-.043.1-.114.426-.498.54-.668.114-.171.229-.142.383-.085.154.057 1.001.472 1.172.558.171.085.285.128.328.199.043.071.043.413-.118.851z"/>
                    </svg>
                  </div>
                  <span>gerência de atendimento</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
