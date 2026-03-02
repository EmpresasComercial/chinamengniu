import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LoadingProvider, RouteTransitionLoader } from './contexts/LoadingContext';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import VIP from './pages/VIP';
import Reproducao from './pages/Reproducao';
import Profile from './pages/Profile';
import Team from './pages/Team';
import RechargeList from './pages/RechargeList';
import RechargeDetail from './pages/RechargeDetail';
import FinancialRecords from './pages/FinancialRecords';
import SecurityCenter from './pages/SecurityCenter';
import ChangePassword from './pages/ChangePassword';
import Withdraw from './pages/Withdraw';
import Login from './pages/Login';
import Register from './pages/Register';
import VIPDetails from './pages/VIPDetails';
import CompanyPresentation from './pages/CompanyPresentation';
import FundTransfer from './pages/FundTransfer';
import HelpCenter from './pages/HelpCenter';
import WithdrawHelp from './pages/WithdrawHelp';
import RechargeHelp from './pages/RechargeHelp';
import Invite from './pages/Invite';
import AddBank from './pages/AddBank';
import CustomerService from './pages/CustomerService';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <LoadingProvider>
          <RouteTransitionLoader />
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/vip" element={<VIP />} />
              <Route path="/reproducao" element={<Reproducao />} />
              <Route path="/perfil" element={<Profile />} />
            </Route>
            <Route path="/equipe" element={<Team />} />
            <Route path="/recarregar" element={<RechargeList />} />
            <Route path="/detalhes-pagamento" element={<RechargeDetail />} />
            <Route path="/detalhes" element={<FinancialRecords />} />
            <Route path="/centro-de-seguranca" element={<SecurityCenter />} />
            <Route path="/alterar-a-senha" element={<ChangePassword />} />
            <Route path="/retirar" element={<Withdraw />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registrar" element={<Register />} />
            <Route path="/vip-detalhes" element={<VIPDetails />} />
            <Route path="/apresentacao-da-empresa" element={<CompanyPresentation />} />
            <Route path="/transferencia-de-fundos" element={<FundTransfer />} />
            <Route path="/central-de-ajuda" element={<HelpCenter />} />
            <Route path="/ajuda-retirar" element={<WithdrawHelp />} />
            <Route path="/ajuda-recarregar" element={<RechargeHelp />} />
            <Route path="/convidar" element={<Invite />} />
            <Route path="/adicionar-banco" element={<AddBank />} />
            <Route path="/atendimento" element={<CustomerService />} />
          </Routes>
        </LoadingProvider>
      </AuthProvider>
    </Router>
  );
}
