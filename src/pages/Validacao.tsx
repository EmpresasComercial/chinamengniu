import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Camera, X, ShieldCheck, Clock, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useLoading } from '../contexts/LoadingContext';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB

export default function Validacao() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showLoading, hideLoading } = useLoading();

  const [fullName, setFullName] = useState('');
  const [biNumber, setBiNumber] = useState('');
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  
  const [status, setStatus] = useState<'nenhum' | 'pendente' | 'verificado' | 'rejeitado'>('nenhum');
  const [notification, setNotification] = useState<string | null>(null);

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const fetchStatus = async () => {
     if (!user) return;
     try {
       const { data, error } = await supabase.rpc('get_user_verification');
       if (error) throw error;

       if (data && data.status !== 'nenhum') {
          setStatus(data.status);
          setFullName(data.nome || '');
          setBiNumber(data.bi_numero || '');

          if (data.status === 'rejeitado') {
             setFrontPreview(null);
             setBackPreview(null);
             setStatus('nenhum');
          } else {
             const { data: sFront } = await supabase.storage.from('validacoes').createSignedUrl(data.frente_path, 3600);
             const { data: sBack } = await supabase.storage.from('validacoes').createSignedUrl(data.verso_path, 3600);
             setFrontPreview(sFront?.signedUrl || null);
             setBackPreview(sBack?.signedUrl || null);
          }
       }
     } catch (err) {
       console.error('Erro ao buscar status:', err);
     }
  };

  useEffect(() => {
    fetchStatus();
  }, [user]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        showNotification('o ficheiro deve ter no máximo 1mb.');
        return;
      }
      const previewUrl = URL.createObjectURL(file);
      if (side === 'front') {
        setFrontImage(file);
        setFrontPreview(previewUrl);
      } else {
        setBackImage(file);
        setBackPreview(previewUrl);
      }
    }
  };

  const removeImage = (e: React.MouseEvent, side: 'front' | 'back') => {
    e.stopPropagation();
    if (side === 'front') {
      setFrontImage(null);
      setFrontPreview(null);
    } else {
      setBackImage(null);
      setBackPreview(null);
    }
  };

  const handleSend = async () => {
    if (!user) return;
    if (!frontImage || !backImage || !biNumber || !fullName) {
      showNotification('por favor, preencha todos os campos e fotos.');
      return;
    }

    if (biNumber.length !== 14) {
      showNotification('o bi deve ter 14 dígitos.');
      return;
    }

    showLoading();
    try {
      const frontPath = `${user.id}/frente_${Date.now()}`;
      const backPath = `${user.id}/verso_${Date.now()}`;

      await Promise.all([
        supabase.storage.from('validacoes').upload(frontPath, frontImage),
        supabase.storage.from('validacoes').upload(backPath, backImage)
      ]);

      const { data, error } = await supabase.rpc('submit_verification', {
          p_nome: fullName,
          p_bi_numero: biNumber,
          p_frente_path: frontPath,
          p_verso_path: backPath
      });

      if (error) throw error;

      setStatus('pendente');
      showNotification('enviado com sucesso!');
    } catch (err: any) {
      showNotification('erro ao enviar. tente novamente.');
    } finally {
      hideLoading();
    }
  };

  const canSubmit = frontImage && backImage && fullName && biNumber.length === 14 && status === 'nenhum';

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA] font-sans antialiased text-gray-900 pb-12">
      <div className="relative bg-[#6D28D9] pt-4 pb-20 px-6 rounded-b-[40px] shadow-lg overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-32 h-32 bg-purple-400/20 rounded-full blur-xl"></div>
        
        <div className="relative z-10">
          <header className="flex items-center justify-between mb-8">
            <button onClick={() => navigate(-1)} className="p-1 text-white active:scale-90 transition-transform">
              <ChevronLeft className="h-6 w-6" />
            </button>
            <h1 className="text-[16px] font-bold text-white lowercase">validar</h1>
            <div className="w-8"></div>
          </header>

          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1 mt-2">
              <h2 className="text-[24px] font-black text-white leading-tight">Junte-se agora</h2>
              <p className="text-[11.5px] text-white/80 font-medium mt-3">Proteção dos seus direitos legais</p>
            </div>
            
            <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md relative transform rotate-6 border border-white/20">
               <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
               <div className="w-10 h-1 bg-white/20 absolute top-4 left-4 rounded-full"></div>
               <div className="w-14 h-1 bg-white/20 absolute top-7 left-4 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      <main className="px-5 -mt-12 relative z-20 space-y-6">
        <div className="bg-white rounded-[24px] shadow-sm p-6 border border-gray-100">
           <div className="flex items-center gap-2 mb-8">
             <div className="p-1.5 bg-gray-50 rounded-lg">
                <ShieldCheck className="w-4 h-4 text-gray-500" />
             </div>
             <span className="text-[14px] font-bold text-gray-800">Verificado</span>
           </div>

           <div className="space-y-6">
              <div className="flex flex-col gap-1 px-2">
                 <label className="text-[12px] text-gray-400 font-medium">Nome Completo</label>
                 <input 
                    type="text"
                    value={fullName}
                    onChange={(e) => status === 'nenhum' && setFullName(e.target.value)}
                    placeholder="digite o seu nome"
                    readOnly={status !== 'nenhum'}
                    className="text-[16px] font-bold text-gray-900 bg-transparent focus:outline-none placeholder:text-gray-200 border-none p-0"
                 />
              </div>

              <div className="flex flex-col gap-1 px-2">
                 <label className="text-[12px] text-gray-400 font-medium lowercase">número do certificado</label>
                 <input 
                    type="text"
                    value={biNumber}
                    maxLength={14}
                    onChange={(e) => status === 'nenhum' && setBiNumber(e.target.value.toUpperCase())}
                    placeholder="digite o número do bi"
                    readOnly={status !== 'nenhum'}
                    className="text-[16px] font-bold text-gray-900 bg-transparent focus:outline-none placeholder:text-gray-200 border-none p-0"
                 />
              </div>

              <div className="flex items-start gap-2 pt-2">
                 <div className="mt-1 flex items-center justify-center w-2.5 h-2.5 rounded-full border border-gray-400 text-[7px] text-gray-400 font-bold italic">i</div>
                 <p className="text-[9.5px] text-gray-400 leading-relaxed font-medium">
                    O nome real é utilizado apenas para determinar se é um utilizador real e para proteger a segurança dos seus fundos.
                 </p>
              </div>
           </div>
        </div>

        <div className="bg-white rounded-[24px] shadow-sm p-6 border border-gray-100 flex flex-col items-center">
           <div className="flex flex-col items-center gap-6 w-full max-w-[280px]">
              {status === 'pendente' && (
                <div className="w-full bg-orange-50 text-orange-600 py-2 px-4 rounded-xl flex items-center justify-center gap-2 mb-2 text-[12px] font-bold lowercase">
                  <Clock className="w-4 h-4" /> em análise (72h)
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 w-full">
                 {['frente', 'verso'].map((side) => (
                   <div key={side} className="flex flex-col items-center gap-2">
                    <p className="text-[10px] text-gray-400 font-bold lowercase">{side}</p>
                    <div 
                        onClick={() => status === 'nenhum' && !(side === 'frente' ? frontPreview : backPreview) && (side === 'frente' ? frontInputRef : backInputRef).current?.click()}
                        className="w-full aspect-square bg-gray-100/50 rounded-xl border border-dashed border-gray-200 flex items-center justify-center overflow-hidden relative active:scale-95 transition-all"
                    >
                        {(side === 'frente' ? frontPreview : backPreview) ? (
                          <>
                            <img src={side === 'frente' ? frontPreview! : backPreview!} className="w-full h-full object-contain" />
                            {status === 'nenhum' && (
                              <button onClick={(e) => removeImage(e, side as 'front' | 'back')} className="absolute top-1 right-1 p-0.5 text-red-500">
                                <X className="w-5 h-5" />
                              </button>
                            )}
                          </>
                        ) : (
                          <Camera className="w-5 h-5 text-gray-300" />
                        )}
                    </div>
                    <input type="file" ref={side === 'frente' ? frontInputRef : backInputRef} hidden accept="image/*" onChange={(e) => handleImageChange(e, side as 'front' | 'back')} />
                   </div>
                 ))}
              </div>

              {status === 'nenhum' && (
                <button
                  onClick={handleSend}
                  disabled={!canSubmit}
                  className={`w-full h-[50px] text-white rounded-[16px] text-[15px] font-black transition-all shadow-md mt-2 ${canSubmit ? 'bg-[#6D28D9] active:scale-95 shadow-purple-900/20' : 'bg-gray-200 cursor-not-allowed shadow-none'}`}
                >
                  enviar
                </button>
              )}
           </div>
        </div>
      </main>

      <AnimatePresence>
        {notification && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md text-white px-6 py-2.5 rounded-full text-[12px] font-medium z-[100] lowercase shadow-xl">
            {notification}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
