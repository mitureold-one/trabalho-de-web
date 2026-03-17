"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import styles from "@/styles/modal/modal.resetpassword.module.css" 

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function ResetPasswordModal({ isOpen, onClose }: Props) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  async function resetPassword() {
    if (!email) return alert("Digite o e-mail!")
    setLoading(true)
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`
    })

    setLoading(false)

    if (error) {
      alert("Erro ao enviar email")
    } else {
      alert("Email de recuperação enviado!")
      onClose()
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        
        <div className={styles.header}>
          <h2 style={{ color: 'white', margin: 0 }}>Recuperar senha</h2>
          <button onClick={onClose} className={styles.closeBtn}>&times;</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <p style={{ color: '#ccc', fontSize: '14px', margin: '0 0 10px 0' }}>
            Enviaremos um link para o seu e-mail para você criar uma nova senha.
          </p>
          
          <input
            type="email"
            placeholder="Digite seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.1)',
              backgroundColor: 'rgba(255,255,255,0.05)',
              color: 'white',
              outline: 'none'
            }}
          />

          <button 
            onClick={resetPassword} 
            disabled={loading}
            style={{
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#ff1a1a', 
              color: 'white',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'opacity 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
            onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
          >
            {loading ? "Enviando..." : "Enviar Link"}
          </button>
        </div>

      </div>
    </div>
  )
}