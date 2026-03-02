import { useState } from 'react';
import { ChevronLeft, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useLoading } from '../contexts/LoadingContext';

export default function CustomerService() {
  const navigate = useNavigate();
  const { setIsLoading } = useLoading();
  const [notification, setNotification] = useState<string | null>(null);

  const handleWhatsAppClick = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setNotification('Redirecionando para o WhatsApp...');
      setTimeout(() => {
        setNotification(null);
        window.open('https://wa.me/1234567890', '_blank');
      }, 2000);
    }, 500);
  };

  return (
    <div className="bg-[#f3f4f6] dark:bg-[#221610] min-h-screen">
      {/* Header Section */}
      <header className="bg-[#0000AA] text-white flex items-center p-4 sticky top-0 z-10 shadow-md">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center p-1 rounded-full hover:bg-white/10 transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="flex-1 text-center text-[15px] font-bold pr-8">atendimento ao cliente</h1>
      </header>

      {/* Main Content Area */}
      <main className="p-4 max-w-md mx-auto">
        {/* VIP Card Container */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden p-4 border border-slate-200 dark:border-slate-700">

          {/* VIP Header Row (Image + Title/Stars) */}
          <div className="flex gap-4 items-center mb-6">
            <div
              className="w-24 h-24 rounded-lg bg-cover bg-center shrink-0 border border-slate-100"
              style={{ backgroundImage: 'url("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTesX5rV1rOocJY0whTEMQmZpNSSymjRNZhVA&s")' }}
            >
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-[15px] font-black text-slate-900 dark:text-white">Mengniu Company chat</h2>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-5 h-5 fill-[#FFD700] text-[#FFD700]" />
                ))}
              </div>
            </div>
          </div>

          {/* Data Rows Section */}
          <div className="space-y-4 mb-8">
            <div className="flex flex-col border-b border-slate-100 dark:border-slate-700 pb-3">
              <span className="text-slate-500 dark:text-slate-400 text-[12.5px] font-medium mb-2">
                escolha uma das opções abaixo para falar com nossa equipe de suporte.
              </span>
              <span className="text-slate-700 dark:text-slate-300 text-[12.5px]">
                horário de funcionamento: <span className="font-semibold">seg-seg, 10:00 às 22:00.</span>
              </span>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleWhatsAppClick}
            className="w-full bg-[#0000AA] hover:bg-blue-800 text-white font-bold rounded-xl shadow-lg shadow-blue-200 dark:shadow-none transition-all active:scale-[0.98] py-4"
          >
            entrar no whatsapp de vendas
          </button>
        </div>
      </main>

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: '-50%', y: '-50%' }}
            animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
            exit={{ opacity: 0, scale: 0.9, x: '-50%', y: '-50%' }}
            className="fixed top-1/2 left-1/2 bg-black/80 text-white px-6 py-3 rounded-xl text-[12.5px] font-medium shadow-2xl z-[100] text-center min-w-[280px]"
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
