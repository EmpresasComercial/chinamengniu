import { useState, useEffect } from 'react';
import { ArrowLeftRight, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLoading } from '../contexts/LoadingContext';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

export default function Reproducao() {
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

  const showToast = (message: string) => {
    setFeedback(message);
    setTimeout(() => setFeedback(null), 3000);
  };

  async function fetchPurchases() {
    if (!user) return;

    // Primeiro buscamos todos os produtos para ter as imagens corretas
    const { data: productsData } = await supabase
      .from('products')
      .select('name, image_url');

    const { data: historyData, error } = await supabase
      .from('historico_compras')
      .select('*')
      .eq('user_id', user.id)
      .order('data_compra', { ascending: false });

    if (error) {
      console.error('Error fetching history:', error);
      return;
    }

    if (historyData) {
      const activeInvestments = historyData.filter(h =>
        h.status === 'confirmado' && new Date(h.data_expiracao) > new Date()
      );

      const totalDailyIncome = activeInvestments.reduce((sum, h) => sum + Number(h.rendimento_diario), 0);
      const totalInvested = activeInvestments.reduce((sum, h) => sum + Number(h.preco), 0);

      const formattedData = historyData.map((item: any) => {
        const product = productsData?.find(p => p.name === item.nome_produto);
        return {
          ...item,
          image_url: product?.image_url || 'https://png.pngtree.com/png-clipart/20240615/original/pngtree-a-black-and-white-cow-with-tranparent-background-png-image_15340862.png'
        };
      });

      setPurchases(formattedData);
      setStats(prev => ({
        ...prev,
        activeCowsCount: activeInvestments.length,
        totalPurchasesCount: historyData.length
      }));
    }
  }

  async function fetchDailyStats() {
    if (!user) return;

    // 1. Check if collected today
    const { data: todayTask } = await supabase
      .from('tarefas_diarias')
      .select('id')
      .eq('user_id', user.id)
      .gte('data_atribuicao', new Date().toISOString().split('T')[0])
      .limit(1);

    setHasCollectedToday(!!(todayTask && todayTask.length > 0));

    // 2. Fetch reproduction balance (sum of balance_correte from all tasks)
    const { data: tareas } = await supabase
      .from('tarefas_diarias')
      .select('balance_correte, renda_coletada')
      .eq('user_id', user.id);

    if (tareas) {
      // conta de reprodução: soma de balance_correte
      const balance = tareas.reduce((sum, t) => sum + Number(t.balance_correte || 0), 0);
      // renda diária: soma de renda_coletada
      const rendaTotal = tareas.reduce((sum, t) => sum + Number(t.renda_coletada || 0), 0);
      setStats(prev => ({
        ...prev,
        reproductionBalance: balance,  // conta de reprodução = balance_correte
        totalProfit: balance,           // ativos de lucro = balance_correte (igual)
        dailyIncomeTotal: rendaTotal    // renda diária = renda_coletada
      }));
    }
  }

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
  }, [user]);

  const handleStartCollection = async () => {
    if (hasCollectedToday) {
      showToast('você já realizou a coleta hoje!');
      return;
    }

    showLoading();
    try {
      const { data, error } = await supabase.rpc('claim_daily_income');

      if (error) {
        showToast(`erro: ${error.message}`);
      } else if (data && data.success) {
        showToast('coleta bem-sucedida!');
        fetchDailyStats();
      } else {
        showToast(data?.message || 'coleta não sucedida tente novamente.');
      }
    } catch (err) {
      showToast('conexão instavel.');
    } finally {
      hideLoading();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0000AA] text-white p-4 page-content">
      {/* Banner Card */}
      <section className="relative rounded-xl overflow-hidden mb-4">
        <img
          alt="Banner Cow"
          className="w-full h-auto object-cover"
          src="/vaca-6978d793f60d.webp"
          loading="lazy"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <h2 className="text-[15px] font-bold lowercase tracking-tight">alimentação inteligente</h2>
          <p className="text-[10px] text-gray-200">criação inteligente, segura e robusta</p>
        </div>

        {/* VIP Badge */}
        <div className="absolute top-3 left-3 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-2">
          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center overflow-hidden p-1">
            <img
              alt="Mengniu Company logo"
              className="w-full h-full object-contain"
              src="https://s3-symbol-logo.tradingview.com/mengniu-dairy--600.png"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold">VIP0</span>
            <div className="flex text-[8px] text-yellow-400">☆☆☆☆☆</div>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-2 gap-y-4 mb-6 px-1">
        <div>
          <p className="text-[10px] text-gray-300">conta de reprodução</p>
          <p className="text-[15px] font-bold">{stats.reproductionBalance.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-300">ativos de lucro</p>
          <p className="text-[15px] font-bold">{stats.totalProfit.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-300">renda diária</p>
          <p className="text-[12.5px] font-semibold">{stats.dailyIncomeTotal.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-300">usado / número total de vezes</p>
          <p className="text-[12.5px] font-semibold">{stats.activeCowsCount}/{stats.totalPurchasesCount}</p>
        </div>
        <div className="col-span-2 mt-2">
          <p className="text-[10px] text-gray-300">horário de reinicialização da alimentação</p>
          <p className="text-[15px] font-bold lowercase">
            {hasCollectedToday ? 'coleta concluída hoje' : 'aguardando coleta diária'}
          </p>
        </div>
      </section>

      {/* Action Buttons */}
      <section className="grid grid-cols-2 gap-3 mb-8">
        <button
          onClick={() => navigate('/transferencia-de-fundos')}
          className="bg-[#D2F076] text-black rounded-lg p-4 flex items-center justify-between text-left font-black lowercase leading-[1] h-[45px] shadow-lg shadow-black/20"
        >
          <span className="text-[12px]">trocar saldo</span>
          <ArrowLeftRight className="w-5 h-5" />
        </button>
        <button
          onClick={handleStartCollection}
          disabled={hasCollectedToday}
          className={`rounded-lg p-4 flex items-center justify-between text-left font-black lowercase leading-[1] h-[45px] shadow-lg shadow-black/20 transition-all ${hasCollectedToday ? 'bg-gray-400 cursor-not-allowed text-gray-200' : 'bg-[#D2F076] text-black active:scale-95'
            }`}
        >
          <span className="text-[12px]">{hasCollectedToday ? 'coletado' : 'comece agora'}</span>
          <Play className={`w-5 h-5 ${hasCollectedToday ? 'text-gray-300' : 'fill-current'}`} />
        </button>
      </section>

      {/* History Section */}
      <section className="bg-[#EBF1FF] rounded-t-[2.5rem] p-8 -mx-4 flex-grow min-h-[400px]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[#000080] font-black text-[15px] lowercase tracking-wider">registros históricos</h3>
          <button className="text-blue-600 text-[11px] font-bold lowercase underline">veja mais</button>
        </div>

        <div className="flex flex-col">
          {purchases.length > 0 ? (
            <div className="grid grid-cols-3 gap-x-2 gap-y-8 pt-2">
              {purchases.map((item) => (
                <div key={item.id} className="flex flex-col items-center text-center font-serif">
                  <div className="w-[50px] h-[50px] mb-2 flex items-center justify-center relative">
                    <img
                      alt={item.nome_produto}
                      className="w-full h-full object-contain drop-shadow-sm animate-walk mix-blend-multiply"
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
            initial={{ opacity: 0, scale: 0.9, x: '-50%', y: '-50%' }}
            animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
            exit={{ opacity: 0, scale: 0.9, x: '-50%', y: '-50%' }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-sm text-white px-5 py-3 rounded-2xl text-[12.5px] shadow-xl z-[500] text-center max-w-[85vw] whitespace-normal break-words"
          >
            {feedback}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
