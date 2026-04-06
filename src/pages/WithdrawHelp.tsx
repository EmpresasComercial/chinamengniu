import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function WithdrawHelp() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-[#e5e9f2] antialiased page-content">
      {/* Header */}
      <header className="bg-[#000080] h-14 flex items-center px-4 sticky top-0 z-50">
        <button onClick={() => navigate(-1)} className="text-white">
          <ChevronLeft className="h-6 w-6" />
        </button>
      </header>

      {/* Main Content */}
      <main className="p-4 flex-grow">
        <article className="bg-white rounded-xl p-6  min-h-[400px]">
          {/* Card Title */}
          <h1 className="text-[15px] font-bold text-[#001f3f] mb-6">
            como retirar ganhos
          </h1>

          {/* Card Body Text */}
          <div className="text-[#1a202c] leading-relaxed space-y-5 text-[12.5px]">
            <p className="font-medium">
              como retirar os ganhos do dia:
            </p>

            <ul className="list-none space-y-2">
              <li>1. clique em extrair no seu perfil</li>
              <li>2. selecione transferência bancária como método de recebimento</li>
              <li>3. insira o valor do saque, os seus dados bancários (iban), a sua senha de saque e clique em confirmar</li>
            </ul>

            <p>
              a plataforma suporta agora apenas retiradas via transferência bancária para bancos angolanos. certifique-se de que os dados do iban e o nome do titular da conta estão corretos para evitar falhas ou atrasos no processamento.
            </p>

            <p>
              pode retirar dinheiro todos os dias. o valor mínimo de retirada é de 1000 kz e o valor máximo é de 100.000,00 kz por operação. o processamento é rápido e cobramos uma taxa de retirada de 14%. em caso de dúvida, contacte o suporte.
            </p>
          </div>
        </article>
      </main>
    </div>
  );
}
