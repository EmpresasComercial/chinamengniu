import { ChevronLeft, Star } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLoading } from '../contexts/LoadingContext';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

export default function VIPDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showLoading, hideLoading } = useLoading();
  const { refreshProfile } = useAuth();
  const [feedback, setFeedback] = useState<string | null>(null);

  const product = location.state?.product;

  const showToast = (message: string) => {
    setFeedback(message);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handlePurchase = async () => {
    if (!product) {
      showToast('Produto inválido.');
      return;
    }

    showLoading();
    try {
      const { data, error } = await supabase.rpc('purchase_product', {
        p_product_id: product.id
      });

      if (error) {
        showToast(`Erro na adoção: ${error.message}`);
        return;
      }

      if (data && data.success === false) {
        showToast(`Erro: ${data.message}`);
        return;
      }

      showToast('Adoção realizada com sucesso!');
      await refreshProfile();
      setTimeout(() => navigate('/vip'), 1500);
    } catch (err) {
      showToast('Erro inesperado ao realizar adoção');
    } finally {
      hideLoading();
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6]">
      {/* Header Section */}
      <header className="bg-[#0000AA] text-white flex items-center p-4 sticky top-0 z-10 shadow-md">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center p-1 rounded-full hover:bg-white/10 transition-colors"
        >
          <ChevronLeft className="text-2xl" />
        </button>
        <h1 className="flex-1 text-center text-[15px] font-bold pr-8">detalhe de animal</h1>
      </header>

      {/* Main Content Area */}
      <main className="p-3 max-w-md mx-auto">
        {/* VIP Card Container */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden p-3.5">
          {/* VIP Header Row (Image + Title/Stars) */}
          <div className="flex gap-3 items-center mb-4">
            <div
              className="w-24 h-24 rounded-lg bg-cover bg-center shrink-0 border border-slate-100"
              style={{ backgroundImage: `url(${product?.image_url || 'https://png.pngtree.com/png-clipart/20240615/original/pngtree-a-black-and-white-cow-with-tranparent-background-png-image_15340862.png'})` }}
            >
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-[15px] font-black text-slate-900">{product?.name || 'vaca'}</h2>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-5 h-5 fill-[#FFD700] text-[#FFD700]" />
                ))}
              </div>
            </div>
          </div>

          {/* Data Rows Section */}
          <div className="space-y-2.5 mb-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span className="text-slate-500 text-[12px] font-medium">frequência diária de alimentação</span>
              <span className="text-slate-900 font-bold text-[14px]">1</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span className="text-slate-500 text-[12px] font-medium"> rendimentos/diários</span>
              <span className="text-slate-900 font-bold text-[14px]">4%</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span className="text-slate-500 text-[12px] font-medium">preço de adoção</span>
              <span className="text-slate-900 font-bold text-[14px]">{product?.price || '0.00'} Kz</span>
            </div>
            <div className="flex justify-between items-center pb-1">
              <span className="text-slate-500 text-[12px] font-medium">número de dias que podem ser mantidos</span>
              <span className="text-slate-900 font-bold text-[14px]">{product?.duration_days || '365'}</span>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handlePurchase}
            className="w-full h-[45px] bg-[#0000AA] hover:bg-blue-800 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
          >
            clique para comprar
          </button>
        </div>

        {/* Footer Spacing */}
        <div className="py-6 px-4 text-center text-slate-400 text-[11px] leading-relaxed">
          certifique que possui saldo suficiente para comprar esse animal, caso contrário, por favor entre em contacto com o seu gestor para fazer depósito/transferência para recarregar a sua conta Mengniu Company!
        </div>
      </main>

      {/* Feedback Toast */}
      {feedback && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white px-6 py-3 rounded-xl text-[12.5px] font-medium shadow-2xl z-[100] text-center min-w-[280px]">
          {feedback}
        </div>
      )}
    </div>
  );
}
