import { supabase, requireConfiguration, getProfile } from "./supabase.js";

if (requireConfiguration()) {
  document.querySelector("#login-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = document.querySelector("#message");
    message.textContent = "Entrando...";
    const { error } = await supabase.auth.signInWithPassword({
      email: document.querySelector("#email").value.trim(),
      password: document.querySelector("#password").value,
    });
    if (error) { message.textContent = "E-mail ou senha inválidos."; return; }
    const profile = await getProfile();
    if (!profile || profile.role !== "admin") {
      await supabase.auth.signOut();
      message.textContent = "Este usuário não possui permissão administrativa.";
      return;
    }
    location.href = "admin.html";
  });
}
