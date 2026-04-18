-- [OPTIMIZATION] Row-Level Security (RLS) Performance
-- A documentação do Supabase recomenda envolver chamadas a JWT (como auth.uid()) 
-- em uma subconsulta para permitir caching pelo otimizador do Postgres.

-- 1. Tabela 'profiles'
ALTER POLICY "Usuários podem ver o próprio perfil" ON public.profiles
USING ((SELECT auth.uid()) = id);

-- 2. Tabela 'retirada_clientes'
ALTER POLICY "Usuários podem ver suas próprias retiradas" ON public.retirada_clientes
USING ((SELECT auth.uid()) = user_id);

-- 3. Tabela 'depositos_clientes'
ALTER POLICY "Usuários podem ver seus próprios depósitos" ON public.depositos_clientes
USING ((SELECT auth.uid()) = user_id);

-- 4. Tabela 'tarefas_diarias'
ALTER POLICY "Usuários podem ver suas próprias tarefas" ON public.tarefas_diarias
USING ((SELECT auth.uid()) = user_id);

-- 5. Tabela 'bonus_transacoes'
ALTER POLICY "Usuários podem ver seus próprios bônus" ON public.bonus_transacoes
USING ((SELECT auth.uid()) = user_id);

-- [INDEXES] Garantir que as colunas de filtro estão indexadas
CREATE INDEX IF NOT EXISTS idx_retirada_user_id ON public.retirada_clientes(user_id);
CREATE INDEX IF NOT EXISTS idx_depositos_user_id ON public.depositos_clientes(user_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_user_id ON public.tarefas_diarias(user_id);
CREATE INDEX IF NOT EXISTS idx_bonus_user_id ON public.bonus_transacoes(user_id);
