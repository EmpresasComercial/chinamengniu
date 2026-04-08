import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ShieldCheck, Globe, Mail, Phone, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function CompanyPresentation() {
  const navigate = useNavigate();
  const [links, setLinks] = React.useState({
    whatsapp_gerente_url: '#',
    whatsapp_grupo_vendas_url: '#',
  });

  React.useEffect(() => {
    async function fetchLinks() {
      const { data } = await supabase
        .from('atendimento_links')
        .select('whatsapp_gerente_url, whatsapp_grupo_vendas_url')
        .single();
      if (data) setLinks(data);
    }
    fetchLinks();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 page-content p-4 pb-24">
      <header className="px-4 py-4 flex items-center bg-[#6D28D9] text-white">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 transition-colors hover:text-white/80" title="voltar">
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-[17px] font-black text-white lowercase tracking-tight">apresentação corporativa</h1>
      </header>
      
      <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden">
        <div className="relative h-60 overflow-hidden">
          <img 
            src="/ai-server.jpg" 
            alt="Operações AI" 
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-6 left-6 text-white">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1">founded 1921</p>
            <h2 className="text-2xl font-black lowercase tracking-tighter">render</h2>
          </div>
        </div>
        
        <div className="p-6 space-y-10">
          {/* Introdução */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-[1.5px] bg-[#6D28D9]" />
              <h2 className="text-[16px] font-black text-[#6D28D9] lowercase tracking-wide">introdução</h2>
            </div>
            <p className="text-slate-600 text-[13px] leading-relaxed lowercase mb-3 font-medium">
              render é uma empresa americana de tecnologia fundada com o objetivo de fornecer serviços de infraestrutura de software e ferramentas para desenvolvedores. seu foco principal é oferecer soluções que auxiliem no ciclo de vida de desenvolvimento de aplicações digitais, incluindo integração com sistemas de controle de versão e automação de processos relacionados ao desenvolvimento de software.
            </p>
          </section>

          {/* Histórico e Fundação */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-[1.5px] bg-[#6D28D9]" />
              <h2 className="text-[16px] font-black text-[#6D28D9] lowercase tracking-wide">histórico e fundação</h2>
            </div>
            <p className="text-slate-600 text-[13px] leading-relaxed lowercase mb-3 font-medium">
              a empresa foi fundada em 2018 pelo empreendedor anurag goel, que anteriormente ocupou posições de liderança em outras empresas de tecnologia. a missão inicial da render foi criar uma plataforma que reduzisse a complexidade técnica enfrentada por equipes de desenvolvimento ao lançar e manter aplicações modernas.
            </p>
            <p className="text-slate-600 text-[13px] leading-relaxed lowercase font-medium">
              render surgiu em um contexto em que muitas equipes de desenvolvimento buscavam ferramentas mais integradas e eficientes para apoiar suas operações de engenharia, sem a necessidade de administrar infraestrutura complexa.
            </p>
          </section>

          {/* Ramo de Atuação */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-[1.5px] bg-[#6D28D9]" />
              <h2 className="text-[16px] font-black text-[#6D28D9] lowercase tracking-wide">ramo de atuação</h2>
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

          {/* Localização e Estrutura Corporativa */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-[1.5px] bg-[#6D28D9]" />
              <h2 className="text-[16px] font-black text-[#6D28D9] lowercase tracking-wide">localização e estrutura corporativa</h2>
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

          {/* Finanças, Investimentos e Crescimento */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-[1.5px] bg-[#6D28D9]" />
              <h2 className="text-[16px] font-black text-[#6D28D9] lowercase tracking-wide">finanças, investimentos e crescimento</h2>
            </div>
            <p className="text-slate-600 text-[13px] leading-relaxed lowercase mb-3 font-medium">
              render passou por rodadas de investimento com participação de fundos de capital de risco reconhecidos no setor de tecnologia, incluindo general catalyst, bessemer venture partners e outros investidores estratégicos. as rodadas de investimento e a captação de recursos indicam que a empresa obteve financiamento significativo desde sua criação, o que contribuiu para seu crescimento organizacional e expansão de equipe.
            </p>
            <p className="text-slate-600 text-[13px] leading-relaxed lowercase font-medium mb-3">
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

          {/* Modelo de Negócio e Abordagem Comercial */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-[1.5px] bg-[#6D28D9]" />
              <h2 className="text-[16px] font-black text-[#6D28D9] lowercase tracking-wide">modelo de negócio e abordagem comercial</h2>
            </div>
            <p className="text-slate-600 text-[13px] leading-relaxed lowercase mb-3 font-medium">
              render opera com um modelo de negócios que combina oferta de serviços gratuitos com planos pagos que incluem recursos adicionais e capacidades empresariais mais amplas. essa abordagem freemium permite atrair uma base ampla de usuários, que podem optar por planos mais avançados conforme as necessidades de seus projetos crescem.
            </p>
            <p className="text-slate-600 text-[13px] leading-relaxed lowercase font-medium">
              o foco comercial da render está em atender tanto desenvolvedores individuais quanto equipes de engenharia em empresas de pequeno, médio e grande porte, oferecendo ferramentas que permitem acelerar fluxos de trabalho, melhorar integração de código e reduzir o tempo necessário para atividades recorrentes de desenvolvimento.
            </p>
          </section>

          {/* Cultura Organizacional e Influência */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-[1.5px] bg-[#6D28D9]" />
              <h2 className="text-[16px] font-black text-[#6D28D9] lowercase tracking-wide">cultura organizacional e influência</h2>
            </div>
            <p className="text-slate-600 text-[13px] leading-relaxed lowercase mb-3 font-medium">
              render tem uma cultura organizacional orientada para inovação e foco em eficiência técnica. a empresa valoriza práticas modernas de engenharia de software e incentiva a utilização de fluxos de trabalho colaborativos.
            </p>
            <p className="text-slate-600 text-[13px] leading-relaxed lowercase font-medium">
              a influência da render se estende à comunidade de desenvolvedores, com a empresa sendo citada em publicações especializadas, participando de eventos do setor e aparecendo em rankings de plataformas tecnológicas com crescimento rápido.
            </p>
          </section>
            
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)] rounded-2xl flex items-center justify-center border border-slate-50 mb-2 group hover:border-[#6D28D9] transition-colors duration-500">
                <img 
                  src="/file_loga IAc78c7243befa67a31cf49487.png" 
                  className="w-10 h-10 object-contain grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" 
                  alt="AI" 
                />
              </div>
              <p className="text-[10px] text-slate-400 lowercase font-black tracking-widest opacity-60 italic">institutional authority</p>
            </div>
          </section>

          {/* Compact Premium Footer */}
          <footer className="pt-8 border-t border-slate-100">
            <div className="flex justify-between items-start gap-4">
              {/* Left Column: Essential Contacts */}
              <div className="flex-1 space-y-4">
                <div>
                  <h4 className="text-[12px] font-black text-slate-800 lowercase tracking-widest mb-4 opacity-80 flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5" /> contactos oficiais
                  </h4>
                  <div className="space-y-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] text-slate-400 font-bold lowercase">atendimento ao cliente</span>
                      <a href={links.whatsapp_grupo_vendas_url} target="_blank" rel="noreferrer" className="text-[12px] text-blue-600 font-black lowercase flex items-center gap-1">
                        whatsapp oficial <ExternalLink className="w-2.5 h-2.5 opacity-50" />
                      </a>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] text-slate-400 font-bold lowercase">gerência de suporte</span>
                      <a href={links.whatsapp_gerente_url} target="_blank" rel="noreferrer" className="text-[12px] text-blue-600 font-black lowercase flex items-center gap-1">
                        canal de gerência <ExternalLink className="w-2.5 h-2.5 opacity-50" />
                      </a>
                    </div>
                  </div>
                </div>

                <div className="pt-1">
                  <h4 className="text-[11px] font-black text-slate-800 lowercase tracking-widest mb-2 opacity-80 flex items-center gap-2">
                    <Globe className="w-3 h-3" /> sede tecnológica global
                  </h4>
                  <p className="text-[10px] text-slate-500 lowercase leading-snug">
                    vale do silício, california, estados unidos
                  </p>
                </div>
                
                <div className="flex gap-2 pt-1">
                  <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                    <ShieldCheck className="w-2.5 h-2.5 text-green-600" />
                    <span className="text-[8px] text-slate-700 font-black">SSL VERIFIED</span>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                    <ShieldCheck className="w-2.5 h-2.5 text-blue-600" />
                    <span className="text-[8px] text-slate-700 font-black">SECURE DATA</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Navigation Aligned Right */}
              <div className="flex flex-col items-end space-y-4">
                <h4 className="text-[12px] font-black text-slate-800 lowercase tracking-widest mb-4 opacity-80">
                  navegação institucional
                </h4>
                <nav className="flex flex-col gap-2.5 text-right items-end">
                  <button onClick={() => navigate('/projetos')} className="text-[12px] text-slate-600 font-black lowercase hover:text-[#6D28D9] text-right">nossos produtos</button>
                  <button onClick={() => navigate('/perfil')} className="text-[12px] text-slate-600 font-black lowercase hover:text-[#6D28D9] text-right">sobre nós</button>
                  <button onClick={() => navigate('/withdraw')} className="text-[12px] text-slate-600 font-black lowercase hover:text-[#6D28D9] text-right">como retirar saldo</button>
                  <button onClick={() => navigate('/ajuda')} className="text-[12px] text-slate-600 font-black lowercase hover:text-[#6D28D9] text-right">perguntas frequentes</button>
                  <button onClick={() => navigate('/seguranca')} className="text-[12px] text-slate-600 font-black lowercase hover:text-[#6D28D9] text-right">centro de segurança</button>
                </nav>
                
                <div className="pt-4 flex flex-col items-end space-y-0.5 opacity-50">
                  <p className="text-[9px] text-slate-400 font-black lowercase tracking-widest">s&p 500 member</p>
                  <p className="text-[9px] text-slate-400 font-black lowercase tracking-widest">iso 14001:2015</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center">
              <p className="text-[9px] text-slate-400 lowercase text-center font-bold tracking-tight opacity-70">
                © 2026 ai corp • advanced security systems
              </p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
