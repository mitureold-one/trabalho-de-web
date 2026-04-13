"use client"

import { useState, useCallback } from "react"
import { UserDto } from "@/app/_interfaces/dto/user-dto"
import { useAuth } from "@/AuthContext"

export const useSignup = () => {
  const { signUp } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Valida os dados básicos do formulário antes de enviar ao servidor
   */
  const validateFormData = useCallback(
    (email: string, password: string, confirmPassword: string): string | null => {
      if (!email.trim() || !email.includes("@")) {
        return "Por favor, digite um e-mail válido."
      }

      if (password !== confirmPassword) {
        return "As senhas não coincidem."
      }

      if (password.length < 6) {
        return "A senha deve ter no mínimo 6 caracteres."
      }

      return null
    },
    []
  )

  /**
   * Executa o processo de cadastro
   */
  const signup = useCallback(
    async (email: string, password: string): Promise<UserDto | null> => {
      setLoading(true)
      setError(null)

      try {
        // 1. Chama o método de cadastro do AuthContext
        const userDto = await signUp(email, password)

        // Se o AuthContext retornar um objeto (fluxo sem confirmação de e-mail),
        // o cadastro foi imediato.
        return userDto
      } catch (err: any) {
        const msg = err?.message || ""
        console.warn("⚠️ [useSignup] Interceptando resposta para tratamento:", msg)

        // 2. TRATAMENTO PARA CONFIRMAÇÃO DE E-MAIL (Efeito Colateral)
        // Quando a confirmação de e-mail está ligada, o signUp cria o usuário 
        // mas NÃO cria a sessão. Isso faz o refreshUser do AuthContext falhar 
        // após os retries. Interceptamos isso para dar feedback positivo ao usuário.
        const isPendingEmail = 
          msg.includes("Perfil de usuário não encontrado") || 
          msg.includes("Email confirmation is required") ||
          msg.includes("confirmation sent")

        if (isPendingEmail) {
          return {
            id: "pending",
            email: email,
            name: "Usuário",
            hasCompletedOnboarding: false,
            pendingConfirmation: true, // Gatilho para a mensagem de sucesso no form
            isConfirmed: false
          } as UserDto
        }

        // 3. TRATAMENTO DE ERROS REAIS
        let errorMessage = "Erro ao cadastrar. Verifique os dados e tente novamente."

        if (msg.includes("rate limit")) {
          errorMessage = "Muitas tentativas. Aguarde um pouco ou tente outro e-mail."
        } else if (msg.includes("already registered") || msg.includes("User already exists")) {
          errorMessage = "Este e-mail já está em uso. Tente fazer login."
        } else if (msg) {
          errorMessage = msg
        }

        setError(errorMessage)
        return null
      } finally {
        // Garante que o estado de loading seja encerrado, liberando o botão da UI
        setLoading(false)
      }
    },
    [signUp]
  )

  return {
    signup,
    validateFormData,
    loading,
    error,
    setError,
  }
}