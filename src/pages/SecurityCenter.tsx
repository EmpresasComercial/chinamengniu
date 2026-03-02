import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SecurityCenter() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-[#E6E8F0] page-content">
      {/* Header */}
      <header className="w-full bg-[#0000A0] text-white flex items-center justify-between px-4 py-3 shadow-md">
        <button onClick={() => navigate(-1)} className="flex items-center w-8">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-[15px] font-semibold">centro de segurança</h1>
        <div className="w-8"></div>
      </header>

      {/* Menu Options */}
      <main className="w-full max-w-md px-4 py-6 space-y-4 mx-auto">
        <button
          onClick={() => navigate('/alterar-a-senha')}
          className="w-full h-[45px] bg-white rounded-3xl px-6 flex items-center justify-between shadow-sm active:bg-gray-50 transition-colors"
        >
          <span className="text-[#333333] font-normal text-[12.5px]">senha</span>
          <ChevronRight className="h-4 w-4 text-[#0000A0]" />
        </button>

        <button
          onClick={() => navigate('/adicionar-banco')}
          className="w-full h-[45px] bg-white rounded-3xl px-6 flex items-center justify-between shadow-sm active:bg-gray-50 transition-colors"
        >
          <span className="text-[#333333] font-normal text-[12.5px]">adicionar banco</span>
          <ChevronRight className="h-4 w-4 text-[#0000A0]" />
        </button>
      </main>
    </div>
  );
}
