import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { SUPABASE_URL, SUPABASE_ANON_KEY, configured } from "./config.js";

export const supabase = configured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

export function requireConfiguration() {
  if (configured) return true;
  document.body.innerHTML = `<main class="setup"><h1>Casa Cabana</h1><h2>Configuração necessária</h2><p>Abra <code>assets/config.js</code> e informe a URL e a chave pública do Supabase.</p></main>`;
  return false;
}

export async function getProfile() {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return data ? { ...data, email: user.email } : null;
}

export async function requireRole(role) {
  if (!requireConfiguration()) return null;
  const profile = await getProfile();
  if (!profile || profile.role !== role) {
    await supabase.auth.signOut();
    location.href = "login.html";
    return null;
  }
  return profile;
}

export async function uploadImage(file, folder) {
  if (!file) return null;
  if (!file.type.startsWith("image/")) throw new Error("Selecione um arquivo de imagem.");
  if (file.size > 5 * 1024 * 1024) throw new Error("A imagem deve ter no máximo 5 MB.");
  const ext = file.name.split(".").pop().toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("site-images").upload(path, file, { cacheControl: "3600" });
  if (error) throw error;
  return supabase.storage.from("site-images").getPublicUrl(path).data.publicUrl;
}
