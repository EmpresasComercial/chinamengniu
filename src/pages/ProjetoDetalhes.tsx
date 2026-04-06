import { ChevronLeft, Star, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLoading } from '../contexts/LoadingContext';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

export default function ProjetoDetalhes() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showLoading, hideLoading } = useLoading();
  const { refreshProfile } = useAuth();
  const [purchaseResult, setPurchaseResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);

  const product = location.state?.product;

  const handlePurchase = async () => {
    if (!product) {
      setPurchaseResult({ success: false, message: 'projeto indisponível' });
      setIsResultModalOpen(true);
      return;
    }

    showLoading();
    try {
      const { data, error } = await supabase.rpc('purchase_product', {
        p_product_id: product.id
      });

      hideLoading();

      if (error) {
        setPurchaseResult({ success: false, message: error.message || 'erro na conexão' });
        setIsResultModalOpen(true);
        return;
      }

      if (data && data.success === false) {
        setPurchaseResult({ success: false, message: data.message || 'erro no investimento' });
        setIsResultModalOpen(true);
        return;
      }

      setPurchaseResult({ success: true, message: data?.message || 'investimento bem-sucedido!' });
      setIsResultModalOpen(true);
      await refreshProfile();
    } catch (err) {
      hideLoading();
      setPurchaseResult({ success: false, message: 'erro inesperado' });
      setIsResultModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] page-content">
      {/* Header Section */}
      <header className="bg-[#0000AA] text-white flex items-center p-4 sticky top-0 z-10 ">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center p-1 rounded-full active:bg-white/10 transition-none"
          title="voltar"
        >
          <ChevronLeft className="text-2xl" />
        </button>
        <h1 className="flex-1 text-center text-[15px] font-bold pr-8">detalhe do projeto</h1>
      </header>

      {/* Main Content Area */}
      <main className="p-3 max-w-md mx-auto">
        {/* VIP Card Container */}
        <div className="bg-white rounded-xl  border border-slate-200 overflow-hidden p-3.5 mt-4">
          {/* VIP Header Row (Image + Title/Stars) */}
          <div className="flex gap-3 items-center mb-4">
            <div className="w-24 h-24 rounded-lg shrink-0 border border-slate-100 overflow-hidden">
              <img 
                src={product?.image_url || 'https://png.pngtree.com/png-clipart/20240615/original/pngtree-a-black-and-white-cow-with-tranparent-background-png-image_15340862.png'} 
                alt={product?.name || 'projeto'}
                className="w-full h-full object-cover object-center"
              />
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-[15px] font-black text-slate-900 leading-tight">{product?.name || 'projeto'}</h2>
              <div className="flex gap-0.5">
                {Array.from({ length: product?.purchase_limit || 1 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${(product?.bought_count || 0) > i ? "fill-[#FFD700] text-[#FFD700]" : "text-slate-300"}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Data Rows Section */}
          <div className="space-y-2.5 mb-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span className="text-slate-500 text-[12px] font-medium">frequência diária de operação</span>
              <span className="text-slate-900 font-bold text-[14px]">1</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span className="text-slate-500 text-[12px] font-medium"> rendimentos/diários</span>
              <span className="text-slate-900 font-bold text-[14px]">{product?.price > 0 ? ((product.daily_income / product.price) * 100).toFixed(2) : '0.00'}%</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span className="text-slate-500 text-[12px] font-medium">preço de investimento</span>
              <span className="text-slate-900 font-bold text-[14px]">{product?.price?.toLocaleString('pt-AO')} Kz</span>
            </div>
            <div className="flex justify-between items-center pb-1">
              <span className="text-slate-500 text-[12px] font-medium">número de dias que podem ser mantidos</span>
              <span className="text-slate-900 font-bold text-[14px]">{product?.duration_days || '365'}</span>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handlePurchase}
            className="w-full h-[45px] bg-[#0000AA] hover:bg-blue-800 text-white font-normal rounded-xl   transition-none active:scale-[0.98]"
          >
            clique para comprar
          </button>
        </div>

        {/* Footer Spacing */}
        <div className="py-6 px-4 text-center text-slate-400 text-[11px] leading-relaxed">
          certifique que possui saldo suficiente para comprar este contrato, caso contrário, por favor entre em contacto com o seu gestor para fazer depósito/transferência para recarregar a sua conta Newmont Corporation!
        </div>
      </main>

      {/* Purchase Result Modal */}
      {isResultModalOpen && purchaseResult && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
            onClick={() => setIsResultModalOpen(false)}
          />
          <div className="relative w-[85%] max-w-[320px] bg-white rounded-xl p-8  z-[10002] text-center flex flex-col items-center justify-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${purchaseResult.success ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {purchaseResult.success ? (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <X className="w-8 h-8" strokeWidth={3} />
              )}
            </div>
            
            <h3 className={`text-lg font-black lowercase mb-2 ${purchaseResult.success ? 'text-green-600' : 'text-red-600'}`}>
              {purchaseResult.success ? 'sucesso' : 'ops! houve um erro'}
            </h3>
            
            <p className="text-slate-600 text-[13px] lowercase leading-relaxed mb-8">
              {purchaseResult.message}
            </p>

            <button
              onClick={() => {
                setIsResultModalOpen(false);
                if (purchaseResult.success) navigate('/projetos');
              }}
              className={`w-full h-11 rounded-xl font-bold text-[14px] lowercase transition-none active:scale-95  ${
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
