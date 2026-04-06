import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CompanyPresentation() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-[#E2E4EB] antialiased page-content">
      {/* Header */}
      <header className="bg-[#0000B3] h-14 flex items-center px-4 sticky top-0 z-10 ">
        <div className="flex items-center w-full relative justify-center">
          {/* Back Arrow Icon */}
          <button
            onClick={() => navigate(-1)}
            className="absolute left-0 p-1 rounded-full hover:bg-white/10 transition-colors"
            title="voltar"
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>

          {/* Header Title */}
          <h1 className="text-white text-[15px] font-medium tracking-wide">apresentação da empresa</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4">
        <div className="bg-white rounded-xl  p-6 w-full mx-auto">
          <article className="text-[#333333] text-[12.5px] leading-[1.6] text-justify hyphens-none break-keep">
            <p className="mb-4">
              bem-vindo à Newmont Corporation. somos uma plataforma digital focada em investimentos de mineração estabelecida a nível global. atualmente estamos recrutando parceiros de mineração online. construímos um sistema de serviço completo de "investimento - acompanhamento - extração - renda". rompendo os pontos problemáticos de alto limiar, alto risco e baixa eficiência da mineração tradicional, o modelo "internet + mineração corporativa" permite que pessoas comuns participem facilmente nas operações extrativas de ouro e metais preciosos e compartilhem os dividendos da indústria.
            </p>
            <p className="mb-4 font-bold text-[14px]">
              modelo de cooperação: você pode ser um "sócio minerador" sem experiência
            </p>
            <p className="mb-4">
              investimento e aquisição: os parceiros escolhem o nível de investimento que mais lhes convém, completam o investimento através da plataforma e obtêm os direitos de renda da produção correspondente;
            </p>
            <p className="mb-4">
              acompanhamento diário: após o investimento ser bem-sucedido, você só precisa fazer login na plataforma todos os dias para acompanhar, e pode completar a tarefa virtual (a plataforma executa simultaneamente a mineração física). a operação é simples e não leva muito tempo;
            </p>
            <p>
              liquidação de rendimentos: com base no ciclo de extração e nas condições do mercado de comodities, a plataforma liquida diariamente rendimentos para os parceiros. a receita inclui receitas de valor agregado provenientes da mineração, receitas de prêmios do ouro e outros metais, etc. quanto mais você investe, mais você ganha, e a receita é transparente e rastreável;
            </p>
          </article>
        </div>
      </main>
    </div>
  );
}
