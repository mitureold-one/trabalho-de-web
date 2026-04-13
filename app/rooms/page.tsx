"use client"

import { Suspense, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { RoomsContent } from "./RoomsContent"
import WelcomeModal from "@/app/_components/_auth/WelcomeModal"
import { useAuth } from "@/AuthContext"

export default function SalasPage() {
  return (
    <Suspense fallback={<div style={{ padding: "2rem", textAlign: "center" }}>Carregando salas...</div>}>
      <RoomsPageWrapper />
    </Suspense>
  )
}

function RoomsPageWrapper() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  
  // Estado para o modal específico desta página
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    // Verifica se a URL tem o ?welcome=true vindo do /setup
    if (searchParams.get("welcome") === "true") {
      setShowWelcome(true)
      
      // Limpa a URL para não reabrir no F5
      window.history.replaceState({}, "", "/rooms")
    }
  }, [searchParams])

  return (
    <>
      <WelcomeModal
        isOpen={showWelcome}
        userData={user} // O user aqui já estará atualizado pelo refreshUser do setup
        onClose={() => setShowWelcome(false)}
      />

      <RoomsContent />
    </>
  )
}