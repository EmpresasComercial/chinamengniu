import { useState, useEffect } from 'react';
import { ChevronLeft, Megaphone, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLoading } from '../contexts/LoadingContext';
import { motion } from 'motion/react';

interface Anuncio {
  id: string;
  titulo: string;
  descricao: string;
  imagem_url: string;
  link_url: string;
  created_at: string;
}

export default function Anuncios() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showLoading, hideLoading } = useLoading();
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchAnuncios = async () => {
      showLoading();
      try {
        const { data, error } = await supabase
          .from('info_anuncio')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setAnuncios(data || []);
      } catch (error) {
        console.error('Erro ao buscar anúncios:', error);
      } finally {
        hideLoading();
      }
    };

    fetchAnuncios();
  }, [user, navigate, showLoading, hideLoading]);

  const fmtDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-AO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFDFF] font-serif antialiased pb-12">
      {/* Header Fixo */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-[#6D28D9] flex items-center px-4 z-[100] shadow-md">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 text-white active:scale-95 transition-all"
          title="voltar"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="flex-1 text-center text-white text-[16px] font-bold lowercase pr-8">anúncios</h1>
      </header>

      <main className="pt-20 px-5 space-y-6">
        {/* Banner Informativo */}
        <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100 flex items-center gap-3">
          <div className="p-2 bg-[#6D28D9] rounded-xl text-white">
            <Megaphone className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[#6D28D9] text-[13px] font-bold lowercase leading-none">anúncios exclusivos</p>
            <p className="text-purple-400 text-[10.5px] lowercase">informações personalizadas direto para você</p>
          </div>
        </div>

        {/* Lista de Anúncios */}
        <div className="space-y-5">
          {anuncios.length > 0 ? (
            anuncios.map((anuncio, index) => (
              <motion.div
                key={anuncio.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100"
              >
                {anuncio.imagem_url && (
                  <div className="relative w-full aspect-video bg-gray-50 border-b border-gray-50">
                    <img 
                      src={anuncio.imagem_url} 
                      alt={anuncio.titulo}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="p-5 space-y-2">
                   <div className="flex justify-between items-start">
                     <h3 className="text-[#1A1A1A] text-[17px] font-bold leading-tight lowercase">
                       {anuncio.titulo}
                     </h3>
                     <span className="text-gray-300 text-[10px] font-medium lowercase">
                       {fmtDate(anuncio.created_at)}
                     </span>
                   </div>
                   
                   <p className="text-gray-500 text-[13px] leading-relaxed lowercase">
                     {anuncio.descricao}
                   </p>

                   {anuncio.link_url && (
                     <a 
                       href={anuncio.link_url}
                       target="_blank"
                       rel="noopener noreferrer"
                       className="inline-flex items-center gap-1.5 text-[#6D28D9] text-[13px] font-bold mt-2 lowercase hover:underline"
                     >
                       ver mais detalhes <ExternalLink className="h-3 w-3" />
                     </a>
                   )}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 space-y-4 opacity-40">
              <Megaphone className="h-12 w-12 text-gray-300" />
              <p className="text-gray-400 text-[14px] lowercase font-medium">nenhum anúncio disponível</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
