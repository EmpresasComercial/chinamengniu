import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * ProtectedRoute
 * Envolve rotas que exigem autenticação.
 * Se o utilizador não estiver autenticado, redireciona para /registrar imediatamente,
 * sem travar a UI com telas de carregamento.
 */
export default function ProtectedRoute() {
    const { session } = useAuth();

    // Redireciona imediatamente se não houver sessão ativa
    if (!session) {
        return <Navigate to="/registrar" replace />;
    }

    // Sessão válida → permite o acesso às sub-rotas
    return <Outlet />;
}
