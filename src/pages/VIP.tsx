import { useState, useEffect, useCallback, useMemo } from 'react';
import { Send, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLoading } from '../contexts/LoadingContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  daily_income: number;
  total_income?: number;
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
  const [promoCount, setPromoCount] = useState(0);

  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [purchaseResult, setPurchaseResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);

  const handlePurchase = useCallback(async () => {
    if (!selectedProduct) return;

    setIsPurchaseModalOpen(false);
    
    const done = registerFetch();
    showLoading();
    try {
      const { data, error } = await supabase.rpc('purchase_product', {
        p_product_id: selectedProduct.id
      });

      hideLoading();
      done();

      if (error) {
        setPurchaseResult({ 
          success: false, 
          message: error.message || 'erro na conexão com o servidor' 
        });
        setIsResultModalOpen(true);
        return;
      }

      if (data?.success === false) {
        setPurchaseResult({ 
          success: false, 
          message: data.message || 'erro ao processar adoção' 
        });
        setIsResultModalOpen(true);
        return;
      }

      setPurchaseResult({ 
        success: true, 
        message: data?.message || 'adoção realizada com sucesso!' 
      });
      setIsResultModalOpen(true);
      await refreshProfile();
    } catch (err) {
      hideLoading();
      done();
      setPurchaseResult({ 
        success: false, 
        message: 'erro inesperado ao processar solicitação' 
      });
      setIsResultModalOpen(true);
    }
  }, [selectedProduct, showLoading, hideLoading, registerFetch, refreshProfile]);

  useEffect(() => {
    async function loadData() {
      const done = registerFetch();
      try {
        const productsPromise = supabase
          .from('products')
          .select('id, name, description, price, daily_income, total_income, duration_days, image_url, purchase_limit')
          .eq('status', 'active')
          .order('price', { ascending: true });

        const historyPromise = user 
          ? supabase.from('historico_compras').select('nome_produto').eq('user_id', user.id)
          : Promise.resolve({ data: null });

        const tarefasPromise = user
          ? supabase.from('tarefas_diarias').select('balance_correte, renda_coletada').eq('user_id', user.id)
          : Promise.resolve({ data: null });

        const [productsRes, historyRes, tarefasRes] = await Promise.all([
          productsPromise,
          historyPromise,
          tarefasPromise
        ]);

        const productsData = productsRes.data;
        const history = historyRes.data;
        const tarefas = tarefasRes.data;

        if (productsData) {
          const mappedProducts = productsData.map(p => ({
            ...p,
            bought_count: history?.filter(h => h.nome_produto === p.name).length || 0
          }));
          setProducts(mappedProducts);
        }

        if (tarefas) {
          const total = tarefas.reduce((sum, t) => sum + Number(t.balance_correte || 0), 0);
          const rendaColetada = tarefas.reduce((sum, t) => sum + Number(t.renda_coletada || 0), 0);

          setStats({
            totalRevenue: total,
            dailyIncome: rendaColetada
          });
        }
        // Buscar contagem de promoções ativas
        const { count } = await supabase
          .from('promocao_products')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active');
        
        setPromoCount(count || 0);
      } finally {
        done();
      }
    }
    loadData();
  }, [user, registerFetch]);

  return (
    <div className="flex flex-col min-h-screen bg-[#0000A5] page-content uppercase-none">
      <header className="p-4 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-white border-2 border-white flex items-center justify-center">
              <img
                alt="user level icon"
                className="w-full h-full object-contain p-1"
                src={products[0]?.image_url || "https://api.mengniu.wang/upload/img/6978d793f60d.webp"}
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
          <div className="relative">
            <button
              onClick={() => navigate('/promocao')}
              className="bg-blue-400 text-white px-4 py-1.5 rounded-full text-[10.5px] font-black active:scale-95 transition-all lowercase shadow-lg shadow-blue-900/20"
            >
              promoção
            </button>
            {promoCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-[#0000A5] shadow-sm animate-bounce">
                {promoCount}
              </span>
            )}
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center text-[10px] mb-1 lowercase">
            <span>pontuação de crédito:</span>
            <span>100</span>
          </div>
          <div className="w-full bg-white/30 h-1 rounded-full">
            <div className="bg-white h-1 rounded-full w-full"></div>
          </div>
        </div>

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

        <div
          onClick={() => navigate('/convidar')}
          className="bg-[#D4ED71] text-black flex items-center justify-between p-4 rounded-lg mb-2 cursor-pointer"
        >
          <span className="font-semibold text-[15px] text-[#000080] lowercase">convidar amigos</span>
          <Send className="w-6 h-6" />
        </div>
      </header>

      <main className="bg-[#EBF1FF] rounded-t-[1.5rem] flex-grow text-black p-6 mb-20">
        <h2 className="text-[15px] font-bold text-[#000080] mb-4 lowercase">sistema de empregos</h2>
        <div className="space-y-3">
          {products.map((vip) => (
            <div
              key={vip.id}
              className="flex bg-white p-3 rounded-xl border border-slate-100 shadow-sm relative min-h-[140px]"
            >
              {/* Product Image */}
              <div className="w-[100px] shrink-0 flex items-center justify-center bg-slate-50/50 rounded-lg p-2 mr-3 border border-slate-50/50">
                <img src={vip.image_url} alt={vip.name} className="max-h-[100px] object-contain" />
              </div>

              {/* Product Details */}
              <div className="flex flex-col flex-1 py-1 pr-16">
                <div className="flex items-center gap-1 mb-1">
                  <h3 className="text-[15px] font-black text-[#000080] lowercase leading-tight">
                    {vip.name.toLowerCase()}
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500 lowercase leading-snug mb-2 font-medium">
                  {vip.description || `ganhe comissão válida por ${vip.duration_days} dias`}<br/>
                  (limite de {vip.purchase_limit} compras)
                </p>
                <div className="space-y-1 mt-auto">
                  <p className="text-[12px] font-bold text-slate-700 lowercase leading-none">
                    kz: <span className="text-[#FF0000]">{vip.price.toLocaleString('pt-AO')}</span>
                  </p>
                  <p className="text-[12px] font-bold text-slate-700 lowercase leading-none">
                    renda diária: <span className="text-green-600">{vip.daily_income.toLocaleString('pt-AO')}</span>
                  </p>
                </div>
              </div>

              {/* Buy Button & Position Tag */}
              <div className="absolute right-3 bottom-3 flex flex-col items-end">
                {profile?.state === vip.name && (
                  <span className="absolute -top-7 right-0 bg-blue-50 text-[#0000AA] px-2 py-0.5 rounded-full text-[9px] font-black lowercase leading-none whitespace-nowrap">
                    posição atual
                  </span>
                )}
                <button
                  onClick={() => {
                    setSelectedProduct(vip);
                    setIsPurchaseModalOpen(true);
                  }}
                  className="bg-[#0000AA] hover:bg-blue-800 text-white px-5 py-1.5 rounded-[8px] text-[11.5px] font-bold lowercase active:scale-95 transition-none shadow-md shadow-blue-900/10"
                >
                  comprar
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {isPurchaseModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            onClick={() => setIsPurchaseModalOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
          />
          <div className="relative w-full max-w-[280px] bg-white rounded-3xl p-5 shadow-2xl z-[101] text-center">
            <h3 className="text-[#000080] font-black text-[16px] lowercase mb-3">confirmar adoção</h3>
            <p className="text-slate-600 text-[13px] lowercase leading-relaxed mb-6 px-1">
              tens a certeza que desejas comprar o animal <span className="font-bold text-[#000080]">{selectedProduct.name.toLowerCase()}</span> no preço de <span className="font-bold text-[#FF0000]">{selectedProduct.price.toLocaleString('pt-AO')} kz</span>?
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setIsPurchaseModalOpen(false)}
                className="h-[38px] bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold rounded-xl text-[13px] lowercase transition-colors"
              >
                cancelar
              </button>
              <button
                onClick={handlePurchase}
                className="h-[38px] bg-[#0000AA] hover:bg-blue-800 text-white font-bold rounded-xl text-[13px] lowercase shadow-md transition-colors"
              >
                adotar
              </button>
            </div>
          </div>
        </div>
      )}

      {isResultModalOpen && purchaseResult && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
            onClick={() => setIsResultModalOpen(false)}
          />
          <div className="relative w-full max-w-[260px] bg-white rounded-[1.5rem] p-5 shadow-2xl z-[10002] text-center flex flex-col items-center justify-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${purchaseResult.success ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {purchaseResult.success ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <X className="w-6 h-6" strokeWidth={3} />
              )}
            </div>
            <h3 className={`text-[15px] font-black lowercase mb-1 ${purchaseResult.success ? 'text-green-600' : 'text-red-600'}`}>
              {purchaseResult.success ? 'sucesso' : 'falhou'}
            </h3>
            <p className="text-slate-600 text-[11.5px] lowercase leading-snug mb-5 px-2">
              {purchaseResult.message}
            </p>
            <button
              onClick={() => setIsResultModalOpen(false)}
              className={`w-full h-9 rounded-xl font-bold text-[13px] lowercase transition-none shadow-md ${
                purchaseResult.success 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-[#0000AA] hover:bg-blue-800 text-white'
              }`}
            >
              entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
