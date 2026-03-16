"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"

export default function ResetPassword(){

  const [email,setEmail] = useState("")

  async function resetPassword(){

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:3000/update-password"
    })

    if(error){
      console.log(error)
      alert("Erro ao enviar email")
    }else{
      alert("Email de recuperação enviado!")
    }
  }

  return(

    <div>

      <h1>Recuperar senha</h1>

      <input
        type="email"
        placeholder="Digite seu email"
        onChange={(e)=>setEmail(e.target.value)}
      />

      <button onClick={resetPassword}>
        Enviar
      </button>

    </div>

  )
}