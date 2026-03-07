import { useState, useEffect } from 'react';
import { ChevronLeft, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type FilterType = 'retiradas' | 'recarregamentos' | 'tarefas_diarias' | 'bonus_transacoes';

const FILTER_OPTIONS: { id: FilterType; label: string; table: string }[] = [
  { id: 'retiradas', label: 'Conta de Retiradas', table: 'retirada_clientes' },
  { id: 'recarregamentos', label: 'Recarregamentos Feitos', table: 'depositos_clientes' },
  { id: 'tarefas_diarias', label: 'Tarefas Diárias', table: 'tarefas_diarias' },
  { id: 'bonus_transacoes', label: 'Bónus e Comissões', table: 'bonus_transacoes' },
];

const statusColor: Record<string, string> = {
  pendente: 'bg-yellow-100 text-yellow-700',
  aprovado: 'bg-green-100 text-green-700',
  confirmado: 'bg-green-100 text-green-700',
  rejeitado: 'bg-red-100 text-red-700',
  cancelado: 'bg-red-100 text-red-700',
  concluido: 'bg-blue-100 text-blue-700',
  success: 'bg-green-100 text-green-700',
};

export default function FinancialRecords() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeFilter, setActiveFilter] = useState<FilterType>('retiradas');
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const currentFilter = FILTER_OPTIONS.find(f => f.id === activeFilter)!;

  useEffect(() => {
    if (!user) return;
    fetchRecords(activeFilter);
  }, [user, activeFilter]);

  async function fetchRecords(filter: FilterType) {
    setLoading(true);
    setRecords([]);

    let query;
    switch (filter) {
      case 'retiradas':
        query = supabase.from('retirada_clientes').select('*').eq('user_id', user!.id).order('data_de_criacao', { ascending: false });
        break;
      case 'recarregamentos':
        query = supabase.from('depositos_clientes').select('*').eq('user_id', user!.id).order('created_at', { ascending: false });
        break;
      case 'tarefas_diarias':
        query = supabase.from('tarefas_diarias').select('*').eq('user_id', user!.id).order('data_atribuicao', { ascending: false });
        break;
      case 'bonus_transacoes':
        query = supabase.from('bonus_transacoes').select('*').eq('user_id', user!.id).order('data_recebimento', { ascending: false });
        break;
    }

    const { data, error } = await query;
    if (!error && data) setRecords(data);
    setLoading(false);
  }

  const handleFilterSelect = (filter: FilterType) => {
    setActiveFilter(filter);
    setShowFilterPopup(false);
  };

  const renderItem = (item: any) => {
    switch (activeFilter) {
      case 'retiradas':
        return (
          <div key={item.id} className="border border-gray-100 rounded-xl p-4 flex justify-between items-center">
            <div className="flex flex-col gap-1">
              <p className="text-[13px] font-bold text-gray-800">{item.nome_do_banco}</p>
              <p className="text-[11px] text-gray-500">
                {item.data_da_retirada ? new Date(item.data_da_retirada).toLocaleDateString('pt-AO') : '—'}
                {item.hora_da_retirada ? ' · ' + item.hora_da_retirada.slice(0, 5) : ''}
              </p>
              <p className="text-[10px] text-gray-400">{item.metodo || 'Transferência'}</p>
            </div>
            <div className="text-right flex flex-col items-end gap-1.5">
              <p className="text-[14px] font-black text-red-500">-{Number(item.valor_solicitado).toLocaleString('pt-AO')} Kz</p>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${statusColor[item.estado_da_retirada] || 'bg-gray-100 text-gray-500'}`}>
                {item.estado_da_retirada}
              </span>
            </div>
          </div>
        );

      case 'recarregamentos':
        return (
          <div key={item.id} className="border border-gray-100 rounded-xl p-4 flex justify-between items-center">
            <div className="flex flex-col gap-1">
              <p className="text-[13px] font-bold text-gray-800">{item.nome_do_banco}</p>
              <p className="text-[11px] text-gray-500">
                {item.created_at ? new Date(item.created_at).toLocaleDateString('pt-AO') : '—'}
              </p>
              <p className="text-[10px] text-gray-400 font-mono truncate max-w-[160px]">{item.chave_de_transacao || '—'}</p>
            </div>
            <div className="text-right flex flex-col items-end gap-1.5">
              <p className="text-[14px] font-black text-[#0000A5]">+{Number(item.valor_deposito).toLocaleString('pt-AO')} Kz</p>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${statusColor[item.estado_de_pagamento] || 'bg-gray-100 text-gray-500'}`}>
                {item.estado_de_pagamento}
              </span>
            </div>
          </div>
        );

      case 'tarefas_diarias':
        return (
          <div key={item.id} className="border border-gray-100 rounded-xl p-4 flex justify-between items-center">
            <div className="flex flex-col gap-1">
              <p className="text-[13px] font-bold text-gray-800">Tarefa diária</p>
              <p className="text-[11px] text-gray-500">
                {item.data_atribuicao ? new Date(item.data_atribuicao).toLocaleDateString('pt-AO') : '—'}
              </p>
            </div>
            <div className="text-right flex flex-col items-end gap-1.5">
              <p className="text-[14px] font-black text-green-600">+{Number(item.renda_coletada).toLocaleString('pt-AO')} Kz</p>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${statusColor[item.status] || 'bg-gray-100 text-gray-500'}`}>
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
                <p className="text-[13px] font-bold text-gray-800 leading-snug">
                  {item.origem_bonus || 'Bónus'}
                </p>
                <p className="text-[11px] text-gray-500">
                  {dateStr}{timeStr ? <span className="text-gray-400"> · {timeStr}</span> : null}
                </p>
              </div>
              <div className="text-right flex flex-col items-end gap-1.5 flex-shrink-0">
                <p className={`text-[14px] font-black ${isTransfer ? 'text-[#0000A5]' : 'text-green-600'}`}>
                  +{Number(item.valor_recebido).toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz
                </p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${statusColor[item.status] || 'bg-gray-100 text-gray-500'}`}>
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
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#E2E4EB] page-content">
      {/* Header */}
      <header className="bg-[#0000A5] text-white flex items-center justify-between px-4 py-3 sticky top-0 z-50">
        <button onClick={() => navigate(-1)} className="w-10">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-[15px] font-bold tracking-wide">registros de conta</h1>
        <div className="w-10" />
      </header>

      {/* Main Content */}
      <main className="p-4 flex-1">
        <div className="bg-white rounded-[2rem] p-4 shadow-sm flex flex-col min-h-[400px]">

          {/* Active Tab Label + Filter Icon */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex-1 bg-[#F4F6F9] rounded-full px-4 py-2">
              <span className="text-[12.5px] font-bold text-[#0000A5] block text-center">
                {currentFilter.label}
              </span>
            </div>
            <button
              onClick={() => setShowFilterPopup(true)}
              className="ml-3 w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <Filter className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="w-7 h-7 border-4 border-[#0000A5] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : records.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <img
                alt="vazio"
                className="w-24 h-24 object-contain opacity-50 mb-3"
                src="/empty-image-CHCN_UjN.png"
              />
              <p className="text-gray-400 text-[12.5px]">nenhum registo encontrado</p>
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
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[70] overflow-hidden"
            >
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-800 text-[15px]">filtrar por</h3>
                <button onClick={() => setShowFilterPopup(false)} className="text-gray-400 p-1">✕</button>
              </div>
              <div className="py-2">
                {FILTER_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleFilterSelect(option.id)}
                    className={`w-full text-left px-6 py-4 border-b border-gray-50 flex items-center justify-between transition-colors ${activeFilter === option.id ? 'bg-[#0000A5]/5' : 'hover:bg-gray-50'
                      }`}
                  >
                    <span className={`text-[14px] font-medium ${activeFilter === option.id ? 'text-[#0000A5] font-bold' : 'text-gray-700'}`}>
                      {option.label}
                    </span>
                    {activeFilter === option.id && (
                      <div className="w-2 h-2 rounded-full bg-[#0000A5]" />
                    )}
                  </button>
                ))}
              </div>
              <div className="h-6" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
