import { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronLeft, Filter } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLoading } from '../contexts/LoadingContext';
import { ListSkeleton } from '../components/Skeleton';

type FilterType = 'retiradas' | 'recarregamentos' | 'tarefas_diarias' | 'bonus_transacoes';

const FILTER_OPTIONS: { id: FilterType; label: string; table: string }[] = [
  { id: 'retiradas', label: 'Histórico de Levantamentos', table: 'retirada_clientes' },
  { id: 'recarregamentos', label: 'Histórico de Depósitos', table: 'depositos_clientes' },
  { id: 'tarefas_diarias', label: 'Rendimentos Diários', table: 'tarefas_diarias' },
  { id: 'bonus_transacoes', label: 'Bónus e Comissões', table: 'bonus_transacoes' },
];

const statusColor: Record<string, string> = {
  pendente: 'bg-yellow-100 text-yellow-700',
  aprovado: 'bg-green-100 text-green-700',
  confirmado: 'bg-green-100 text-green-700',
  rejeitado: 'bg-red-100 text-red-700',
  cancelado: 'bg-red-100 text-red-700',
  concluido: 'bg-purple-100 text-purple-700',
  success: 'bg-green-100 text-green-700',
};

export default function FinancialRecords() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { registerFetch } = useLoading();

  const locationState = location.state as { initialFilter?: FilterType } | null;
  const [activeFilter, setActiveFilter] = useState<FilterType>(
    locationState?.initialFilter ?? 'retiradas'
  );
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const currentFilter = useMemo(() => FILTER_OPTIONS.find(f => f.id === activeFilter)!, [activeFilter]);

  const fetchRecords = useCallback(async (filter: FilterType) => {
    if (!user) return;
    setLoading(true);
    setRecords([]);
    const done = registerFetch();

    try {
      const { data, error } = await supabase.rpc('get_my_financial_records', { p_filter: filter });
      if (!error && data) setRecords(data);
    } finally {
      setLoading(false);
      done();
    }
  }, [user, registerFetch]);

  useEffect(() => {
    fetchRecords(activeFilter);
  }, [fetchRecords, activeFilter]);

  const handleFilterSelect = useCallback((filter: FilterType) => {
    setActiveFilter(filter);
    setShowFilterPopup(false);
  }, []);

  const renderItem = useCallback((item: any) => {
    switch (activeFilter) {
      case 'retiradas':
        return (
          <div key={item.id} className="border border-gray-100 rounded-xl p-4 flex justify-between items-center">
            <div className="flex flex-col gap-1">
              <p className="text-[12.5px] font-bold text-gray-800">{item.nome_do_banco}</p>
              <p className="text-[10px] text-gray-500">
                {item.data_da_retirada ? new Date(item.data_da_retirada).toLocaleDateString('pt-AO') : '—'}
                {item.hora_da_retirada ? ' · ' + item.hora_da_retirada.slice(0, 5) : ''}
              </p>
              <p className="text-[10px] text-gray-400">{item.metodo || 'Transferência Bancária'}</p>
            </div>
            <div className="text-right flex flex-col items-end gap-1.5">
              <p className="text-[12.5px] font-black text-red-500">-{Number(item.valor_solicitado).toLocaleString('pt-AO')} Kz</p>
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${statusColor[item.estado_da_retirada] || 'bg-gray-100 text-gray-500'}`}>
                {item.estado_da_retirada}
              </span>
            </div>
          </div>
        );

      case 'recarregamentos':
        return (
          <div key={item.id} className="border border-gray-100 rounded-xl p-4 flex justify-between items-center">
            <div className="flex flex-col gap-1">
              <p className="text-[12.5px] font-bold text-gray-800">{item.nome_do_banco || 'Depósito Bancário'}</p>
              <p className="text-[10px] text-gray-500">
                {item.created_at ? new Date(item.created_at).toLocaleDateString('pt-AO') : '—'}
              </p>
              <p className="text-[10px] text-gray-400 font-mono truncate max-w-[160px] opacity-60">{item.chave_de_transacao || '—'}</p>
            </div>
            <div className="text-right flex flex-col items-end gap-1.5">
              <p className="text-[12.5px] font-black text-[#6D28D9]">+{Number(item.valor_deposito).toLocaleString('pt-AO')} Kz</p>
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${statusColor[item.estado_de_pagamento] || 'bg-gray-100 text-gray-500'}`}>
                {item.estado_de_pagamento}
              </span>
            </div>
          </div>
        );

      case 'tarefas_diarias':
        return (
          <div key={item.id} className="border border-gray-100 rounded-xl p-4 flex justify-between items-center">
            <div className="flex flex-col gap-1">
              <p className="text-[12.5px] font-bold text-gray-800">Tarefa Diária Concluída</p>
              <p className="text-[10px] text-gray-500">
                {item.data_atribuicao ? new Date(item.data_atribuicao).toLocaleDateString('pt-AO') : '—'}
              </p>
            </div>
            <div className="text-right flex flex-col items-end gap-1.5">
              <p className="text-[12.5px] font-black text-green-600">+{Number(item.renda_coletada).toLocaleString('pt-AO')} Kz</p>
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${statusColor[item.status] || 'bg-gray-100 text-gray-500'}`}>
                {item.status}
              </span>
            </div>
          </div>
        );

      case 'bonus_transacoes': {
        const dt = item.data_recebimento ? new Date(item.data_recebimento) : null;
        const dateStr = dt ? dt.toLocaleDateString('pt-AO') : '—';
        const timeStr = dt ? dt.toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' }) : '';
        const isTransfer = String(item.origem_bonus || '').toLowerCase().includes('transferência');
        return (
          <div key={item.id} className="border border-gray-100 rounded-xl p-4">
            <div className="flex justify-between items-start gap-3">
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <p className="text-[12.5px] font-bold text-gray-800 leading-snug">
                  {item.origem_bonus || 'Bónus de Ativação'}
                </p>
                <p className="text-[10px] text-gray-500">
                  {dateStr}{timeStr ? <span className="text-gray-400"> · {timeStr}</span> : null}
                </p>
              </div>
              <div className="text-right flex flex-col items-end gap-1.5 flex-shrink-0">
                <p className={`text-[12.5px] font-black ${isTransfer ? 'text-[#6D28D9]' : 'text-green-600'}`}>
                  +{Number(item.valor_recebido).toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz
                </p>
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${statusColor[item.status] || 'bg-gray-100 text-gray-500'}`}>
                  {item.status}
                </span>
              </div>
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  }, [activeFilter]);

  return (
    <div className="flex flex-col min-h-screen bg-[#E2E4EB] page-content">
      {/* Header */}
      <header className="bg-[#6D28D9] text-white flex items-center justify-between px-4 py-3 sticky top-0 z-50">
        <button onClick={() => navigate(-1)} className="w-10" aria-label="Voltar" title="Voltar">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-[15px] font-bold tracking-wide">Registos de Conta</h1>
        <div className="w-10" />
      </header>

      {/* Main Content */}
      <main className="p-4 flex-1">
        <div className="bg-white rounded-xl p-4  flex flex-col min-h-[400px]">

          {/* Active Tab Label + Filter Icon */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex-1 bg-[#F4F6F9] rounded-full px-4 py-2">
              <span className="text-[12.5px] font-bold text-[#6D28D9] block text-center">
                {currentFilter.label}
              </span>
            </div>
            <button
              onClick={() => setShowFilterPopup(true)}
              className="ml-3 w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              aria-label="filtrar"
              title="filtrar"
            >
              <Filter className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          {loading ? (
            <div className="py-2">
              <ListSkeleton count={4} />
            </div>
          ) : records.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <img
                alt="Vazio"
                className="w-24 h-24 object-contain opacity-50 mb-3"
                src="/empty-image-CHCN_UjN.png"
              />
              <p className="text-gray-400 text-[12.5px]">Nenhum registo encontrado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {records.map((item) => renderItem(item))}
            </div>
          )}
        </div>
      </main>

      {/* Filter Popup */}
      <AnimatePresence>
        {showFilterPopup && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilterPopup(false)}
              className="fixed inset-0 bg-black/50 z-[60]"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-white rounded-[1.5rem] z-[70] overflow-hidden "
            >
              <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-800 text-[15px]">Filtrar por</h3>
                <button 
                  onClick={() => setShowFilterPopup(false)} 
                  className="text-gray-400 p-1 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="fechar"
                  title="fechar"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="py-2">
                {FILTER_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleFilterSelect(option.id)}
                    className={`w-full text-left px-6 py-4 flex items-center justify-between transition-colors ${activeFilter === option.id ? 'bg-[#6D28D9]/5' : 'hover:bg-gray-50'
                      }`}
                  >
                    <span className={`text-[14.5px] font-medium ${activeFilter === option.id ? 'text-[#6D28D9] font-bold' : 'text-gray-700'}`}>
                      {option.label}
                    </span>
                    {activeFilter === option.id && (
                      <svg className="w-5 h-5 text-[#6D28D9]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
