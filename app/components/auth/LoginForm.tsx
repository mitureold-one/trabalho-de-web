"use client"

import { useState } from "react"
import styles from "../../styles/auth.module.css"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function LoginForm() {

  const router = useRouter()
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")

  async function login(e:any){
    e.preventDefault()

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: senha
    })

    if(error){
      alert(error.message)
      return
    }
    router.push("/salas")
  }

  return (
    <div className={`${styles["form-container"]} ${styles["sign-in"]}`}>

      <form onSubmit={login}>

        <h1>Login</h1>

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
          Entrar
        </button>

      </form>

    </div>
  )
}