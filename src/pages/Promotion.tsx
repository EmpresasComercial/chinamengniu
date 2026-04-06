import { useState, useEffect } from 'react';
import { ChevronLeft, Star, Zap, Sprout, X, ShieldCheck, Inbox } from 'lucide-react';
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
                // Fetch products
                const { data: productsData, error } = await supabase
                    .from('promocao_products')
                    .select('*')
                    .neq('status', 'expired')
                    .order('price', { ascending: true });

                if (!error && productsData) {
                    // Count global sales for EACH product NAME
                    const { data: globalHistory } = await supabase
                        .from('historico_compras')
                        .select('nome_produto');

                    const mapped = productsData.map(p => {
                        const globalCount = globalHistory?.filter(h => h.nome_produto === p.name).length || 0;
                        return { ...p, global_sold: globalCount };
                    }).filter(p => {
                        // Display rules:
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
        if ((product.global_sold || 0) >= product.purchase_limit) {
            setPurchaseResult({ success: false, message: 'estoque esgotado' });
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

            setPurchaseResult({ success: true, message: 'adesão confirmada com êxito! ✨' });
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
            {/* Decorações da Mina */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-20 left-6 opacity-30 animate-bounce duration-[6s] text-2xl">🐄</div>
                <div className="absolute top-48 right-12 opacity-40 animate-pulse text-3xl">🌸</div>
                <div className="absolute bottom-32 left-12 opacity-30 text-4xl">🌻</div>
                <div className="absolute top-[35%] right-[15%] opacity-20 text-5xl">🐖</div>
                <div className="absolute bottom-[40%] left-8 opacity-20 text-4xl rotate-12">🚜</div>
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_#E0E7FF_0%,_transparent_60%)]" />
            </div>

            <header className="relative z-20 px-4 pt-6 pb-2.5 flex items-center">
                <button
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 bg-[#000080] rounded-lg flex items-center justify-center  active:scale-95 transition-transform"
                    title="voltar"
                >
                    <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <div className="flex-grow text-center pr-10">
                    <h1 className="text-[13px] font-black tracking-tight text-[#000080] bg-white/40 backdrop-blur-sm inline-block px-4 py-1.5 rounded-full border border-blue-100/30 lowercase">
                         super promoção newmont ✨
                    </h1>
                </div>
            </header>

            <main className="relative z-10 flex-grow px-5 pb-24">
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#000080]/90 backdrop-blur-sm rounded-lg p-3.5 mb-6 text-white  flex items-center justify-between border border-white/10"
                >
                    <div>
                        <h2 className="text-md font-black lowercase leading-none mb-1">ofertas exclusivas!</h2>
                        <p className="text-white/60 text-[9px] lowercase">adesões de alta renda com estoque limitado.</p>
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
                                    className="relative bg-white/30 backdrop-blur-md rounded-lg border border-white/60 p-4  group active:scale-[0.98] transition-all cursor-pointer overflow-hidden"
                                >
                                    {/* Overlay de Esgotado */}
                                    {vip.status === 'sold_out' && (
                                        <div className="absolute inset-0 bg-red-600/10 backdrop-blur-[2px] z-20 flex items-center justify-center pointer-events-none">
                                            <span className="bg-red-600 text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest ">esgotado</span>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-4">
                                        <div className="w-20 h-20 bg-white/60 rounded-lg flex items-center justify-center p-3 border border-white/80 shrink-0 ">
                                            <img src={vip.image_url} className="w-full h-full object-contain " alt={vip.name} />
                                        </div>

                                        <div className="flex-grow flex flex-col pt-0.5">
                                            <div className="flex justify-between items-start mb-1.5">
                                                <h4 className="font-black text-[15.5px] text-[#000080] lowercase tracking-tight leading-none pt-0.5">{vip.name.toLowerCase()}</h4>
                                                <div className="flex flex-col items-end leading-none">
                                                    <span className="text-[8px] text-slate-400 font-bold lowercase mb-0.5">estoque total</span>
                                                    <span className="text-red-600 font-black text-[12px]">{Math.max(0, vip.purchase_limit - (vip.global_sold || 0))}</span>
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
                                                    <span className="text-[8.5px] text-slate-500 font-bold lowercase leading-none mb-1">ciclo do projeto</span>
                                                    <span className="text-[#000080] font-black text-[11.5px] leading-none">{vip.duration_days} dias</span>
                                                </div>
                                            </div>

                                            <button 
                                                disabled={vip.status === 'sold_out'}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedProduct(vip);
                                                }}
                                                className={`h-7 rounded-lg text-[10px] font-black lowercase w-full transition-all   active:scale-95
                                                    ${vip.status === 'sold_out' 
                                                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed ' 
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
                                <Inbox className="w-10 h-10 text-slate-200 mx-auto mb-3" strokeWidth={1.5} />
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
                            className="relative w-full max-w-[270px] bg-white rounded-lg p-5  z-[10002] flex flex-col font-sans"
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
                                className="w-full h-10 bg-[#000080] text-white font-normal rounded-lg  active:scale-95 transition-all lowercase text-[13px] flex items-center justify-center gap-2"
                            >
                                <Zap className="w-3.5 h-3.5 fill-white" />
                                confirmar adesão
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal de Feedback */}
            <AnimatePresence>
                {isResultModalOpen && purchaseResult && (
                    <div className="fixed inset-0 z-[10003] flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/50 backdrop-blur-md"
                            onClick={() => setIsResultModalOpen(false)}
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="relative w-full max-w-[260px] bg-white rounded-lg p-6  z-[10004] text-center flex flex-col items-center"
                        >
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${purchaseResult.success ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                                {purchaseResult.success ? (
                                    <ShieldCheck className="w-7 h-7" strokeWidth={3} />
                                ) : (
                                    <X className="w-7 h-7" strokeWidth={3} />
                                )}
                            </div>
                            
                            <h3 className={`text-[16px] font-black lowercase mb-2 ${purchaseResult.success ? 'text-green-600' : 'text-red-500'}`}>
                                {purchaseResult.success ? 'sucesso total! ✨' : 'não foi possível'}
                            </h3>
                            
                            <p className="text-slate-500 text-[11.5px] lowercase leading-relaxed mb-6 font-medium">
                                {purchaseResult.message}
                            </p>

                            <button
                                onClick={() => {
                                    setIsResultModalOpen(false);
                                    if (purchaseResult.success) navigate('/extracao');
                                }}
                                className={`w-full h-9 rounded-lg font-black text-[12px] lowercase transition-all active:scale-95  ${
                                    purchaseResult.success ? 'bg-green-600 text-white' : 'bg-[#000080] text-white'
                                }`}
                            >
                                {purchaseResult.success ? 'ver meus investimentos' : 'entendido'}
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
