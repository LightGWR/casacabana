// Substitua pelos dados exibidos em Supabase > Project Settings > API.
export const SUPABASE_URL = "COLE_AQUI_A_URL_DO_SUPABASE";
export const SUPABASE_ANON_KEY = "COLE_AQUI_A_CHAVE_ANON_PUBLICA";

export const configured =
  SUPABASE_URL.startsWith("https://") &&
  !SUPABASE_URL.includes("COLE_AQUI") &&
  !SUPABASE_ANON_KEY.includes("COLE_AQUI");
