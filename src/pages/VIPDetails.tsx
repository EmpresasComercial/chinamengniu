import { ChevronLeft, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLoading } from '../contexts/LoadingContext';

export default function VIPDetails() {
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();

  return (
    <div className="min-h-screen bg-[#f3f4f6]">
      {/* Header Section */}
      <header className="bg-[#0000AA] text-white flex items-center p-4 sticky top-0 z-10 shadow-md">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center p-1 rounded-full hover:bg-white/10 transition-colors"
        >
          <ChevronLeft className="text-2xl" />
        </button>
        <h1 className="flex-1 text-center text-[15px] font-bold pr-8">detalhes do plano</h1>
      </header>

      {/* Main Content Area */}
      <main className="p-4 max-w-md mx-auto">
        {/* VIP Card Container */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden p-4 border border-slate-200">
          {/* VIP Header Row (Image + Title/Stars) */}
          <div className="flex gap-4 items-center mb-6">
            <div
              className="w-24 h-24 rounded-lg bg-cover bg-center shrink-0 border border-slate-100"
              style={{ backgroundImage: "url('https://png.pngtree.com/png-clipart/20240615/original/pngtree-a-black-and-white-cow-with-tranparent-background-png-image_15340862.png')" }}
            >
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-[15px] font-black text-slate-900">vaca</h2>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-5 h-5 fill-[#FFD700] text-[#FFD700]" />
                ))}
              </div>
            </div>
          </div>

          {/* Data Rows Section */}
          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <span className="text-slate-500 text-[12.5px] font-medium">frequência diária de alimentação</span>
              <span className="text-slate-900 font-bold text-[15px]">1</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <span className="text-slate-500 text-[12.5px] font-medium"> rendimentos/diários</span>
              <span className="text-slate-900 font-bold text-[15px]">20.00%</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <span className="text-slate-500 text-[12.5px] font-medium">preço de adoção</span>
              <span className="text-slate-900 font-bold text-[15px]">≥10.00 KZs</span>
            </div>
            <div className="flex justify-between items-center pb-3">
              <span className="text-slate-500 text-[12.5px] font-medium">número de dias que podem ser mantidos</span>
              <span className="text-slate-900 font-bold text-[15px]">365</span>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => {
              showLoading();
              setTimeout(() => {
                hideLoading();
                // Simulation of purchase
              }, 1500);
            }}
            className="w-full h-[45px] bg-[#0000AA] hover:bg-blue-800 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
          >
            clique para comprar
          </button>
        </div>

        {/* Footer Spacing */}
        <div className="py-10 text-center text-slate-400 text-[12.5px]">
          "certifique que possui saldo suficiente para comprar esse animal, caso contrário, por favor entre em contacto com o seu gestor para fazer depósito/transferência para recarregar a sua conta mengniu company!"
        </div>
      </main>
    </div>
  );
}
