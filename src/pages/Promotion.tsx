import { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
        <div className="flex flex-col min-h-screen bg-[#0000A5] page-content uppercase-none">
            <header className="p-4 text-white flex items-center">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center justify-center p-1 rounded-full active:bg-white/10 transition-none"
                    title="voltar"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h1 className="flex-1 text-center text-[15px] font-bold pr-8 lowercase">promoção especial</h1>
            </header>

            <main className="bg-[#EBF1FF] rounded-t-[1.5rem] flex-grow text-black p-6 mt-2 mb-20">
                <h2 className="text-[15px] font-bold text-[#000080] mb-4 lowercase">sistema de promoções</h2>
                <div className="space-y-3">
                    {products.length > 0 ? (
                        products.map((vip) => (
                            <div
                                key={vip.id}
                                onClick={() => navigate('/promocao-detalhes', { state: { product: vip } })}
                                className="relative overflow-hidden flex flex-col bg-white p-3.5 rounded-[8px] border border-slate-100 shadow-none cursor-pointer active:scale-95 transition-none"
                            >
                                <div 
                                    className="absolute inset-0 opacity-[0.14] pointer-events-none bg-no-repeat bg-contain bg-center"
                                    style={{ 
                                        backgroundImage: `url(${vip.image_url})`,
                                        filter: 'grayscale(25%)'
                                    }}
                                />

                                <div className="flex items-start justify-between mb-2 relative z-10">
                                    <div>
                                        <p className="font-black text-[14px] text-[#000080] lowercase tracking-tight mb-0.5 leading-none">
                                            {vip.name.toLowerCase()}
                                        </p>
                                        <div className="flex text-[9px] gap-0.5 items-center leading-none">
                                            {Array.from({ length: vip.purchase_limit || 1 }).map((_, i) => (
                                                <span key={i} className={(vip.bought_count || 0) > i ? "text-[#FFD700]" : "text-slate-200"}>
                                                    {(vip.bought_count || 0) > i ? '★' : '☆'}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col items-end gap-1">
                                        <div className="text-right">
                                            <p className="text-[9px] text-green-600 font-bold lowercase leading-tight">renda diária:</p>
                                            <p className="text-[11px] font-black text-green-600 lowercase leading-tight">{vip.daily_income.toLocaleString('pt-AO')} kz</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-end justify-between border-t border-slate-50/50 pt-2.5 mt-0.5 relative z-10">
                                    <div className="flex flex-col gap-2.5 flex-1">
                                        <div className="flex flex-col">
                                            <p className="text-[9px] text-slate-400 mb-0.5 font-bold lowercase tracking-tight leading-none">preço</p>
                                            <p className="text-[13px] font-black text-[#FF0000] lowercase leading-none">{vip.price.toLocaleString('pt-AO')} kz</p>
                                        </div>
                                        <div className="flex flex-col">
                                            <p className="text-[9px] text-slate-400 mb-0.5 font-bold lowercase tracking-tight leading-none">duração</p>
                                            <p className="text-[12.5px] font-black text-slate-800 lowercase leading-none">{vip.duration_days} dias</p>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-[#0000AA] text-white px-4 h-[22px] rounded-lg text-[10px] font-bold lowercase flex items-center justify-center">
                                        ver detalhes
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 text-slate-400">
                            <p className="text-[12.5px] lowercase">nenhuma promoção ativa no momento.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
