import { useState, useEffect, useCallback } from 'react';
import { Power, Info, ChevronRight, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLoading } from '../contexts/LoadingContext';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

export default function Extracao() {
  const navigate = useNavigate();
  const { showLoading, hideLoading, registerFetch } = useLoading();
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<any[]>([]);
  const [hasCollectedToday, setHasCollectedToday] = useState(false);
  const [stats, setStats] = useState({
    reproductionBalance: 0,
    totalProfit: 0,
    dailyIncomeTotal: 0,
    activeCowsCount: 0,
    totalPurchasesCount: 0
  });
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isCollecting, setIsCollecting] = useState(false);

  const showToast = (message: string) => {
    setFeedback(message);
    setTimeout(() => setFeedback(null), 3000);
  };

  const fetchPurchases = useCallback(async () => {
    if (!user) return;
    const [productsRes, historyRes] = await Promise.all([
      supabase.rpc('get_active_products'),
      supabase.rpc('get_my_purchased_products_detailed')
    ]);

    if (historyRes.data) {
      const historyData = historyRes.data;
      const today = new Date();
      const activeInvestments = historyData.filter((h: any) =>
        new Date(h.data_expiracao || today) > today
      );

      const productsData = productsRes.data || [];
      const productMap = new Map(productsData.map(p => [p.name, p]));

      const formattedData = historyData.map((item: any) => {
        const p = productMap.get(item.nome_produto);
        return {
          ...item,
          image_url: p?.image_url || '/ai-go-onrender.png',
          daily_percent: p?.daily_income_percent || 0.697,
          preco: item.daily_income ? (item.daily_income / (p?.daily_income_percent || 0.697) * 100) : (p?.price || 0)
        };
      });

      setPurchases(formattedData);
      setStats(prev => ({
        ...prev,
        activeCowsCount: activeInvestments.length,
        totalPurchasesCount: historyData.length
      }));
    }
  }, [user]);

  const fetchDailyStats = useCallback(async () => {
    if (!user) return;
    
    const [todayTaskRes, summaryRes] = await Promise.all([
      supabase.rpc('check_today_task'),
      supabase.rpc('get_user_financial_summary')
    ]);

    setHasCollectedToday(!!todayTaskRes.data);

    if (summaryRes.data) {
      const summary = Array.isArray(summaryRes.data) ? summaryRes.data[0] : summaryRes.data;
      if (summary) {
        setStats(prev => ({
          ...prev,
          reproductionBalance: Number(summary.fundo_balance || 0),
          totalProfit: Number(summary.fundo_balance || 0),
          dailyIncomeTotal: Number(summary.total_renda_coletada || 0)
        }));
      }
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const donePurchases = registerFetch();
    const doneStats = registerFetch();
    fetchPurchases().finally(() => donePurchases());
    fetchDailyStats().finally(() => doneStats());

    const channel = supabase.channel('realtime_extracao')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tarefas_diarias', filter: `user_id=eq.${user?.id}` }, () => fetchDailyStats())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'historico_compras', filter: `user_id=eq.${user?.id}` }, () => fetchPurchases())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, fetchPurchases, fetchDailyStats, registerFetch]);

  const handleStartCollection = useCallback(async () => {
    if (hasCollectedToday) {
      showToast('O processamento diário já foi realizado com sucesso.');
      return;
    }
    setIsCollecting(true);
    showLoading();
    try {
      const { data, error } = await supabase.rpc('claim_daily_income');
      if (error) {
        showToast(`erro operacional: ${error.message}`);
      } else if (data && data.success) {
        showToast('rendimento processado com sucesso.');
        fetchDailyStats();
      } else {
        showToast(data?.message || 'falha no processamento.');
      }
    } catch (err) {
      showToast('instabilidade detectada.');
    } finally {
      setIsCollecting(false);
      hideLoading();
    }
  }, [hasCollectedToday, showLoading, hideLoading, fetchDailyStats]);

  const fmt = (val: number) => val.toLocaleString('pt-AO', { minimumFractionDigits: 2 });

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFDFD] pb-24 font-sans antialiased page-content">
      {/* 🟣 Header - Power Area */}
      <section className="bg-white pt-6 pb-10 relative overflow-hidden flex flex-col items-center">
         <div className="relative z-10 flex flex-col items-center">
            {/* Power Ring UI */}
            <div className="relative w-[160px] h-[160px] flex items-center justify-center">
               <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-[1.5px] border-gray-100 rounded-full"
               ></motion.div>
               <div className="absolute inset-4 border-[1px] border-gray-50 rounded-full"></div>
               
               <div className="relative w-[120px] h-[120px] bg-gray-50/50 rounded-full flex items-center justify-center shadow-inner">
                  <button 
                     onClick={handleStartCollection}
                     disabled={hasCollectedToday || isCollecting}
                     className={`relative w-[80px] h-[80px] rounded-full flex items-center justify-center transition-all active:scale-95 ${
                        hasCollectedToday 
                        ? 'bg-gray-100 text-gray-300' 
                        : 'bg-white shadow-[0_12px_30px_rgba(0,0,0,0.06)] text-[#6D28D9]'
                     }`}
                  >
                     <Power className="w-8 h-8" />
                     {!hasCollectedToday && !isCollecting && (
                        <motion.div 
                           initial={{ opacity: 0, scale: 0.8 }}
                           animate={{ opacity: [0, 0.4, 0], scale: [1, 1.4, 1.8] }}
                           transition={{ repeat: Infinity, duration: 2 }}
                           className="absolute inset-0 bg-[#6D28D9] rounded-full"
                        />
                     )}
                  </button>
               </div>
            </div>
            
            <span className="text-gray-300 text-[10px] font-black tracking-[0.3em] mt-4 uppercase">AI-GO 4.7.1</span>
         </div>
      </section>

      {/* 📊 Stats Grid - Simplified as per reference */}
      <section className="px-6 mb-6">
         <div className="bg-[#F8F9FB] rounded-[28px] p-6 border border-white/50">
            <div className="flex flex-col items-center mb-6">
               <span className="text-gray-400 text-[12.5px] font-black lowercase mb-1">Restando hoje</span>
               <span className="text-[#EF4444] text-[22px] font-black leading-none">{hasCollectedToday ? 0 : 1}</span>
            </div>

            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
               <div>
                  <p className="text-gray-400 text-[11px] font-bold lowercase mb-1.5">renda diária</p>
                  <p className="text-gray-900 text-[14px] font-black">2.76% ~ 2.85%</p>
               </div>
               <div className="text-right">
                  <p className="text-gray-400 text-[11px] font-bold lowercase mb-1.5">Renda de hoje</p>
                  <p className="text-gray-900 text-[14px] font-black">{fmt(stats.dailyIncomeTotal)} AI-GO</p>
               </div>
               <div>
                  <p className="text-gray-400 text-[11px] font-bold lowercase mb-1.5">quantidade</p>
                  <p className="text-gray-900 text-[14px] font-black">{fmt(stats.reproductionBalance)} AI-GO</p>
               </div>
               <div className="text-right">
                  <p className="text-gray-400 text-[11px] font-bold lowercase mb-1.5">Lucro histórico</p>
                  <p className="text-gray-900 text-[14px] font-black">{fmt(stats.totalProfit)} AI-GO</p>
               </div>
            </div>
         </div>
      </section>

      {/* 📜 Registo Section */}
      <section className="px-6 pb-20">
         <div className="flex items-center gap-2 mb-6">
            <h3 className="text-gray-900 text-[18px] font-black lowercase">Registo</h3>
         </div>

         <div className="space-y-4">
            {purchases.length > 0 ? (
               purchases.map((item, idx) => (
                  <div key={idx} className="bg-white rounded-3xl p-5 flex items-center justify-between shadow-xl shadow-gray-100/50 border border-gray-50/50 select-none active:scale-[0.98] transition-all">
                     <div className="flex items-center gap-4">
                        <div className="w-[52px] h-[52px] bg-red-50/50 rounded-2xl flex items-center justify-center p-2.5">
                           {/* Brand Icon Placeholder as per reference */}
                           <div className="w-full h-full bg-[#EF4444] rounded-lg flex items-center justify-center">
                              <TrendingUp className="w-6 h-6 text-white" />
                           </div>
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[17px] font-black text-[#EF4444] leading-tight">+{fmt(item.preco * (item.daily_percent / 100))} AI-GO</span>
                           <span className="text-[12px] text-gray-400 font-bold lowercase mt-0.5">quantidade {fmt(item.preco)} AI-GO</span>
                        </div>
                     </div>
                     <div className="text-right">
                        <span className="text-[14px] font-black text-gray-900">{item.daily_percent}%</span>
                        <p className="text-[11px] text-gray-400 font-bold lowercase">margens</p>
                     </div>
                  </div>
               ))
            ) : (
               <div className="py-20 flex flex-col items-center">
                  <img src="/empty-image-CHCN_UjN.png" alt="vazio" className="w-20 h-20 opacity-10 grayscale mb-4" />
                  <p className="text-gray-300 text-[12px] font-black lowercase tracking-widest">sem registos disponíveis</p>
               </div>
            )}
         </div>
      </section>

      {/* 🔔 Feedback Toast */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[1000] bg-black/80 backdrop-blur-xl text-white px-8 py-3.5 rounded-full text-[13px] font-black shadow-2xl lowercase"
          >
            {feedback}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
