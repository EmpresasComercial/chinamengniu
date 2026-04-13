import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoadingProvider, RouteTransitionLoader } from './contexts/LoadingContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Páginas públicas (entrada)
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));

// Páginas privadas (requerem autenticação)
const Home = React.lazy(() => import('./pages/Home'));
const Projetos = React.lazy(() => import('./pages/Projetos'));
const Extracao = React.lazy(() => import('./pages/Extracao'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Team = React.lazy(() => import('./pages/Team'));
const RechargeList = React.lazy(() => import('./pages/RechargeList'));
const RechargeDetail = React.lazy(() => import('./pages/RechargeDetail'));
const FinancialRecords = React.lazy(() => import('./pages/FinancialRecords'));
const SecurityCenter = React.lazy(() => import('./pages/SecurityCenter'));
const ChangePassword = React.lazy(() => import('./pages/ChangePassword'));
const Withdraw = React.lazy(() => import('./pages/Withdraw'));
const ProjetoDetalhes = React.lazy(() => import('./pages/ProjetoDetalhes'));
const CompanyPresentation = React.lazy(() => import('./pages/CompanyPresentation'));
const FundTransfer = React.lazy(() => import('./pages/FundTransfer'));
const HelpCenter = React.lazy(() => import('./pages/HelpCenter'));
const WithdrawHelp = React.lazy(() => import('./pages/WithdrawHelp'));
const RechargeHelp = React.lazy(() => import('./pages/RechargeHelp'));
const Invite = React.lazy(() => import('./pages/Invite'));
const AddBank = React.lazy(() => import('./pages/AddBank'));
const RechargeUSDT = React.lazy(() => import('./pages/RechargeUSDT'));
const Fundos = React.lazy(() => import('./pages/Fundos'));
const Terraco = React.lazy(() => import('./pages/Terraco'));
const Resgate = React.lazy(() => import('./pages/Resgate'));
const Validacao = React.lazy(() => import('./pages/Validacao'));
const Anuncios = React.lazy(() => import('./pages/Anuncios'));
const Contrato = React.lazy(() => import('./pages/Contrato'));

/**
 * PublicOnlyRoute
 * Redireciona utilizadores já autenticados para a página inicial,
 * evitando que acedam ao login/registo desnecessariamente.
 */
function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <LoadingProvider>
          <RouteTransitionLoader />
          <Suspense fallback={
            <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/5 backdrop-blur-[1px] lowercase">
              <div className="spinner spinner-dark !w-7 !h-7 !border-[3px]"></div>
              <div className="mt-4 text-[12.5px] text-gray-500 font-serif text-center px-6">
                carregando...<br />
                <span className="text-[10px] opacity-60">a página poderá demorar a carregar dependendo da sua conexão.</span>
              </div>
            </div>
          }>
            <Routes>

              {/* ── ROTAS PÚBLICAS (sem autenticação) ── */}
              <Route
                path="/login"
                element={
                  <PublicOnlyRoute>
                    <Login />
                  </PublicOnlyRoute>
                }
              />
              <Route
                path="/registrar"
                element={
                  <PublicOnlyRoute>
                    <Register />
                  </PublicOnlyRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicOnlyRoute>
                    <Register />
                  </PublicOnlyRoute>
                }
              />

              {/* ── ROTAS PRIVADAS (exigem utilizador autenticado) ── */}
              <Route element={<ProtectedRoute />}>

                {/* Rotas com Layout (barra de navegação) */}
                <Route element={<Layout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/projetos" element={<Projetos />} />
                  <Route path="/extracao" element={<Extracao />} />
                  <Route path="/perfil" element={<Profile />} />
                  <Route path="/fundos" element={<Fundos />} />
                </Route>

                {/* Rotas sem Layout (ecrã completo) */}
                <Route path="/terraco" element={<Terraco />} />
                <Route path="/equipe" element={<Team />} />
                <Route path="/select-bank" element={<RechargeList />} />
                <Route path="/detalhes-pagamento" element={<RechargeDetail />} />
                <Route path="/resgate" element={<Resgate />} />
                <Route path="/detalhes" element={<FinancialRecords />} />
                <Route path="/centro-de-seguranca" element={<SecurityCenter />} />
                <Route path="/alterar-senha" element={<ChangePassword />} />
                <Route path="/retirar" element={<Withdraw />} />
                <Route path="/projeto-detalhes" element={<ProjetoDetalhes />} />
                <Route path="/apresentacao-da-empresa" element={<CompanyPresentation />} />
                <Route path="/validar" element={<Validacao />} />
                <Route path="/transferencia-de-fundos" element={<FundTransfer />} />
                <Route path="/central-de-ajuda" element={<HelpCenter />} />
                <Route path="/ajuda-retirar" element={<WithdrawHelp />} />
                <Route path="/ajuda-recarregar" element={<RechargeHelp />} />
                <Route path="/convidar" element={<Invite />} />
                <Route path="/adicionar-banco" element={<AddBank />} />
                <Route path="/recarregar-usdt" element={<RechargeUSDT />} />
                <Route path="/anuncios" element={<Anuncios />} />
                <Route path="/contrato" element={<Contrato />} />


              </Route>

              {/* Qualquer rota desconhecida → registrar */}
              <Route path="*" element={<Navigate to="/registrar" replace />} />

            </Routes>
          </Suspense>
        </LoadingProvider>
      </AuthProvider>
    </Router>
  );
}
