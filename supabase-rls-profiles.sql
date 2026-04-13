-- ============================================================================
-- RLS Policies para tabela PROFILES
-- Funciona com email confirmation DESATIVADO (usuário já autenticado ao signup)
-- ============================================================================

-- 1. ENABLE RLS na tabela (se ainda não está)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. DROP de políticas antigas (se existirem)
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can read their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own row" ON public.profiles;

-- 3. POLÍTICA DE INSERT (CreateProfile no Signup)
CREATE POLICY "Users can insert their own profile"
ON public.profiles
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid()::text = id::text
);

-- 4. POLÍTICA DE SELECT (Login/Refresh)
CREATE POLICY "Users can read their own profile"
ON public.profiles
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
  auth.uid()::text = id::text
);

-- 5. POLÍTICA DE UPDATE (Editar perfil)
CREATE POLICY "Users can update their own profile"
ON public.profiles
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (
  auth.uid()::text = id::text
)
WITH CHECK (
  auth.uid()::text = id::text
);

-- ============================================================================
-- Para DESENVOLVIMENTO/TESTING apenas:
-- Descomente a linha abaixo se precisar de acesso total via service_role
-- ============================================================================

-- CREATE POLICY "Service role has full access"
-- ON public.profiles
-- AS PERMISSIVE
-- FOR ALL
-- TO service_role
-- WITH CHECK (true);
