import { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
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

export default function Projetos() {
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
          message: data.message || 'erro ao processar ativação' 
        });
        setIsResultModalOpen(true);
        return;
      }

      setPurchaseResult({ 
        success: true, 
        message: data?.message || 'ativação realizada com sucesso!' 
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
      } finally {
        done();
      }
    }
    loadData();
  }, [user, registerFetch]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 page-content">

      <main className="bg-slate-50 flex-grow text-black px-4 pt-6 pb-20">
        <h2 className="text-[18px] font-black text-slate-800 mb-6 lowercase">infraestrutura de ia</h2>
        <div className="space-y-3">
          {products.map((vip) => (
            <div
              key={vip.id}
              className="bg-white p-4 rounded-2xl border border-slate-100 flex gap-4 relative shadow-sm mb-4"
            >
              {/* Product Image */}
              <div className="w-[120px] shrink-0 h-[100px] flex items-center justify-center rounded-xl overflow-hidden self-center">
                <img 
                  src={vip.image_url} 
                  alt={vip.name} 
                  className="w-full h-full object-cover" 
                />
              </div>

              {/* Product Details */}
              <div className="flex-1 space-y-1">
                <h3 className="text-[16px] font-black text-slate-900 uppercase pr-8">
                  {vip.name}
                </h3>
                
                <div className="space-y-0.5 text-[11px] text-slate-500 font-medium lowercase">
                  <p>preço: <span className="text-slate-900 font-bold uppercase tracking-tighter">aoa{vip.price.toFixed(2)}</span></p>
                  <p>período de validade: <span className="text-slate-900 font-bold uppercase tracking-tighter">{vip.duration_days} dias</span></p>
                  <p>renda diária: <span className="text-slate-900 font-bold uppercase tracking-tighter">aoa{vip.daily_income.toFixed(2)}</span></p>
                  <p>rendimento horário: <span className="text-slate-900 font-bold uppercase tracking-tighter">aoa{(vip.daily_income / 24).toFixed(2)}</span></p>
                  <p>limite de quantidade: <span className="text-slate-900 font-bold uppercase tracking-tighter">{vip.purchase_limit}</span></p>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      setSelectedProduct(vip);
                      setIsPurchaseModalOpen(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 h-9 flex items-center justify-center rounded-xl text-[12px] font-bold active:scale-95 transition-all shadow-md shadow-blue-600/20"
                  >
                    ativar rede
                  </button>
                </div>
              </div>

              {profile?.state === vip.name && (
                <div className="absolute top-4 right-4">
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                </div>
              )}
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
          <div className="relative w-full max-w-[280px] bg-white rounded-xl p-5  z-[101] text-center">
            <h3 className="text-[#000080] font-black text-[16px] lowercase mb-3">confirmar ativação</h3>
            <p className="text-slate-600 text-[13px] lowercase leading-relaxed mb-6 px-1">
              tens a certeza que desejas ativar o modelo <span className="font-bold text-[#000080]">{selectedProduct.name.toLowerCase()}</span> no preço de <span className="font-bold text-[#FF0000]">{selectedProduct.price.toLocaleString('pt-AO')} kz</span>?
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
                className="h-[38px] bg-[#0000AA] hover:bg-blue-800 text-white font-normal rounded-xl text-[13px] lowercase  transition-colors"
              >
                ativar
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
          <div className="relative w-full max-w-[260px] bg-white rounded-[1.5rem] p-5  z-[10002] text-center flex flex-col items-center justify-center">
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
              className={`w-full h-9 rounded-xl font-bold text-[13px] lowercase transition-none  ${
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
