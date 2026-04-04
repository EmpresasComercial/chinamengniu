import { useState, useEffect } from 'react';
import { ChevronLeft, Star, Zap, Sprout, X, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useLoading } from '../contexts/LoadingContext';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Product {
    id: string;
    name: string;
    price: number;
    daily_income: number;
    duration_days: number;
    image_url: string;
    purchase_limit: number;
    status: string;
    sold_out_at?: string;
    global_sold?: number;
}

export default function Promotion() {
    const navigate = useNavigate();
    const { showLoading, hideLoading, registerFetch } = useLoading();
    const { refreshProfile } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    
    // Modal State
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [purchaseResult, setPurchaseResult] = useState<{ success: boolean; message: string } | null>(null);
    const [isResultModalOpen, setIsResultModalOpen] = useState(false);

    useEffect(() => {
        async function loadData() {
            const done = registerFetch();
            try {
                // Fetch products and their global sales
                const { data: productsData, error } = await supabase
                    .from('promocao_products')
                    .select('*')
                    .neq('status', 'expired')
                    .order('price', { ascending: true });

                if (!error && productsData) {
                    // Logic to count global sales for each product name
                    const { data: globalHistory } = await supabase
                        .from('historico_compras')
                        .select('nome_produto');

                    const mapped = productsData.map(p => {
                        const globalCount = globalHistory?.filter(h => h.nome_produto === p.name).length || 0;
                        return { ...p, global_sold: globalCount };
                    }).filter(p => {
                        // REGRAS DE EXIBIÇÃO:
                        // 1. Mostrar se ativo
                        // 2. Se esgotado, mostrar apenas se foi há menos de 10 minutos
                        if (p.status === 'active') return true;
                        if (p.status === 'sold_out' && p.sold_out_at) {
                            const soldOutTime = new Date(p.sold_out_at).getTime();
                            const now = new Date().getTime();
                            return now - soldOutTime < 10 * 60 * 1000;
                        }
                        return false;
                    });
                    
                    setProducts(mapped);
                }
            } finally {
                done();
            }
        }
        loadData();
    }, [registerFetch]);

    const handlePurchase = async (product: Product) => {
        // Double check stock before processing modal
        if ((product.global_sold || 0) >= product.purchase_limit) {
            setPurchaseResult({ success: false, message: 'estoque esgotado no servidor' });
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
            setSelectedProduct(null);

            if (error) {
                setPurchaseResult({ success: false, message: error.message || 'erro na conexão' });
                setIsResultModalOpen(true);
                return;
            }

            if (data && data.success === false) {
                setPurchaseResult({ success: false, message: data.message || 'adesão bloqueada' });
                setIsResultModalOpen(true);
                return;
            }

            setPurchaseResult({ success: true, message: data?.message || 'adesão confirmada com êxito!' });
            setIsResultModalOpen(true);
            await refreshProfile();
        } catch (err) {
            hideLoading();
            done();
            setPurchaseResult({ success: false, message: 'erro inesperado ao processar' });
            setIsResultModalOpen(true);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#F0F4FF] antialiased page-content overflow-hidden relative">
            {/* Decorações da Fazenda Transparentes */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-20 left-6 opacity-30 animate-bounce duration-[4s] text-2xl">🐄</div>
                <div className="absolute top-48 right-12 opacity-40 text-3xl">🌸</div>
                <div className="absolute bottom-32 left-12 opacity-30 text-4xl">🌻</div>
                <div className="absolute top-[35%] right-[15%] opacity-20 text-5xl">🐖</div>
                <div className="absolute bottom-[40%] left-8 opacity-20 text-4xl rotate-12">🚜</div>
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_#E0E7FF_0%,_transparent_60%)]" />
            </div>

            {/* Header seguindo as cores do App (#000080) */}
            <header className="relative z-20 px-4 pt-6 pb-2.5 flex items-center">
                <button
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 bg-[#000080] rounded-lg flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                    title="voltar"
                >
                    <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <div className="flex-grow text-center pr-10">
                    <h1 className="text-[13px] font-black tracking-tight text-[#000080] bg-white/40 inline-block px-5 py-1.5 rounded-full border border-blue-100/30 lowercase">
                         ofertas da fazenda 🚜✨
                    </h1>
                </div>
            </header>

            <main className="relative z-10 flex-grow px-5 pb-24">
                {/* Banners Reduzidos e Transparentes */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#000080]/80 backdrop-blur-sm rounded-lg p-3.5 mb-6 text-white shadow-xl flex items-center justify-between border border-white/10"
                >
                    <div>
                        <h2 className="text-md font-black lowercase leading-none mb-1">oferta limitada!</h2>
                        <p className="text-white/60 text-[9px] lowercase">adesão especial para estoque da empresa.</p>
                    </div>
                    <Sprout className="w-6 h-6 text-green-300 opacity-50" />
                </motion.div>

                <div className="grid gap-4">
                    <AnimatePresence mode="popLayout">
                        {products.length > 0 ? (
                            products.map((vip, index) => (
                                <motion.div
                                    key={vip.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.03 }}
                                    className="relative bg-white/20 backdrop-blur-md rounded-lg border border-white/60 p-4 shadow-sm group active:scale-[0.98] transition-all cursor-pointer overflow-hidden"
                                >
                                    {/* Overlay de Esgotado */}
                                    {vip.status === 'sold_out' && (
                                        <div className="absolute inset-0 bg-red-600/10 backdrop-blur-[2px] z-20 flex items-center justify-center pointer-events-none">
                                            <span className="bg-red-600 text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest shadow-xl">esgotado</span>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-4">
                                        <div className="w-20 h-20 bg-white/50 rounded-lg flex items-center justify-center p-3 border border-white/60 shrink-0 shadow-sm">
                                            <img src={vip.image_url} className="w-full h-full object-contain drop-shadow-md" alt={vip.name} />
                                        </div>

                                        <div className="flex-grow flex flex-col pt-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-black text-[15px] text-[#000080] lowercase tracking-tight leading-none">{vip.name.toLowerCase()}</h4>
                                                <div className="bg-[#000080] text-white text-[8.5px] font-black px-2 py-1 rounded-lg lowercase leading-none">
                                                    {vip.duration_days} dias
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-y-2 gap-x-1 mb-3">
                                                <div className="flex flex-col">
                                                    <span className="text-[8.5px] text-slate-500 font-bold lowercase leading-none mb-1">preço</span>
                                                    <span className="text-red-500 font-black text-[11.5px] leading-none">{vip.price.toLocaleString('pt-AO')} kz</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[8.5px] text-slate-500 font-bold lowercase leading-none mb-1">renda diária</span>
                                                    <span className="text-green-600 font-black text-[11.5px] leading-none">{vip.daily_income.toLocaleString('pt-AO')} kz</span>
                                                </div>
                                                <div className="flex flex-col col-span-2">
                                                    <span className="text-[8.5px] text-slate-500 font-bold lowercase leading-none mb-1">ciclo do animal</span>
                                                    <span className="text-[#000080] font-black text-[11.5px] leading-none">{vip.duration_days} dias</span>
                                                </div>
                                            </div>

                                            <button 
                                                disabled={vip.status === 'sold_out'}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedProduct(vip);
                                                }}
                                                className={`h-7 rounded-lg text-[10px] font-black lowercase w-full transition-all shadow-lg shadow-blue-900/10 active:scale-95
                                                    ${vip.status === 'sold_out' 
                                                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                                                        : 'bg-[#000080] text-white hover:bg-blue-800'}`}
                                            >
                                                aderir
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-20 bg-white/10 backdrop-blur-sm rounded-lg border border-dashed border-blue-200">
                                <p className="text-slate-400 text-[12px] lowercase italic">colheita de novas promoções em breve...</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            {/* Modal de Adesão ULTRA COMPACTO, FLAT e 8px Rounding */}
            <AnimatePresence>
                {selectedProduct && (
                    <div className="fixed inset-0 z-[10001] flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-[#000080]/20 backdrop-blur-sm"
                            onClick={() => setSelectedProduct(null)}
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="relative w-full max-w-[270px] bg-white rounded-lg p-5 shadow-2xl z-[10002] flex flex-col font-sans"
                        >
                            <h3 className="text-[16px] font-black text-[#000080] lowercase mb-4 leading-none tracking-tight text-center">
                                confirmar adesão
                            </h3>
                            
                            <div className="w-full space-y-2 mb-6">
                                <div className="flex justify-between items-center bg-slate-50 p-2.5 px-3 rounded-lg border border-slate-100">
                                    <span className="text-[9px] text-slate-400 font-bold lowercase leading-none">nome</span>
                                    <span className="text-slate-800 font-black text-[11px] leading-none text-right">{selectedProduct.name.toLowerCase()}</span>
                                </div>
                                <div className="flex justify-between items-center bg-slate-50 p-2.5 px-3 rounded-lg border border-slate-100">
                                    <span className="text-[9px] text-slate-400 font-bold lowercase leading-none">renda diária</span>
                                    <span className="text-green-600 font-black text-[11px] leading-none">{selectedProduct.daily_income.toLocaleString('pt-AO')} kz</span>
                                </div>
                                <div className="flex justify-between items-center bg-slate-50 p-2.5 px-3 rounded-lg border border-slate-100">
                                    <span className="text-[9px] text-slate-400 font-bold lowercase leading-none">preço</span>
                                    <span className="text-red-500 font-black text-[11px] leading-none">{selectedProduct.price.toLocaleString('pt-AO')} kz</span>
                                </div>
                                <div className="flex justify-between items-center bg-slate-50 p-2.5 px-3 rounded-lg border border-slate-100">
                                    <span className="text-[9px] text-slate-400 font-bold lowercase leading-none">período</span>
                                    <span className="text-[#000080] font-black text-[11px] leading-none">{selectedProduct.duration_days} dias</span>
                                </div>
                            </div>

                            <button
                                onClick={() => handlePurchase(selectedProduct)}
                                className="w-full h-10 bg-[#000080] text-white font-black rounded-lg shadow-xl active:scale-95 transition-all lowercase text-[13px] flex items-center justify-center gap-2"
                            >
                                <Zap className="w-3.5 h-3.5 fill-white pb-0.5" />
                                confirmar adesão
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal de Feedback Simplificado */}
            <AnimatePresence>
                {isResultModalOpen && purchaseResult && (
                    <div className="fixed inset-0 z-[10003] flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/40 backdrop-blur-md"
                            onClick={() => setIsResultModalOpen(false)}
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="relative w-full max-w-[260px] bg-white rounded-lg p-6 shadow-2xl z-[10004] text-center flex flex-col items-center"
                        >
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${purchaseResult.success ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                                {purchaseResult.success ? (
                                    <ShieldCheck className="w-7 h-7" strokeWidth={3} />
                                ) : (
                                    <X className="w-7 h-7" strokeWidth={3} />
                                )}
                            </div>
                            
                            <h3 className={`text-[16px] font-black lowercase mb-2 ${purchaseResult.success ? 'text-green-600' : 'text-red-500'}`}>
                                {purchaseResult.success ? 'êxito!' : 'atenção'}
                            </h3>
                            
                            <p className="text-slate-500 text-[11.5px] lowercase leading-relaxed mb-6 font-medium">
                                {purchaseResult.message}
                            </p>

                            <button
                                onClick={() => {
                                    setIsResultModalOpen(false);
                                    if (purchaseResult.success) navigate('/reproducao');
                                }}
                                className={`w-full h-9 rounded-lg font-black text-[12px] lowercase transition-all active:scale-95 shadow-md ${
                                    purchaseResult.success ? 'bg-green-600 text-white' : 'bg-[#000080] text-white'
                                }`}
                            >
                                {purchaseResult.success ? 'ver meus animais' : 'fechar'}
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
