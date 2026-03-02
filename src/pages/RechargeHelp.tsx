import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function RechargeHelp() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-[#e8ebf5] antialiased page-content">
      {/* Header */}
      <header className="bg-[#000080] h-12 flex items-center px-4 sticky top-0 z-50">
        <button onClick={() => navigate(-1)} className="text-white">
          <ChevronLeft className="h-6 w-6 stroke-[2.5]" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4">
        {/* Content Card */}
        <section className="bg-white rounded-[2rem] p-6 shadow-sm min-h-[500px]">
          {/* Title Section */}
          <h1 className="text-[15px] font-bold mb-4 text-[#001a4d]">como recarregar sua conta</h1>

          {/* Subtitle */}
          <h2 className="text-[12.5px] font-medium mb-4 text-[#1a365d] opacity-80">
            como investir na Mengniu Company
          </h2>

          {/* Instructions List */}
          <div className="space-y-4 text-justify">
            <p className="text-[12.5px] leading-[1.6] text-[#333]">
              1. entre na página de recarga e selecione o método de transferência bancária. você verá os detalhes da conta bancária da empresa para depósito.
            </p>
            <p className="text-[12.5px] leading-[1.6] text-[#333]">
              2. faça a transferência através do seu aplicativo bancário ou caixa eletrônico (multicaixa). o valor mínimo para recarga é de 9000 kz e o máximo é de 7.000.000,00 kz.
            </p>
            <p className="text-[12.5px] leading-[1.6] text-[#333]">
              3. após efetuar o pagamento, carregue o comprovativo da transferência na plataforma para que possamos validar e creditar o saldo na sua conta. o processamento geralmente leva alguns minutos.
            </p>
            <p className="text-[12.5px] leading-[1.6] text-[#333]">
              observação: utilize sempre contas bancárias angolanas e certifique-se de que o valor transferido corresponde ao solicitado na plataforma para agilizar a verificação. em caso de dúvidas, contacte o seu gestor.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
