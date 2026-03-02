import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * ProtectedRoute
 * Envolve rotas que exigem autenticação.
 * Se o utilizador não estiver autenticado, redireciona para /login.
 * Enquanto verifica a sessão, mostra um ecrã mínimo de espera.
 */
export default function ProtectedRoute() {
    const { user, loading } = useAuth();

    // Aguarda que o Supabase confirme a sessão antes de decidir
    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f0f2f5] gap-4">
                <div className="w-10 h-10 rounded-full border-4 border-[#0000a0]/20 border-t-[#0000a0] animate-spin" />
                <p className="text-[12.5px] text-gray-500">a verificar sessão…</p>
            </div>
        );
    }

    // Sem sessão → redireciona para login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Sessão válida → renderiza a rota pedida
    return <Outlet />;
}
