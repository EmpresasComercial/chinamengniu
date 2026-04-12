import { ChevronLeft, Copy, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '../lib/supabase';

export default function Invite() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [links, setLinks] = useState({ link_app_atualizado: '' });
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

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
    if (!customLink.startsWith('http')) {
      customLink = `https://${customLink.startsWith('www.') ? '' : 'www.'}${customLink}`;
    }
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

  const handleCopy = (text: string, type: 'code' | 'link') => {
    navigator.clipboard.writeText(text).then(() => {
      if (type === 'code') {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      } else {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }
      showToast('Copiado com sucesso!');
    });
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] relative overflow-hidden font-sans page-content">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-full h-full opacity-[0.03] pointer-events-none select-none overflow-hidden">
         <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] border-[50px] border-[#6D28D9] rounded-full"></div>
      </div>

      {/* Header */}
      <header className="flex items-center justify-between px-4 h-14 bg-white/80 backdrop-blur-sm sticky top-0 z-30">
        <button onClick={() => navigate(-1)} className="p-2 text-gray-800" title="voltar">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-[18px] font-bold text-gray-900 lowercase mr-8">partilhar</h1>
        <div className="w-6" /> {/* Spacer */}
      </header>

      <main className="px-6 pt-6 pb-20 relative z-10 flex flex-col items-center">
         <div className="w-full mb-6 relative">
            <div className="max-w-[70%]">
              <h2 className="text-[20px] font-black text-gray-900 leading-tight">Convide amigos</h2>
              <p className="text-[12.5px] text-gray-500 font-medium mt-1">Crie uma situação de win-win~</p>
            </div>
           {/* Decorative Image Mock - Similar to the red cards in the provided image */}
           <div className="absolute right-[-10px] top-[-10px] w-28 h-28 transform rotate-12 opacity-90">
                <div className="w-16 h-20 bg-[#6D28D9] rounded-xl shadow-lg relative -rotate-6">
                    <div className="w-10 h-10 bg-white/20 rounded-full absolute top-2 right-2 flex items-center justify-center">
                        <Check className="text-white w-6 h-6" />
                    </div>
                </div>
                <div className="w-16 h-20 bg-[#6D28D9]/80 rounded-xl shadow-lg absolute top-4 left-6 rotate-12"></div>
           </div>
        </div>

         {/* Main Invite Card */}
         <div className="w-full bg-white rounded-[1.5rem] shadow-xl shadow-purple-900/5 p-6 flex flex-col items-center border border-gray-50">
            {/* QR Code Section */}
            <div className="p-3 rounded-[1.5rem] border-[2px] border-[#6D28D9]/30 mb-8 bg-white">
               <div className="p-2 rounded-[1rem] border border-[#6D28D9]/10">
                 <QRCodeSVG 
                     value={inviteLink} 
                     size={125}
                     level="H"
                     includeMargin={false}
                     fgColor="#000000"
                 />
               </div>
            </div>

            {/* Code Section */}
            <div className="w-full mb-6">
               <p className="text-[12.5px] text-gray-400 font-bold mb-2 lowercase">Código de Convite</p>
               <div className="flex items-center justify-between group">
                  <span className="text-[24px] font-black text-gray-900 tracking-tight leading-none">{inviteCode}</span>
                  <button 
                    onClick={() => handleCopy(inviteCode, 'code')}
                    className="p-2 bg-gray-50 rounded-xl active:scale-90 transition-all hover:bg-purple-50"
                  >
                    {copiedCode ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-gray-400" />}
                  </button>
               </div>
            </div>

            {/* Link Section */}
            <div className="w-full">
               <p className="text-[12.5px] text-gray-400 font-bold mb-2 lowercase">Link de convite</p>
               <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 overflow-hidden">
                     <p className="text-[11px] text-[#6D28D9] font-bold underline break-all leading-tight opacity-80">
                       {inviteLink}
                     </p>
                  </div>
                  <button 
                    onClick={() => handleCopy(inviteLink, 'link')}
                    className="p-2 bg-gray-50 rounded-xl active:scale-90 transition-all hover:bg-purple-50 shrink-0"
                  >
                     {copiedLink ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-gray-400" />}
                  </button>
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
              className="bg-black/80 backdrop-blur-sm text-white px-5 py-3 rounded-xl text-[12.5px] font-bold text-center pointer-events-auto"
            >
              {toastMessage}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
