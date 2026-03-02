import { useState } from 'react';
import { ChevronLeft, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLoading } from '../contexts/LoadingContext';

export default function Team() {
  const navigate = useNavigate();
  const { setIsLoading } = useLoading();
  const [activeTab, setActiveTab] = useState<'members' | 'contribution'>('members');

  const handleTabChange = (tab: 'members' | 'contribution') => {
    setIsLoading(true);
    setTimeout(() => {
      setActiveTab(tab);
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#E5E9F2]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0000A0] text-white flex items-center h-12 px-4">
        <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-start">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="flex-1 text-center font-medium text-[15px] mr-8">minha equipe</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-4 space-y-4">
        {/* Stats Card */}
        <section className="bg-white rounded-[1.5rem] p-5 shadow-sm">
          <div className="grid grid-cols-2 gap-y-6 text-center">
            <div className="flex flex-col">
              <span className="text-[10px] text-[#4A5568] font-medium mb-1">Receita total($)</span>
              <span className="text-[15px] font-bold text-[#0000A0]">0</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-[#4A5568] font-medium mb-1">Ganhos de hoje($)</span>
              <span className="text-[15px] font-bold text-[#0000A0]">0</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-[#4A5568] font-medium mb-1">Número total de pessoas</span>
              <span className="text-[15px] font-bold text-[#0000A0]">0</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-[#4A5568] font-medium mb-1">Novos cadastros hoje</span>
              <span className="text-[15px] font-bold text-[#0000A0]">0</span>
            </div>
          </div>
        </section>

        {/* Tab Switcher */}
        <nav className="bg-white rounded-full py-3 px-1 flex items-center justify-around shadow-sm text-[12.5px] font-medium">
          <button
            onClick={() => handleTabChange('members')}
            className="flex flex-col items-center focus:outline-none"
          >
            <span className={activeTab === 'members' ? 'text-black' : 'text-gray-500'}>membros da equipe</span>
            {activeTab === 'members' && <div className="w-[30px] h-[3px] bg-[#333] mt-1 rounded-full"></div>}
          </button>
          <div className="h-4 w-[1px] bg-gray-300"></div>
          <button
            onClick={() => handleTabChange('contribution')}
            className="flex flex-col items-center focus:outline-none"
          >
            <span className={activeTab === 'contribution' ? 'text-black' : 'text-gray-500'}>contribuição da equipe</span>
            {activeTab === 'contribution' && <div className="w-[30px] h-[3px] bg-[#333] mt-1 rounded-full"></div>}
          </button>
        </nav>

        {activeTab === 'members' ? (
          <>
            {/* Filters */}
            <div className="flex justify-between items-center px-1 text-[12.5px]">
              <div className="text-[#4A5568]">
                novos cadastros hoje <span className="text-[#4A5568] ml-1">0</span>
              </div>
              <div className="flex items-center text-[#4A5568]">
                nível 1
                <ChevronDown className="h-3 w-3 ml-1" />
              </div>
            </div>

            {/* List Container */}
            <div className="space-y-2">
              {/* Table Header */}
              <div className="bg-white rounded-lg py-3 px-4 grid grid-cols-3 text-center text-[12.5px] font-medium text-gray-700 shadow-sm">
                <div>conta</div>
                <div>nota</div>
                <div>período de inscrição</div>
              </div>

              {/* Empty State */}
              <div className="bg-white rounded-[1.5rem] flex flex-col items-center justify-center p-8 shadow-sm min-h-[250px]">
                <div className="relative w-32 h-32 mb-4">
                  <img
                    alt="vazio"
                    className="w-full h-full object-contain"
                    src="https://www.mengniu.wang/assets/empty-image-CHCN_UjN.png"
                  />
                </div>
                <p className="text-gray-400 text-[12.5px]">vazio</p>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            {/* Contribution Content */}
            <div className="bg-white rounded-[1.5rem] flex flex-col items-center justify-center p-8 shadow-sm min-h-[350px]">
              <div className="relative w-32 h-32 mb-4">
                <img
                  alt="vazio"
                  className="w-full h-full object-contain"
                  src="https://www.mengniu.wang/assets/empty-image-CHCN_UjN.png"
                />
              </div>
              <p className="text-gray-400 text-[12.5px]">nenhuma contribuição registrada</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
