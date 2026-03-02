import { useState, useEffect } from 'react';
import { ArrowLeftRight, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLoading } from '../contexts/LoadingContext';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function Reproducao() {
  const navigate = useNavigate();
  const { setIsLoading } = useLoading();
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<any[]>([]);


  useEffect(() => {
    async function fetchPurchases() {
      if (!user) return;

      // Primeiro buscamos todos os produtos para ter as imagens corretas
      const { data: productsData } = await supabase
        .from('products')
        .select('name, image_url');

      const { data: historyData, error } = await supabase
        .from('historico_compras')
        .select('*')
        .eq('user_id', user.id)
        .order('data_compra', { ascending: false });

      if (error) {
        console.error('Error fetching history:', error);
        return;
      }

      if (historyData) {
        const formattedData = historyData.map((item: any) => {
          // Tenta encontrar a imagem do produto correspondente pelo nome
          const product = productsData?.find(p => p.name === item.nome_produto);
          return {
            ...item,
            image_url: product?.image_url || 'https://png.pngtree.com/png-clipart/20240615/original/pngtree-a-black-and-white-cow-with-tranparent-background-png-image_15340862.png'
          };
        });
        setPurchases(formattedData);
      }
    }

    fetchPurchases();

    const channel = supabase.channel('realtime_purchases')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'historico_compras',
        filter: `user_id=eq.${user?.id}`
      }, () => {
        fetchPurchases();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleStart = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0000AA] text-white p-4 page-content">
      {/* Banner Card */}
      <section className="relative rounded-xl overflow-hidden mb-4">
        <img
          alt="Banner Cow"
          className="w-full h-auto object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_dmEaeb_6QdTc9_t3C9uz0fPnsvMp25ERBHFoJFw9-ZJkyj9fv3txK-A_CYl2G2NTtY8S2GflPhIURitNTkIAqQ4w7Q_bXLJORqADk92DnNXFA1rwzZduTXz4LySeAXyWjQ-6N_p0dik_C-Bdrw7TelHwWYSh43i_QtxINNceX05WLGuc4ioII6DK_zfKOrera0B4SvL56bRw2yqHvZMiSeEK_Y5XQC776XoZFgwCKTc12o5hspuU26F14CUmCioOhLAD6GloKw"
          loading="lazy"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <h2 className="text-[15px] font-bold lowercase tracking-tight">alimentação inteligente</h2>
          <p className="text-[10px] text-gray-200">criação inteligente, segura e robusta</p>
        </div>

        {/* VIP Badge */}
        <div className="absolute top-3 left-3 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-2">
          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center overflow-hidden p-1">
            <img
              alt="Mengniu Company logo"
              className="w-full h-full object-contain"
              src="https://s3-symbol-logo.tradingview.com/mengniu-dairy--600.png"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold">VIP0</span>
            <div className="flex text-[8px] text-yellow-400">☆☆☆☆☆</div>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-2 gap-y-4 mb-6 px-1">
        <div>
          <p className="text-[10px] text-gray-300">conta de reprodução</p>
          <p className="text-[15px] font-bold">0.00 Kz</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-300">ativos de lucro</p>
          <p className="text-[15px] font-bold">0.00 Kz</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-300">renda diária</p>
          <p className="text-[12.5px] font-semibold">0.00%</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-300">usado / número total de vezes</p>
          <p className="text-[12.5px] font-semibold">0/0</p>
        </div>
        <div className="col-span-2 mt-2">
          <p className="text-[10px] text-gray-300">horário de reinicialização da alimentação</p>
          <p className="text-[15px] font-bold lowercase">reinicialização concluída</p>
        </div>
      </section>

      {/* Action Buttons */}
      <section className="grid grid-cols-2 gap-3 mb-8">
        <button
          onClick={() => navigate('/transferencia-de-fundos')}
          className="bg-[#D2F076] text-black rounded-lg p-4 flex items-center justify-between text-left font-black lowercase leading-[1] h-[45px] shadow-lg shadow-black/20"
        >
          <span className="text-[12px]">trocar saldo</span>
          <ArrowLeftRight className="w-5 h-5" />
        </button>
        <button
          onClick={handleStart}
          className="bg-[#D2F076] text-black rounded-lg p-4 flex items-center justify-between text-left font-black lowercase leading-[1] h-[45px] shadow-lg shadow-black/20"
        >
          <span className="text-[12px]">comece agora</span>
          <Play className="w-5 h-5 fill-current" />
        </button>
      </section>


      {/* History Section */}
      <section className="bg-[#EBF1FF] rounded-t-[2.5rem] p-8 -mx-4 flex-grow min-h-[400px]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[#000080] font-black text-[15px] lowercase tracking-wider">registros históricos</h3>
          <button className="text-blue-600 text-[11px] font-bold lowercase underline">veja mais</button>
        </div>

        <div className="flex flex-col">
          {purchases.length > 0 ? (
            <div className="grid grid-cols-3 gap-x-2 gap-y-8 pt-2">
              {purchases.map((item) => (
                <div key={item.id} className="flex flex-col items-center text-center font-serif">
                  {/* Imagem do Animal - Tamanho reduzido para 50px conforme solicitado */}
                  <div className="w-[50px] h-[50px] mb-2 flex items-center justify-center relative">
                    <img
                      alt={item.nome_produto}
                      className="w-full h-full object-contain drop-shadow-sm animate-walk mix-blend-multiply"
                      src={item.image_url}
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Nome do Animal - Lowercase conforme regra */}
                  <h4 className="font-bold text-[18px] text-black lowercase leading-tight tracking-tight">
                    {item.nome_produto}
                  </h4>

                  {/* Duração - Formato dias/X conforme regra */}
                  <p className="text-[15px] text-black font-medium">
                    dias/{item.duracao_dias}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center pt-10">
              <div className="w-20 h-20 mb-4 opacity-30">
                <img
                  alt="vazio"
                  className="w-full h-full object-contain"
                  src="https://www.mengniu.wang/assets/empty-image-CHCN_UjN.png"
                />
              </div>
              <p className="text-gray-400 text-[12px] font-bold lowercase tracking-widest">nenhum registro</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
