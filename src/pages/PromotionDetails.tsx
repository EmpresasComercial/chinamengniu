import { ChevronLeft, Star } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLoading } from '../contexts/LoadingContext';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

export default function PromotionDetails() {
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
            showToast('animal indisponível.');
            return;
        }

        showLoading();
        try {
            const { data, error } = await supabase.rpc('purchase_promocao_product', {
                p_product_id: product.id
            });

            if (error) {
                showToast(`Erro na adesão: ${error.message}`);
                return;
            }

            if (data && data.success === false) {
                showToast(`Falha: ${data.message}`);
                return;
            }

            showToast('promoção bem-sucedido');
            await refreshProfile();
            setTimeout(() => navigate('/vip'), 1500);
        } catch (err) {
            showToast('adesão indisponível');
        } finally {
            hideLoading();
        }
    };

    return (
        <div className="min-h-screen bg-[#f3f4f6] page-content">
            <header className="bg-[#000080] text-white flex items-center p-4 sticky top-0 z-10 shadow-md">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center justify-center p-1 rounded-full hover:bg-white/10 transition-colors"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h1 className="flex-1 text-center text-[15px] font-bold pr-8 font-serif">Detalhe de Promoção</h1>
            </header>

            <main className="p-3 max-w-md mx-auto">
                <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden p-3.5">
                    <div className="flex gap-3 items-center mb-4">
                        <div
                            className="w-24 h-24 rounded-lg bg-cover bg-center shrink-0 border border-slate-100"
                            style={{ backgroundImage: `url(${product?.image_url || 'https://api.mengniu.wang/upload/img/6978d793f60d.webp'})` }}
                        >
                        </div>
                        <div className="flex flex-col gap-1">
                            <h2 className="text-[15px] font-black text-slate-900 font-serif">{product?.name || 'Promoção'}</h2>
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

                    <div className="space-y-2.5 mb-6">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                            <span className="text-slate-500 text-[12px] font-medium font-serif">preço de promoção</span>
                            <span className="text-slate-900 font-bold text-[14px] font-serif">{product?.price || '0.00'} Kz</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                            <span className="text-slate-500 text-[12px] font-medium font-serif">lucro diário</span>
                            <span className="text-slate-900 font-bold text-[14px] font-serif">{product?.daily_income || '0.00'} Kz</span>
                        </div>
                        <div className="flex justify-between items-center pb-1">
                            <span className="text-slate-500 text-[12px] font-medium font-serif">duração do contrato</span>
                            <span className="text-slate-900 font-bold text-[14px] font-serif">{product?.duration_days || '0'} dias</span>
                        </div>
                    </div>

                    <button
                        onClick={handlePurchase}
                        className="w-full h-[45px] bg-[#000080] hover:bg-blue-900 text-white font-bold rounded-xl shadow-lg transition-all active:scale-[0.98] font-serif flex items-center justify-center gap-2"
                    >
                        <span>Confirmar Adesão</span>
                    </button>
                    <p className="mt-4 text-center text-slate-400 text-[10px] leading-relaxed font-serif">
                        Esta é uma oferta especial limitada. Certifique-se de que possui saldo suficiente em sua conta para participar desta promoção especial da Mengniu Company.
                    </p>
                </div>
            </main>

            {/* Feedback Toast */}
            {feedback && (
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white px-6 py-3 rounded-xl text-[12.5px] font-medium shadow-2xl z-[100] text-center min-w-[280px] font-serif">
                    {feedback}
                </div>
            )}
        </div>
    );
}
