import { useState, useCallback } from "react"
import { useAuth } from "@/AuthContext"
import { UserDto } from "@/app/_interfaces/dto/user-dto"

export const useLogin = () => {
  const { signIn } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Valida os dados do formulário de login
   */
  const validateFormData = useCallback(
    (email: string, password: string): string | null => {
      if (!email.trim()) {
        return "Por favor, digite um e-mail válido."
      }

      if (!password) {
        return "Por favor, digite sua senha."
      }

      return null
    },
    []
  )

  /**
   * Executa o login
   * Valida dados e chama signIn do AuthContext
   */
  const login = useCallback(
    async (email: string, password: string): Promise<UserDto | null> => {
      setLoading(true)
      setError(null)

      try {
        // Valida dados
        const validationError = validateFormData(email, password)
        if (validationError) {
          setError(validationError)
          return null
        }

        // Chama signIn via AuthContext
        // signIn aguarda o SIGNED_IN → refreshUser resolver e devolve o UserDto completo.
        // Nenhuma race condition — o user já está populado quando resolve.
        const loggedUser = await signIn(email.trim().toLowerCase(), password)
        return loggedUser
      } catch (error: any) {
        const msg = error.error_description || error.message || ""
        const isCredentialError =
          msg.includes("Invalid login credentials") || error.status === 400

        const errorMessage = isCredentialError
          ? "E-mail ou senha incorretos."
          : "Erro ao entrar. Tente novamente."

        console.error("❌ [useLogin] Error:", error)
        setError(errorMessage)
        return null
      } finally {
        setLoading(false)
      }
    },
    [signIn, validateFormData]
  )

  return {
    login,
    validateFormData,
    loading,
    error,
    setError,
  }
}
