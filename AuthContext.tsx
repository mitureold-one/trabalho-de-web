"use client"

import { createContext, useContext, useEffect, useState, ReactNode, useMemo, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { loginUsuario, getSessionUser, logoutUsuario, UserData } from "@/lib/auth" 
import { Session, Subscription } from "@supabase/supabase-js"

interface AuthContextType {
  user: UserData | null
  loading: boolean
  signIn: (email: string, pass: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(async (session: Session | null) => {
    if (!session) {
      setUser(null)
      setLoading(false)
      return
    }

    try {
      // 1. SET IMEDIATO: Preenchemos o básico para o sistema não achar que está deslogado
      // Se UserData for compatível com session.user, faça isso:
      setUser(session.user as any) 

      // 2. BUSCA DETALHADA: Agora sim buscamos os dados extras (perfil, cargo, etc)
      const dados = await getSessionUser()
      setUser(dados)
    } catch (error) {
      console.error("Erro ao sincronizar usuário:", error)
      // Se der erro nos dados extras, mantemos o básico ou deslogamos
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let authSubscription: Subscription | null = null

    const setupAuth = () => {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log(`[Auth Event]: ${event}`)
        
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'USER_UPDATED') {
          // Se já tivermos a session, não precisamos esperar o refreshUser para parar o loading de rota
          if (session) {
             // Chamada assíncrona, mas o loading do Proxy já foi resolvido pelo cookie
             refreshUser(session)
          } else {
             setLoading(false)
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setLoading(false)
          // Forçamos o redirecionamento para garantir que o Proxy barre o acesso
          window.location.href = '/' 
        } else if (event === 'TOKEN_REFRESHED') {
          refreshUser(session)
        }
      })

      authSubscription = data.subscription
    }

    setupAuth()

    return () => {
      authSubscription?.unsubscribe()
    }
  }, [refreshUser])


  // SignIn simplificado: deixa o listener (onAuthStateChange) atualizar o user
  const signIn = useCallback(async (email: string, pass: string) => {
    setLoading(true)
    try {
      await loginUsuario(email, pass)
      // O setUser acontecerá automaticamente via listener de evento SIGNED_IN
    } catch (error) {
      setLoading(false) // Se falhar, precisamos parar o loading manualmente
      throw error 
    }
  }, [])

  const signOut = useCallback(async () => {
    setLoading(true)
    try {
      await logoutUsuario()
    } finally {
      // O listener SIGNED_OUT cuidará do setUser(null) e setLoading(false)
    }
  }, [])

  // ❌ 5. Memoização do contexto para evitar re-renders na árvore inteira
  const contextValue = useMemo(() => ({
    user,
    loading,
    signIn,
    signOut
  }), [user, loading, signIn, signOut])

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth deve ser usado dentro de um AuthProvider")
  return context
}