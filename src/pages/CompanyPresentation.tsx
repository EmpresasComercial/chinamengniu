import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function CompanyPresentation() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 page-content pb-24">
      <header className="px-4 py-4 flex items-center bg-[#6D28D9] text-white">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 transition-colors hover:text-white/80" title="voltar">
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="flex-grow text-center text-[17px] font-black text-white lowercase tracking-tight pr-0">sobre nós</h1>
        <div className="w-10"></div>
      </header>

      <div className="p-4">
        <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden">
          <div className="p-6 space-y-10">

            {/* 1. Introdução */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-[1.5px] bg-[#6D28D9]" />
                <h2 className="text-[16px] font-black text-[#6D28D9] lowercase tracking-wide">1. introdução</h2>
              </div>
              <p className="text-slate-600 text-[13px] leading-relaxed lowercase font-medium">
                render é uma empresa americana de tecnologia fundada com o objetivo de fornecer serviços de infraestrutura de software e ferramentas para desenvolvedores. seu foco principal é oferecer soluções que auxiliem no ciclo de vida de desenvolvimento de aplicações digitais, incluindo integração com sistemas de controle de versão e automação de processos relacionados ao desenvolvimento de software.
              </p>
            </section>

            {/* 2. Histórico e Fundação */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-[1.5px] bg-[#6D28D9]" />
                <h2 className="text-[16px] font-black text-[#6D28D9] lowercase tracking-wide">2. histórico e fundação</h2>
              </div>
              <p className="text-slate-600 text-[13px] leading-relaxed lowercase mb-3 font-medium">
                a empresa foi fundada em 2018 pelo empreendedor anurag goel, que anteriormente ocupou posições de liderança em outras empresas de tecnologia. a missão inicial da render foi criar uma plataforma que reduzisse a complexidade técnica enfrentada por equipes de desenvolvimento ao lançar e manter aplicações modernas.
              </p>
              <p className="text-slate-600 text-[13px] leading-relaxed lowercase font-medium">
                render surgiu em um contexto em que muitas equipes de desenvolvimento buscavam ferramentas mais integradas e eficientes para apoiar suas operações de engenharia, sem a necessidade de administrar infraestrutura complexa.
              </p>
            </section>

            {/* 3. Ramo de Atuação */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-[1.5px] bg-[#6D28D9]" />
                <h2 className="text-[16px] font-black text-[#6D28D9] lowercase tracking-wide">3. ramo de atuação</h2>
              </div>
              <p className="text-slate-600 text-[13px] leading-relaxed lowercase mb-3 font-medium">
                render atua no setor de tecnologia da informação, mais especificamente no segmento de plataformas que apoiam o desenvolvimento de software. seu escopo inclui:
              </p>
              <ul className="list-disc pl-5 text-slate-600 text-[13px] leading-relaxed lowercase mb-3 font-medium space-y-1">
                <li>ferramentas para automação de processos de engenharia de software.</li>
                <li>serviços de integração contínua e entrega contínua (ci/cd).</li>
                <li>suporte para sistemas modernos de versionamento de código.</li>
                <li>soluções voltadas para profissionais de tecnologia, equipes de desenvolvimento e empresas que buscam otimizar fluxos de trabalho.</li>
              </ul>
              <p className="text-slate-600 text-[13px] leading-relaxed lowercase font-medium">
                diferentemente de empresas que oferecem somente serviços de infraestrutura física, o foco da render está em facilitar aspectos do processo produtivo de software, promovendo maior eficiência e velocidade nas fases de desenvolvimento e manutenção.
              </p>
            </section>

            {/* 4. Localização e Estrutura Corporativa */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-[1.5px] bg-[#6D28D9]" />
                <h2 className="text-[16px] font-black text-[#6D28D9] lowercase tracking-wide">4. localização e estrutura corporativa</h2>
              </div>
              <p className="text-slate-600 text-[13px] leading-relaxed lowercase mb-3 font-medium">
                a sede da render está localizada em:
                <br />
                525 brannan street, suite 300
                <br />
                san francisco, ca 94107
                <br />
                estados unidos
              </p>
              <p className="text-slate-600 text-[13px] leading-relaxed lowercase font-medium">
                além da sede, a empresa mantém equipes distribuídas, com colaboradores trabalhando de forma remota em diferentes países. essa estrutura híbrida permite à render atrair talentos globalmente e operar com flexibilidade em termos de organização de trabalho.
              </p>
            </section>

            {/* 5. Finanças, Investimentos e Crescimento */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-[1.5px] bg-[#6D28D9]" />
                <h2 className="text-[16px] font-black text-[#6D28D9] lowercase tracking-wide">5. finanças, investimentos e crescimento</h2>
              </div>
              <p className="text-slate-600 text-[13px] leading-relaxed lowercase mb-3 font-medium">
                render passou por rodadas de investimento com participação de fundos de capital de risco reconhecidos no setor de tecnologia, incluindo general catalyst, bessemer venture partners e outros investidores estratégicos.
              </p>
              <p className="text-slate-600 text-[13px] leading-relaxed lowercase mb-3 font-medium">
                as rodadas de investimento e a captação de recursos indicam que a empresa obteve financiamento significativo desde sua criação, o que contribuiu para seu crescimento organizacional e expansão de equipe.
              </p>
              <p className="text-slate-600 text-[13px] leading-relaxed lowercase mb-3 font-medium">
                segundo informações de mercado e estimativas públicas:
              </p>
              <ul className="list-disc pl-5 text-slate-600 text-[13px] leading-relaxed lowercase mb-3 font-medium space-y-1">
                <li>a render recebeu aportes de capital que totalizam dezenas de milhões de dólares ao longo de seu desenvolvimento.</li>
                <li>a avaliação (valuation) da empresa atingiu valores que a colocam como participante relevante no segmento de plataformas tecnológicas, com avaliação estimada em mais de us$1 bilhão em meados da década de 2020.</li>
              </ul>
              <p className="text-slate-600 text-[13px] leading-relaxed lowercase font-medium">
                esses números refletem a confiança de investidores e o potencial de crescimento da empresa dentro do setor de tecnologia.
              </p>
            </section>

            {/* 6. Modelo de Negócio e Abordagem Comercial */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-[1.5px] bg-[#6D28D9]" />
                <h2 className="text-[16px] font-black text-[#6D28D9] lowercase tracking-wide">6. modelo de negócio e abordagem comercial</h2>
              </div>
              <p className="text-slate-600 text-[13px] leading-relaxed lowercase mb-3 font-medium">
                render opera com um modelo de negócios que combina oferta de serviços gratuitos com planos pagos que incluem recursos adicionais e capacidades empresariais mais amplas. essa abordagem freemium permite atrair uma base ampla de usuários, que podem optar por planos mais avançados conforme as necessidades de seus projetos crescem.
              </p>
              <p className="text-slate-600 text-[13px] leading-relaxed lowercase font-medium">
                o foco comercial da render está em atender tanto desenvolvedores individuais quanto equipes de engenharia em empresas de pequeno, médio e grande porte, oferecendo ferramentas que permitem acelerar fluxos de trabalho, melhorar integração de código e reduzir o tempo necessário para atividades recorrentes de desenvolvimento.
              </p>
            </section>

            {/* 7. Cultura Organizacional e Influência */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-[1.5px] bg-[#6D28D9]" />
                <h2 className="text-[16px] font-black text-[#6D28D9] lowercase tracking-wide">7. cultura organizacional e influência</h2>
              </div>
              <p className="text-slate-600 text-[13px] leading-relaxed lowercase mb-3 font-medium">
                render tem uma cultura organizacional orientada para inovação e foco em eficiência técnica. a empresa valoriza práticas modernas de engenharia de software e incentiva a utilização de fluxos de trabalho colaborativos.
              </p>
              <p className="text-slate-600 text-[13px] leading-relaxed lowercase font-medium">
                a influência da render se estende à comunidade de desenvolvedores, com a empresa sendo citada em publicações especializadas, participando de eventos do setor e aparecendo em rankings de plataformas tecnológicas com crescimento rápido.
              </p>
            </section>s do setor e aparecendo em rankings de plataformas tecnológicas com crescimento rápido.
              </p>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
