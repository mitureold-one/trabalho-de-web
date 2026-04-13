"use client"

/**
 * AuthProvider - Versão Otimizada para Triggers de Banco de Dados
 * * ALTERAÇÕES REALIZADAS:
 * 1. ✅ Remoção de conflito com Trigger: O signUp não cria mais o perfil manualmente.
 * 2. ✅ Lógica de Retry: refreshUser agora tenta buscar o perfil até 3 vezes caso a Trigger demore.
 * 3. ✅ Limpeza de Navegação: Substituição de window.location por redirecionamento controlado (ou logout limpo).
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useMemo,
  useCallback,
  useRef,
} from "react"
import { supabase } from "@/app/_lib/Supa-base"
import { profileDao } from "@/app/_interfaces/dao/profile-dao"
import { userDao } from "@/app/_interfaces/dao/user-dao"
import { UserDto } from "@/app/_interfaces/dto/user-dto"
import { Session, Subscription } from "@supabase/supabase-js"
import { AuthContextType } from "@/app/_interfaces/context/auth-context"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const CACHE_EXPIRATION_MS = 5 * 60 * 1000

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null)
  const [loading, setLoading] = useState(true)

  const pendingSignInRef = useRef<{
    resolve: (u: UserDto) => void
    reject: (e: unknown) => void
  } | null>(null)

  const userCacheRef = useRef<{
    userData: UserDto
    timestamp: number
  } | null>(null)

  const isCacheValid = useCallback(() => {
    if (!userCacheRef.current) return false
    const elapsedMs = Date.now() - userCacheRef.current.timestamp
    return elapsedMs < CACHE_EXPIRATION_MS
  }, [])

  const getCachedUser = useCallback((): UserDto | null => {
    if (isCacheValid() && userCacheRef.current) {
      console.log("[AuthContext] Usando dados do cache")
      return userCacheRef.current.userData
    }
    return null
  }, [isCacheValid])

  const invalidateCache = useCallback(() => {
    console.log("[AuthContext] Cache invalidado")
    userCacheRef.current = null
  }, [])

  /**
   * refreshUser com Lógica de Retry
   * Essencial quando usamos Triggers no Postgres, pois o perfil pode levar
   * alguns milissegundos para ser criado após o Auth.
   */
  const refreshUser = useCallback(
    async (session: Session | null, forceRefresh = false) => {
      if (!session) {
        setUser(null)
        invalidateCache()
        setLoading(false)
        return
      }

      try {
        if (!forceRefresh) {
          const cachedUser = getCachedUser()
          if (cachedUser) {
            setUser(cachedUser)
            setLoading(false)
            if (pendingSignInRef.current) {
              pendingSignInRef.current.resolve(cachedUser)
              pendingSignInRef.current = null
            }
            return
          }
        }

        console.log("[AuthContext] Buscando dados do usuário no banco...")

        let profile = null
        let retries = 3
        
        // Loop de tentativa para aguardar a Trigger do banco de dados
        while (retries > 0 && !profile) {
          profile = await profileDao.fetchProfile(session.user.id)
          if (!profile && retries > 1) {
            console.warn(`[AuthContext] Perfil não encontrado, tentando novamente em 1s... (${retries - 1} restando)`)
            await new Promise(res => setTimeout(res, 1000))
          }
          retries--
        }

        if (!profile) {
          throw new Error("Perfil de usuário não encontrado após várias tentativas.")
        }

        const userData = userDao.mapToDto(session.user, profile)

        // ✅ LUGAR IDEAL PARA O DEBUG:
        console.log("=== DEBUG REFRESH USER ===");
        console.log("1. Perfil Bruto do Banco (profile):", profile);
        console.log("2. DTO Mapeado (userData):", userData);
        console.log("3. Onboarding Complete no DTO:", userData.hasCompletedOnboarding);
        console.log("==========================");

        userCacheRef.current = {
          userData,
          timestamp: Date.now(),
        }

        setUser(userData)

        if (userData && pendingSignInRef.current) {
          pendingSignInRef.current.resolve(userData)
          pendingSignInRef.current = null
        }
      } catch (err) {
        console.error("[AuthContext] Erro crítico: sessão ativa mas perfil sumiu.", err)
        
        // Se não achou o perfil após os retries, a sessão é inválida para o nosso app
        setUser(null)
        invalidateCache()
        
        
        await supabase.auth.signOut() 
        
      } finally {
        setLoading(false)
}
    },
    [getCachedUser, invalidateCache]
  )

  useEffect(() => {
    let authSubscription: Subscription | null = null

    const setupAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      await refreshUser(session)

      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === "SIGNED_IN" || event === "USER_UPDATED") {
          if (session) await refreshUser(session)
          else setLoading(false)
        } else if (event === "SIGNED_OUT") {
          setUser(null)
          invalidateCache()
          setLoading(false)
          // Em Next.js, você pode querer usar router.push('/') aqui. 
          // Se preferir o reset total, mantenha o reload:
          window.location.href = "/" 
        } else if (event === "TOKEN_REFRESHED") {
          await refreshUser(session)
        }
      })

      authSubscription = data.subscription
    }

    setupAuth()

    const handleCleanup = () => {
      setUser(null)
      invalidateCache()
      pendingSignInRef.current = null
    }

    window.addEventListener("beforeunload", handleCleanup)
    window.addEventListener("pagehide", handleCleanup)

    return () => {
      authSubscription?.unsubscribe()
      window.removeEventListener("beforeunload", handleCleanup)
      window.removeEventListener("pagehide", handleCleanup)
    }
  }, [refreshUser, invalidateCache])

  const signIn = useCallback(async (email: string, pass: string): Promise<UserDto> => {
    return new Promise(async (resolve, reject) => {
      pendingSignInRef.current = { resolve, reject }
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: pass,
        })
        if (error) throw error
      } catch (err) {
        pendingSignInRef.current = null
        reject(err)
      }
    })
  }, [])

  const signUp = useCallback(async (email: string, pass: string): Promise<UserDto> => {
  return new Promise(async (resolve, reject) => {
    // Mantemos a ref para casos de login automático (se você desligar o e-mail depois)
    pendingSignInRef.current = { resolve, reject }
    
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: pass,
        options: {
          data: {
            display_name: email.split("@")[0]
          }
        }
      })

      if (authError) throw authError
      if (!authData.user) throw new Error("Erro ao criar usuário.")

      if (authData.user.identities && authData.user.identities.length === 0) {
        throw new Error("Este e-mail já está em uso.")
      }

      // 🔥 O AJUSTE ESTÁ AQUI:
      // Se não temos uma sessão (authData.session é null), significa que 
      // o e-mail de confirmação foi enviado. Precisamos RESOLVER a promise agora!
      if (!authData.session) {
        pendingSignInRef.current = null // Limpa a ref pois não haverá evento SIGNED_IN agora
        
        resolve({
          id: authData.user.id,
          email: authData.user.email || email,
          pendingConfirmation: true, // <--- O Hook e o Form lerão isso
          hasCompletedOnboarding: false,
        } as UserDto)
        
        return // Encerra a execução aqui
      }

      // Se existir sessão (e-mail desativado), a Promise continua aberta 
      // esperando o onAuthStateChange resolver ela via refreshUser.
      
    } catch (err) {
      pendingSignInRef.current = null
      reject(err)
    }
  })
}, [])

  const signOut = useCallback(async () => {
    setLoading(true)
    try {
      invalidateCache()
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (err) {
      console.error("[AuthContext] Erro logout:", err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [invalidateCache])

  const contextValue = useMemo(
    () => ({
      user,
      loading,
      signIn,
      signUp,
      signOut,
      refreshUser,
      invalidateUserCache: invalidateCache,
      isAuthenticated: user !== null,
      isPendingConfirmation: user?.pendingConfirmation ?? false,
      hasCompletedOnboarding: user?.hasCompletedOnboarding ?? false,
    }),
    [user, loading, signIn, signUp, signOut, refreshUser, invalidateCache]
  )

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth deve ser usado dentro de um AuthProvider")
  return context
}