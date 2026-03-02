import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CompanyPresentation() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-[#E2E4EB] antialiased">
      {/* Header */}
      <header className="bg-[#0000B3] h-14 flex items-center px-4 sticky top-0 z-10 shadow-md">
        <div className="flex items-center w-full relative justify-center">
          {/* Back Arrow Icon */}
          <button
            onClick={() => navigate(-1)}
            className="absolute left-0 p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>

          {/* Header Title */}
          <h1 className="text-white text-[15px] font-medium tracking-wide">apresentação da empresa</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4">
        <div className="bg-white rounded-[24px] shadow-sm p-6 w-full mx-auto">
          <article className="text-[#333333] text-[12.5px] leading-[1.6] text-justify hyphens-none break-keep">
            <p className="mb-4">
              bem-vindo a Mengniu Company. somos uma plataforma digital de operação e manutenção de criação estabelecida em cingapura. atualmente estamos recrutando parceiros de criação online. construímos um sistema de serviço completo de "adoção - alimentação - manejo - renda". rompendo os pontos problemáticos de alto limiar, alto risco e baixa eficiência da criação tradicional, o modelo "internet + criação física" permite que pessoas comuns participem facilmente na criação de gado de corte e vacas leiteiras e compartilhem os dividendos da indústria.
            </p>
            <p className="mb-4 font-bold text-[14px]">
              modelo de cooperação: você pode ser um "chefe de gado" sem experiência
            </p>
            <p className="mb-4">
              investimento e adoção: os parceiros escolhem o nível de investimento que mais lhes convém, completam o investimento e a adoção através da plataforma e obtêm a propriedade exclusiva e os direitos de renda do gado correspondente;
            </p>
            <p className="mb-4">
              alimentação diária: após a adoção ser bem-sucedida, você só precisa fazer login na plataforma todos os dias para alimentar, e pode completar a tarefa de alimentação virtual (a plataforma implementa simultaneamente a alimentação física). a operação é simples e não leva muito tempo;
            </p>
            <p>
              liquidação de rendimentos: com base no ciclo de crescimento do gado e nas condições do mercado, a plataforma liquida diariamente rendimentos para os parceiros. a receita inclui receitas de valor agregado provenientes da criação, receitas de prêmios de mercado, etc. quanto mais você investe, mais você ganha, e a receita é transparente e rastreável;
            </p>
          </article>
        </div>
      </main>
    </div>
  );
}
