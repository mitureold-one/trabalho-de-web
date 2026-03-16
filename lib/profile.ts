import { supabase } from "@/lib/supabase"

export async function uploadAvatar(file: File, userId: string) {
  const fileExt = file.name.split(".").pop()
  const filePath = `${userId}/avatar-${Date.now()}.${fileExt}`
  const { error } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, {
      upsert: true
    })

  if (error) {
    throw error
  }

  const { data } = supabase.storage
    .from("avatars")
    .getPublicUrl(filePath)

  return data.publicUrl
}

export async function updateAvatar(url: string, userId: string) {
  const { error } = await supabase
    .from("profiles")
    .update({
      avatar_url: url
    })
    .eq("id_user", userId) 

  if (error) {
    throw error
  }
}