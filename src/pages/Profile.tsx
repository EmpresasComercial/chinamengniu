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


  useEffect(() => {
    if (!user) return;
  }, [user]);

  const handleCopyUID = () => {
    if (profile?.invite_code) {
      navigator.clipboard.writeText(profile.invite_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
              alt="Mengniu Company logo"
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

        {/* Financial Statistics */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div>
            <p className="text-[10px] opacity-80 uppercase tracking-wider">Ativos totais</p>
            <p className="text-[20px] font-bold">{profile?.balance || '0'} Kz</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] opacity-80 uppercase tracking-wider">Receita total</p>
            <p className="text-[20px] font-bold">{profile?.income || '0.00'} Kz</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4 text-center">
          <div>
            <p className="text-[10px] opacity-80 leading-tight">conta de<br />reprodução</p>
            <p className="font-bold text-[14px] mt-1">0.00 Kz</p>
          </div>
          <div>
            <p className="text-[10px] opacity-80 leading-tight">Ativos de<br />Lucro</p>
            <p className="font-bold text-[14px] mt-1">{profile?.balance || '0.00'} Kz</p>
          </div>
          <div>
            <p className="text-[10px] opacity-80 leading-tight">Comissão<br />total</p>
            <p className="font-bold text-[14px] mt-1">0 Kz</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 mt-6">
          <button
            onClick={() => navigate('/recarregar')}
            className="flex-1 bg-[#D6F174] text-black font-bold h-[45px] rounded-lg px-4"
          >
            <span className="text-[15px] flex-1 text-left">recarregar</span>
            <img
              alt="recharge icon"
              className="w-8 h-7 object-contain ml-2"
              src="https://www.mengniu.wang/assets/deposit1-Dk3ugVyJ.png"
              referrerPolicy="no-referrer"
            />
          </button>
          <button
            onClick={() => navigate('/retirar')}
            className="flex-1 bg-[#D6F174] text-black font-bold h-[45px] rounded-lg px-4"
          >
            <span className="text-[15px] flex-1 text-left">extrair</span>
            <img
              alt="withdraw icon"
              className="w-7 h-7 object-contain ml-2"
              src="https://www.mengniu.wang/assets/withdraw1-pLMbG-t2.png"
              referrerPolicy="no-referrer"
            />
          </button>
        </div>
      </header>

      {/* Stats Section */}
      <section className="bg-[#0000AA] px-4 pb-6 text-white relative">
        <div className="absolute right-[-20px] top-4 w-24 h-24 rounded-full bg-white/5 border-2 border-white/10"></div>
        <div className="grid grid-cols-3 gap-2 text-center py-4 border-t border-white/10">
          <div>
            <p className="text-[10px] opacity-70">Lucros de ontem</p>
            <p className="font-bold text-[14px]">0 Kz</p>
          </div>
          <div>
            <p className="text-[10px] opacity-70">Ganhos de hoje</p>
            <p className="font-bold text-[14px]">0 Kz</p>
          </div>
          <div>
            <p className="text-[10px] opacity-70">Comissão de hoje</p>
            <p className="font-bold text-[14px]">0 Kz</p>
          </div>
        </div>

      </section>

      {/* Action List Section */}
      <section className="bg-[#EAEBED] rounded-t-3xl -mt-4 relative z-10 px-4 pt-6 flex-grow">
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
      </section>
    </div>
  );
}
