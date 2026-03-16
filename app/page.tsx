"use client"

import { useState } from "react"
import styles from "@/styles/auth.module.css"

import LoginForm from "@/components/auth/LoginForm"
import SignupForm from "@/components/auth/SignupForm"
import TogglePanel from "@/components/auth/TogglePanel"

import { supabase } from "@/lib/supabase"

async function testar(){

  const { data, error } = await supabase
    .from("profiles")
    .select("*")

  console.log(data)
  console.log(error)

}

testar()

export default function Home() {
  

  const [active, setActive] = useState(false)

  return (
    <div className={styles.page}>
      <div className={`${styles.container} ${active ? styles.active : ""}`}>

        <SignupForm />
        <LoginForm />

        <TogglePanel
          ativarLogin={() => setActive(false)}
          ativarCadastro={() => setActive(true)}
        />

      </div>
    </div>
  )
}