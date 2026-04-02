import { useState, useEffect } from 'react';
import { Send, ChevronRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useLoading } from '../contexts/LoadingContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Product {
  id: string;
  name: string;
  price: number;
  daily_income: number;
  duration_days: number;
  image_url: string;
  purchase_limit: number;
  bought_count?: number;
}

export default function VIP() {
  const navigate = useNavigate();
  const { showLoading, hideLoading, registerFetch } = useLoading();
  const { profile, user, refreshProfile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    dailyIncome: 0
  });

  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handlePurchase = async () => {
    if (!selectedProduct) return;

    // Close modal first for clear notification UI
    setIsPurchaseModalOpen(false);
    
    const done = registerFetch();
    showLoading();
    try {
      const { data, error } = await supabase.rpc('purchase_product', {
        p_product_id: selectedProduct.id
      });

      if (error) {
        showToast(`erro: ${error.message}`);
        return;
      }

      if (data && data.success === false) {
        showToast(`erro: ${data.message}`);
        return;
      }

      showToast('adoção bem-sucedida!');
      await refreshProfile();
    } catch (err) {
      showToast('erro inesperado');
    } finally {
      hideLoading();
      done();
    }
  };

  useEffect(() => {
    async function loadData() {
      const done = registerFetch();
      try {
        // 1. Load Products & Purchase Counts
        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .eq('status', 'active')
          .order('price', { ascending: true });

        if (user && productsData) {
          // Obter contagem de compras para cada produto
          const { data: history } = await supabase
            .from('historico_compras')
            .select('nome_produto')
            .eq('user_id', user.id);

          const mappedProducts = productsData.map(p => ({
            ...p,
            bought_count: history?.filter(h => h.nome_produto === p.name).length || 0
          }));
          setProducts(mappedProducts);
        } else if (productsData) {
          setProducts(productsData);
        }

        // 2. Load Revenue Stats from tarefas_diarias
        if (user) {
          const { data: tarefas } = await supabase
            .from('tarefas_diarias')
            .select('balance_correte, renda_coletada')
            .eq('user_id', user.id);

          if (tarefas) {
            const total = tarefas.reduce((sum, t) => sum + Number(t.balance_correte || 0), 0);
            const rendaColetada = tarefas.reduce((sum, t) => sum + Number(t.renda_coletada || 0), 0);

            setStats({
              totalRevenue: total,
              dailyIncome: rendaColetada
            });
          }
        }
      } finally {
        done();
      }
    }
    loadData();
  }, [user, registerFetch]);

  return (
    <div className="flex flex-col min-h-screen bg-[#0000A5] page-content uppercase-none">
      {/* Header Section */}
      <header className="p-4 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-white border-2 border-white flex items-center justify-center">
              <img
                alt="cow icon"
                className="w-full h-full object-contain p-1"
                src="https://api.mengniu.wang/upload/img/6978d793f60d.webp"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h1 className="text-[15px] font-bold lowercase">{profile?.state || 'vip0'}</h1>
              <div className="flex text-[11px] gap-0.5 mt-0.5">
                {[1, 2, 3, 4, 5].map((star) => {
                  const currentLevel = parseInt((profile?.state || 'VIP0').replace(/\D/g, '')) || 0;
                  return (
                    <span key={star} className={star <= currentLevel ? "text-yellow-400" : "text-gray-400"}>
                      {star <= currentLevel ? '★' : '☆'}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/promocao')}
            className="bg-blue-600/50 text-white px-4 py-1 rounded-full text-[10px] font-semibold active:opacity-70 transition-opacity lowercase"
          >
            promoção
          </button>
        </div>

        {/* Credit Score */}
        <div className="mb-6">
          <div className="flex justify-between items-center text-[10px] mb-1 lowercase">
            <span>pontuação de crédito:</span>
            <span>100</span>
          </div>
          <div className="w-full bg-white/30 h-1 rounded-full">
            <div className="bg-white h-1 rounded-full w-full"></div>
          </div>
        </div>

        {/* Earnings Stats */}
        <div className="mb-6 relative overflow-hidden bg-white/10 p-4 rounded-xl">
          <div className="flex justify-between mb-4">
            <div>
              <p className="text-[10px] opacity-80 lowercase">receita total</p>
              <p className="text-[15px] font-bold">{stats.totalRevenue.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} kz</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] opacity-80 lowercase">renda diária</p>
              <p className="text-[15px] font-bold">{stats.dailyIncome.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} kz</p>
            </div>
          </div>
          <div className="text-center pt-2 border-t border-white/10">
            <p className="text-[10px] opacity-80 lowercase">tempo de expiração: permanente</p>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 border-[12px] border-white/10 rounded-full"></div>
        </div>

        {/* Invite Banner */}
        <div
          onClick={() => navigate('/convidar')}
          className="bg-[#D4ED71] text-black flex items-center justify-between p-4 rounded-lg mb-2 cursor-pointer"
        >
          <span className="font-semibold text-[15px] text-[#000080] lowercase">convidar amigos</span>
          <Send className="w-6 h-6" />
        </div>
      </header>

      {/* Job System List */}
      <main className="bg-[#EBF1FF] rounded-t-[1.5rem] flex-grow text-black p-6">
        <h2 className="text-[15px] font-bold text-[#000080] mb-4 lowercase">sistema de empregos</h2>
        <div className="space-y-3">
          {products.map((vip) => (
            <div
              key={vip.id}
              className="relative overflow-hidden flex flex-col bg-white p-3.5 rounded-[8px] border border-slate-100 transition-all shadow-none"
            >
              {/* artistic background - full coverage - no crop */}
              <div 
                className="absolute inset-0 opacity-[0.14] pointer-events-none bg-no-repeat bg-contain bg-center"
                style={{ 
                  backgroundImage: `url(${vip.image_url})`,
                  filter: 'grayscale(25%)'
                }}
              />

              {/* card header - compact */}
              <div className="flex items-center justify-between mb-2 relative z-10">
                <div>
                  <p className="font-black text-[14px] text-[#000080] lowercase tracking-tight mb-0.5 leading-none">
                    {vip.name.toLowerCase()}
                  </p>
                  <div className="flex text-[9px] gap-0.5 items-center leading-none">
                    {Array.from({ length: vip.purchase_limit || 1 }).map((_, i) => (
                      <span key={i} className={(vip.bought_count || 0) > i ? "text-[#FFD700]" : "text-slate-200"}>
                        {(vip.bought_count || 0) > i ? '★' : '☆'}
                      </span>
                    ))}
                  </div>
                </div>
                {profile?.state === vip.name && (
                  <span className="bg-blue-50 text-[#0000AA] px-2 py-0.5 rounded-full text-[9px] font-black lowercase leading-none">
                    posição atual
                  </span>
                )}
              </div>

              {/* info grid & buy button */}
              <div className="flex items-end justify-between border-t border-slate-50/50 pt-2.5 mt-0.5 relative z-10">
                <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 flex-1">
                  <div className="flex flex-col">
                    <p className="text-[9px] text-slate-400 mb-0.5 font-bold lowercase tracking-tight leading-none">preço</p>
                    <p className="text-[13px] font-black text-[#FF0000] lowercase leading-none">{vip.price.toLocaleString('pt-AO')} kz</p>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-[9px] text-slate-400 mb-0.5 font-bold lowercase tracking-tight leading-none">renda diária</p>
                    <p className="text-[12.5px] font-black text-green-600 lowercase leading-none">{vip.daily_income.toLocaleString('pt-AO')} kz</p>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-[9px] text-slate-400 mb-0.5 font-bold lowercase tracking-tight leading-none">duração</p>
                    <p className="text-[12.5px] font-black text-slate-800 lowercase leading-none">{vip.duration_days} dias</p>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-[9px] text-slate-400 mb-0.5 font-bold lowercase tracking-tight leading-none">limite compra</p>
                    <p className="text-[12.5px] font-black text-slate-800 lowercase leading-none">{vip.purchase_limit} vezes</p>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    setSelectedProduct(vip);
                    setIsPurchaseModalOpen(true);
                  }}
                  className="bg-[#0000AA] hover:bg-blue-800 text-white px-4 h-[22px] rounded-lg text-[10px] font-bold lowercase active:scale-95 transition-all ml-2 flex items-center justify-center"
                >
                  comprar
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* product details & purchase pop-up */}
      <AnimatePresence>
        {isPurchaseModalOpen && selectedProduct && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPurchaseModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-white rounded-[2rem] p-6 shadow-2xl z-[101]"
            >
              <div className="flex flex-col items-center">
                <p className="text-slate-400 text-[11px] font-bold lowercase mb-4 tracking-wider">detalhe do animal de compra</p>
                <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center p-3 mb-4 border border-slate-100">
                  <img src={selectedProduct.image_url} className="w-full h-full object-contain" alt={selectedProduct.name} />
                </div>
                <h3 className="text-[#000080] font-black text-lg lowercase mb-1">{selectedProduct.name.toLowerCase()}</h3>
                <div className="flex gap-0.5 mb-6">
                  {Array.from({ length: selectedProduct.purchase_limit || 1 }).map((_, i) => (
                    <span key={i} className={(selectedProduct.bought_count || 0) > i ? "text-[#FFD700]" : "text-slate-200"}>★</span>
                  ))}
                </div>

                <div className="w-full space-y-2 mb-8">
                  <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                    <span className="text-slate-400 text-[11px] lowercase font-medium">frequência alimentar</span>
                    <span className="text-slate-900 font-black text-[13.5px]">1 vez/dia</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                    <span className="text-slate-400 text-[11px] lowercase font-medium">rendimento diário</span>
                    <span className="text-green-600 font-black text-[13.5px]">{selectedProduct.daily_income.toLocaleString('pt-AO')} kz p/ dia</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                    <span className="text-slate-400 text-[11px] lowercase font-medium">preço de adoção</span>
                    <span className="text-[#FF0000] font-black text-[13.5px]">{selectedProduct.price.toLocaleString('pt-AO')} kz</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-[11px] lowercase font-medium">período de adoção</span>
                    <span className="text-slate-900 font-black text-[13.5px]">{selectedProduct.duration_days} dias</span>
                  </div>
                </div>

                <button
                  onClick={handlePurchase}
                  className="w-full h-[32px] bg-[#0000AA] hover:bg-blue-800 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98] lowercase text-[13px] flex items-center justify-center p-0"
                >
                  adotar
                </button>
                <button 
                  onClick={() => setIsPurchaseModalOpen(false)}
                  className="mt-4 text-slate-400 text-[11px] font-medium lowercase"
                  title="fechar"
                >
                  cancelar
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: '-50%', y: -20 }}
            animate={{ opacity: 1, scale: 1, x: '-50%', y: 20 }}
            exit={{ opacity: 0, scale: 0.9, x: '-50%', y: -20 }}
            className="fixed top-0 left-1/2 bg-black/80 text-white px-6 py-3 rounded-xl text-[12.5px] font-medium shadow-2xl z-[1000] text-center min-w-[280px]"
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
