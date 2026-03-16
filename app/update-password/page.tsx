"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function UpdatePassword(){

  const router = useRouter()

  const [password,setPassword] = useState("")
  const [confirmPassword,setConfirmPassword] = useState("")

  async function updatePassword(e:React.FormEvent){

    e.preventDefault()

    if(password !== confirmPassword){
      alert("As senhas não coincidem")
      return
    }

    const { error } = await supabase.auth.updateUser({
      password: password
    })

    if(error){
      console.log(error)
      alert("Erro ao atualizar senha")
      return
    }

    alert("Senha atualizada com sucesso!")

    router.push("/")
  }

  return(

    <div className="flex items-center justify-center h-screen">

      <form
        onSubmit={updatePassword}
        className="flex flex-col gap-3 w-[300px]"
      >

        <h1 className="text-2xl font-bold text-center">
          Nova senha
        </h1>

        <input
          type="password"
          placeholder="Nova senha"
          onChange={(e)=>setPassword(e.target.value)}
          className="border p-2 rounded"
        />

        <input
          type="password"
          placeholder="Confirmar senha"
          onChange={(e)=>setConfirmPassword(e.target.value)}
          className="border p-2 rounded"
        />

        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded"
        >
          Atualizar senha
        </button>

      </form>

    </div>
  )
}