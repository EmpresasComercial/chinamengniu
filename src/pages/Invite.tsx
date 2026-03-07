import { ChevronLeft, Copy, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';

export default function Invite() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const inviteCode = profile?.invite_code || '...';
  const baseUrl = 'https://www.mengniu.wang/#/register?invite=';
  const inviteLink = `${baseUrl}${inviteCode}`;

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleCopy = (text: string, label?: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      showToast(label ? `${label} copiado!` : 'Copiado com sucesso!');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const shareOnWhatsApp = () => {
    const msg = encodeURIComponent(`🐄 Junte-se à Mengniu Company!\n\nUse o meu código de convite: *${inviteCode}*\nOu aceda ao link: ${inviteLink}`);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  const shareOnTelegram = () => {
    const msg = encodeURIComponent(`🐄 Junte-se à Mengniu Company! Código: ${inviteCode} | Link: ${inviteLink}`);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${msg}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#E8EBF2] page-content">
      {/* Header and Main Blue Card */}
      <section className="bg-[#0000CC] pb-12 rounded-b-[40px] shadow-lg relative">
        {/* Header Navigation */}
        <header className="flex items-center px-4 h-14 text-white">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="flex-grow text-center text-[15px] font-bold pr-8">convidar amigos</h1>
        </header>

        {/* Invite Codes Section */}
        <div className="px-6 mt-8 text-white space-y-6">
          {/* Code */}
          <div>
            <p className="text-[12.5px] mb-2 font-bold text-white/70 uppercase tracking-wider">meu código de convite</p>
            <div className="flex items-center gap-3">
              <span className="text-[22px] font-black tracking-[4px]">{inviteCode}</span>
              <button
                onClick={() => handleCopy(inviteCode, 'Código')}
                className="bg-gradient-to-r from-[#7367f0] to-[#a067f0] px-4 py-1.5 rounded-full text-[12px] text-white font-medium flex items-center gap-1.5 shrink-0"
              >
                <Copy className="w-3.5 h-3.5" />
                copiar
              </button>
            </div>
          </div>

          {/* Link */}
          <div>
            <p className="text-[12.5px] mb-2 font-bold text-white/70 uppercase tracking-wider">link de convite</p>
            <div className="bg-white/10 rounded-xl px-3 py-2 mb-2">
              <span className="text-[11px] text-white/80 break-all leading-relaxed">{inviteLink}</span>
            </div>
            <button
              onClick={() => handleCopy(inviteLink, 'Link')}
              className="bg-gradient-to-r from-[#7367f0] to-[#a067f0] px-4 py-1.5 rounded-full text-[12px] text-white font-medium flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'copiado!' : 'copiar link'}
            </button>
          </div>
        </div>

        {/* Horizontal Divider */}
        <div className="mx-6 border-t border-white/20 mt-8 pt-6">
          <p className="text-white text-center text-[12.5px] font-semibold mb-4 opacity-90 leading-tight">
            para partilhar com whatsap ou telegram clique no icone em seguida abrirá automaticamente e selecione o destinatário de whatsap ou telegram.
          </p>
          <p className="text-white text-center text-[12.5px] font-bold mb-6">
            compartilhe com
          </p>

          {/* Social Media Icons Row */}
          <div className="flex items-center justify-center gap-6">
            {/* Telegram */}
            <button onClick={shareOnTelegram} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md">
              <img
                alt="Telegram"
                className="w-6 h-6 object-contain"
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Telegram_logo.svg/512px-Telegram_logo.svg.png"
              />
            </button>
            {/* WhatsApp */}
            <button onClick={shareOnWhatsApp} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md">
              <img
                alt="WhatsApp"
                className="w-7 h-7 object-contain"
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png"
              />
            </button>
          </div>
        </div>
      </section>

      {/* Bottom Interaction Section */}
      <main className="px-6 mt-6 relative z-10 pb-10">
        {/* Team Button */}
        <button
          onClick={() => navigate('/equipe')}
          className="w-full h-[45px] bg-[#000099] text-white rounded-full text-[15px] font-medium shadow-lg mb-6"
        >
          minha equipe
        </button>

        {/* Bottom Info Card */}
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <div className="space-y-6 text-[13px] text-gray-800">
            <p className="text-center font-bold text-[#000099]">
              receba um desconto quando seu amigo recarregar o celular.
            </p>

            <div className="space-y-2">
              <p className="font-bold text-[#333]">nota</p>
              <p className="leading-relaxed text-gray-600">
                após seus subordinados fazer a adoção ser bem-sucedida, receber automaticamente a recompensa de investimento. a operação é simples e não leva muito tempo; basta copiar e partilhar.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <p className="font-bold text-[#333]">recompensas de equipe (adoção)</p>
              <div className="text-gray-600 space-y-1">
                <p>• <strong className="text-gray-800">Nível 1:</strong> Ganhe <strong>10%</strong> do valor sempre que um subordinado adotar um produto.</p>
                <p>• <strong className="text-gray-800">Nível 2:</strong> Ganhe <strong>5%</strong> do valor sempre que um subordinado adotar um produto.</p>
                <p>• <strong className="text-gray-800">Nível 3:</strong> Ganhe <strong>2%</strong> do valor sempre que um subordinado adotar um produto.</p>
                <p className="pt-2 text-[12px] opacity-80 text-[#0000a5]">Válido para todas as adoções por 365 dias a partir da data de criação.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: '-50%', y: '-50%' }}
            animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
            exit={{ opacity: 0, scale: 0.9, x: '-50%', y: '-50%' }}
            className="fixed top-1/2 left-1/2 bg-black/80 text-white px-6 py-3 rounded-xl text-[12.5px] font-medium shadow-2xl z-[100] text-center min-w-[200px]"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
