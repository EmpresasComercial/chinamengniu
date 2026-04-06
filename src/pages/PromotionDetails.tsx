import { ChevronLeft, X, Gift, Sparkles, Star, Zap, Sprout } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLoading } from '../contexts/LoadingContext';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

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
            setPurchaseResult({ success: false, message: 'projeto indisponível' });
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

    if (!product) return null;

    return (
        <div className="flex flex-col min-h-screen bg-[#F0F4FF] antialiased page-content overflow-hidden relative">
             {/* Elementos Decorativos de Fundo */}
             <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-24 right-14 opacity-20 text-6xl">🐄</div>
                <div className="absolute bottom-48 left-10 opacity-20 text-5xl">🚜</div>
                <div className="absolute top-[45%] left-[8%] opacity-10 text-7xl rotate-12">🌽</div>
            </div>

            <header className="relative z-20 px-4 pt-6 pb-4 flex items-center">
                <button
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 bg-[#000080] rounded-xl flex items-center justify-center   active:scale-90 transition-transform"
                    title="voltar"
                >
                    <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <div className="flex-grow text-center pr-10">
                    <h1 className="text-[14.5px] font-black tracking-tight text-[#000080] bg-white/70 backdrop-blur-sm inline-block px-5 py-2 rounded-full border border-blue-100/50 lowercase ">
                        detalhes da farm ✨
                    </h1>
                </div>
            </header>

            <main className="relative z-10 flex-grow px-5 pb-24">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-xl border border-blue-50 p-8 0_20px_50px_rgba(0,0,128,0.12)] relative overflow-hidden"
                >
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-56 h-56 bg-blue-50/60 rounded-xl blur-[90px] -mr-28 -mt-28" />
                    
                    <div className="flex flex-col items-center relative z-10 text-center">
                        <div className="bg-[#000080] text-white text-[10px] font-normal px-4 py-1.5 rounded-xl lowercase mb-7   tracking-widest uppercase">
                             oferta vip limitada
                        </div>

                        <div className="w-36 h-36 bg-gradient-to-br from-indigo-50/50 to-blue-50/50 rounded-xl flex items-center justify-center p-5 border border-blue-50  mb-7">
                            <img src={product.image_url} className="w-full h-full object-contain " alt={product.name} />
                        </div>

                        <h2 className="text-[26px] font-black text-slate-800 lowercase mb-1 leading-none tracking-tighter">
                            {product.name.toLowerCase()}
                        </h2>
                        
                        <div className="flex gap-1.5 mb-10">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star 
                                    key={i} 
                                    className={`w-4.5 h-4.5 ${(product.bought_count || 0) > i ? 'text-yellow-400 fill-yellow-400' : 'text-slate-100 fill-slate-100'}`} 
                                    strokeWidth={3.5}
                                />
                            ))}
                        </div>

                        <div className="w-full space-y-4 mb-12">
                            <div className="bg-slate-50/70 rounded-xl p-5 flex justify-between items-center border border-slate-100/30">
                                <div className="flex flex-col items-start">
                                    <span className="text-[11px] text-slate-400 font-bold lowercase tracking-tighter leading-none mb-1.5">rendimento diário</span>
                                    <span className="text-green-600 font-black text-[18px] leading-none">{product.daily_income.toLocaleString('pt-AO')} kz</span>
                                </div>
                                <div className="w-12 h-12 bg-green-50 rounded-[1.2rem] flex items-center justify-center">
                                    <Zap className="w-6 h-6 text-green-600 fill-green-600 outline-none" />
                                </div>
                            </div>

                            <div className="bg-slate-50/70 rounded-xl p-5 flex justify-between items-center border border-slate-100/30">
                                <div className="flex flex-col items-start">
                                    <span className="text-[11px] text-slate-400 font-bold lowercase tracking-tighter leading-none mb-1.5">investimento</span>
                                    <span className="text-red-500 font-black text-[18px] leading-none">{product.price.toLocaleString('pt-AO')} kz</span>
                                </div>
                                <div className="w-12 h-12 bg-red-50 rounded-[1.2rem] flex items-center justify-center">
                                    <Gift className="w-6 h-6 text-red-500" />
                                </div>
                            </div>

                            <div className="bg-slate-50/70 rounded-xl p-5 flex justify-between items-center border border-slate-100/30">
                                <div className="flex flex-col items-start">
                                    <span className="text-[11px] text-slate-400 font-bold lowercase tracking-tighter leading-none mb-1.5">período</span>
                                    <span className="text-slate-900 font-black text-[18px] leading-none">{product.duration_days} dias</span>
                                </div>
                                <div className="w-12 h-12 bg-blue-50 rounded-[1.2rem] flex items-center justify-center">
                                    <Sprout className="w-6 h-6 text-[#000080] fill-[#000080]/10" />
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handlePurchase}
                            className="w-full h-15 bg-gradient-to-r from-[#000080] to-[#0000BB] text-white font-black rounded-xl   active:scale-[0.98] transition-all lowercase text-[15.5px] flex items-center justify-center gap-3.5 group"
                        >
                            <Zap className="w-5 h-5 fill-white group-hover:scale-125 transition-transform" />
                            garantir este projeto na oferta
                        </button>

                        <p className="mt-10 text-center text-slate-400 text-[11px] leading-relaxed lowercase font-medium opacity-70">
                            esta oferta faz parte da promoção exclusiva newmont. certifique-se de possuir o valor disponível em seu balance.
                        </p>
                    </div>
                </motion.div>
            </main>

            {/* Modal de Resultado seguindo padrão Newmont */}
            <AnimatePresence>
                {isResultModalOpen && purchaseResult && (
                    <div className="fixed inset-0 z-[10001] flex items-center justify-center p-5">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-md"
                            onClick={() => setIsResultModalOpen(false)}
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.85 }}
                            className="relative w-full max-w-[330px] bg-white rounded-xl p-10  z-[10002] text-center flex flex-col items-center justify-center"
                        >
                            <div className={`w-22 h-22 rounded-full flex items-center justify-center mx-auto mb-8 ${purchaseResult.success ? 'bg-green-100 text-green-600  ' : 'bg-red-100 text-red-600  '}`}>
                                {purchaseResult.success ? (
                                    <svg className="w-11 h-11" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <X className="w-11 h-11" strokeWidth={3} />
                                )}
                            </div>
                            
                            <h3 className={`text-[20px] font-black lowercase mb-3 ${purchaseResult.success ? 'text-green-600' : 'text-red-500'}`}>
                                {purchaseResult.success ? 'projeto resgatado! ✨' : 'ops! saldo insuficiente'}
                            </h3>
                            
                            <p className="text-slate-500 text-[14px] lowercase leading-relaxed mb-10 font-medium">
                                {purchaseResult.message}
                            </p>

                            <button
                                onClick={() => {
                                    setIsResultModalOpen(false);
                                    if (purchaseResult.success) navigate('/extracao');
                                }}
                                className={`w-full h-13 rounded-xl font-black text-[14.5px] lowercase transition-all active:scale-95  ${
                                    purchaseResult.success 
                                        ? 'bg-green-600 text-white ' 
                                        : 'bg-[#000080] text-white '
                                }`}
                            >
                                {purchaseResult.success ? 'ver minha colheita' : 'ajuste de saldo'}
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
