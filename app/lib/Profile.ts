import { supabase } from "@/app/lib/Supa-base"

export async function updateAvatar(url: string, userId: string) {
  const { error } = await supabase
    .from("profiles")
    .update({
      avatar_url: url
    })
    .eq("id", userId) 

  if (error) {
    throw error
  }
}