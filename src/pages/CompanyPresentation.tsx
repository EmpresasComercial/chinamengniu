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
      <header className="px-4 py-4 flex items-center bg-[#00008b] text-white">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 transition-colors hover:text-white/80" title="voltar">
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-[17px] font-black text-white lowercase tracking-tight">apresentação corporativa</h1>
      </header>
      
      <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden">
        <div className="relative h-60 overflow-hidden">
          <img 
            src="/minas.jpg" 
            alt="Operações Newmont" 
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-6 left-6 text-white">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1">founded 1921</p>
            <h2 className="text-2xl font-black lowercase tracking-tighter">newmont global</h2>
          </div>
        </div>
        
        <div className="p-6 space-y-10">
          {/* Introdução */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-[1.5px] bg-[#0000AA]" />
              <h2 className="text-[16px] font-black text-[#0000AA] lowercase tracking-wide">introdução corporativa</h2>
            </div>
            <p className="text-slate-600 text-[13px] leading-relaxed lowercase mb-3 font-medium">
              a newmont corporation é a instituição líder global no setor de mineração de metais preciosos. com uma história que abrange mais de um século de inovação e excelência operacional, a empresa consolidou-se como a maior produtora de ouro do mundo.
            </p>
            <p className="text-slate-600 text-[13px] leading-relaxed lowercase font-medium">
              com sede em denver, colorado, a newmont opera ativos de classe mundial em domínios mineiros estáveis, focando na criação de valor sustentável e no retorno sólido para os seus parceiros globais.
            </p>
          </section>

          {/* Modelo de Negócio */}
          <section className="bg-[#f8faff] p-6 rounded-2xl border border-blue-50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Globe className="w-24 h-24 text-blue-900 rotate-12" />
            </div>
            <h2 className="text-[16px] font-black text-slate-800 mb-3 lowercase relative z-10">modelo de negócio e rentabilidade</h2>
            <p className="text-slate-600 text-[13px] leading-relaxed lowercase relative z-10 font-medium">
              o nosso modelo de negócio baseia-se na gestão de ativos "tier 1", que são jazidas de grande escala e baixo custo de extração. a rentabilidade é gerada através da comercialização direta de ouro e metais industriais essenciais, aproveitando a valorização do mercado global para garantir fluxos de caixa robustos.
            </p>
          </section>

          {/* Como Geramos Lucro - Compact Step Design */}
          <section>
            <h2 className="text-[16px] font-black text-slate-800 mb-6 lowercase tracking-wide">estratégias de geração de lucro</h2>
            <div className="grid gap-6">
              {[
                { n: '01', title: 'otimização de ativos', desc: 'focamos em operações de baixo custo e alta eficiência, alienando ativos não estratégicos.' },
                { n: '02', title: 'exposição de mercado', desc: 'capturamos o "preço à vista" (spot price) dos metais, permitindo benefícios diretos.' },
                { n: '03', title: 'eficiência de capital', desc: 'reinvestimos em exploração tecnológica de ponta e projetos de alto retorno.' }
              ].map((item) => (
                <div key={item.n} className="flex gap-4 items-start">
                  <span className="text-3xl font-black text-slate-100 leading-none">{item.n}</span>
                  <div>
                    <h3 className="text-[14px] font-black text-slate-900 lowercase mb-1">{item.title}</h3>
                    <p className="text-[12px] text-slate-500 lowercase leading-relaxed font-medium">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Operacional Timeline */}
          <section>
            <h2 className="text-[16px] font-black text-slate-800 mb-6 lowercase tracking-wide">ciclo operacional institucional</h2>
            <div className="space-y-0 relative">
              <div className="absolute left-[7px] top-2 bottom-2 w-[1px] bg-slate-100" />
              {[
                { title: 'exploração científica', desc: 'geofísica avançada e modelagem geológica.' },
                { title: 'desenvolvimento técnico', desc: 'viabilidade econômica e infraestrutura.' },
                { title: 'extração e produção', desc: 'extração operacional e refinamento industrial.' },
                { title: 'recuperação ambiental', desc: 'reabilitação total e garantia de estabilidade.' }
              ].map((step, idx) => (
                <div key={idx} className="relative pl-7 pb-6 last:pb-0">
                  <div className="absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-[#0000AA] bg-white z-10" />
                  <h4 className="text-[14px] font-black text-slate-800 lowercase mb-0.5">{step.title}</h4>
                  <p className="text-[11.5px] text-slate-500 lowercase leading-snug">{step.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Confiança e Valor Section */}
          <section className="pt-8 border-t border-slate-100">
            <div className="flex flex-col items-center mb-8 text-center px-2">
              <h3 className="text-[17px] font-black text-[#0000AA] lowercase mb-4">confiança e valor a longo prazo</h3>
              <p className="text-slate-500 text-[12.5px] lowercase leading-relaxed text-left w-full font-medium">
                com mais de um século de história, a newmont continua a ser o padrão de excelência na mineração global. a nossa integridade operacional e transparência financeira garantem que cada parceria seja baseada na segurança e no crescimento real. o nosso compromisso é proporcionar retornos consistentes para cada investidor.
              </p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)] rounded-2xl flex items-center justify-center border border-slate-50 mb-2 group hover:border-[#0000AA] transition-colors duration-500">
                <img 
                  src="/NewmontCorporationfff83c6b-57f6-428e-alogob.png" 
                  className="w-10 h-10 object-contain grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" 
                  alt="Newmont" 
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
                    <Globe className="w-3 h-3" /> sede mundial
                  </h4>
                  <p className="text-[10px] text-slate-500 lowercase leading-snug">
                    6900 e layton ave, denver, colorado, estados unidos
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
                  <button onClick={() => navigate('/projetos')} className="text-[12px] text-slate-600 font-black lowercase hover:text-[#0000AA] text-right">nossos produtos</button>
                  <button onClick={() => navigate('/perfil')} className="text-[12px] text-slate-600 font-black lowercase hover:text-[#0000AA] text-right">sobre nós</button>
                  <button onClick={() => navigate('/withdraw')} className="text-[12px] text-slate-600 font-black lowercase hover:text-[#0000AA] text-right">como retirar saldo</button>
                  <button onClick={() => navigate('/ajuda')} className="text-[12px] text-slate-600 font-black lowercase hover:text-[#0000AA] text-right">perguntas frequentes</button>
                  <button onClick={() => navigate('/seguranca')} className="text-[12px] text-slate-600 font-black lowercase hover:text-[#0000AA] text-right">centro de segurança</button>
                </nav>
                
                <div className="pt-4 flex flex-col items-end space-y-0.5 opacity-50">
                  <p className="text-[9px] text-slate-400 font-black lowercase tracking-widest">s&p 500 member</p>
                  <p className="text-[9px] text-slate-400 font-black lowercase tracking-widest">iso 14001:2015</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center">
              <p className="text-[9px] text-slate-400 lowercase text-center font-bold tracking-tight opacity-70">
                © 2026 newmont corp • advanced security systems
              </p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
