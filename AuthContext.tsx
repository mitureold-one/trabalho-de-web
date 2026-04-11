// Contexto de autenticação para gerenciar o estado de login do usuário
"use client"

import { createContext, useContext, useEffect, useState, ReactNode, useMemo, useCallback, useRef } from "react"
import { supabase } from "@/app/lib/Supa-base"
import { loginUsuario, getSessionUser, logoutUsuario } from "@/app/lib/Auth"
import { UserDto } from "@/app/interfaces/dto/user-dto" 
import { Session, Subscription } from "@supabase/supabase-js"
import { AuthContextType } from "@/app/interfaces/context/auth-context"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null) // Atualizado para UserDto
  const [loading, setLoading] = useState(true)
  const isSigningIn = useRef(false)

  const refreshUser = useCallback(async (session: Session | null) => {
    if (!session) {
      setUser(null)
      setLoading(false)
      return
    }
    try {
      const dados = await getSessionUser()
      setUser(dados)
    } catch (error) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let authSubscription: Subscription | null = null

    const setupAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      await refreshUser(session)

      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log(`[Auth Event]: ${event}`)

        if (event === "SIGNED_IN") {
          if (isSigningIn.current) {
            isSigningIn.current = false
            return
          }
          if (session) await refreshUser(session)
          else setLoading(false)
        } else if (event === "USER_UPDATED") {
          if (session) await refreshUser(session)
          else setLoading(false)
        } else if (event === "SIGNED_OUT") {
          setUser(null)
          setLoading(false)
          // Em Next.js, useRouter() é preferível, mas window.location resolve o cache
          window.location.href = "/"
        } else if (event === "TOKEN_REFRESHED") {
          await refreshUser(session)
        }
      })

      authSubscription = data.subscription
    }

    setupAuth()

    return () => { authSubscription?.unsubscribe() }
  }, [refreshUser])

  const signIn = useCallback(async (email: string, pass: string) => {
    setLoading(true)
    isSigningIn.current = true 
    try {
      await loginUsuario(email, pass)
      const { data: { session } } = await supabase.auth.getSession()
      await refreshUser(session)
    } catch (error) {
      isSigningIn.current = false
      setLoading(false)
      throw error
    }
  }, [refreshUser])

  const signOut = useCallback(async () => {
    setLoading(true)
    try {
      await logoutUsuario()
    } finally {
      setLoading(false)
    }
  }, [])

  const contextValue = useMemo(
    () => ({ user, loading, signIn, signOut }),
    [user, loading, signIn, signOut]
  )

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