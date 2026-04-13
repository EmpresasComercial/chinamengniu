import React, { useRef } from 'react';
import { ChevronLeft, FileText, Download, Printer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { contract_data } from '../data/contract_data';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function Contrato() {
  const navigate = useNavigate();
  const contractRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    const element = contractRef.current;
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('contrato_ai_go_onrender.pdf');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F2F5] font-serif antialiased pb-20">
      {/* Header Estilo Documento */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-[#6D28D9] flex items-center px-4 z-[100] shadow-lg print:hidden">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 text-white active:scale-95 transition-all"
          title="voltar"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="flex-1 text-center text-white text-[15px] font-bold lowercase pr-8">documento de contrato</h1>
      </header>

      <main className="pt-24 px-4 sm:px-10 flex flex-col items-center">
        {/* Folha A4 Fake */}
        <div 
          ref={contractRef}
          className="w-full max-w-[800px] bg-white shadow-2xl rounded-sm p-8 sm:p-16 border border-gray-200 relative overflow-hidden transition-all"
        >
          
          {/* Marca d'água discreta */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none rotate-45">
            <span className="text-[120px] font-black uppercase">AI-GO</span>
          </div>

          <div className="relative z-10 space-y-10">
            {/* Logo Discreta */}
            <div className="flex justify-between items-start border-b border-gray-100 pb-8">
               <div className="bg-[#6D28D9] w-12 h-12 rounded-lg flex items-center justify-center shadow-md">
                  <FileText className="text-white w-6 h-6" />
               </div>
               <p className="text-[11px] text-gray-400 font-sans text-right uppercase tracking-[2px] mt-2">
                 angola / luanda<br/>central de riscos
               </p>
            </div>

            {/* Cabeçalho do Contrato */}
            <div className="text-center space-y-2">
              <h2 className="text-[24px] sm:text-[28px] font-black text-gray-900 leading-tight uppercase underline underline-offset-8 decoration-gray-200">
                {contract_data.titulo}
              </h2>
              <p className="text-[14px] text-gray-400 font-medium italic">
                {contract_data.subtitulo}
              </p>
            </div>

            {/* Corpo do Contrato */}
            <div className="space-y-10 pt-6">
              {contract_data.secoes.map((secao, idx) => (
                <div key={idx} className="space-y-3">
                  <h3 className="text-[16px] font-black text-gray-800 uppercase tracking-wide">
                    {secao.titulo}
                  </h3>
                  <p className="text-[14px] text-gray-600 leading-relaxed text-justify px-2 bg-gray-50/30 py-1 rounded">
                    {secao.conteudo}
                  </p>
                </div>
              ))}
            </div>

            {/* Rodapé do Documento */}
            <div className="border-t border-gray-100 pt-16 mt-20 flex flex-col items-center gap-10">
               <div className="w-64 h-[1px] bg-gray-300"></div>
               <div className="text-center space-y-1">
                  <p className="text-[13px] font-black text-gray-900 lowercase italic">concordo eletronicamente com os termos</p>
                  <p className="text-[10px] text-gray-400 font-sans">id de autenticação digital: {Math.random().toString(36).substring(7).toUpperCase()}</p>
               </div>
            </div>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="mt-8 flex gap-4 print:hidden">
           <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 rounded-full text-gray-500 text-[12px] font-bold shadow-sm active:scale-95 transition-all">
              <Printer className="w-4 h-4" /> imprimir
           </button>
           <button 
             onClick={handleDownloadPDF}
             className="flex items-center gap-2 px-6 py-2.5 bg-[#6D28D9] text-white rounded-full text-[12px] font-bold shadow-lg shadow-purple-900/20 active:scale-95 transition-all"
           >
              <Download className="w-4 h-4" /> baixar pdf
           </button>
        </div>
      </main>
    </div>
  );
}
