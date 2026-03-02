import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function HelpCenter() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-[#E5E9F2] antialiased page-content">
      {/* Header */}
      <header className="w-full bg-[#0000A5] h-14 flex items-center px-4 sticky top-0 z-50">
        <button onClick={() => navigate(-1)} className="flex-none w-8">
          <ChevronLeft className="h-6 w-6 text-white" />
        </button>
        <h1 className="flex-grow text-center text-white font-medium text-[18px] pr-8">
          central de ajuda
        </h1>
      </header>

      {/* Content Area */}
      <main className="flex-grow p-4">
        {/* Secondary section title */}
        <div className="mb-4">
          <span className="text-[#2D3748] text-[15px] font-normal ml-1">
            central de ajuda
          </span>
        </div>

        {/* Help Options Card */}
        <section className="bg-white rounded-3xl shadow-sm overflow-hidden">
          {/* List Item: Como retirar ganhos */}
          <button
            onClick={() => navigate('/ajuda-retirar')}
            className="w-full h-[45px] flex items-center justify-between px-6 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left"
          >
            <span className="text-[#1A202C] text-[12.5px] font-medium">como retirar ganhos</span>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </button>

          {/* List Item: Como recarregar sua conta */}
          <button
            onClick={() => navigate('/ajuda-recarregar')}
            className="w-full h-[45px] flex items-center justify-between px-6 hover:bg-gray-50 transition-colors text-left"
          >
            <span className="text-[#1A202C] text-[12.5px] font-medium">como recarregar sua conta</span>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </button>
        </section>
      </main>
    </div>
  );
}
