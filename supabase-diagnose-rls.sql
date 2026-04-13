-- ============================================================================
-- DIAGNÓSTICO DE RLS - Profiles
-- Execute este script para verificar as políticas existentes
-- ============================================================================

-- Ver todas as políticas na tabela profiles
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Ver se RLS está ativado na tabela
SELECT 
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'profiles';

-- Ver estrutura da tabela profiles
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
