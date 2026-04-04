import { useState, useEffect } from 'react';
import { ChevronLeft, Star, Zap, Sparkles, Sprout } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useLoading } from '../contexts/LoadingContext';
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

export default function Promotion() {
    const navigate = useNavigate();
    const { showLoading, hideLoading, registerFetch } = useLoading();
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        async function loadData() {
            const done = registerFetch();
            try {
                const { data: productsData, error } = await supabase
                    .from('promocao_products')
                    .select('*')
                    .eq('status', 'active')
                    .order('price', { ascending: true });

                if (!error && productsData) {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (user) {
                        const { data: history } = await supabase
                            .from('historico_compras')
                            .select('nome_produto')
                            .eq('user_id', user.id);

                        const mapped = productsData.map(p => ({
                            ...p,
                            bought_count: history?.filter(h => h.nome_produto === p.name).length || 0
                        }));
                        setProducts(mapped);
                    } else {
                        setProducts(productsData);
                    }
                }
            } finally {
                done();
            }
        }
        loadData();
    }, [registerFetch]);

    return (
        <div className="flex flex-col min-h-screen bg-[#F0F4FF] antialiased page-content overflow-hidden relative">
            {/* Elementos Decorativos de Fazenda (Estilo Infantil/Vibrante) */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-20 left-6 opacity-30 animate-bounce duration-[4s] text-2xl">🐄</div>
                <div className="absolute top-48 right-12 opacity-40 animate-pulse text-3xl">🌸</div>
                <div className="absolute bottom-32 left-12 opacity-30 text-4xl">🌻</div>
                <div className="absolute top-[25%] right-[20%] opacity-20 text-5xl">🐖</div>
                <div className="absolute bottom-[25%] right-10 opacity-30 text-3xl">🐤</div>
                <div className="absolute top-[60%] left-4 opacity-20 text-4xl rotate-12">🚜</div>
                
                {/* Background Shapes */}
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_#E0E7FF_0%,_transparent_60%)]" />
                <div className="absolute top-1/2 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,_#EEF2FF_0%,_transparent_50%)]" />
            </div>

            {/* Header seguindo as cores do App (#000080) */}
            <header className="relative z-20 px-4 pt-6 pb-4 flex items-center">
                <button
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 bg-[#000080] rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/20 active:scale-90 transition-transform"
                    title="voltar"
                >
                    <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <div className="flex-grow text-center pr-10">
                    <h1 className="text-[14px] font-black tracking-tight text-[#000080] bg-white/60 backdrop-blur-sm inline-block px-5 py-1.5 rounded-full border border-blue-100/50 lowercase shadow-sm">
                        promoção da fazenda 🚜✨
                    </h1>
                </div>
            </header>

            <main className="relative z-10 flex-grow px-5 pb-24">
                {/* Banner de Boas-vindas Azul Mengniu */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-[#000080] to-[#0000BB] rounded-[2.5rem] p-7 mb-8 text-white shadow-2xl shadow-blue-900/30 relative overflow-hidden"
                >
                    <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/5 rounded-full blur-3xl opacity-50" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                             <Sprout className="w-5 h-5 text-green-300" />
                             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200">ofertas exclusivas</span>
                        </div>
                        <h2 className="text-2xl font-black mb-1 lowercase leading-tight">super adesões especiais!</h2>
                        <p className="text-white/70 text-[11.5px] leading-relaxed max-w-[90%] lowercase">obtenha rendimentos diários superiores com nossos animais selecionados para a grande festa da colheita.</p>
                    </div>
                </motion.div>

                <h3 className="text-[13.5px] font-black text-slate-800 mb-6 px-1 flex items-center gap-2.5 lowercase">
                    <div className="w-2 h-2 rounded-full bg-[#000080] animate-pulse" />
                    animais em oferta limitada
                </h3>

                <div className="grid gap-5">
                    <AnimatePresence mode="popLayout">
                        {products.length > 0 ? (
                            products.map((vip, index) => (
                                <motion.div
                                    key={vip.id}
                                    initial={{ opacity: 0, scale: 0.92 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.04 }}
                                    onClick={() => navigate('/promocao-detalhes', { state: { product: vip } })}
                                    className="group relative bg-white rounded-[2.2rem] border border-blue-50 p-5 shadow-[0_8px_30px_rgba(0,0,128,0.04)] active:scale-[0.98] transition-all cursor-pointer overflow-hidden"
                                >
                                    {/* decorative glow */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/40 rounded-full blur-[40px] -mr-16 -mt-16" />

                                    <div className="flex items-center gap-5 relative z-10">
                                        <div className="w-22 h-22 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-3xl flex items-center justify-center p-3 border border-blue-50/50 shrink-0 shadow-inner">
                                            <img src={vip.image_url} className="w-full h-full object-contain drop-shadow-md" alt={vip.name} />
                                        </div>

                                        <div className="flex-grow flex flex-col pt-1">
                                            <div className="flex justify-between items-start mb-2.5">
                                                <div>
                                                    <h4 className="font-black text-[16px] text-slate-800 lowercase tracking-tight leading-none mb-1.5">{vip.name.toLowerCase()}</h4>
                                                    <div className="flex gap-0.5">
                                                        {Array.from({ length: 5 }).map((_, i) => (
                                                            <Star 
                                                                key={i} 
                                                                className={`w-2.5 h-2.5 ${(vip.bought_count || 0) > i ? 'text-yellow-400 fill-yellow-400' : 'text-slate-100 fill-slate-100'}`} 
                                                                strokeWidth={3}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="bg-[#000080] text-white text-[9.5px] font-black px-2.5 py-1.5 rounded-xl lowercase leading-none shadow-md shadow-blue-900/10">
                                                    {vip.duration_days} d
                                                </div>
                                            </div>

                                            <div className="flex items-end justify-between gap-2">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-slate-400 font-bold lowercase tracking-tighter mb-1.5">renda diária</span>
                                                    <span className="text-green-600 font-black text-[15px] leading-none">{vip.daily_income.toLocaleString('pt-AO')} kz</span>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[14px] font-black text-red-500 leading-none mb-1.5">{vip.price.toLocaleString('pt-AO')} kz</span>
                                                    <div className="bg-[#000080] text-white w-8 h-8 rounded-[0.8rem] flex items-center justify-center shadow-lg shadow-blue-500/20 group-active:translate-x-1 transition-transform">
                                                        <Zap className="w-4 h-4 fill-white" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-[2.5rem] border border-dashed border-blue-200 shadow-inner">
                                <p className="text-slate-400 text-[12.5px] lowercase italic font-medium">estamos selecionando novos animais especiais!</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
