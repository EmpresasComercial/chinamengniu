import { useState, useEffect, useCallback } from 'react';
import { ArrowLeftRight, Play } from 'lucide-react';
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
    reproductionBalance: 0,   // balance_correte
    totalProfit: 0,           // balance_correte (ativos de lucro)
    dailyIncomeTotal: 0,      // renda_coletada
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

    // Parallel fetch of products and history for faster loading
    const [productsRes, historyRes] = await Promise.all([
      supabase.from('products').select('name, image_url'),
      supabase.from('historico_compras')
        .select('*')
        .eq('user_id', user.id)
        .order('data_compra', { ascending: false })
    ]);

    if (historyRes.error) {
      console.error('Error fetching history:', historyRes.error);
      return;
    }

    if (historyRes.data) {
      const historyData = historyRes.data;
      const today = new Date();
      const activeInvestments = historyData.filter(h =>
        h.status === 'confirmado' && new Date(h.data_expiracao) > today
      );

      const productsData = productsRes.data || [];
      const productMap = new Map(productsData.map(p => [p.name, p.image_url]));

      const formattedData = historyData.map((item: any) => ({
        ...item,
        image_url: productMap.get(item.nome_produto) || 'https://png.pngtree.com/png-clipart/20240615/original/pngtree-a-black-and-white-cow-with-tranparent-background-png-image_15340862.png'
      }));

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

    // Parallel fetch of tasks and today check
    const todayStr = new Date().toISOString().split('T')[0];
    
    const [todayTaskRes, tasksRes] = await Promise.all([
      supabase.from('tarefas_diarias').select('id').eq('user_id', user.id).gte('data_atribuicao', todayStr).limit(1),
      supabase.from('tarefas_diarias').select('balance_correte, renda_coletada').eq('user_id', user.id)
    ]);

    setHasCollectedToday(!!(todayTaskRes.data && todayTaskRes.data.length > 0));

    if (tasksRes.data) {
      const tasks = tasksRes.data;
      const balance = tasks.reduce((sum, t) => sum + Number(t.balance_correte || 0), 0);
      const rendaTotal = tasks.reduce((sum, t) => sum + Number(t.renda_coletada || 0), 0);
      setStats(prev => ({
        ...prev,
        reproductionBalance: balance,
        totalProfit: balance,
        dailyIncomeTotal: rendaTotal
      }));
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    // Use registerFetch for each parallel initial load
    const donePurchases = registerFetch();
    const doneStats = registerFetch();

    fetchPurchases().finally(() => donePurchases());
    fetchDailyStats().finally(() => doneStats());

    const channel = supabase.channel('realtime_reproducao')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tarefas_diarias',
        filter: `user_id=eq.${user?.id}`
      }, () => {
        fetchDailyStats();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'historico_compras',
        filter: `user_id=eq.${user?.id}`
      }, () => {
        fetchPurchases();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchPurchases, fetchDailyStats, registerFetch]);

  const handleStartCollection = useCallback(async () => {
    if (hasCollectedToday) {
      showToast('A extração diária já foi realizada com sucesso.');
      return;
    }

    setIsCollecting(true);
    showLoading();
    try {
      const { data, error } = await supabase.rpc('claim_daily_income');

      if (error) {
        showToast(`erro operacional: ${error.message}`);
      } else if (data && data.success) {
        showToast('rendimento extraído com sucesso.');
        fetchDailyStats();
      } else {
        showToast(data?.message || 'falha na extração. tente novamente.');
      }
    } catch (err) {
      showToast('instabilidade na rede de dados detectada.');
    } finally {
      setIsCollecting(false);
      hideLoading();
    }
  }, [hasCollectedToday, showLoading, hideLoading, fetchDailyStats]);

  return (
    <div className="flex flex-col min-h-screen bg-[#0000AA] text-white pt-4 px-4 pb-0 page-content">
      {/* Banner Card */}
      <section className="relative rounded-xl overflow-hidden mb-4">
        <img
          alt="Banner Cow"
          className="w-full h-auto object-cover"
          src="/minas.jpg"
          loading="lazy"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <h2 className="text-[15px] font-bold tracking-tight lowercase">extração de recursos</h2>
          <p className="text-[10px] text-gray-200 lowercase">monitorização inteligente e segura em tempo real</p>
        </div>

        {/* VIP Badge */}
        <div className="absolute top-3 left-3 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-2">
          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center overflow-hidden p-1">
            <img
              alt="Newmont Corporation logo"
              className="w-12 h-12 object-contain"
              src="/NewmontCorporationfff83c6b-57f6-428e-alogob.png"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold lowercase">vip0</span>
            <div className="flex text-[8px] text-yellow-400">☆☆☆☆☆</div>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-2 gap-y-4 mb-6 px-1">
        <div>
          <p className="text-[10px] text-gray-300 uppercase tracking-wider lowercase">conta de extração</p>
          <p className="text-[15px] font-bold">{stats.reproductionBalance.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} kz</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-300 uppercase tracking-wider lowercase">ativos de lucro</p>
          <p className="text-[15px] font-bold">{stats.totalProfit.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} kz</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-300 uppercase tracking-wider lowercase">renda diária</p>
          <p className="text-[12.5px] font-semibold">{stats.dailyIncomeTotal.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} kz</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-300 uppercase tracking-wider lowercase">ciclos de atividade</p>
          <p className="text-[12.5px] font-semibold">{stats.activeCowsCount} ativos / {stats.totalPurchasesCount} total</p>
        </div>
        <div className="col-span-2 mt-2">
          <p className="text-[10px] text-gray-300 uppercase tracking-wider lowercase">estado do ciclo diário</p>
          <p className="text-[15px] font-bold lowercase">
            {hasCollectedToday ? 'extração concluída hoje' : 'aguardando operação diária'}
          </p>
        </div>
      </section>

      {/* Action Buttons */}
      <section className="grid grid-cols-2 gap-3 mb-8">
        <button
          onClick={() => navigate('/transferencia-de-fundos')}
          className="bg-[#D2F076] text-white rounded-lg p-4 flex items-center justify-between text-left font-black leading-[1] h-[45px]"
        >
          <span className="text-[11px] uppercase tracking-tighter lowercase flex-1 text-center">converter saldo</span>
          <ArrowLeftRight className="w-4 h-4 ml-2" />
        </button>
        <button
          onClick={handleStartCollection}
          disabled={hasCollectedToday || isCollecting}
          className={`rounded-lg p-4 flex items-center justify-between text-left font-black leading-[1] h-[45px] transition-all ${hasCollectedToday || isCollecting ? 'bg-gray-400 cursor-not-allowed text-gray-200' : 'bg-[#D2F076] text-white active:scale-95'
            }`}
        >
          <span className="text-[11px] uppercase tracking-tighter lowercase flex-1 text-center">
            {isCollecting ? 'processando...' : hasCollectedToday ? 'extraído' : 'minerar'}
          </span>
          <Play className={`w-4 h-4 ml-2 ${hasCollectedToday || isCollecting ? 'text-gray-300' : 'fill-current'}`} />
        </button>
      </section>

      {/* Seção de Ativos Adquiridos */}
      <section className="bg-white rounded-t-[12px] p-8 -mx-4 flex-grow min-h-[400px]">

        <div className="flex flex-col">
          {purchases.length > 0 ? (
            <div className="grid grid-cols-3 gap-x-2 gap-y-8 pt-2">
              {purchases.map((item) => (
                <div key={item.id} className="flex flex-col items-center text-center font-serif">
                  <div className="w-[50px] h-[50px] mb-2 flex items-center justify-center relative">
                    <img
                      alt={item.nome_produto}
                      className="w-full h-full object-contain  animate-walk mix-blend-multiply"
                      src={item.image_url}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <h4 className="font-bold text-[18px] text-black lowercase leading-tight tracking-tight">
                    {item.nome_produto}
                  </h4>
                  <p className="text-[15px] text-black font-medium">
                    dias/{item.duracao_dias}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center pt-10">
              <div className="w-20 h-20 mb-4 opacity-30">
                <img
                  alt="vazio"
                  className="w-full h-full object-contain"
                  src="/empty-image-CHCN_UjN.png"
                />
              </div>
              <p className="text-gray-400 text-[12px] font-bold lowercase tracking-widest">nenhum registro</p>
            </div>
          )}
        </div>
      </section>

      {/* Feedback Toast */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 0, y: 0 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: 0, y: 0 }}
            className="fixed inset-0 m-auto w-fit h-fit min-w-[260px] bg-black/50 backdrop-blur-sm text-white px-5 py-3 rounded-xl text-[12.5px]  z-[500] text-center max-w-[85vw] whitespace-normal break-words"
          >
            {feedback}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
