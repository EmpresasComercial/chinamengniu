import { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
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
    const { showLoading, hideLoading } = useLoading();
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        async function loadData() {
            showLoading(true); // Indica que é uma página "pesada" ou importante
            const { data: productsData, error } = await supabase
                .from('promocao_products')
                .select('*')
                .eq('status', 'active')
                .order('price', { ascending: true });

            if (!error && productsData) {
                // Obter contagem de compras histórico para o usuário
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
            hideLoading();
        }
        loadData();
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-[#000080] page-content">
            <header className="bg-[#000080] text-white flex items-center p-4 sticky top-0 z-10 shadow-md">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center justify-center p-1 rounded-full hover:bg-white/10 transition-colors"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h1 className="flex-1 text-center text-[15px] font-bold pr-8 font-serif">Promoção Especial</h1>
            </header>

            <main className="bg-[#EBF1FF] rounded-t-[1.5rem] flex-grow text-black p-6 mt-4">
                <h2 className="text-[15px] font-bold text-[#000080] mb-4 font-serif">Sistema de Promoções</h2>
                <div className="space-y-3">
                    {products.length > 0 ? (
                        products.map((vip) => (
                            <div
                                key={vip.id}
                                onClick={() => {
                                    showLoading();
                                    setTimeout(() => {
                                        hideLoading();
                                        navigate('/promocao-detalhes', { state: { product: vip } });
                                    }, 400);
                                }}
                                className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm border border-gray-100 cursor-pointer active:scale-[0.98] transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-100">
                                        <img alt={vip.name} className="w-full h-full object-contain" src={vip.image_url} referrerPolicy="no-referrer" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-[12.5px] text-[#000080] font-serif">{vip.name}</p>
                                        <div className="flex text-[10px] gap-1">
                                            {Array.from({ length: vip.purchase_limit || 1 }).map((_, i) => (
                                                <span key={i} className={(vip.bought_count || 0) > i ? "text-[#FFD700]" : "text-gray-300"}>
                                                    {(vip.bought_count || 0) > i ? '★' : '☆'}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-bold text-slate-400 font-serif">ver mais</span>
                                    <ChevronRight className="w-5 h-5 text-gray-300" />
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 text-slate-400">
                            <p className="text-[12.5px] font-serif">Nenhuma promoção ativa no momento.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
