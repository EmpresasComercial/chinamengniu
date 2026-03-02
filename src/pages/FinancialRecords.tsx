import { useState } from 'react';
import { ChevronLeft, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLoading } from '../contexts/LoadingContext';

export default function FinancialRecords() {
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();
  const [activeTab, setActiveTab] = useState<'reproducao' | 'lucro'>('reproducao');

  const handleTabSwitch = (tab: 'reproducao' | 'lucro') => {
    if (activeTab === tab) return;

    showLoading();
    setActiveTab(tab);

    setTimeout(() => {
      hideLoading();
    }, 500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#E2E4EB]">
      {/* Header */}
      <header className="bg-[#0000A5] text-white flex items-center justify-between px-4 py-3 sticky top-0 z-50">
        <button onClick={() => navigate(-1)} className="w-10">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-[15px] font-bold tracking-wide">registros de conta</h1>
        <div className="w-10"></div>
      </header>

      {/* Main Content */}
      <main className="p-4 flex-1">
        <div className="bg-white rounded-[2rem] p-4 shadow-sm min-h-[350px] flex flex-col">
          {/* Tabs */}
          <div className="flex items-center justify-center bg-[#F4F6F9] rounded-full px-2 py-2 mb-6">
            <div
              className="flex-1 text-center cursor-pointer"
              onClick={() => handleTabSwitch('reproducao')}
            >
              <span className={`text-[12.5px] font-medium block transition-colors ${activeTab === 'reproducao' ? 'text-[#0000A5]' : 'text-gray-400'}`}>
                conta de retiradas
              </span>
              {activeTab === 'retiradas' && (
                <div className="w-[30px] h-[2px] bg-[#0000A5] mx-auto mt-[2px] rounded-full"></div>
              )}
            </div>

            <div className="h-4 w-px bg-gray-300 mx-2"></div>

            <div
              className="flex-1 text-center cursor-pointer"
              onClick={() => handleTabSwitch('lucro')}
            >
              <span className={`text-[12.5px] font-medium block transition-colors ${activeTab === 'lucro' ? 'text-[#0000A5]' : 'text-gray-400'}`}>
                recarregamentos feitos
              </span>
              {activeTab === 'recarregamentos' && (
                <div className="w-[30px] h-[2px] bg-[#0000A5] mx-auto mt-[2px] rounded-full"></div>
              )}
            </div>
          </div>

          {/* Filter Icon */}
          <div className="flex justify-end pr-2 mb-10">
            <Filter className="w-5 h-5 text-gray-700 cursor-pointer" />
          </div>

          {/* Empty State */}
          <div className="flex-1 flex flex-col items-center justify-start pt-4">
            <div className="relative w-32 h-32 mb-4 overflow-hidden flex items-center justify-center">
              <img
                alt="vazio"
                className="object-contain w-full h-full"
                src="https://www.mengniu.wang/assets/empty-image-CHCN_UjN.png"
              />
            </div>
            <p className="text-gray-400 text-[12.5px]">
              {activeTab === 'reproducao' ? 'vazio' : 'nenhum ativo de lucro'}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
