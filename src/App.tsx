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
const VIP = React.lazy(() => import('./pages/VIP'));
const Reproducao = React.lazy(() => import('./pages/Reproducao'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Team = React.lazy(() => import('./pages/Team'));
const RechargeList = React.lazy(() => import('./pages/RechargeList'));
const RechargeDetail = React.lazy(() => import('./pages/RechargeDetail'));
const FinancialRecords = React.lazy(() => import('./pages/FinancialRecords'));
const SecurityCenter = React.lazy(() => import('./pages/SecurityCenter'));
const ChangePassword = React.lazy(() => import('./pages/ChangePassword'));
const Withdraw = React.lazy(() => import('./pages/Withdraw'));
const VIPDetails = React.lazy(() => import('./pages/VIPDetails'));
const CompanyPresentation = React.lazy(() => import('./pages/CompanyPresentation'));
const FundTransfer = React.lazy(() => import('./pages/FundTransfer'));
const HelpCenter = React.lazy(() => import('./pages/HelpCenter'));
const WithdrawHelp = React.lazy(() => import('./pages/WithdrawHelp'));
const RechargeHelp = React.lazy(() => import('./pages/RechargeHelp'));
const Invite = React.lazy(() => import('./pages/Invite'));
const AddBank = React.lazy(() => import('./pages/AddBank'));
const Promotion = React.lazy(() => import('./pages/Promotion'));
const PromotionDetails = React.lazy(() => import('./pages/PromotionDetails'));
const RechargeUSDT = React.lazy(() => import('./pages/RechargeUSDT'));


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
            <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/5 backdrop-blur-[1px]">
              <div className="spinner spinner-dark !w-7 !h-7 !border-[3px]"></div>
              <div className="mt-4 text-[12.5px] text-gray-500 font-serif text-center px-6">
                Carregando...<br />
                <span className="text-[10px] opacity-60">A página poderá demorar a carregar dependendo da sua conexão.</span>
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
                  <Route path="/vip" element={<VIP />} />
                  <Route path="/reproducao" element={<Reproducao />} />
                  <Route path="/perfil" element={<Profile />} />
                </Route>

                {/* Rotas sem Layout (ecrã completo) */}
                <Route path="/equipe" element={<Team />} />
                <Route path="/recarregar" element={<RechargeList />} />
                <Route path="/detalhes-pagamento" element={<RechargeDetail />} />
                <Route path="/detalhes" element={<FinancialRecords />} />
                <Route path="/centro-de-seguranca" element={<SecurityCenter />} />
                <Route path="/alterar-a-senha" element={<ChangePassword />} />
                <Route path="/retirar" element={<Withdraw />} />
                <Route path="/vip-detalhes" element={<VIPDetails />} />
                <Route path="/apresentacao-da-empresa" element={<CompanyPresentation />} />
                <Route path="/transferencia-de-fundos" element={<FundTransfer />} />
                <Route path="/central-de-ajuda" element={<HelpCenter />} />
                <Route path="/ajuda-retirar" element={<WithdrawHelp />} />
                <Route path="/ajuda-recarregar" element={<RechargeHelp />} />
                <Route path="/convidar" element={<Invite />} />
                <Route path="/adicionar-banco" element={<AddBank />} />
                <Route path="/promocao" element={<Promotion />} />
                <Route path="/promocao-detalhes" element={<PromotionDetails />} />
                <Route path="/recarregar-usdt" element={<RechargeUSDT />} />


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
