import { Send, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLoading } from '../contexts/LoadingContext';

export default function VIP() {
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();
  const vipLevels = [
    { id: 'VIP0', icon: 'https://api.mengniu.wang/upload/img/6978d793f60d.webp', current: true },
    { id: 'VIP1', icon: 'https://api.mengniu.wang/upload/img/6978d793f60d.webp' },
    { id: 'VIP2', icon: 'https://api.mengniu.wang/upload/img/6978d793f60d.webp' },
    { id: 'VIP3', icon: 'https://api.mengniu.wang/upload/img/6978d793f60d.webp' },
    { id: 'VIP4', icon: 'https://api.mengniu.wang/upload/img/6978d793f60d.webp' },
    { id: 'VIP5', icon: 'https://api.mengniu.wang/upload/img/6978d793f60d.webp' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#0000A5]">
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
              <h1 className="text-[15px] font-bold uppercase">VIP0</h1>
              <div className="flex text-[10px] text-gray-400">
                <span>☆</span><span>☆</span><span>☆</span><span>☆</span><span>☆</span>
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
              <p className="text-[15px] font-bold">0.00 KZs</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] opacity-80">renda diária</p>
              <p className="text-[15px] font-bold">0.00%</p>
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
          {vipLevels.map((vip) => (
            <div
              key={vip.id}
              onClick={() => {
                showLoading();
                setTimeout(() => {
                  hideLoading();
                  navigate('/vip-detalhes');
                }, 500);
              }}
              className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm border border-gray-100 cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <img alt={vip.id} className="w-12 h-12 object-contain" src={vip.icon} referrerPolicy="no-referrer" />
                <div>
                  <p className="font-bold text-[12.5px] text-[#000080]">{vip.id}</p>
                  <div className={`flex text-[10px] gap-1 ${vip.current ? 'text-gray-300' : 'text-[#FFD700]'}`}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i}>{vip.current ? '☆' : '★'}</span>
                    ))}
                    {vip.current && <span className="ml-2 text-gray-400">posição atual</span>}
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
