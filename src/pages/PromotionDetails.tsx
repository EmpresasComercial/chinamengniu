import { ChevronLeft, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLoading } from '../contexts/LoadingContext';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

export default function PromotionDetails() {
    const navigate = useNavigate();
    const location = useLocation();
    const { showLoading, hideLoading, registerFetch } = useLoading();
    const { refreshProfile } = useAuth();
    const [purchaseResult, setPurchaseResult] = useState<{ success: boolean; message: string } | null>(null);
    const [isResultModalOpen, setIsResultModalOpen] = useState(false);

    const product = location.state?.product;

    const handlePurchase = async () => {
        if (!product) {
            setPurchaseResult({ success: false, message: 'animal indisponível' });
            setIsResultModalOpen(true);
            return;
        }

        const done = registerFetch();
        showLoading();
        try {
            const { data, error } = await supabase.rpc('purchase_promocao_product', {
                p_product_id: product.id
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

            if (data && data.success === false) {
                setPurchaseResult({ 
                    success: false, 
                    message: data.message || 'erro ao processar solicitação' 
                });
                setIsResultModalOpen(true);
                return;
            }

            setPurchaseResult({ 
                success: true, 
                message: data?.message || 'promoção adquirida com sucesso!' 
            });
            setIsResultModalOpen(true);
            await refreshProfile();
        } catch (err) {
            hideLoading();
            done();
            setPurchaseResult({ 
                success: false, 
                message: 'erro inesperado ao processar adesão' 
            });
            setIsResultModalOpen(true);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#0000A5] page-content uppercase-none">
            <header className="p-4 text-white flex items-center">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center justify-center p-1 rounded-full active:bg-white/10 transition-none"
                    title="voltar"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h1 className="flex-1 text-center text-[15px] font-bold pr-8 lowercase">detalhe da promoção</h1>
            </header>

            <main className="bg-[#EBF1FF] rounded-t-[1.5rem] flex-grow text-black p-6 mt-2 mb-20">
                <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden p-6 mt-4">
                    <div className="flex flex-col items-center">
                        <p className="text-slate-400 text-[11px] font-bold lowercase mb-4 tracking-wider">animal de promoção limitada</p>
                        <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center p-3 mb-4 border border-slate-100">
                            <img src={product?.image_url} className="w-full h-full object-contain" alt={product?.name} />
                        </div>
                        <h3 className="text-[#000080] font-black text-lg lowercase mb-1">{product?.name.toLowerCase()}</h3>
                        <div className="flex gap-0.5 mb-6">
                            {Array.from({ length: product?.purchase_limit || 1 }).map((_, i) => (
                                <span key={i} className={(product?.bought_count || 0) > i ? "text-[#FFD700]" : "text-slate-200"}>★</span>
                            ))}
                        </div>

                        <div className="w-full space-y-2 mb-8">
                            <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                                <span className="text-slate-400 text-[11px] lowercase font-medium">rendimento diário</span>
                                <span className="text-green-600 font-black text-[13.5px]">{product?.daily_income.toLocaleString('pt-AO')} kz p/ dia</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                                <span className="text-slate-400 text-[11px] lowercase font-medium">preço de promoção</span>
                                <span className="text-[#FF0000] font-black text-[13.5px]">{product?.price.toLocaleString('pt-AO')} kz</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400 text-[11px] lowercase font-medium">período de adoção</span>
                                <span className="text-slate-900 font-black text-[13.5px]">{product?.duration_days} dias</span>
                            </div>
                        </div>

                        <button
                            onClick={handlePurchase}
                            className="w-full h-[45px] bg-[#0000AA] hover:bg-blue-800 text-white font-bold rounded-xl shadow-lg transition-none active:scale-[0.98] lowercase text-[14px] flex items-center justify-center"
                        >
                            Confirmar Adesão
                        </button>
                        <p className="mt-6 text-center text-slate-400 text-[10px] leading-relaxed lowercase">
                            Esta é uma oferta especial limitada. Certifique-se de que possui saldo suficiente em sua conta para participar desta promoção especial da Mengniu Company.
                        </p>
                    </div>
                </div>
            </main>

            {/* Purchase Result Modal */}
            {isResultModalOpen && purchaseResult && (
                <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-[1px]"
                        onClick={() => setIsResultModalOpen(false)}
                    />
                    <div className="relative w-[85%] max-w-[320px] bg-white rounded-[2rem] p-8 shadow-2xl z-[10002] text-center flex flex-col items-center justify-center">
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
                                if (purchaseResult.success) navigate('/vip');
                            }}
                            className={`w-full h-11 rounded-2xl font-bold text-[14px] lowercase transition-none active:scale-95 shadow-lg ${
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
