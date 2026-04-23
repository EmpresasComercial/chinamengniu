import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, HeadphonesIcon, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SupportFABProps {
  constraintsRef: React.RefObject<HTMLDivElement>;
}

const WA_ICON = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export default function SupportFAB({ constraintsRef }: SupportFABProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [links, setLinks] = useState({
    whatsapp_grupo_vendas_url: '',
    whatsapp_gerente_url: ''
  });

  useEffect(() => {
    async function fetchLinks() {
      try {
        const { data, error } = await supabase.rpc('get_support_links');
        const linkData = Array.isArray(data) ? data[0] : data;
        if (!error && linkData) {
          setLinks({
            whatsapp_grupo_vendas_url: linkData.whatsapp_grupo_vendas_url || '',
            whatsapp_gerente_url: linkData.whatsapp_gerente_url || ''
          });
        }
      } catch (err) {
        // erro silenciado
      }
    }
    fetchLinks();
  }, []);

  const handleWhatsApp = (type: 'canal' | 'gerencia') => {
    const url = type === 'canal' ? links.whatsapp_grupo_vendas_url : links.whatsapp_gerente_url;
    if (url) window.open(url, '_blank');
    setIsOpen(false);
  };

  return (
    <>
      {/* FAB Button */}
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
            boxShadow: [
              '0px 4px 12px rgba(109,40,217,0.35)',
              '0px 4px 22px rgba(109,40,217,0.65)',
              '0px 4px 12px rgba(109,40,217,0.35)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-12 h-12 bg-[#6D28D9] text-white rounded-full flex items-center justify-center shadow-lg"
          title="Suporte"
        >
          <MessageCircle className="w-6 h-6" />
        </motion.button>
      </motion.div>

      {/* Support Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[1000] flex items-end justify-center sm:items-center px-0 sm:px-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative w-full max-w-[420px] bg-white rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl overflow-hidden"
            >
              {/* Drag handle (mobile) */}
              <div className="flex justify-center pt-3 pb-1 sm:hidden">
                <div className="w-10 h-1 bg-gray-200 rounded-full" />
              </div>

              {/* Header with gradient */}
              <div className="bg-gradient-to-br from-[#6D28D9] to-[#4C1D95] px-6 pt-10 pb-14">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center">
                      <HeadphonesIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-[20px] leading-tight">suporte técnico</h3>
                      <p className="text-white/60 text-[12px] font-medium mt-1">estamos aqui para ajudar</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-10 h-10 flex items-center justify-center bg-white/15 hover:bg-white/25 text-white rounded-xl transition-colors"
                    title="fechar"
                    aria-label="fechar modal de suporte"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="px-5 -mt-6 pb-12">
                <div className="flex flex-col gap-4">
                  {/* Atendimento Cliente */}
                  <button
                    onClick={() => handleWhatsApp('gerencia')}
                    className="w-full flex items-center gap-4 px-5 py-5 bg-white hover:bg-green-50 active:bg-green-100 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 transition-all active:scale-[0.98]"
                  >
                    <div className="w-14 h-14 bg-[#25D366] rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-green-500/30">
                      <WA_ICON />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-gray-900 font-black text-[16px] leading-tight lowercase">atendimento cliente</p>
                      <p className="text-gray-400 text-[12px] mt-1 lowercase">whatsapp · suporte prioritário</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 shrink-0" />
                  </button>

                  {/* Grupo de Vendas */}
                  <button
                    onClick={() => handleWhatsApp('canal')}
                    className="w-full flex items-center gap-4 px-5 py-5 bg-white hover:bg-green-50 active:bg-green-100 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 transition-all active:scale-[0.98]"
                  >
                    <div className="w-14 h-14 bg-[#25D366] rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-green-500/30">
                      <WA_ICON />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-gray-900 font-black text-[16px] leading-tight lowercase">grupo de vendas</p>
                      <p className="text-gray-400 text-[12px] mt-1 lowercase">whatsapp · canal oficial</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 shrink-0" />
                  </button>
                </div>

                {/* Footer note */}
                <p className="text-center text-gray-400 text-[11px] mt-4">
                  tempo médio de resposta · menos de 5 min
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
