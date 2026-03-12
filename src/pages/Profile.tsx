import { useState, useEffect } from 'react';
import { Rocket, Users, BarChart3, CircleDollarSign, ShieldCheck, HelpCircle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLoading } from '../contexts/LoadingContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function Profile() {
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();
  const { profile, signOut, user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [financialData, setFinancialData] = useState({
    contaReproducao: 0,      // tarefas_diarias.balance_correte
    retiradaTotal: 0,        // retirada_clientes.valor_solicitado (aprovado)
    comissaoTotalEquipe: 0,  // bonus_transacoes total
    lucrosOntem: 0,          // tarefas_diarias.renda_coletada de ontem
    ganhoHoje: 0,            // tarefas_diarias.renda_coletada de hoje
    comissaoHoje: 0,         // bonus_transacoes de hoje
  });

  useEffect(() => {
    if (!user) return;
    fetchFinancialData();
  }, [user]);

  async function fetchFinancialData() {
    if (!user) return;

    const hoje = new Date();
    const inicioDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()).toISOString();
    const inicioOntem = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - 1).toISOString();
    const fimOntem = inicioDia;

    // 1. tarefas_diarias: balance_correte e renda_coletada
    const { data: tarefas } = await supabase
      .from('tarefas_diarias')
      .select('balance_correte, renda_coletada, data_atribuicao')
      .eq('user_id', user.id);

    // 2. retiradas aprovadas: valor_solicitado
    const { data: retiradas } = await supabase
      .from('retirada_clientes')
      .select('valor_solicitado')
      .eq('user_id', user.id)
      .eq('estado_da_retirada', 'aprovado');

    // 3. bonus_transacoes: todos os bônus (cadastro + investimento + comissões)
    const { data: bonus } = await supabase
      .from('bonus_transacoes')
      .select('valor_recebido, data_recebimento')
      .eq('user_id', user.id);

    const contaReproducao = (tarefas || []).reduce((s, t) => s + Number(t.balance_correte || 0), 0);
    const retiradaTotal = (retiradas || []).reduce((s, r) => s + Number(r.valor_solicitado || 0), 0);
    const comissaoTotalEquipe = (bonus || []).reduce((s, b) => s + Number(b.valor_recebido || 0), 0);

    const lucrosOntem = (tarefas || [])
      .filter(t => {
        const d = new Date(t.data_atribuicao);
        return d >= new Date(inicioOntem) && d < new Date(fimOntem);
      })
      .reduce((s, t) => s + Number(t.renda_coletada || 0), 0);

    const ganhoHoje = (tarefas || [])
      .filter(t => new Date(t.data_atribuicao) >= new Date(inicioDia))
      .reduce((s, t) => s + Number(t.renda_coletada || 0), 0);

    const comissaoHoje = (bonus || [])
      .filter(b => new Date(b.data_recebimento) >= new Date(inicioDia))
      .reduce((s, b) => s + Number(b.valor_recebido || 0), 0);

    setFinancialData({ contaReproducao, retiradaTotal, comissaoTotalEquipe, lucrosOntem, ganhoHoje, comissaoHoje });
  }

  const handleCopyUID = () => {
    if (profile?.invite_code) {
      navigator.clipboard.writeText(profile.invite_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const fmt = (val: number) => val.toLocaleString('pt-AO', { minimumFractionDigits: 2 });

  const menuItems = [
    { name: 'convidar amigos', icon: Rocket, path: '/convidar' },
    { name: 'minha equipe', icon: Users, path: '/equipe' },
    { name: 'registros de conta', icon: BarChart3, path: '/detalhes' },
    { name: 'trocar saldo', icon: CircleDollarSign, path: '/transferencia-de-fundos' },
    { name: 'centro de segurança', icon: ShieldCheck, path: '/centro-de-seguranca' },
    { name: 'perguntas frequentes', icon: HelpCircle, path: '/central-de-ajuda' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#EAEBED] page-content">
      {/* Header Section */}
      <header className="bg-[#0000AA] p-4 text-white pb-8 relative overflow-hidden">
        {/* Decorative circle */}
        <div className="absolute -right-10 top-10 w-32 h-32 rounded-full bg-white/10 border-4 border-white/20"></div>

        <div className="flex items-center space-x-3 mb-2">
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center overflow-hidden">
            <img
              alt="logo"
              className="w-full h-full object-contain p-1"
              src="https://s3-symbol-logo.tradingview.com/mengniu-dairy--600.png"
            />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-[15px] truncate max-w-[150px]">
                {profile?.phone ? `+244 ${profile.phone}` : 'Carregando...'}
              </span>
              <span className="bg-yellow-500 text-[10px] px-2 rounded-full text-black font-bold">
                {profile?.state || 'VIP0'}
              </span>
            </div>
            <div className="flex items-center mt-1">
              <span className="text-[12.5px] text-yellow-400 font-bold tracking-wider">
                ID: {profile?.invite_code || '---'}
              </span>
              <button
                onClick={handleCopyUID}
                className="ml-2 text-[10px] bg-white/20 px-1 rounded flex items-center gap-1 btn-small"
              >
                {copied ? 'copiado!' : '📋'}
              </button>
            </div>
          </div>
        </div>

        {/* Linha 1: balance (profiles.balance) + recarga total (profiles.reloaded_amount) */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div>
            <p className="text-[10px] opacity-80 uppercase tracking-wider">Balance contabilazado</p>
            <p className="text-[20px] font-bold">{fmt(Number(profile?.balance || 0))} Kz</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] opacity-80 uppercase tracking-wider">recarga total</p>
            <p className="text-[20px] font-bold">{fmt(Number(profile?.reloaded_amount || 0))} Kz</p>
          </div>
        </div>

        {/* Linha 2: conta de reprodução + retirada total + comissão total equipe */}
        <div className="grid grid-cols-3 gap-2 mt-4 text-center">
          <div>
            <p className="text-[10px] opacity-80 leading-tight">conta de<br />reprodução</p>
            <p className="font-bold text-[14px] mt-1">{fmt(financialData.contaReproducao)} Kz</p>
          </div>
          <div>
            <p className="text-[10px] opacity-80 leading-tight">retirada<br />total</p>
            <p className="font-bold text-[14px] mt-1">{fmt(financialData.retiradaTotal)} Kz</p>
          </div>
          <div>
            <p className="text-[10px] opacity-80 leading-tight">Comissão total<br />equipe</p>
            <p className="font-bold text-[14px] mt-1">{fmt(financialData.comissaoTotalEquipe)} Kz</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2 mt-6">
          <button
            onClick={() => navigate('/recarregar')}
            className="bg-[#D6F174] text-black font-bold h-[45px] rounded-lg px-2 flex items-center justify-between shadow-sm"
          >
            <span className="text-[12.5px]">recarregar</span>
            <img src="/deposit1-Dk3ugVyJ.png" alt="Recarregar" className="w-6 h-6 object-contain shrink-0" />
          </button>
          <button
            onClick={() => navigate('/recarregar-usdt')}
            className="bg-[#00D1FF] text-white font-bold h-[45px] rounded-lg px-2 flex items-center justify-between shadow-sm"
          >
            <span className="text-[12.5px]">recarga USDT</span>
            <img src="/image-svasa.png" alt="USDT" className="w-8 h-8 object-contain shrink-0" />
          </button>
          <button
            onClick={() => navigate('/retirar')}
            className="bg-[#D6F174] text-black font-bold h-[45px] rounded-lg px-2 flex items-center justify-between shadow-sm"
          >
            <span className="text-[12.5px]">extrair</span>
            <img src="/withdraw1-pLMbG-t2.png" alt="Extrair" className="w-6 h-6 object-contain shrink-0" />
          </button>
        </div>
      </header>

      {/* Stats Section */}
      <section className="bg-[#0000AA] px-4 pb-6 text-white relative">
        <div className="absolute right-[-20px] top-4 w-24 h-24 rounded-full bg-white/5 border-2 border-white/10"></div>
        <div className="grid grid-cols-3 gap-2 text-center py-4 border-t border-white/10">
          <div>
            <p className="text-[10px] opacity-70">Lucros de ontem</p>
            <p className="font-bold text-[14px]">{fmt(financialData.lucrosOntem)} Kz</p>
          </div>
          <div>
            <p className="text-[10px] opacity-70">Ganhos de hoje</p>
            <p className="font-bold text-[14px]">{fmt(financialData.ganhoHoje)} Kz</p>
          </div>
          <div>
            <p className="text-[10px] opacity-70">Comissão de hoje</p>
            <p className="font-bold text-[14px]">{fmt(financialData.comissaoHoje)} Kz</p>
          </div>
        </div>

      </section >

      {/* Action List Section */}
      < section className="bg-[#EAEBED] rounded-t-3xl -mt-4 relative z-10 px-4 pt-6 flex-grow" >
        <div className="space-y-1">
          {menuItems.map((item, idx) => (
            <div
              key={idx}
              onClick={() => item.path !== '#' && navigate(item.path)}
              className="flex items-center justify-between py-3 border-b border-gray-200 cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <item.icon className="w-5 h-5 text-blue-900" />
                <span className="text-blue-900 text-[12.5px] font-medium">{item.name}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          ))}
        </div>
        <button
          onClick={async () => {
            showLoading();
            await signOut();
            hideLoading();
            navigate('/login');
          }}
          className="w-full bg-[#0000B8] text-white font-bold h-[45px] mt-8 mb-20 rounded-full text-[15px]"
        >
          sair
        </button>
      </section >
    </div >
  );
}
