import { ArrowLeftRight, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLoading } from '../contexts/LoadingContext';

export default function Reproducao() {
  const navigate = useNavigate();
  const { setIsLoading } = useLoading();

  const handleStart = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0000AA] text-white p-4">
      {/* Banner Card */}
      <section className="relative rounded-xl overflow-hidden mb-4">
        <img
          alt="Banner Cow"
          className="w-full h-auto object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_dmEaeb_6QdTc9_t3C9uz0fPnsvMp25ERBHFoJFw9-ZJkyj9fv3txK-A_CYl2G2NTtY8S2GflPhIURitNTkIAqQ4w7Q_bXLJORqADk92DnNXFA1rwzZduTXz4LySeAXyWjQ-6N_p0dik_C-Bdrw7TelHwWYSh43i_QtxINNceX05WLGuc4ioII6DK_zfKOrera0B4SvL56bRw2yqHvZMiSeEK_Y5XQC776XoZFgwCKTc12o5hspuU26F14CUmCioOhLAD6GloKw"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <h2 className="text-[15px] font-bold">alimentação inteligente</h2>
          <p className="text-[10px] text-gray-200">criação inteligente, segura e robusta</p>
        </div>

        {/* VIP Badge */}
        <div className="absolute top-3 left-3 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-2">
          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center overflow-hidden p-1">
            <img
              alt="Mengniu Company logo"
              className="w-full h-full object-contain"
              src="https://s3-symbol-logo.tradingview.com/mengniu-dairy--600.png"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold">VIP0</span>
            <div className="flex text-[8px] text-yellow-400">☆☆☆☆☆</div>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-2 gap-y-4 mb-6 px-1">
        <div>
          <p className="text-[10px] text-gray-300">conta de reprodução</p>
          <p className="text-[15px] font-bold">0.00 Kz</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-300">ativos de lucro</p>
          <p className="text-[15px] font-bold">0.00 Kz</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-300">renda diária</p>
          <p className="text-[12.5px] font-semibold">0.00%</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-300">Usado / Número total de vezes</p>
          <p className="text-[12.5px] font-semibold">0/0</p>
        </div>
        <div className="col-span-2 mt-2">
          <p className="text-[10px] text-gray-300">Horário de reinicialização da alimentação</p>
          <p className="text-[15px] font-bold">Reinicialização concluída</p>
        </div>
      </section>

      {/* Action Buttons */}
      <section className="grid grid-cols-2 gap-3 mb-8">
        <button
          onClick={() => navigate('/transferencia-de-fundos')}
          className="bg-[#D2F076] text-black rounded-lg p-4 flex items-center justify-between text-left font-medium leading-tight h-[45px]"
        >
          <span className="text-[12.5px]">trocar saldo</span>
          <ArrowLeftRight className="w-5 h-5" />
        </button>
        <button
          onClick={handleStart}
          className="bg-[#D2F076] text-black rounded-lg p-4 flex items-center justify-between text-left font-medium leading-tight h-[45px]"
        >
          <span className="text-[12.5px]">Comece agora</span>
          <Play className="w-5 h-5 fill-current" />
        </button>
      </section>

      {/* History Section */}
      <section className="bg-[#E5E7EB] rounded-t-[2.5rem] p-6 -mx-4 flex-grow min-h-[300px]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-[#00008B] font-bold text-[15px]">Registros históricos</h3>
          <button className="text-blue-600 text-[12.5px]">Veja mais</button>
        </div>
        <div className="flex flex-col items-center justify-center pt-10">
          {/* Content area */}
        </div>
      </section>
    </div>
  );
}
