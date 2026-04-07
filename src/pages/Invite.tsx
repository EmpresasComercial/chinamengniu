import { ChevronLeft, Copy, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';

import { supabase } from '../lib/supabase';

export default function Invite() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [links, setLinks] = useState({ link_app_atualizado: '' });
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchLinks = async () => {
      const { data } = await supabase
        .from('atendimento_links')
        .select('link_app_atualizado')
        .single();
      if (data) setLinks({ link_app_atualizado: data.link_app_atualizado || '' });
    };
    fetchLinks();
  }, []);

  const inviteCode = profile?.invite_code || '...';
  
  let baseLink = window.location.origin;
  if (links.link_app_atualizado && links.link_app_atualizado !== '#') {
    let customLink = links.link_app_atualizado.trim();
    // Se digitou apenas o domínio (ex: newmont.online)
    if (!customLink.startsWith('http')) {
      customLink = `https://${customLink.startsWith('www.') ? '' : 'www.'}${customLink}`;
    }
    // Adiciona o /#/register se o link ainda não tiver
    if (!customLink.includes('/register') && !customLink.includes('/registrar')) {
      customLink = customLink.endsWith('/') ? `${customLink}#/register` : `${customLink}/#/register`;
    }
    baseLink = customLink;
  } else {
    baseLink = `${baseLink}/#/register`;
  }

  const inviteLink = baseLink.includes('(codigo)')
    ? baseLink.replace('(codigo)', inviteCode)
    : baseLink.includes('join=') || baseLink.includes('invite=')
      ? baseLink
      : baseLink.includes('?')
        ? `${baseLink}&join=${inviteCode}`
        : `${baseLink}?join=${inviteCode}`;

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
    const msg = encodeURIComponent(inviteLink);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  const shareOnTelegram = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(inviteLink)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#E8EBF2] page-content">
      {/* Header and Main Blue Card */}
      <section className="bg-[#0000CC] pb-6 rounded-b-xl  relative">
        {/* Header Navigation */}
        <header className="flex items-center px-4 h-14 text-white">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2" title="voltar" aria-label="voltar">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="flex-grow text-center text-[15px] font-bold pr-8">convidar amigos</h1>
        </header>

        {/* Invite Codes Section */}
        <div className="px-6 mt-4 text-white space-y-3">
          {/* Code */}
          <div>
            <p className="text-[11px] mb-1 font-bold text-white/70 tracking-wider">meu código de convite</p>
            <div className="flex items-center gap-3">
              <span className="text-[22px] font-black tracking-[4px]">{inviteCode}</span>
              <button
                onClick={() => handleCopy(inviteCode, 'código')}
                className="bg-gradient-to-r from-[#7367f0] to-[#a067f0] px-4 h-10 rounded-full text-[12px] text-white font-medium flex items-center gap-1.5 shrink-0 lowercase"
              >
                <Copy className="w-3.5 h-3.5" />
                copiar
              </button>
            </div>
          </div>

          {/* Link */}
          <div>
            <p className="text-[11px] mb-1 font-bold text-white/70 tracking-wider">link de convite</p>
            <div className="flex items-center gap-2">
              <div className="bg-white/10 rounded-xl px-3 py-1.5 flex-1 min-w-0">
                <p className="text-[11px] text-white/80 truncate leading-relaxed">{inviteLink}</p>
              </div>
              <button
                onClick={() => handleCopy(inviteLink, 'link')}
                className="bg-gradient-to-r from-[#7367f0] to-[#a067f0] px-4 h-10 rounded-full text-[12px] text-white font-medium flex items-center gap-1.5 shrink-0 lowercase"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'copiado!' : 'copiar'}
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal Divider */}
        <div className="mx-6 border-t border-white/20 mt-4 pt-4">
          <p className="text-white text-center text-[11px] font-semibold mb-3 opacity-85 leading-tight">
            para partilhar com whatsap ou telegram clique no icone em seguida abrirá automaticamente e selecione o destinatário de whatsap ou telegram.
          </p>
          <p className="text-white text-center text-[11px] font-bold mb-4">
            compartilhe com
          </p>

          {/* Social Media Icons Row */}
          <div className="flex items-center justify-center gap-6">
            {/* Telegram */}
            <button onClick={shareOnTelegram} title="telegram" aria-label="partilhar no telegram" className="w-10 h-10 bg-white rounded-full flex items-center justify-center ">
              <img
                alt="Telegram"
                className="w-6 h-6 object-contain"
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Telegram_logo.svg/512px-Telegram_logo.svg.png"
              />
            </button>
            {/* WhatsApp */}
            <button
            onClick={shareOnWhatsApp}
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center "
            title="whatsapp"
          >    <img
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
          className="w-full h-[45px] bg-[#000099] text-white rounded-xl text-[15px] font-normal  mb-6"
        >
          minha equipe
        </button>

        {/* Bottom Info Card */}
        <div className="bg-white rounded-xl p-8 ">
          <div className="space-y-6 text-[13px] text-gray-800">
            <p className="text-center font-bold text-[#000099]">
              receba um desconto quando seu amigo recarregar o celular.
            </p>

            <div className="space-y-2">
              <p className="font-bold text-[#333]">nota</p>
              <p className="leading-relaxed text-gray-600">
                após seus subordinados realizarem o investimento, receba automaticamente a recompensa de investimento. a operação é simples e não leva muito tempo; basta copiar e partilhar.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <p className="font-bold text-[#333]">reembolso de recarga</p>
              <div className="text-gray-600 space-y-1">
                <p>• quando o subordinado de nível 1 compra um produto pela primeira vez, você ganha <strong>10%</strong> do valor investido.</p>
                <p>• quando o subordinado de nível 2 compra um produto pela primeira vez, você ganha <strong>5%</strong> do valor investido.</p>
                <p>• quando o subordinado de nível 3 compra um produto pela primeira vez, você ganha <strong>2%</strong> do valor investido.</p>
                <p className="pt-2 text-[12px] opacity-80 text-[#0000a5]">válido pela primeira recarga para todos os níveis, contados a partir da criação: 365 dias.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <div className="fixed inset-0 pointer-events-none z-[10000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-black/80 backdrop-blur-sm text-white px-5 py-3 rounded-xl text-[12.5px]  text-center max-w-[85vw] whitespace-normal break-words pointer-events-auto"
            >
              {toastMessage}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
