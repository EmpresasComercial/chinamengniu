import { useState, useEffect } from 'react';
import { Send, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLoading } from '../contexts/LoadingContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Product {
  id: string;
  name: string;
  price: number;
  daily_income: number;
  duration_days: number;
  image_url: string;
}

export default function VIP() {
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();
  const { profile, user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    dailyIncome: 0
  });

  useEffect(() => {
    async function loadData() {
      // 1. Load Products
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .order('price', { ascending: true });

      if (productsData) setProducts(productsData);

      // 2. Load Revenue Stats from tarefas_diarias
      if (user) {
        const { data: tarefas } = await supabase
          .from('tarefas_diarias')
          .select('balance_correte, renda_coletada')
          .eq('user_id', user.id);

        if (tarefas) {
          // receita total: soma de balance_correte
          const total = tarefas.reduce((sum, t) => sum + Number(t.balance_correte || 0), 0);
          // renda diária: soma de renda_coletada
          const rendaColetada = tarefas.reduce((sum, t) => sum + Number(t.renda_coletada || 0), 0);

          setStats({
            totalRevenue: total,
            dailyIncome: rendaColetada
          });
        }
      }
    }
    loadData();
  }, [user]);

  return (
    <div className="flex flex-col min-h-screen bg-[#0000A5] page-content">
      {/* Header Section */}
      <header className="p-4 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-white border-2 border-white flex items-center justify-center">
              <img
                alt="cow icon"
                className="w-full h-full object-contain p-1"
                src="https://api.mengniu.wang/upload/img/6978d793f60d.webp"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h1 className="text-[15px] font-bold uppercase">{profile?.state || 'VIP0'}</h1>
              <div className="flex text-[11px] gap-0.5 mt-0.5">
                {[1, 2, 3, 4, 5].map((star) => {
                  const currentLevel = parseInt((profile?.state || 'VIP0').replace(/\D/g, '')) || 0;
                  return (
                    <span key={star} className={star <= currentLevel ? "text-yellow-400" : "text-gray-400"}>
                      {star <= currentLevel ? '★' : '☆'}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
          <button className="bg-blue-600/50 text-white px-4 py-1 rounded-full text-[10px] font-semibold">
            promoção
          </button>
        </div>

        {/* Credit Score */}
        <div className="mb-6">
          <div className="flex justify-between items-center text-[10px] mb-1">
            <span>pontuação de crédito:</span>
            <span>100</span>
          </div>
          <div className="w-full bg-white/30 h-1 rounded-full">
            <div className="bg-white h-1 rounded-full w-full"></div>
          </div>
        </div>

        {/* Earnings Stats */}
        <div className="mb-6 relative overflow-hidden bg-white/10 p-4 rounded-xl">
          <div className="flex justify-between mb-4">
            <div>
              <p className="text-[10px] opacity-80">receita total</p>
              <p className="text-[15px] font-bold">{stats.totalRevenue.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] opacity-80">renda diária</p>
              <p className="text-[15px] font-bold">{stats.dailyIncome.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz</p>
            </div>
          </div>
          <div className="text-center pt-2 border-t border-white/10">
            <p className="text-[10px] opacity-80">tempo de expiração: permanente</p>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 border-[12px] border-white/10 rounded-full"></div>
        </div>

        {/* Invite Banner */}
        <div
          onClick={() => navigate('/convidar')}
          className="bg-[#D4ED71] text-black flex items-center justify-between p-4 rounded-lg mb-2 cursor-pointer"
        >
          <span className="font-semibold text-[15px] text-[#000080]">convidar amigos</span>
          <Send className="w-6 h-6" />
        </div>
      </header>

      {/* Job System List */}
      <main className="bg-[#EBF1FF] rounded-t-[1.5rem] flex-grow text-black p-6">
        <h2 className="text-[15px] font-bold text-[#000080] mb-4">sistema de empregos</h2>
        <div className="space-y-3">
          {products.map((vip) => (
            <div
              key={vip.id}
              onClick={() => {
                showLoading();
                setTimeout(() => {
                  hideLoading();
                  navigate('/vip-detalhes', { state: { product: vip } });
                }, 500);
              }}
              className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm border border-gray-100 cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <img alt={vip.name} className="w-12 h-12 object-contain" src={vip.image_url} referrerPolicy="no-referrer" />
                <div>
                  <p className="font-bold text-[12.5px] text-[#000080]">{vip.name}</p>
                  <div className={`flex text-[10px] gap-1 ${profile?.state === vip.name ? 'text-gray-300' : 'text-[#FFD700]'}`}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i}>{profile?.state === vip.name ? '☆' : '★'}</span>
                    ))}
                    {profile?.state === vip.name && <span className="ml-2 text-gray-400">posição atual</span>}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
