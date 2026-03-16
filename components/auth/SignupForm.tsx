"use client"

import { useState } from "react"
import styles from "@/styles/auth.module.css"
import { supabase } from "@/lib/supabase"

export default function SignupForm() {

  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [nome, setNome] = useState("")

  async function registrar(e:any){
  e.preventDefault()

  const { data, error } = await supabase.auth.signUp({
  email: email,
  password: senha,
  options: {
    data: {
      nome: nome
    }
  }
})

  if(error){
    console.log(error.message)
    alert(error.message)
    return
  }

  const user = data.user

  if(user){
    await supabase.from("profiles").insert({
      id_user: user.id,
      nome: nome,
      email: email
    })
  }

  alert("Conta criada!")
}

  return (
    <div className={`${styles["form-container"]} ${styles["sign-up"]}`}>
      
      <form onSubmit={registrar}>

        <h1>Crie sua conta</h1>

        <input
          type="text"
          placeholder="Nome"
          onChange={(e)=>setNome(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          onChange={(e)=>setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Senha"
          onChange={(e)=>setSenha(e.target.value)}
        />

        <button type="submit">
          Inscrever-se
        </button>

      </form>

    </div>
  )
}